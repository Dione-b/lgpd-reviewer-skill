# Padrões de implementação — NestJS / Prisma / TypeScript

Carregue ao planejar/escrever código de adequação LGPD em stack Node. Pressuposto: a classificação (field-taxonomy) e a base legal (legal-basis) já foram decididas. Aqui é o "como" técnico. Adapte os exemplos — não copie cego.

## 1. Marcar a classificação no schema (fonte da verdade)

Anote cada campo pessoal no `schema.prisma` com comentário estruturado `/// @lgpd:`. O `scripts/audit-schema.js` lê essas anotações para distinguir mapeado de não-mapeado.

```prisma
model Paciente {
  id        String   @id @default(uuid())
  nome      String   /// @lgpd:comum base=contrato ret=5a
  cpf       String   @unique /// @lgpd:comum base=obrigacao_legal ret=5a mask
  email     String   /// @lgpd:comum base=consentimento ret=ate_revogacao
  cid       String?  /// @lgpd:sensivel base=tutela_saude ret=20a encrypt
  consentId String?  /// vínculo ao registro de consentimento
  deletedAt DateTime? /// soft-delete p/ direito de eliminação
}
```

Convenção: `@lgpd:<categoria> base=<base_legal> ret=<prazo> [mask] [encrypt]`. Campo pessoal sem anotação = pendência (o script reporta).

## 2. Criptografia de campo sensível em repouso

Sensível/identificador forte deve ser cifrado na coluna (não só TLS/disco). Use AES-256-GCM via Prisma middleware/extension, chave fora do banco (KMS/secret manager).

```ts
// crypto.util.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const KEY = Buffer.from(process.env.LGPD_FIELD_KEY!, 'base64'); // 32 bytes via KMS

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), enc].map(b => b.toString('base64')).join('.');
}
export function decrypt(blob: string): string {
  const [iv, tag, enc] = blob.split('.').map(s => Buffer.from(s, 'base64'));
  const d = createDecipheriv('aes-256-gcm', KEY, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}
```

```ts
// prisma.extension.ts — cifra/decifra campos marcados encrypt
const ENCRYPTED: Record<string, string[]> = { Paciente: ['cid'] };
prisma.$extends({ query: { $allModels: {
  async $allOperations({ model, args, query, operation }) {
    const fields = ENCRYPTED[model ?? ''] ?? [];
    if (['create','update','upsert'].includes(operation))
      for (const f of fields) if (args.data?.[f]) args.data[f] = encrypt(args.data[f]);
    const res = await query(args);
    const dec = (r: any) => { for (const f of fields) if (r?.[f]) r[f] = decrypt(r[f]); return r; };
    return Array.isArray(res) ? res.map(dec) : dec(res);
  }
}}});
```

## 3. Registro de consentimento (art. 8º — ônus da prova do controlador)

Consentimento é evento versionado e revogável, **nunca** um booleano mutável. Guarde finalidade, versão do texto, timestamp, origem.

```prisma
model Consentimento {
  id         String   @id @default(uuid())
  titularId  String
  finalidade String   // específica: "marketing_email", não "geral"
  politicaV  String   // versão do texto aceito
  status     ConsentStatus @default(ATIVO)
  concedidoEm DateTime @default(now())
  revogadoEm  DateTime?
  origem     String   // ip/userAgent/canal
  @@index([titularId, finalidade])
}
enum ConsentStatus { ATIVO REVOGADO }
```

Revogação = novo estado + `revogadoEm`, deve ser tão fácil quanto conceder (art. 8º §5º). Antes de tratar com base em consentimento, verifique `status=ATIVO` para a finalidade exata.

## 4. Registro de operações de tratamento (art. 37)

Toda operação relevante (acesso, compartilhamento, exportação, eliminação) é auditável: quem, o quê, base legal, finalidade, quando. Use interceptor NestJS, não logs ad-hoc.

```ts
@Injectable()
export class TratamentoLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const meta = Reflect.getMetadata('lgpd', ctx.getHandler()); // {operacao, base, finalidade}
    return next.handle().pipe(tap(async () => {
      if (!meta) return;
      const req = ctx.switchToHttp().getRequest();
      await this.prisma.registroTratamento.create({ data: {
        operacao: meta.operacao, baseLegal: meta.base, finalidade: meta.finalidade,
        atorId: req.user?.id, titularId: req.params?.id, em: new Date(),
      }});
    }));
  }
}
// uso: @Lgpd({ operacao:'COMPARTILHAMENTO', base:'consentimento', finalidade:'integracao_parceiro' })
```

## 5. Redação de PII em logs/observabilidade

Logs com CPF/e-mail/sensível = tratamento e vazamento. Aplique redator no logger (Pino/Nest Logger) e nunca logue objeto de entidade cru.

```ts
const PII = /\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|[\w.-]+@[\w.-]+)\b/g;
const redact = (s: string) => s.replace(PII, '[REDACTED]');
// pino: redact paths conhecidos
pino({ redact: { paths: ['*.cpf','*.email','*.cid','req.body.senha'], censor: '[REDACTED]' } });
```

## 6. Direitos do titular (art. 18) — endpoints obrigatórios

Projete o modelo para responder, **por titular**, em prazo razoável. Mínimo:

| Direito | Endpoint sugerido | Implementação |
|---|---|---|
| Confirmação + acesso | `GET /titulares/:id/dados` | agrega todas as tabelas que referenciam o titular |
| Correção | `PATCH /titulares/:id` | + registro no log de tratamento |
| Eliminação | `DELETE /titulares/:id` | soft-delete + job de hard-delete/anonimização respeitando retenção legal |
| Portabilidade | `GET /titulares/:id/export` | JSON/CSV estruturado e legível |
| Revogação consentimento | `POST /titulares/:id/consentimentos/:f/revogar` | seção 3 |
| Info de compartilhamento | incluso no acesso | lista controladores/operadores com quem houve uso compartilhado |

A **agregação por titular** exige saber todas as FKs que apontam ao titular. Mantenha um mapa central (ex.: `TITULAR_REFS = [{model,fk}]`) para acesso/exportação/eliminação não esquecerem tabela.

## 7. Eliminação x retenção legal x anonimização

Não basta `DELETE`. Fluxo correto:

```ts
async function atenderEliminacao(titularId: string) {
  // 1. dados sob obrigação legal de guarda → NÃO apagar; anonimizar o resto
  await prisma.$transaction([
    prisma.paciente.update({ where:{id:titularId}, data:{
      nome:'ANON', cpf:null, email:null, deletedAt:new Date() }}),     // anonimiza PII
    // 2. preserva o que a lei obriga reter (ex.: nota fiscal 5 anos) sem PII direta
    prisma.registroTratamento.create({ data:{ operacao:'ELIMINACAO',
      base:'art18', titularId, em:new Date() }}),
  ]);
}
```

- **Soft-delete** (`deletedAt`) só atende o titular se houver job que efetiva anonimização/expurgo no fim da retenção. Soft-delete eterno = continuar tratando.
- **Anonimização** precisa ser irreversível (sem chave de reidentificação); senão é pseudonimização e continua sob LGPD.

## 8. Job de expurgo por retenção (necessidade, arts. 15-16)

Cron que varre dados cuja finalidade terminou ou prazo de retenção venceu.

```ts
@Cron('0 3 * * *')
async expurgo() {
  const venc = new Date(Date.now() - 5*365*864e5); // ex.: 5 anos
  await this.prisma.paciente.updateMany({
    where: { deletedAt: { not: null, lt: venc } },
    data: { nome:'ANON', cpf:null, email:null, cid:null },
  });
}
```

## Checklist antes de concluir uma feature com dado pessoal

- [ ] Todo campo pessoal anotado `/// @lgpd:` no schema; `audit-schema.js` sem pendências
- [ ] Base legal definida por operação (não só por entidade)
- [ ] Sensível cifrado em repouso, chave fora do banco
- [ ] Consentimento (se base) versionado e revogável; verificado antes do uso
- [ ] Operação registrada (art. 37) para acesso/compartilhamento/exportação/eliminação
- [ ] Logs/traces sem PII (redator ativo)
- [ ] Direitos do art. 18 atendíveis por titular (acesso/correção/eliminação/portabilidade)
- [ ] Prazo de retenção definido + job de expurgo/anonimização
- [ ] Compartilhamento/transferência internacional sinalizado e com base própria

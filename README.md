# lgpd-reviewer

Agent skill para analisar e planejar adequação de aplicações à **LGPD** (Lei nº 13.709/2018). Orienta o agente a classificar dados, mapear bases legais por operação e entregar um **relatório estruturado em tabelas** — antes de sugerir código.

> **Aviso:** esta skill apoia revisão técnica e de produto; **não substitui assessoria jurídica**. Valide enquadramentos legais com o DPO ou advogado do controlador.

## O que faz

- Classifica campos e fontes como dado pessoal comum, sensível ou não pessoal
- Exige base legal por **operação** (coleta, uso, compartilhamento), não só por entidade
- Avalia ciclo de vida em quatro fases fixas: Coleta → Retenção → Compartilhamento → Eliminação
- Produz veredito e plano de adequação em formato tabular padronizado
- Oferece scanner heurístico para `schema.prisma` (campos sem anotação `@lgpd`)

## Quando usar

Acione a skill quando o trabalho envolver, por exemplo:

- Modelagem de entidades com CPF, e-mail, telefone, endereço, IP, cookies
- Dados sensíveis (saúde, biometria, raça/etnia, religião, etc.)
- Formulários, logs, analytics ou integrações que capturem PII
- Consentimento, retenção, expurgo, anonimização
- Direitos do titular (art. 18) ou transferência internacional (art. 33)
- Auditoria de `schema.prisma`, migrations ou DTOs sem mapeamento LGPD

## Instalação

### Cursor

Clone ou copie este repositório para o diretório de skills do projeto ou do usuário:

```bash
# skill no projeto (recomendado para o time)
git clone git@github.com:Dione-b/lgpd-reviewer-skill.git .cursor/skills/lgpd-reviewer

# ou skill global
git clone git@github.com:Dione-b/lgpd-reviewer-skill.git ~/.cursor/skills/lgpd-reviewer
```

No chat, mencione a skill ou anexe `SKILL.md` na conversa. O agente deve carregar `references/report-format.md` ao gerar análises.

### Claude Code / Codex

Copie a pasta para o namespace de skills do agente (ex.: `~/.claude/skills/lgpd-reviewer` ou `~/.agents/skills/lgpd-reviewer`), mantendo a estrutura abaixo.

## Estrutura do repositório

```
lgpd-reviewer/
├── SKILL.md                      # Entrada da skill (fluxo + regras de saída)
├── references/
│   ├── report-format.md          # Especificação das tabelas do relatório
│   ├── field-taxonomy.md         # Classificação de campos
│   ├── legal-basis.md            # Art. 7º e 11 por operação
│   └── nodejs.md                 # Padrões NestJS / Prisma / TypeScript
└── scripts/
    └── audit-schema.js           # Scanner de schema Prisma
```

## Formato do relatório

Toda análise completa segue as seções de `references/report-format.md`:

| Seção | Formato |
|---|---|
| 1 | Resumo executivo (texto) |
| 2 | Tabela de classificação de dados |
| 2.1 | Tabela de bases legais por operação |
| **3** | **Ciclo de vida (lacunas)** — tabela `Fase \| Estado` |
| **4** | **Veredito** — mesma tabela + `Veredito geral:` |
| 4.1 | Dimensões complementares (opcional) |
| 5 | Plano de adequação (se não conforme) |

As quatro fases do ciclo de vida são **fixas** (não renomear nem fundir):

| Fase |
|---|
| Coleta |
| Retenção |
| Compartilhamento |
| Eliminação |

Marcadores no fim da coluna **Estado**: `✅` `⚠️` `❌`.

## Auditoria Prisma

Para projetos com Prisma, rode o scanner antes de afirmar que o schema está mapeado:

```bash
node scripts/audit-schema.js caminho/para/schema.prisma
```

Saída em texto ou JSON (`--json`). Exit code `1` se houver campo sensível sem anotação `/// @lgpd:` — útil em CI.

Exemplo de anotação no schema:

```prisma
email String /// @lgpd:comum base=contrato ret=ate_revogacao
cid   String? /// @lgpd:sensivel base=tutela_saude ret=20a encrypt
```

## Fluxo resumido

1. Classificar campos (`field-taxonomy.md`)
2. Definir base legal por operação (`legal-basis.md`)
3. Mapear ciclo de vida (quatro fases)
4. Verificar direitos do titular (art. 18)
5. **Emitir relatório tabular** (`report-format.md`)
6. Só então planejar implementação (`nodejs.md`, se aplicável)

## Contribuindo

Issues e PRs são bem-vindos no fork/upstream. Ao alterar o formato de saída, atualize `SKILL.md` e `references/report-format.md` em conjunto para manter o contrato da skill.

## Referências normativas

- Lei nº 13.709/2018 (LGPD)
- Guia LGPD (MCTI)
- ABNT NBR ISO/IEC 27001, 27002:2022, 27701:2020

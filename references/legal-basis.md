# Base legal por operação — guia LGPD

Carregue ao escolher a base legal de um tratamento. **Regra de ouro:** base legal é por **operação/finalidade**, não por entidade. Coletar, usar internamente, compartilhar e exportar são operações distintas — cada uma precisa de sua própria base. Basta enquadrar em UMA hipótese legal para iniciar o tratamento, mas a finalidade deve ser específica, legítima e informada (art. 6º).

## Passo a passo

1. Defina a **finalidade específica** da operação (uma frase: "para quê este dado é usado aqui").
2. O dado é **sensível**? Sim → use a seção art. 11. Não → seção art. 7º.
3. Percorra as hipóteses na ordem de preferência (menor risco primeiro). Pare na primeira que se aplica honestamente — não force enquadramento.
4. Registre a decisão (operação, finalidade, base legal, artigo) no registro de operações (art. 37) / RIPD quando aplicável.

## Art. 7º — dado pessoal comum (10 hipóteses)

Ordem de preferência (do menor para o maior risco operacional):

| # | Hipótese | Art. | Quando usar | Pegadinhas |
|---|---|---|---|---|
| 1 | Cumprimento de obrigação legal/regulatória pelo controlador | 7º-II | Lei/norma obriga guardar (fiscal, trabalhista, KYC, retenção Marco Civil) | Precisa apontar a norma específica; trata só o necessário p/ cumpri-la |
| 2 | Execução de contrato ou procedimentos preliminares, **a pedido do titular** | 7º-V | Dado imprescindível p/ entregar o serviço contratado | Só dados realmente necessários ao contrato; "a pedido do titular" |
| 3 | Exercício regular de direitos em processo judicial/admin/arbitral | 7º-VI | Defesa em litígio, prova | Restrito ao processo |
| 4 | Proteção da vida ou incolumidade física do titular/terceiro | 7º-VII | Emergência, segurança física | Excepcional |
| 5 | Tutela da saúde | 7º-VIII | **Só** por profissional de saúde, serviço de saúde ou autoridade sanitária | Agente restrito; fora disso não vale |
| 6 | Políticas públicas (Adm. Pública) | 7º-III | Execução de política pública prevista em lei/regulamento | Setor público; exige publicidade |
| 7 | Estudos por órgão de pesquisa | 7º-IV | Pesquisa, anonimizar sempre que possível | Anonimização preferencial |
| 8 | Legítimo interesse do controlador ou terceiro | 7º-IX | Antifraude, segurança, melhoria de serviço, marketing próprio moderado | **Exige teste de balanceamento** (LIA): finalidade legítima + necessidade + expectativa do titular + salvaguardas; nunca para dado sensível; só dados estritamente necessários; titular pode se opor; transparência reforçada |
| 9 | Proteção do crédito | 7º-X | Score, análise de crédito, cadastro positivo | Observar legislação específica |
| 10 | **Consentimento** | 7º-I / 8º | Quando nenhuma das anteriores cabe | Livre, informado, inequívoco, **específico** por finalidade; revogável a qualquer tempo (gratuito/facilitado, art. 8º §5º); ônus da prova do controlador (art. 8º §2º); proibido em condição abusiva; consentimento ≠ aceite de termos genérico |

### Teste de legítimo interesse (use a hipótese 8)

Documente as 3 etapas:
1. **Finalidade legítima** — qual interesse concreto (não hipotético)?
2. **Necessidade** — não há meio menos invasivo? Dados minimizados?
3. **Balanceamento** — expectativa razoável do titular? Há salvaguardas (pseudonimização, opt-out, transparência)? Direitos/liberdades do titular não prevalecem?
Se o titular não esperaria esse uso ou os dados são muitos → não use legítimo interesse; volte ao consentimento ou redesenhe a finalidade.

## Art. 11 — dado pessoal sensível (regime restrito)

**Não existe legítimo interesse, proteção ao crédito, nem "execução de contrato" genérica para sensível.** Hipóteses:

| Com consentimento | Sem consentimento |
|---|---|
| Consentimento **específico e destacado**, para finalidades específicas (art. 11-I) | Cumprimento de obrigação legal/regulatória |
| | Tratamento compartilhado p/ execução de política pública (lei/regulamento) |
| | Estudos por órgão de pesquisa (anonimizar quando possível) |
| | Exercício regular de direitos (inclusive contrato, processo judicial/admin/arbitral) |
| | Proteção da vida/incolumidade física do titular ou terceiro |
| | Tutela da saúde — **exclusivamente** por profissional/serviço de saúde/autoridade sanitária |
| | Garantia da prevenção à fraude e à segurança do titular na identificação/autenticação (ressalvados direitos do art. 9º) |

Consentimento para sensível é **mais qualificado** que para comum: destacado, específico, com informação reforçada (art. 11-I). Aceite agrupado em termo genérico não vale.

## Compartilhamento e transferência

- **Compartilhar com outro controlador**: nova finalidade ⇒ nova análise de base legal; se a base original era consentimento, pode exigir **novo consentimento específico** (art. 7º §5º).
- **Operador/suboperador**: contrato obrigatório definindo finalidade, instruções e responsabilidades (art. 39); suboperador exige autorização formal do controlador.
- **Transferência internacional** (art. 33): só para país com grau de proteção adequado, ou com cláusulas contratuais/garantias específicas, ou consentimento específico e destacado. Sinalize sempre que dado sair do Brasil (inclusive cloud em região estrangeira / SaaS).

## Ciclo de vida e término (arts. 15-16)

A base legal sustenta o tratamento enquanto a finalidade existe. O tratamento **deve terminar** quando:
- Finalidade alcançada / dados deixaram de ser necessários
- Fim do período de tratamento
- Revogação do consentimento (quando essa era a base) — art. 8º §5º
- Determinação da ANPD por violação

Após o término: eliminar, salvo conservação autorizada para obrigação legal, estudo por pesquisa (anonimizado), transferência a terceiro conforme a Lei, ou uso exclusivo do controlador anonimizado (art. 16). Defina **prazo de retenção por finalidade** e rotina de expurgo — retenção indefinida viola necessidade.

## Saída esperada

Registre bases legais na **seção 2** do relatório (`references/report-format.md`) ou, se preferir detalhar por operação antes da classificação por campo:

| Operação | Finalidade específica | Categoria do dado | Base legal | Artigo | Retenção | Observações |
|---|---|---|---|---|---|---|

Lacunas de ciclo de vida: **seções 3 e 4** do relatório (`references/report-format.md`) — grade `Fase | Estado`, quatro linhas fixas.

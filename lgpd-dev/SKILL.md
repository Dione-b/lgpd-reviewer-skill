---
name: lgpd-dev
version: "1.0.0"
description: >
  Use ao modelar/alterar entidades com dados pessoais (CPF, RG, e-mail,
  telefone, endereço, IP, geolocalização, foto, data de nascimento, saúde,
  biometria, genético, raça, religião, política, sindicato, sexualidade),
  adicionar coleta/compartilhamento/exportação de dados, definir base legal
  (art. 7º ou art. 11), consentimento, retenção, direitos do titular (art. 18),
  auditar schema.prisma / migrations / DTOs procurando dados pessoais não
  classificados, ou planejar adequação LGPD (Lei 13.709/2018).
---

# lgpd-dev

## Overview

Analisa e planeja a adequação de aplicações à **LGPD** (Lei nº 13.709/2018). Não gera apenas código: primeiro classifica os dados, escolhe a base legal correta por operação, e só então planeja a implementação.

**Princípio central:** *toda operação com dado pessoal precisa de uma base legal explícita (art. 7º ou art. 11) ANTES de existir código.* Sem base legal mapeada, o tratamento é ilegal — não importa quão limpo seja o código.

## When to Use

Use quando o trabalho envolver:

- Modelar/alterar entidade ou tabela que contém dado de pessoa natural (nome, CPF, RG, e-mail, telefone, endereço, geolocalização, IP, foto, data de nascimento)
- Campos sensíveis: saúde, biometria, genético, raça/etnia, religião, opinião política, filiação sindical, vida/orientação sexual (art. 5º-II)
- Adicionar coleta, formulário, importação, integração, log que capture dado pessoal
- Compartilhamento/exportação/transferência (inclusive internacional) de dados
- Consentimento, revogação, política de privacidade, termos
- Retenção, expurgo, anonimização, pseudonimização
- Implementar direitos do titular (acesso, correção, eliminação, portabilidade — art. 18)
- Resposta a incidente de segurança / notificação ANPD (art. 48)
- Auditar `schema.prisma`, migrations ou DTOs procurando dado pessoal não mapeado

**Não use para:** dados que não se referem a pessoa natural identificada/identificável (métricas agregadas anônimas, dados de máquina sem vínculo a indivíduo).

## Fluxo de análise (siga em ordem)

1. **Classificar cada campo** — pessoal comum, pessoal sensível, ou não-pessoal. Use `references/field-taxonomy.md`. Na dúvida entre comum e sensível, trate como sensível.
2. **Determinar sensibilidade** — qualquer campo de saúde/biometria/genético/raça/religião/política/sindicato/sexualidade ⇒ regime do art. 11 (mais restrito).
3. **Escolher base legal por operação** (não por entidade — coleta, uso e compartilhamento podem ter bases distintas). Carregue `references/legal-basis.md`.
4. **Mapear ciclo de vida**: Coleta → Retenção → Processamento → Compartilhamento → Eliminação. Para cada fase, identifique ativos (sistema, banco, documento, equipamento, local físico, unidade) e medidas de segurança.
5. **Direitos do titular** — verifique se a aplicação consegue atender art. 18 sobre os dados afetados (acesso, correção, eliminação, portabilidade, revogação de consentimento, info de compartilhamento).
6. **Planejar implementação** — só agora desça para código. Stack Node/NestJS/Prisma: `references/nodejs.md`.

## Taxonomia resumida (detalhe em field-taxonomy.md)

| Categoria | Exemplos | Regime |
|---|---|---|
| Pessoal comum | nome, CPF, RG, e-mail, telefone, endereço, data nasc., IP, cookie ID, geolocalização | art. 7º |
| Pessoal sensível | saúde, biometria, genético, raça/etnia, religião, opinião política, sindicato, vida/orientação sexual | art. 11 (restrito) |
| Anonimizado | sem reidentificação razoável | fora da LGPD (enquanto irreversível) |
| Pseudonimizado | reidentificável com chave separada | ainda é dado pessoal |

## Árvore de base legal (resumo — detalhe em legal-basis.md)

**Dado comum (art. 7º)** — escolha a PRIMEIRA aplicável, nesta ordem de preferência para reduzir risco:
1. Cumprimento de obrigação legal/regulatória → não precisa consentimento
2. Execução de contrato (a pedido do titular) → não precisa consentimento
3. Exercício regular de direitos / processo judicial-admin-arbitral
4. Proteção da vida ou incolumidade física
5. Tutela da saúde (só profissional/serviço de saúde/autoridade sanitária)
6. Políticas públicas / estudo por órgão de pesquisa (setor público/pesquisa)
7. Legítimo interesse do controlador → exige teste de balanceamento + só dados necessários
8. Proteção do crédito
9. **Consentimento** → último recurso (revogável, ônus da prova do controlador)

**Dado sensível (art. 11)** — bases MAIS restritas: consentimento *específico e destacado*, OU sem consentimento apenas para obrigação legal, política pública, pesquisa, exercício de direitos, proteção da vida, tutela da saúde (agente de saúde), garantia contra fraude/segurança do titular. **Não existe "legítimo interesse" para dado sensível.**

## Auditoria automatizada

Para escanear um schema Prisma e listar campos potencialmente pessoais/sensíveis NÃO classificados, rode:

```
node scripts/audit-schema.js caminho/para/schema.prisma
```

Sempre rode o script antes de afirmar que um schema está mapeado — não confie em leitura visual para isso.

## Erros comuns

- **Escolher base legal por entidade, não por operação.** Coletar e compartilhar exigem análise separada.
- **Usar consentimento como padrão.** É a base mais frágil (revogável). Prefira obrigação legal/contrato quando cabível.
- **Tratar campo sensível como comum.** Saúde/biometria mudam o regime inteiro (art. 11, sem legítimo interesse).
- **Esquecer ciclo de vida.** Retenção sem prazo e ausência de expurgo violam necessidade/eliminação (arts. 15-16).
- **Ignorar direitos do titular no design.** Se o schema não permite eliminar/exportar por titular, viola art. 18.
- **Log/observabilidade vazando PII.** Logs com CPF/e-mail são tratamento de dado pessoal.
- **Descer para código antes de mapear base legal.** Código correto sobre tratamento ilegal continua ilegal.

## Referências

- `references/field-taxonomy.md` — classificação exaustiva de campos
- `references/legal-basis.md` — base legal por operação/contexto (art. 7º e art. 11 detalhados)
- `references/nodejs.md` — padrões NestJS/Prisma/TypeScript
- `scripts/audit-schema.js` — scanner determinístico de schema.prisma

Base normativa: Lei nº 13.709/2018 (LGPD); Resolução CD/ANPD nº 15/2024 (incidentes); Guia de Boas Práticas ANPD.

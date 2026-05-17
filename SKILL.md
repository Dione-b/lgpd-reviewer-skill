---
name: lgpd-reviewer
description: Use quando o trabalho envolver dados pessoais ou sensíveis (CPF, e-mail, saúde, biometria), coleta/compartilhamento/transferência internacional, consentimento, retenção, direitos do titular (art. 18), incidentes de segurança, ou auditoria de schema.prisma/migrations/DTOs sem mapeamento LGPD explícito.
---

# lgpd-reviewer

## Overview

Adequação à **LGPD** (Lei 13.709/2018): base legal e ciclo de vida **antes** de código.

**Princípio:** base legal explícita por **operação**, não por entidade.

## When to Use

PII/sensível em modelos, APIs, formulários, logs; consentimento, retenção, expurgo; direitos art. 18; transferência internacional; incidentes; auditoria Prisma/migrations/DTOs.

## Fluxo (ordem fixa)

1. Classificar — `references/field-taxonomy.md`
2. Base legal — `references/legal-basis.md`
3. Ciclo de vida — quatro fases fixas (ver formato)
4. Direitos do titular — art. 18
5. **Relatório tabular** — `references/report-format.md` (**obrigatório**)
6. Implementar — `references/nodejs.md` (se Node)

## Formato de saída (obrigatório)

**REQUIRED:** Carregue `references/report-format.md`. A análise **só está completa** com as tabelas abaixo — conteúdo varia por projeto; **estrutura não**.

| Seção | Tipo | Estrutura |
|---|---|---|
| 1 | texto | Resumo executivo |
| 2 | **tabela** | `Campo/Fonte` \| `Categoria` \| `Base legal` \| `Retenção` \| `Minimizar?` \| `Em logs?` |
| 2.1 | **tabela** | `Operação` \| `Finalidade` \| `Categoria` \| `Base legal` \| `Artigo` \| `Retenção` |
| **3** | **tabela** | **`Fase` \| `Estado`** — 4 linhas fixas: Coleta, Retenção, Compartilhamento, Eliminação |
| **4** | **tabela** | **mesma grade `Fase` \| `Estado`** + linha `Veredito geral:` |
| 4.1 | tabela (opcional) | `Dimensão` \| `Resultado` |
| 5 | tabela (se ≠ CONFORME) | `Prioridade` \| `Ação` \| `Fase/Artigo` \| `Esforço` |

**Marcadores:** terminar células `Estado`/`Resultado` com `✅` `⚠️` `❌`.

**Proibido:** listas ou prosa no lugar das tabelas das seções 2, 2.1, 3, 4; alterar nomes/ordem das quatro fases; encerrar sem seções 3 e 4.

Múltiplos escopos ⇒ repetir tabelas 3 e 4 com subtítulo por escopo.

## Auditoria Prisma

`node scripts/audit-schema.js caminho/schema.prisma`

## Referências

| Tema | Arquivo |
|---|---|
| **Formato do relatório** | **`references/report-format.md`** |
| Classificação | `references/field-taxonomy.md` |
| Base legal | `references/legal-basis.md` |
| Node/Nest/Prisma | `references/nodejs.md` |

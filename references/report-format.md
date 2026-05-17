# Especificação do formato de saída — análise LGPD

Carregue ao **redigir o relatório final**. Este arquivo define **somente estrutura e colunas** — o conteúdo vem da análise do projeto analisado.

## Convenções globais

| Regra | Detalhe |
|---|---|
| Seções | Numeradas `## 1.` … `## 5.` na ordem; não pule |
| Tabelas | Markdown com cabeçalho; seção marcada **(tabela)** só aceita tabela |
| Marcador | Último token da célula **Estado** (e **Resultado** quando aplicável): `✅` `⚠️` `❌` |
| Lacuna | Sem evidência ⇒ texto objetivo + `❌` (nunca omitir a linha) |
| Múltiplos escopos | Repita blocos 3 e 4 com subtítulo `### 3.1 Nome do escopo` |

---

## 1. Resumo executivo

**Formato:** parágrafo curto (2–4 frases). **Sem tabela.**

Campos conceituais (em prosa, não como lista solta): escopo | risco geral | lacuna principal | próximo passo.

---

## 2. Classificação de dados **(tabela)**

Uma linha por **campo ou fonte** de dado pessoal no escopo.

### Colunas (todas obrigatórias)

| Coluna | O que preencher |
|---|---|
| **Campo / Fonte** | Nome técnico ou origem (coluna, DTO, cookie, endpoint, arquivo) |
| **Categoria** | `comum` \| `sensível` \| `não-pessoal` |
| **Base legal (operação)** | Hipótese + art. 7º ou 11 para a operação que usa este dado |
| **Retenção** | Prazo ou gatilho de término (`5a`, `até_revogacao`, `obrigação_X`) |
| **Minimizar?** | `sim` se necessário à finalidade; `não` + recomendação de remoção |
| **Em logs?** | `sim` \| `não` — se `sim` em dado pessoal/sensível, sinalizar risco |

### Esqueleto

| Campo / Fonte | Categoria | Base legal (operação) | Retenção | Minimizar? | Em logs? |
|---|---|---|---|---|---|
| | | | | | |

Taxonomia: `references/field-taxonomy.md`.

---

## 2.1 Bases legais por operação **(tabela)**

Uma linha por **operação de tratamento** (não por entidade).

| Coluna | O que preencher |
|---|---|
| **Operação** | `coleta` \| `uso` \| `armazenamento` \| `compartilhamento` \| `exportação` |
| **Finalidade** | Uma frase específica |
| **Categoria do dado** | `comum` \| `sensível` |
| **Base legal** | Nome da hipótese (ex.: contrato, consentimento, obrigação legal) |
| **Artigo** | Referência (ex.: art. 7º-V) |
| **Retenção** | Prazo vinculado a esta finalidade |

### Esqueleto

| Operação | Finalidade | Categoria do dado | Base legal | Artigo | Retenção |
|---|---|---|---|---|---|
| | | | | | |

Detalhe: `references/legal-basis.md`.

---

## 3. Ciclo de vida (lacunas) **(tabela)**

Estado **observado** no artefato analisado (código, config, docs) — não o estado desejado.

### Colunas

| Coluna | O que preencher |
|---|---|
| **Fase** | Valor fixo da primeira coluna (não editar o rótulo) |
| **Estado** | Descrição factual + marcador final `✅` `⚠️` `❌` |

### Linhas fixas (ordem obrigatória)

| Fase | Estado |
|---|---|
| **Coleta** | Origem do dado; base legal no momento da entrada; aviso/consentimento se aplicável |
| **Retenção** | Prazo; documentação; implementação técnica de expiração |
| **Compartilhamento** | Operadores/terceiros; contrato art. 39; transferência internacional art. 33 |
| **Eliminação** | Mecanismo técnico; informação ao titular; rotina de expurgo |

**Não** adicionar, remover ou renomear fases. **Não** fundir fases em uma linha.

### Esqueleto (preencher)

| Fase | Estado |
|---|---|
| Coleta | |
| Retenção | |
| Compartilhamento | |
| Eliminação | |

---

## 4. Veredito **(tabela)**

Mesma grade da seção **3** (`Fase` \| `Estado`), com **julgamento final** por fase (pode ser mais sintético que a seção 3).

### Linhas fixas

| Fase | Estado |
|---|---|
| Coleta | |
| Retenção | |
| Compartilhamento | |
| Eliminação | |

### Após a tabela (texto, fora da grade)

Uma linha:

**Veredito geral:** `CONFORME` | `PARCIALMENTE CONFORME` | `NÃO CONFORME` — {justificativa em uma frase}

Regra: se qualquer linha da tabela 4 tiver `❌`, veredito geral **não** pode ser `CONFORME`.

---

## 4.1 Dimensões complementares **(tabela, opcional)**

Use quando o escopo exigir síntese além do ciclo de vida:

| Dimensão | Resultado |
|---|---|
| Classificação de dados | {síntese} {✅\|⚠️\|❌} |
| Bases legais | {síntese} {✅\|⚠️\|❌} |
| Direitos do titular (art. 18) | {síntese} {✅\|⚠️\|❌} |
| Segurança e incidentes (arts. 46–48) | {síntese} {✅\|⚠️\|❌} |

---

## 5. Plano de adequação **(tabela)**

Incluir **somente** se veredito geral ≠ `CONFORME`. Omitir a seção inteira se conforme.

| Coluna | O que preencher |
|---|---|
| **Prioridade** | `P0` \| `P1` \| `P2` |
| **Ação** | O que fazer (verbo + artefato) |
| **Fase / Artigo** | Fase do ciclo ou artigo LGPD |
| **Esforço** | `baixo` \| `médio` \| `alto` |

### Esqueleto

| Prioridade | Ação | Fase / Artigo | Esforço |
|---|---|---|---|
| | | | |

---

## Checklist antes de encerrar

- [ ] Seções 1–4 presentes e numeradas
- [ ] Seção 2: tabela com todas as colunas por campo/fonte
- [ ] Seção 2.1: tabela por operação
- [ ] Seção 3: exatamente 4 linhas (Coleta → Eliminação)
- [ ] Seção 4: mesma grade da 3 + linha `Veredito geral:`
- [ ] Nenhuma seção **(tabela)** substituída por lista ou parágrafo corrido
- [ ] Todo `Estado` / `Resultado` termina com `✅`, `⚠️` ou `❌`

## Anti-padrões de formato

| Anti-padrão | Correto |
|---|---|
| Bullets na seção 3 ou 4 | Tabela `Fase \| Estado` |
| Menos de 4 linhas no ciclo de vida | Quatro fases fixas |
| Marcador ausente na célula | Sempre no final da célula |
| `CONFORME` com `❌` na tabela 4 | Ajustar veredito geral |
| Seção 4 repetida sem subtítulo de escopo | `### 4.1 Escopo X` por contexto |

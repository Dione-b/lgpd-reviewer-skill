# Análise LGPD — viral-insight-etl

> Relatório gerado como teste da skill `lgpd-reviewer` (2026-05-17).  
> Escopo: repositório `/home/dionebastos/Documentos/PROJETOS/viral-insight-etl` (branch principal, sem worktrees).

## 1. Resumo executivo

A plataforma Circular Hedge / ViralInsight trata dados pessoais de usuários cadastrados (username, e-mail, senha com hash Argon2, portfólio financeiro) e encaminha conteúdo de redes/notícias a operadores externos (DeepSeek, SerpAPI, Reddit, NewsAPI, etc.) para análise por IA. O risco geral é **alto**: não há política de privacidade, fluxo de consentimento ou endpoints de direitos do titular; credenciais de terceiros podem ir para logs; transferências internacionais não estão documentadas. Próximo passo: documentar bases legais, publicar aviso ao titular e implementar eliminação/portabilidade antes do deploy público.

## 2. Classificação de dados

| Campo / Fonte | Categoria | Base legal (operação) | Retenção | Minimizar? | Em logs? |
|---|---|---|---|---|---|
| `users.username` | comum | Execução de contrato / cadastro (art. 7º-V) — a confirmar | Indefinida no código | sim | sim — falha de auth loga identifier |
| `users.email` | comum | Idem | Indefinida | sim | sim — JWT e resposta `/auth/login` |
| `users.password_hash` | comum | Idem (necessário à autenticação) | Até exclusão da conta | sim | não direto; hash retornado em `authenticate_user` internamente |
| `users.created_at`, `is_active` | comum | Idem | Indefinida | sim | não |
| JWT (`sub`, `email`, `exp`) | comum | Execução de contrato (sessão) | 8h (`_JWT_EXPIRE_HOURS`) | sim (email no token é redundante com `sub`) | não |
| `localStorage` `auth-storage` (token + user) | comum | Idem | Até logout/limpeza manual | sim | não |
| `portfolio_holdings` (ticker, qty, preço, data) | comum (financeiro) | Execução de contrato (art. 7º-V) | Indefinida | sim | sim — `user_id` em logs |
| `search_history` (modelo ORM) | comum | Não evidenciado uso no código | N/A se não gravado | sim — remover se morto | não |
| `cached_news.author` | comum (terceiros) | Legítimo interesse / pesquisa — a formalizar | `mysql_cache_ttl_hours` (24h default) se cache MySQL | sim | não |
| `app_config.twitter_accounts` | comum (credenciais de terceiros) | Operacional — não é dado do titular da plataforma | Persistente cifrado (Fernet) | não — necessário à integração | **sim** — `update_current_settings` loga payload completo |
| Conteúdo social/notícias → LLM (DeepSeek/Ollama) | comum (pode conter PII de terceiros) | Legítimo interesse / contrato — a formalizar | Cache disco `*_ai_summary.json` sem TTL | revisar minimização no prompt | não direto |
| Relatórios CSV em `data/reports/` | comum (agregado de fontes públicas) | Finalidade de análise | Sem expurgo automático | sim | não |

## 2.1 Bases legais por operação

| Operação | Finalidade | Categoria do dado | Base legal | Artigo | Retenção |
|---|---|---|---|---|---|
| coleta | Cadastro e login na plataforma | comum | Execução de contrato / procedimentos preliminares | art. 7º-V | Enquanto conta ativa |
| armazenamento | Persistir perfil e portfólio | comum | Execução de contrato | art. 7º-V | Indefinida — definir política |
| uso | Autenticação JWT | comum | Execução de contrato | art. 7º-V | 8h (token) |
| coleta | Ingestão Reddit/Twitter/notícias para pipeline | comum (terceiros) | Legítimo interesse — **requer LIA documentado** | art. 7º-IX | Cache configurável |
| compartilhamento | Envio de trechos a DeepSeek/Gemini/Ollama | comum | Legítimo interesse ou contrato com operador — **requer DPA** | art. 7º-IX / art. 39 | Conforme operador |
| compartilhamento | APIs SerpAPI, NewsAPI, Reddit, RapidAPI | comum | Legítimo interesse / contrato | art. 7º-IX | TTL cache API |
| exportação | Download de relatórios CSV pelo usuário autenticado | comum | Execução de contrato | art. 7º-V | Controle do titular |

## 3. Ciclo de vida (lacunas)

### 3.1 Dados de usuários da plataforma

| Fase | Estado |
|---|---|
| Coleta | `POST /auth/register` público; campos username/e-mail/senha sem aviso de privacidade nem checkbox de consentimento ❌ |
| Retenção | MySQL sem política documentada; sem job de expurgo de contas inativas ❌ |
| Compartilhamento | Não evidenciado compartilhamento de dados de cadastro com terceiros além do hospedeiro (Vercel/on-prem) — contrato art. 39 não documentado no repositório ⚠️ |
| Eliminação | Sem endpoint de exclusão de conta, portfólio ou portabilidade (art. 18) ❌ |

### 3.2 Pipeline, cache e operadores de IA

| Fase | Estado |
|---|---|
| Coleta | Fontes externas configuradas via `.env`/`app_config`; sem registro de operações (art. 37) no código ❌ |
| Retenção | `APICache.expires_at` e `mysql_cache_ttl_hours` existem; relatórios e `*_ai_summary.json` sem TTL automático ⚠️ |
| Compartilhamento | DeepSeek (`api.deepseek.com`), SerpAPI, NewsAPI, Reddit, etc.; transferência internacional não divulgada (art. 33) ❌ |
| Eliminação | Exclusão de relatórios por API; sem rotina para cache MySQL/notícias além de TTL parcial ⚠️ |

## 4. Veredito

### 4.1 Dados de usuários da plataforma

| Fase | Estado |
|---|---|
| Coleta | Cadastro sem base informada ao titular ❌ |
| Retenção | Sem prazo nem documentação ❌ |
| Compartilhamento | Operador de infraestrutura não mapeado no produto ⚠️ |
| Eliminação | Direitos art. 18 não implementados ❌ |

### 4.2 Pipeline, cache e operadores de IA

| Fase | Estado |
|---|---|
| Coleta | Operadores múltiplos sem transparência ❌ |
| Retenção | Parcial (cache API); relatórios persistentes ⚠️ |
| Compartilhamento | Transferência internacional sem salvaguardas documentadas ❌ |
| Eliminação | Parcial ⚠️ |

**Veredito geral:** `NÃO CONFORME` — ausência de governança (aviso, bases documentadas, direitos do titular e transferência internacional) para um sistema com cadastro aberto e envio de dados a LLMs e APIs no exterior.

## 4.1 Dimensões complementares

| Dimensão | Resultado |
|---|---|
| Classificação de dados | Campos mapeados no ORM; sem `@lgpd` nem inventário formal ⚠️ |
| Bases legais | Implícitas (contrato/LIA); não registradas por operação ❌ |
| Direitos do titular (art. 18) | Sem eliminação, acesso exportável ou revogação ❌ |
| Segurança e incidentes (arts. 46–48) | Senha com Argon2 e Fernet para secrets ✅; log de payload sensível ❌ |

## 5. Plano de adequação

| Prioridade | Ação | Fase / Artigo | Esforço |
|---|---|---|---|
| P0 | Publicar política de privacidade e aviso no registro | Coleta / arts. 8–9 | baixo |
| P0 | Remover log de payload completo em `update_current_settings` | Segurança / art. 46 | baixo |
| P0 | Implementar `DELETE /auth/account` + cascata portfólio | Eliminação / art. 18 | médio |
| P1 | Documentar operadores e cláusulas art. 33 (DeepSeek, SerpAPI, etc.) | Compartilhamento / art. 33 | médio |
| P1 | Definir e aplicar TTL/expurgo para `data/reports/` e `cached_news` | Retenção / arts. 15–16 | médio |
| P1 | Registro de operações (art. 37) — tabela ou documento versionado | Coleta / art. 37 | médio |
| P2 | Endpoint de exportação de dados do titular (portabilidade) | art. 18 | médio |
| P2 | Revisar necessidade de `email` no JWT | Minimização / art. 6º | baixo |

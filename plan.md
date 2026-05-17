## Seção 1 — Estrutura de arquivos


lgpd-dev/
├── SKILL.md                    ← núcleo: triggers, taxonomia de campos, árvore de base legal
├── references/
│   ├── field-taxonomy.md       ← classificação exaustiva de campos por categoria LGPD
│   ├── legal-basis.md          ← guia de base legal por operação/contexto
│   └── nodejs.md               ← padrões de implementação NestJS/Prisma/TypeScript
└── scripts/
    └── audit-schema.js         ← script que analisa schema.prisma e reporta campos sensíveis


*Racional:*
- SKILL.md carrega sempre — contém triggers e lógica de navegação, mantido enxuto
- references/ carrega sob demanda — o agente puxa apenas o que precisa (taxonomia ao ver um campo, base legal ao modelar uma operação)
- scripts/ para a tarefa mais frágil e repetitiva: scan de schema — offload para script determinístico em vez de depender do LLM
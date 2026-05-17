# lgpd-dev — LGPD Skill para Developers

Skill developer-centric para adequação de aplicações Node.js/NestJS/Prisma à **LGPD (Lei 13.709/2018)**.

Foco em dois pain points práticos:
- Classificar campos de dados pessoais e sensíveis em tempo de design
- Determinar a base legal correta por operação (art. 7º e art. 11)

## Instalação

```bash
npx skills add mferreiradb/lgpd-reviewer-skill --skill lgpd-dev
```

## Quando ativa

A skill ativa automaticamente quando o agente detecta trabalho envolvendo:
- Modelagem de entidades com dados de pessoa natural (CPF, e-mail, saúde, biometria…)
- Definição de base legal, consentimento, retenção ou expurgo
- Auditoria de `schema.prisma`, migrations ou DTOs
- Implementação de direitos do titular (art. 18)

## Estrutura

```text
lgpd-dev/
├── SKILL.md                  ← núcleo: fluxo, taxonomia, base legal
├── references/
│   ├── field-taxonomy.md     ← classificação exaustiva de campos
│   ├── legal-basis.md        ← base legal por operação/contexto
│   └── nodejs.md             ← padrões NestJS/Prisma/TypeScript
└── scripts/
    └── audit-schema.js       ← scanner determinístico de schema.prisma
```

## Stack coberta

Node.js · NestJS · Prisma · TypeScript

## Base normativa

Lei nº 13.709/2018 (LGPD) · Resolução CD/ANPD nº 15/2024 · Guia de Boas Práticas ANPD

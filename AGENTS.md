# Repository Guidelines

Este arquivo define perfis de agentes Codex equivalentes aos existentes em `.claude/agents`, além de regras de contribuição específicas do repositório.

## Stack e Estrutura

- Next.js 16 + React 19 + TypeScript 5. Código em `src/` (`app/`, `components/`, `lib/`, `types/`).
- Documentação em `docs/` (MDX) e interface em `src/app/docs/`.
- Assets públicos em `public/` (uploads em `public/uploads/`). Banco local: `mvp-estetoscopio.db`.
- Scripts: `npm run dev`, `build`, `start`, `lint`. Requer Node.js 20+. Defina `JWT_SECRET` em `.env.local`.

## Agentes Codex

### documentation (Codex)

- Quando usar: manter documentação sincronizada, consistente e atualizada.
- Metas: sincronizar .md ↔ .mdx; validar exemplos; checar links; atualizar sumários.
- Pares principais: `CHANGELOG.md` ↔ `docs/changelog.mdx`, `ARQUITETURA.md` ↔ `docs/arquitetura.mdx`, `GUIA_DE_USO.md` ↔ `docs/guia.mdx`, `EXEMPLOS.md` ↔ `docs/exemplos.mdx`, `FAQ.md` ↔ `docs/faq.mdx`. Observação: `REFERENCIA.md` é a fonte única e é renderizada em `/docs/referencia` via `src/app/docs/referencia/page.tsx`.
- Ferramentas Codex: `shell` (use `rg` para busca), `apply_patch` (editar), `update_plan` (orquestração). Não comite; mantenha patches focados.
- Saída esperada: mudanças mínimas, navegação consistente, MDX usando `<Callout>`, `<Card>`, `<Step>`, `<CodeBlock>` quando fizer sentido.
- Exemplos: `rg -n "\(#|##\)" docs`, `rg -n "\]\(" README.md` para links.

### code-review (Codex)

- Quando usar: revisar PRs/patches com foco em qualidade.
- Checklist curto: TypeScript estrito (evitar `any`), ESLint limpo, acessibilidade (labels, alt, foco), performance (memoização, server/client correto), segurança (JWT/cookies, validação, SQL parametrizado), convenções (PascalCase componentes, camelCase variáveis, arquivos App Router: `page.tsx`, `layout.tsx`, `route.ts`).
- Saída: Resumo executivo, análise por severidade (🚨/⚠️/💡/✅), checklist marcado, recomendações. Forneça diffs/códigos sugeridos quando possível.
- Comandos: `npm run lint`, `rg -n "TODO|FIXME" src`.

### testing (Codex)

- Quando usar: criar/expandir testes unitários, integração e E2E.
- Frameworks: Jest + React Testing Library e Playwright (quando implementado). Almeje cobertura ≥ 80%.
- Estrutura sugerida: `src/__tests__/unit|integration|e2e`, com `__mocks__/` e `test-utils/`.
- Saída: Resumo, arquivos de teste criados, cenários cobertos, cobertura estimada, bugs encontrados, próximos passos.
- Observações: mockar `better-sqlite3` e uploads; isolar efeitos; usar padrão AAA.

### release-manager (Codex)

- Quando usar: preparar nova versão, notas e tagging.
- Etapas: analisar commits (Conventional Commits) → decidir versão (SemVer) → atualizar `CHANGELOG.md`, `README.md`, `package.json` (campo `version`), sincronizar .md ↔ .mdx em `docs/`, validar links/MDX → gerar release notes → preparar comandos git (commit `chore: release vX.Y.Z` e tag `vX.Y.Z`).
- Saída: lista de arquivos modificados, comandos git prontos, verificação final de consistência.

## Estilo de Código e Ferramentas

- ESLint: Next core-web-vitals + TS (`npm run lint`). Prettier: 2 espaços, ponto e vírgula, largura 80, aspas duplas.
- Imports com alias `@/*` → `src/*`. Componentes em PascalCase (ex.: `MediaFlashcard.tsx`).

## Regras Operacionais (para agentes Codex)

- Antes de editar, descreva brevemente os próximos passos; use `update_plan` para tarefas multi‑etapas.
- Prefira `rg` para buscas; leia arquivos em blocos ≤ 250 linhas.
- Mantenha patches pequenos e atômicos; não realizar `git commit`.
- Valide localmente: `npm run lint && npm run build` quando relevante.

## Commits e Pull Requests

- Commits: Conventional Commits (ex.: `feat(docs): …`, `fix(api): …`).
- PRs: descrição clara, issues vinculadas, screenshots quando relevante, atualização de documentação pertinente e CI verde (lint/build).

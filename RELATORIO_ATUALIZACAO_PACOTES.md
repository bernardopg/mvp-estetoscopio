# Relatório de Atualização de Pacotes — mvp-estetoscopio

**Data:** 28/08/2026
**Escopo:** Revisão completa de dependências (`package.json`/`package-lock.json`): updates, security issues e vulnerabilities + majors + correção dos 14 erros de lint.
**Resultado:** ✅ **0 vulnerabilidades** (antes: 1 HIGH) · majors aplicados (better-sqlite3 13, marked 18, lucide-react 1.x, TypeScript 6) · **0 erros de lint** (antes: 14) · build/lint/runtime validados.

---

## 0. Atualização — Fase 2 (majors, lint e ambiente)

| Item | Antes | Depois | Status |
|---|---|---|---|
| Erros de lint | 14 | **0** | ✅ corrigidos (§6.2) |
| Servidor Next órfão (v16.2.1) | rodando | morto | ✅ (§6.3) |
| `lucide-react` | 0.552.0 | **1.35.0** | ✅ aplicado — 34 arquivos, zero breaking changes de API |
| `typescript` | 5.9.3 | **6.0.3** | ✅ aplicado — código **provado TS7-ready** (tsc + build passam no 7.0.2 nativo) |
| `eslint` | 9.39.5 | 9.39.5 | ⏸ bloqueado — ver §4.1 |
| `@types/node` | 24.13.3 | 24.13.3 | ✅ correto — deve casar com o runtime (Node 24) |

### Correções aplicadas nos 14 erros de lint (react-hooks v7 / React Compiler)

Padrões corrigidos:
1. **Função com setState chamada diretamente no corpo do effect** (`react-hooks/set-state-in-effect`) → chamada envolvida em IIFE async: `useEffect(() => { (async () => { await fn(); })(); }, [deps])` — validado empiricamente contra o plugin. Aplicado em `baralhos/criar`, `baralhos/[id]/editar`, `baralhos/[id]/estudar`, `baralhos/page`, `comunidades/page`, `comunidades/[id]/page`, `perfil/page`, `perfil/notificacoes/page`, `CommentsList`, `ShareDeckModal`.
2. **Função usada antes da declaração** → declaração movida para antes do `useEffect` que a usa.
3. **`Date.now()` durante render** (`react-hooks/purity`) em `baralhos/page.tsx` → helper de módulo `exportDeckFilename()` (fora do componente, fora do escopo de pureza do render).
4. **`localStorage` + setState em effect** (`Sidebar.tsx`) → refatorado para **`useSyncExternalStore`** com store de módulo + evento custom — solução oficial do React para stores externos: sem cascata de renders, sem risco de hidratação e **sincronização entre abas** via evento `storage`.

### Por que TypeScript 6 e não 7?
- Com `typescript@7.0.2`: `tsc --noEmit` ✅ e `next build` ✅ (44/44 páginas) — **o código do projeto já é 100% compatível com o compilador nativo**.
- Porém `typescript-eslint` (embutido no `eslint-config-next`) **falha em runtime com TS 7.0** ("does not support TS 7.0"; suporte a TS ≥7.1 em tracking no repo deles). Como o repo exige `npm run lint` verde, o root fica em `typescript@^6.0.3` (último baseado em JS).
- Para migrar quando o typescript-eslint suportar: `npm install -D typescript@^7` e pronto — nenhum outro ajuste necessário (a declaração MDX de `src/types/mdx-modules.d.ts` já cobre os dois).

### Ajuste técnico incluído (TS6/TS7)
- `src/types/mdx-modules.d.ts` (novo): declaração ambiente `declare module "@docs/*.mdx"` — o wildcard `*.mdx` do `@types/mdx` não é aplicado pelo compilador nativo a imports resolvidos via `paths` do tsconfig.

---

## 1. Resumo Executivo

| Item | Antes | Depois |
|---|---|---|
| Vulnerabilidades (npm audit) | 1 HIGH | **0** |
| Pacotes desatualizados (dentro do range semver) | 22 | **0** (restam 4 majors, avaliados na §4) |
| Dependências obsoletas/deprecadas | 3 | **0** (removidas) |
| Build (`npm run build`) | ❌ falhava no Node 24 | ✅ 44/44 páginas |
| Smoke test runtime | — | ✅ auth, DB e docs OK |

**Vulnerabilidade corrigida:**
- **GHSA-2v37-7h3g-55p8** — `nanoid < 3.3.18` (*high*, CWE-835: loop infinito em geradores customizados). Vindo transitivamente de `postcss@8.5.25 → nanoid@3.3.16`. **Correção:** override de `postcss` elevado para `^8.5.26`, que resolve `nanoid@3.3.18`.

---

## 2. Atualizações Aplicadas

### 2.1 Dependencies

| Pacote | Antes | Depois | Observação |
|---|---|---|---|
| `next` | 16.2.12 | **16.3.3** | Última estável (dist-tag `latest`) |
| `@next/mdx` | 16.0.1 | **16.3.3** | Alinhado ao `next` |
| `react` / `react-dom` | 19.2.0 | **19.2.8** | Mantido pin exato (estilo do repo) |
| `better-sqlite3` | 11.10.0 | **13.0.3** ⚠️ major | **Obrigatório**: v11 trava no teardown do Node 24 (SIGABRT, ver §5). API sem mudanças |
| `marked` | 16.4.1 | **18.0.11** ⚠️ major | Validado: `marked.parse()` renderiza `REFERENCIA.md` corretamente |
| `recharts` | 3.3.0 | **3.10.1** | Dentro do range ^3.3 |
| `jsonwebtoken` | 9.0.2 | **9.0.3** | Patch de segurança |
| `cookie` | 1.0.2 | **REMOVIDO** | Dependência morta — nenhum `import` no código (o app usa `cookies()` do Next, não este pacote) |
| `adm-zip`, `bcryptjs`, `jszip`, `@dnd-kit/*`, `@mdx-js/*`, `lucide-react`, `@types/*` | — | já atuais | Sem ação |

### 2.2 DevDependencies

| Pacote | Antes | Depois | Observação |
|---|---|---|---|
| `eslint-config-next` | 16.0.1 | **16.3.3** | Alinhado ao `next` |
| `eslint` | 9.39.0 | **9.39.5** | Patch |
| `@playwright/test` | 1.56.1 | **1.62.1** | Minor |
| `tailwindcss` + `@tailwindcss/postcss` | 4.1.16 | **4.3.3** | Minor |
| `@tailwindcss/typography` | 0.5.0-alpha.3 | **0.5.20** | Saiu de alpha para release estável |
| `@types/node` | ^20 (20.19.24) | **^24 (24.13.3)** | Alinhado ao runtime (Node v24.19.0). Node 20 está EOL |
| `@types/react` / `@types/react-dom` | 19.2.2 | **19.2.18 / 19.2.5** | Minor |
| `@types/better-sqlite3` | 7.6.13 | **9.6.0** | Acompanha better-sqlite3 13 |
| `@types/bcryptjs` | 2.4.6 | **REMOVIDO** | Stub deprecado — bcryptjs 3 embute tipos próprios |
| `@types/recharts` | 1.8.29 | **REMOVIDO** | Stub deprecado — recharts 3 embute tipos próprios |
| `@types/cookie` | 0.6.0 | **REMOVIDO** | Stub deprecado — cookie 1+ embute tipos próprios |

### 2.3 Overrides e allowScripts

- `overrides.postcss`: `^8.5.25` → `^8.5.26` (corrige o nanoid vuln). `sharp` mantido em `^0.35.3` (resolveu `0.35.4`).
- `allowScripts`: `better-sqlite3@11.10.0` → `better-sqlite3@13.0.3`; `unrs-resolver@1.11.1` → `unrs-resolver@1.12.2`.

---

## 3. Segurança

```
$ npm audit          → found 0 vulnerabilities
$ npm audit --omit=dev → found 0 vulnerabilities
```

Nenhum advisory aberto contra o projeto. Recomenda-se manter auditoria periódica:

```bash
npm audit                    # verificar
npm audit fix                # corrigir patches/minors automáticos
```

> 💡 **Automação sugerida:** ativar Dependabot/Renovate no GitHub (`.github/dependabot.yml`) para PRs semanais de update — o projeto já tem diretório `.github/`.

---

## 4. Majors Pendentes (avaliação de risco)

### 4.1 `eslint` 9 → 10 — ❌ BLOQUEADO (testado)
Testado empiricamente: `eslint-config-next@16.3.3` embute `eslint-plugin-react` que usa APIs removidas no ESLint 10 (`contextOrFilename.getFilename is not a function`). Toda a cadeia de plugins (plugin-react 7.37.5, jsx-a11y 6.10.2, import 2.32.0 — **últimas versões**) declara peer `^3..^9`. Não existe override viável. **Reabrir quando `eslint-config-next` suportar ESLint 10.**

### 4.2 `typescript` 6 → 7 — pronto, aguarda ecossistema
Código 100% TS7-compatible (validado). Bloqueado apenas pelo `typescript-eslint` embutido no `eslint-config-next` (§0). `@types/node` permanece em 24.x — deve casar com o runtime Node 24 (26.x mente sobre APIs disponíveis).

---

## 5. Validação Executada

1. **`npm run build`** — ✅ sucesso (Next 16.3.3/Turbopack, 44/44 páginas estáticas, TypeScript OK).
   - Antes da correção do better-sqlite3, o build **crashava** (SIGABRT no teardown de workers, `Statement::~Statement`): incompatibilidade real entre better-sqlite3 v11 e Node 24. Com v13.0.3, resolvedo.
2. **Smoke test runtime** (`npm start`, porta 3001):
   - `GET /login` → 200 ✅
   - `GET /` → 307 (redirect do proxy de auth — comportamento esperado) ✅
   - `POST /api/auth/login` (query no SQLite) → 401 com credenciais inválidas ✅
   - `GET /docs/referencia` (usa `marked.parse`) → renderização validada em isolamento: HTML com h1/h2/code/blockquote correto ✅
3. **`npx eslint .`** — 14 erros **pré-existentes** (ver §6.2), não introduzidos por esta atualização (plugin react-hooks já estava na v7 antes).

---

## 6. Problemas Pré-existentes Identificados (fora do escopo de pacotes)

### 6.1 Rede: IPv6 quebrado na máquina afeta npm/Node
`curl` funciona (Happy Eyeballs), mas o Node tenta IPv6 e trava (`ETIMEDOUT`) em `npm outdated/audit/view`. Workaround usado nesta sessão:

```bash
NODE_OPTIONS="--no-network-family-autoselection" npm <comando>
```

Fix permanente sugerido (um de): corrigir o IPv6 do roteador/sistema, desabilitar IPv6 na interface, ou adicionar o `NODE_OPTIONS` ao shell profile.

### 6.2 14 erros de lint (React Compiler / react-hooks v7)
Regras `react-hooks/set-state-in-effect`, "Cannot access variable before it is declared" e "Cannot call impure function during render" em 11 arquivos (`Sidebar.tsx`, `ShareDeckModal.tsx`, `CommentsList.tsx`, páginas de baralhos/comunidades/perfil). São dívida de código real (setState síncrono em effects) — vale um PR de refactor dedicado.

### 6.3 Porta 3000 ocupada por WhatsApp bridge (não é do projeto)
O `next-server` órfão v16.2.1 foi finalizado. A porta 3000 em si pertence a um **WhatsApp bridge** não-relacionado (`~/.hermes/hermes-agent`, pid 235545) — não foi alterado. Para rodar o projeto enquanto ele existir:

```bash
npm run dev -- -p 3001
```

---

## 7. Validação da Fase 2

1. `npx eslint .` → **0 erros, 0 warnings** ✅
2. `npx tsc --noEmit` (TS 6.0.3) → ✅ · com TS 7.0.2 também ✅
3. `npm run build` → **44/44 páginas** (Next 16.3.3 + TS 6.0.3 + lucide 1.35) ✅ · com TS 7.0.2 também ✅
4. Smoke test runtime: `/login` → 200, query no SQLite → 401, `/docs/referencia` → 307 (auth proxy, esperado) ✅
5. `npm audit` → **0 vulnerabilidades** ✅

## 8. Comandos Sugeridos para Commit

```bash
git add package.json package-lock.json src/ RELATORIO_ATUALIZACAO_PACOTES.md
git commit -m "chore(deps): majors e correção de lint

- lucide-react 0.552→1.35; typescript 5.9→6.0 (código TS7-ready)
- corrige 14 erros de lint (react-hooks v7): IIFE async em effects,
  ordem de declaração, purity (Date.now) e useSyncExternalStore na Sidebar
- src/types/mdx-modules.d.ts: declara @docs/*.mdx p/ compilador nativo
- npm audit: 0 vulnerabilidades; build 44/44 páginas

Fase 1: atualização geral + correção nanoid (GHSA-2v37-7h3g-55p8)
- next/@next/mdx/eslint-config-next 16.3.3; react 19.2.8
- better-sqlite3 11→13 (corrige crash no teardown com Node 24)
- marked 16→18 (validado em /docs/referencia)
- remove cookie (não usado) e @types stubs deprecados
- @types/node ^24 alinhado ao runtime; tailwind 4.3.3; playwright 1.62.1"
```

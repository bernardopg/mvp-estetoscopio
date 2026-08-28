# 🤖 GitHub Actions Workflows

Este diretório contém os workflows automatizados do projeto.

---

## 📋 Workflows Disponíveis

### ✅ CI (Continuous Integration)

**Arquivo**: `ci.yml`

**Status**: [![CI](https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/ci.yml/badge.svg)](https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/ci.yml)

**Quando executa:**

- Push para as branches `main` ou `dev`
- Pull requests para `main`
- Manualmente via `workflow_dispatch`

**Jobs:**

| Job | Depende de | Timeout | O que faz |
| --- | --- | --- | --- |
| **Lint** | — | 10 min | `npm run lint` (ESLint) e `npm run docs:check` (links da documentação) |
| **Test** | — | 10 min | `npm test` (Jest — 44 testes de libs) |
| **Build** | Lint + Test | 15 min | `npm run build` (Next.js) e upload do artefato |

`Lint` e `Test` rodam **em paralelo**; `Build` só inicia se ambos passarem.

**Comportamentos importantes:**

- `concurrency` cancela execuções anteriores do mesmo branch/PR a cada novo push
- `permissions: contents: read` no nível do workflow (princípio do menor privilégio)
- Node definido uma única vez em `env.NODE_VERSION` (deve satisfazer `engines` do `package.json`, hoje `>=22`)
- Cache de dependências via `setup-node` (`cache: 'npm'`) e cache de build do Next (`.next/cache`)
- Artefato `build` retido por 7 dias, **sem** `.next/cache`, com `if-no-files-found: error` para falhar caso o build não gere saída

---

## 🚀 Reproduzindo o CI Localmente

A sequência abaixo é exatamente a executada pelos jobs:

```bash
npm ci --no-audit --no-fund
npm run lint
npm run docs:check
npm test
npm run build
```

Para validar a sintaxe dos workflows antes de commitar:

```bash
actionlint            # https://github.com/rhysd/actionlint
```

---

## 🔄 Dependabot

**Arquivo**: `../dependabot.yml`

- Atualiza dependências **npm** e **GitHub Actions** semanalmente (segundas, 06:00 BRT)
- Agrupa minors/patches em PRs únicos (produção e desenvolvimento separados)
- Ignora majors que hoje quebram o projeto — ver "Limitações conhecidas"

---

## ⚠️ Limitações Conhecidas (upstream)

Avisos que aparecem no log do CI e **não são corrigíveis** no projeto hoje:

| Aviso | Causa | Quando revisitar |
| --- | --- | --- |
| `npm warn deprecated eslint@9.x` | ESLint 10 quebra o `eslint-config-next` 16.x: os plugins embutidos (`eslint-plugin-react`, `jsx-a11y`, `import`) declaram peer `<= 9` e usam APIs removidas na v10 | Quando o `eslint-config-next` publicar suporte a ESLint 10 |
| `npm warn deprecated whatwg-encoding@3.x` | Vem de `jest-environment-jsdom` → `jsdom` → `html-encoding-sniffer@4`. A v6 do sniffer migrou para `@exodus/bytes`, mas o jsdom 26 ainda usa a v4 | Quando o `jest-environment-jsdom` subir para um jsdom mais novo |
| `hint: Using 'master' as the name for the initial branch` | Emitido pelo `git init` executado **dentro** do `actions/checkout` | Nada a fazer — é interno da action |

O compilador nativo do TypeScript (7.x) também está bloqueado: o código já é
compatível (`tsc --noEmit` e `next build` passam), mas o `typescript-eslint`
embutido no `eslint-config-next` ainda não o suporta.

---

## 📝 Adicionando Novos Workflows

### Estrutura Básica

```yaml
name: Nome do Workflow

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '24'

jobs:
  job-name:
    name: Nome do Job
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Sua tarefa
        run: echo "Hello World"
```

### Boas Práticas

1. **Nome claro**: use nomes descritivos para workflow, jobs e steps
2. **Triggers específicos**: evite executar em todo push desnecessariamente
3. **Cache**: use `cache: 'npm'` no `setup-node` e cache o `.next/cache` em builds
4. **Timeout**: defina `timeout-minutes` (o padrão de 6h desperdiça minutos em travamentos)
5. **Permissões**: declare `permissions` mínimas — o padrão do repositório é `contents: read`
6. **Concurrency**: cancele execuções obsoletas do mesmo ref
7. **Secrets**: nunca exponha secrets em `run:`; use `${{ secrets.NOME }}`
8. **Validação**: rode `actionlint` antes de commitar

---

## 🔐 Secrets e Variáveis

### Secrets Necessários

Nenhum secret é necessário no CI atual (usa apenas o `GITHUB_TOKEN` implícito).

Para o envio de emails em produção (recuperação de senha), a aplicação espera
as variáveis descritas em `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, `SMTP_FROM`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`) — elas pertencem
ao ambiente de deploy, não ao CI.

### Como Adicionar Secrets

1. Settings > Secrets and variables > Actions
2. "New repository secret"
3. Use no workflow: `${{ secrets.SECRET_NAME }}`

---

## 🐛 Troubleshooting

**Lint falhando** → rode `npm run lint` localmente; o mesmo ESLint e a mesma
versão de Node (24) são usados no CI.

**Test falhando** → `npm test`. Para depurar um arquivo: `npm test -- auth`.

**Build falhando** → `npm run build`. Erros de tipo aparecem aqui porque o
`next build` executa o TypeScript.

**Artefato vazio** → o job falha de propósito (`if-no-files-found: error`).
Indica que `.next/` não foi gerado; verifique o passo de build.

**`npm ci` falhando por engine** → o `package.json` exige Node `>=22` (o
`better-sqlite3` 13 não compila em versões anteriores). Atualize
`env.NODE_VERSION` e o ambiente local juntos.

---

## 🔮 Workflows Futuros

### Em Planejamento

- [ ] **Deploy**: deploy automático para produção
- [ ] **Release**: automação de releases e tags
- [ ] **E2E**: Playwright em pull requests
- [ ] **Coverage**: publicação do relatório de cobertura
- [ ] **Performance**: Lighthouse CI

### Concluídos

- [x] **Tests**: job `Test` executando a suíte Jest
- [x] **Security Scan**: CodeQL (default setup) + Dependabot alerts
- [x] **Dependency Updates**: `dependabot.yml` com agrupamento semanal

---

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [actionlint](https://github.com/rhysd/actionlint)
- [Dependabot Options](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)

---

**Última Atualização**: 28/08/2026

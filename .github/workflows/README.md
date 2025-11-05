# 🤖 GitHub Actions Workflows

Este diretório contém os workflows automatizados do projeto.

---

## 📋 Workflows Disponíveis

### ✅ CI (Continuous Integration)

**Arquivo**: `ci.yml`

**Quando executa:**
- Push para branches `main` ou `dev`
- Pull requests para `main`

**O que faz:**
1. **Lint**: Executa ESLint para verificar qualidade do código
2. **Build**: Compila o projeto Next.js
3. **Artifacts**: Salva o build por 7 dias

**Status**: ![CI](https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/ci.yml/badge.svg)

---

### 📚 Wiki Sync

**Arquivo**: `wiki-sync.yml`

**Quando executa:**
- Push para `main` que modifica arquivos em `docs/**/*.md`
- Manualmente via workflow_dispatch

**O que faz:**
1. Copia documentação de `docs/` para o GitHub Wiki
2. Organiza em páginas estruturadas
3. Cria sidebar de navegação
4. Commit e push automático no wiki

**Estrutura do Wiki:**
```
wiki/
├── Home.md                    # docs/README.md
├── _Sidebar.md                # Navegação
├── user/
│   ├── getting-started.md
│   ├── user-guide.md
│   ├── examples.md
│   └── faq.md
├── developer/
│   ├── architecture.md
│   ├── api-reference.md
│   └── migrations.md
├── maintainer/
│   ├── agents.md
│   ├── claude-context.md
│   └── release-guide.md
└── releases/
    └── v1.1.0.md
```

**Status**: ![Wiki Sync](https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/wiki-sync.yml/badge.svg)

---

## 🚀 Como Usar

### Executar CI Localmente

```bash
# Lint
npm run lint

# Build
npm run build
```

### Sincronizar Wiki Manualmente

1. Vá para Actions no GitHub
2. Selecione "Sync Wiki"
3. Clique em "Run workflow"
4. Selecione a branch `main`
5. Clique em "Run workflow"

Ou use o script local:

```bash
chmod +x scripts/sync-wiki.sh
./scripts/sync-wiki.sh
```

---

## 📝 Adicionando Novos Workflows

### Estrutura Básica

```yaml
name: Nome do Workflow

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  job-name:
    name: Nome do Job
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Sua tarefa
        run: echo "Hello World"
```

### Boas Práticas

1. **Nome claro**: Use nomes descritivos
2. **Triggers específicos**: Evite executar em todo push
3. **Cache**: Use cache para dependências
4. **Secrets**: Nunca exponha secrets no código
5. **Permissões**: Use permissões mínimas necessárias

---

## 🔐 Secrets e Variáveis

### Secrets Necessários

Atualmente nenhum secret é necessário (workflows usam GITHUB_TOKEN automático).

### Como Adicionar Secrets

1. Vá para Settings > Secrets and variables > Actions
2. Clique em "New repository secret"
3. Adicione nome e valor
4. Use no workflow: `${{ secrets.SECRET_NAME }}`

---

## 🐛 Troubleshooting

### CI Falhando

**Problema**: Lint errors
- **Solução**: Execute `npm run lint` localmente e corrija

**Problema**: Build errors
- **Solução**: Execute `npm run build` localmente e corrija

### Wiki Sync Falhando

**Problema**: Wiki não habilitado
- **Solução**: Vá em Settings > Features > Ative "Wikis"

**Problema**: Permissões negadas
- **Solução**: Verifique que Actions tem permissão de escrita:
  - Settings > Actions > General
  - Workflow permissions > "Read and write permissions"

---

## 📊 Status dos Workflows

Veja o status em:
- [Actions Tab](https://github.com/bernardopg/mvp-estetoscopio/actions)
- Badges no README.md

---

## 🔮 Workflows Futuros

### Em Planejamento

- [ ] **Tests**: Executar testes automatizados
- [ ] **Deploy**: Deploy automático para produção
- [ ] **Release**: Automação de releases
- [ ] **Dependency Updates**: Atualização automática de dependências
- [ ] **Security Scan**: Scan de vulnerabilidades
- [ ] **Performance**: Lighthouse CI

---

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Última Atualização**: 05/11/2025

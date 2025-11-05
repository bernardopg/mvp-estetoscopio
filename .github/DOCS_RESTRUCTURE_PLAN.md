# 📋 Plano de Reestruturação da Documentação

## 🎯 Objetivo

Consolidar e organizar toda a documentação em uma estrutura única, eliminando duplicação e facilitando manutenção.

## 📊 Situação Atual

### Arquivos na Raiz (12 arquivos .md)
```
├── README.md                    # Essencial (raiz)
├── CHANGELOG.md                 # Essencial (raiz)
├── GUIA_DE_USO.md              # → Mover
├── EXEMPLOS.md                 # → Mover
├── ARQUITETURA.md              # → Mover
├── FAQ.md                      # → Mover
├── REFERENCIA.md               # → Mover
├── MIGRATIONS.md               # → Mover
├── AGENTS.md                   # → Mover para .github/
├── CLAUDE.md                   # → Mover para .github/
├── RELEASE_NOTES_v1.1.0.md     # → Mover para releases/
└── RELEASE_MANAGER_QUICKSTART.md # → Mover para .github/
```

### Arquivos em docs/ (8 arquivos .mdx)
```
docs/
├── index.mdx                   # Duplicação com README
├── guia.mdx                    # Duplicação com GUIA_DE_USO.md
├── api.mdx                     # Conteúdo único
├── arquitetura.mdx             # Duplicação com ARQUITETURA.md
├── exemplos.mdx                # Duplicação com EXEMPLOS.md
├── faq.mdx                     # Duplicação com FAQ.md
├── changelog.mdx               # Duplicação com CHANGELOG.md
└── referencia.mdx              # Duplicação com REFERENCIA.md
```

### Arquivos em .github/
```
.github/
├── copilot-instructions.md
├── GITHUB_FOLDER.md
└── RELEASE_GUIDE.md
```

## 🎯 Nova Estrutura Proposta

### Opção A: Wiki Local + Docs Web

```
mvp-estetoscopio/
├── README.md                           # Raiz (essencial)
├── CHANGELOG.md                        # Raiz (essencial)
├── LICENSE
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CONTRIBUTING.md
├── SUPPORT.md
│
├── .github/
│   ├── wiki/                          # 📚 WIKI (editável localmente)
│   │   ├── Home.md                    # Índice principal
│   │   ├── Guia-de-Uso.md
│   │   ├── Exemplos.md
│   │   ├── Arquitetura.md
│   │   ├── FAQ.md
│   │   ├── Referencia-API.md
│   │   └── Migrações.md
│   │
│   ├── docs/                          # 🤖 Documentação para Mantenedores
│   │   ├── AGENTS.md
│   │   ├── CLAUDE_CONTEXT.md
│   │   ├── RELEASE_GUIDE.md
│   │   └── RELEASE_MANAGER_QUICKSTART.md
│   │
│   ├── workflows/                      # GitHub Actions
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── wiki-sync.yml
│   │
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── FUNDING.yml
│
├── docs/                               # 📖 Docs Web (Next.js/MDX)
│   ├── components/                     # Componentes MDX
│   └── pages/                          # Páginas geradas da wiki
│
└── releases/                           # Release notes
    └── v1.1.0.md
```

### Opção B: Docs Unificado (Recomendado)

```
mvp-estetoscopio/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CONTRIBUTING.md
├── SUPPORT.md
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── docs/                               # 📚 TODA DOCUMENTAÇÃO
│   ├── README.md                       # Índice da documentação
│   │
│   ├── user/                           # Documentação de Usuário
│   │   ├── getting-started.md
│   │   ├── user-guide.md
│   │   ├── examples.md
│   │   └── faq.md
│   │
│   ├── developer/                      # Documentação de Desenvolvedor
│   │   ├── architecture.md
│   │   ├── api-reference.md
│   │   ├── components.md
│   │   ├── contributing.md            # Symlink → ../../CONTRIBUTING.md
│   │   └── migrations.md
│   │
│   ├── maintainer/                     # Documentação de Mantenedor
│   │   ├── agents.md
│   │   ├── claude-context.md
│   │   ├── release-guide.md
│   │   └── release-manager-quickstart.md
│   │
│   ├── releases/                       # Release Notes
│   │   ├── v1.1.0.md
│   │   └── template.md
│   │
│   └── components/                     # Componentes MDX
│       ├── Callout.tsx
│       ├── Card.tsx
│       ├── Step.tsx
│       └── CodeBlock.tsx
│
└── src/app/docs/                       # Rotas Next.js para docs
    └── [...slug]/page.tsx              # Renderiza markdown dinamicamente
```

## ✅ Vantagens da Opção B

1. **Única fonte de verdade**: Markdown único, renderizado como MDX
2. **Sem duplicação**: Elimina .md ↔ .mdx
3. **Organização clara**: user/developer/maintainer
4. **Wiki sincronizado**: Scripts sincronizam docs/ → GitHub Wiki
5. **Busca fácil**: Tudo em um lugar
6. **Manutenção simples**: Editar só um arquivo

## 🔄 Migração

### Mapeamento

| Atual | Novo |
|-------|------|
| GUIA_DE_USO.md | docs/user/user-guide.md |
| EXEMPLOS.md | docs/user/examples.md |
| FAQ.md | docs/user/faq.md |
| ARQUITETURA.md | docs/developer/architecture.md |
| REFERENCIA.md | docs/developer/api-reference.md |
| MIGRATIONS.md | docs/developer/migrations.md |
| AGENTS.md | docs/maintainer/agents.md |
| CLAUDE.md | docs/maintainer/claude-context.md |
| .github/RELEASE_GUIDE.md | docs/maintainer/release-guide.md |
| RELEASE_MANAGER_QUICKSTART.md | docs/maintainer/release-manager-quickstart.md |
| RELEASE_NOTES_v1.1.0.md | docs/releases/v1.1.0.md |

### Scripts

1. **sync-wiki.sh**: Sincroniza docs/ → GitHub Wiki
2. **generate-mdx.sh**: Gera páginas Next.js da documentação
3. **validate-links.sh**: Valida todos os links internos

## 🚀 Implementação

### Fase 1: Criar estrutura
- [ ] Criar pastas docs/{user,developer,maintainer,releases}
- [ ] Criar docs/README.md com índice

### Fase 2: Migrar arquivos
- [ ] Mover e renomear arquivos
- [ ] Atualizar links internos
- [ ] Adicionar frontmatter

### Fase 3: Scripts
- [ ] Criar script de sincronização wiki
- [ ] Criar GitHub Action para wiki
- [ ] Configurar rotas Next.js

### Fase 4: Limpeza
- [ ] Remover arquivos antigos
- [ ] Atualizar README.md
- [ ] Testar todos os links

## 📝 Frontmatter Padrão

```yaml
---
title: Título da Página
description: Descrição breve
category: user|developer|maintainer
tags: [tag1, tag2]
lastUpdated: 2025-11-05
---
```

## 🔗 Links

Usar sempre links relativos:

```markdown
<!-- Usuário para Desenvolvedor -->
[Arquitetura](../developer/architecture.md)

<!-- Desenvolvedor para Mantenedor -->
[Guia de Release](../maintainer/release-guide.md)

<!-- Qualquer para Raiz -->
[Contributing](../../CONTRIBUTING.md)
```

## 🎯 Decisão

**Recomendo Opção B** pela consolidação e eliminação de duplicação.

# 📚 Documentação - MVP Estetoscópio

Bem-vindo à documentação completa do MVP Estetoscópio!

---

## 📖 Estrutura

A documentação está organizada em quatro categorias principais:

### 👥 [User](./user/) - Documentação de Usuário

Para usuários finais que querem aprender a usar o sistema:

- **[Getting Started](./user/getting-started.md)** - Primeiros passos
- **[User Guide](./user/user-guide.md)** - Guia completo de uso
- **[Examples](./user/examples.md)** - Exemplos práticos
- **[FAQ](./user/faq.md)** - Perguntas frequentes

### 💻 [Developer](./developer/) - Documentação de Desenvolvedor

Para desenvolvedores que querem contribuir ou entender o código:

- **[Architecture](./developer/architecture.md)** - Arquitetura técnica do sistema
- **[API Reference](./developer/api-reference.md)** - Referência completa da API
- **[Migrations](./developer/migrations.md)** - Guia de migrações de banco de dados
- **[Contributing](../CONTRIBUTING.md)** - Como contribuir

### 🔧 [Maintainer](./maintainer/) - Documentação de Mantenedor

Para mantenedores do projeto:

- **[Agents](./maintainer/agents.md)** - Agentes de automação
- **[Claude Context](./maintainer/claude-context.md)** - Contexto completo para IA
- **[Release Guide](./maintainer/release-guide.md)** - Guia de releases
- **[Release Manager Quickstart](./maintainer/release-manager-quickstart.md)** - Quick start do release manager

### 🚀 [Releases](./releases/) - Notas de Lançamento

Histórico de versões e mudanças:

- **[v1.1.0](./releases/v1.1.0.md)** - Release atual

---

## 🧩 Componentes MDX

Componentes customizados para documentação interativa:

- **[Callout](./components/DocComponents.tsx)** - Avisos e alertas
- **[Card](./components/DocComponents.tsx)** - Cards de conteúdo
- **[Step](./components/DocComponents.tsx)** - Passos de tutorial
- **[CodeBlock](./components/DocComponents.tsx)** - Blocos de código
- **[FeatureGrid](./components/DocComponents.tsx)** - Grid de features

Veja [IMPLEMENTACAO_MDX.md](./IMPLEMENTACAO_MDX.md) para detalhes técnicos.

---

## 🔍 Navegação Rápida

### Quero

- **Começar a usar** → [Getting Started](./user/getting-started.md)
- **Aprender a usar** → [User Guide](./user/user-guide.md)
- **Ver exemplos** → [Examples](./user/examples.md)
- **Resolver problemas** → [FAQ](./user/faq.md)
- **Entender a arquitetura** → [Architecture](./developer/architecture.md)
- **Ver APIs** → [API Reference](./developer/api-reference.md)
- **Contribuir** → [Contributing](../CONTRIBUTING.md)
- **Fazer release** → [Release Guide](./maintainer/release-guide.md)

---

## 📝 Convenções

### Frontmatter

Todos os documentos Markdown usam frontmatter YAML:

```yaml
---
title: Título do Documento
description: Descrição breve
category: user|developer|maintainer
tags: [tag1, tag2]
lastUpdated: 2025-11-05
---
```

### Links

Use sempre links relativos:

```markdown
<!-- Mesmo nível -->
[Outro Doc](./outro-doc.md)

<!-- Subir um nível -->
[Doc Pai](../doc-pai.md)

<!-- Entre categorias -->
[Guia de Usuário](../user/user-guide.md)
```

### Componentes MDX

Componentes disponíveis na documentação:

```mdx
<Callout type="info|warning|success|error">
Conteúdo do aviso
</Callout>

<Card title="Título">
Conteúdo do card
</Card>

<Step number={1} title="Passo 1">
Descrição do passo
</Step>
```

---

## 🔄 Sincronização

Esta documentação é consumida em:

- **Site de Docs** - Renderizado como MDX via Next.js em `/docs`
- **README.md** - Links para seções principais
- **CI** - `npm run docs:check` valida links relativos e sincronia do changelog

---

## 🤝 Contribuindo com a Documentação

Para melhorar a documentação:

1. Edite os arquivos Markdown nesta pasta
2. Use os componentes MDX quando apropriado
3. Mantenha o frontmatter atualizado
4. Valide os links
5. Siga as convenções de escrita

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para mais detalhes.

---

## 📞 Suporte

Precisa de ajuda?

- **Issues**: [GitHub Issues](https://github.com/bernardopg/mvp-estetoscopio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bernardopg/mvp-estetoscopio/discussions)
- **Email**: <bernardo.gomes@bebitterbebetter.com.br>
- **Instagram**: [@be.pgomes](https://instagram.com/be.pgomes)

---

**Última Atualização**: 05/11/2025
**Versão da Documentação**: 2.0

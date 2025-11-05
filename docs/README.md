# Documentação MDX

Esta pasta contém a documentação do projeto em formato MDX (Markdown + JSX).

## 📁 Estrutura

```
docs/
├── components/              # Componentes React para documentação
│   ├── DocComponents.tsx   # Componentes especializados (Callout, Card, Step, etc)
│   └── mdx-components.tsx  # Componentes base para MDX (h1, h2, p, code, etc)
├── index.mdx               # Página inicial da documentação
├── guia.mdx                # Guia de uso completo
├── faq.mdx                 # Perguntas frequentes
├── arquitetura.mdx         # Documentação técnica
└── README.md               # Este arquivo
```

## 🎨 Componentes Disponíveis

### Callout

Caixas de destaque para informações importantes.

```mdx
<Callout type="info" title="Título opcional">
Conteúdo da mensagem
</Callout>
```

**Tipos**: `info`, `warning`, `success`, `error`

### Card

Cartões para organizar conteúdo.

```mdx
<Card title="Título opcional">
Conteúdo do card
</Card>
```

### Step

Passos numerados para tutoriais.

```mdx
<Step number={1} title="Título do passo">
Descrição do passo
</Step>
```

### CodeBlock

Blocos de código com título e linguagem.

```mdx
<CodeBlock title="exemplo.ts" language="typescript">
{`const hello = "world";`}
</CodeBlock>
```

### FeatureGrid

Grid responsivo para listar recursos.

```mdx
<FeatureGrid>
  <Card title="Recurso 1">Descrição</Card>
  <Card title="Recurso 2">Descrição</Card>
  <Card title="Recurso 3">Descrição</Card>
</FeatureGrid>
```

## 📝 Sintaxe MDX

### Títulos

```mdx
# H1
## H2
### H3
```

### Texto

```mdx
**Negrito**
*Itálico*
[Link](https://example.com)
```

### Listas

```mdx
- Item 1
- Item 2
  - Subitem 2.1

1. Item numerado 1
2. Item numerado 2
```

### Código

````mdx
Código inline: `const x = 10`

```typescript
// Bloco de código
function hello() {
  console.log("Hello World");
}
```
````

### Citações

```mdx
> Esta é uma citação
```

### Tabelas

```mdx
| Coluna 1 | Coluna 2 |
|----------|----------|
| Valor 1  | Valor 2  |
```

## 🎯 Como Criar um Novo Documento

1. **Crie o arquivo MDX** em `/docs/nome-do-doc.mdx`

```mdx
export const metadata = {
  title: 'Título',
  description: 'Descrição'
}

# Título Principal

Conteúdo do documento...
```

2. **Crie a página Next.js** em `/src/app/docs/nome-do-doc/page.tsx`

```tsx
import NomeDoc from "@/../../docs/nome-do-doc.mdx";

export const metadata = {
  title: "Título - MVP Estetoscópio",
  description: "Descrição do documento",
};

export default function NomeDocPage() {
  return <NomeDoc />;
}
```

3. **Adicione ao menu** em `/src/app/docs/layout.tsx`

```tsx
const navItems = [
  // ... items existentes
  { href: "/docs/nome-do-doc", icon: IconName, label: "Título" },
];
```

## 🎨 Estilização

Todos os componentes MDX já vêm estilizados com Tailwind CSS e suportam dark mode automaticamente.

### Classes CSS disponíveis

- `prose`: Tipografia otimizada para leitura
- `dark:prose-invert`: Inverte cores no dark mode
- Classes customizadas nos componentes

## 🔧 Configuração

A configuração do MDX está em:

- `/next.config.ts`: Configuração do `@next/mdx`
- `/mdx-components.tsx`: Mapeamento de componentes na raiz
- `/docs/components/`: Componentes customizados

## 💡 Dicas

1. **Use componentes React**: MDX permite misturar Markdown com componentes React
2. **Metadata**: Sempre adicione metadata para SEO
3. **Componentize**: Crie componentes reutilizáveis para padrões comuns
4. **Dark mode**: Todos os componentes devem suportar dark mode
5. **Acessibilidade**: Use títulos semânticos e alt text em imagens

## 📚 Recursos

- [MDX Documentation](https://mdxjs.com/)
- [Next.js + MDX](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)

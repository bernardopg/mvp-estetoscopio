# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o MVP Estetoscópio! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📚 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Revisão de Código](#revisão-de-código)

---

## 📜 Código de Conduta

Este projeto e todos os participantes estão sob o [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, espera-se que você o respeite.

---

## 🎯 Como Posso Contribuir?

### Reportar Bugs

Antes de criar um relatório de bug:
- Verifique se o bug já não foi reportado nas [issues](https://github.com/bernardopg/mvp-estetoscopio/issues)
- Teste na versão mais recente do projeto

Ao criar um relatório de bug, inclua:
- Título claro e descritivo
- Passos detalhados para reproduzir
- Comportamento esperado vs comportamento atual
- Screenshots (se aplicável)
- Informações do ambiente (navegador, OS, versão)

### Sugerir Melhorias

Para sugerir uma nova feature:
1. Verifique se já não existe uma issue similar
2. Crie uma nova issue com a tag `enhancement`
3. Descreva detalhadamente:
   - O problema que a feature resolve
   - Como a feature funcionaria
   - Alternativas consideradas
   - Mockups ou exemplos (se aplicável)

### Contribuir com Código

1. Faça fork do repositório
2. Crie uma branch para sua feature/fix
3. Implemente suas mudanças
4. Execute os testes
5. Faça commit seguindo os padrões
6. Abra um Pull Request

### Contribuir com Documentação

Documentação é sempre bem-vinda! Você pode:
- Corrigir erros de digitação
- Melhorar explicações
- Adicionar exemplos
- Traduzir documentação
- Criar tutoriais

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- npm 9+
- Git

### Instalação

```bash
# Clone seu fork
git clone https://github.com/bernardopg/mvp-estetoscopio.git
cd mvp-estetoscopio

# Adicione o repositório original como upstream
git remote add upstream https://github.com/bernardopg/mvp-estetoscopio.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura do Projeto

Consulte [ARQUITETURA.md](ARQUITETURA.md) para entender a estrutura completa do projeto.

---

## 🔄 Processo de Desenvolvimento

### 1. Escolha uma Issue

- Procure issues com as tags `good first issue` ou `help wanted`
- Comente na issue que você pretende trabalhar nela
- Aguarde confirmação de um mantenedor

### 2. Crie uma Branch

```bash
# Atualize seu fork
git checkout main
git pull upstream main

# Crie uma branch
git checkout -b tipo/descricao-curta
```

Tipos de branch:
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `refactor/` - Refatoração
- `test/` - Testes
- `chore/` - Manutenção

Exemplos:
```bash
git checkout -b feature/dark-mode
git checkout -b fix/login-redirect
git checkout -b docs/api-endpoints
```

### 3. Desenvolva

- Escreva código seguindo os [padrões](#padrões-de-código)
- Adicione testes para novas funcionalidades
- Atualize a documentação
- Execute os linters

```bash
# Verificar código
npm run lint

# Executar testes (quando implementado)
npm test

# Build para produção
npm run build
```

### 4. Commit

Siga o padrão [Conventional Commits](#commits):

```bash
git add .
git commit -m "tipo(escopo): descrição"
```

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin sua-branch

# Abra um Pull Request no GitHub
```

---

## 📝 Padrões de Código

### TypeScript

- **Sempre use TypeScript**: Sem `any`
- **Tipos explícitos**: Funções devem ter tipos de retorno
- **Interfaces vs Types**: Use types para unions, interfaces para objetos
- **Nomenclatura**:
  - Componentes: `PascalCase`
  - Funções/variáveis: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Tipos/Interfaces: `PascalCase`

### React

- **Componentes Funcionais**: Sempre use function components
- **Hooks**: Use hooks do React apropriadamente
- **Props**: Sempre tipadas com interface
- **Keys**: Use keys únicas em listas
- **Client Components**: Marque com `"use client"` quando necessário

### Next.js

- **App Router**: Use o App Router (não Pages Router)
- **Server vs Client**: Entenda quando usar cada um
- **Metadata**: Configure metadata para SEO
- **Imagens**: Use `next/image` para otimização

### Tailwind CSS

- **Classes utilitárias**: Prefira sobre CSS customizado
- **Responsividade**: Mobile-first
- **Dark mode**: Suporte com classe `dark:`
- **Consistência**: Use classes do design system

### Acessibilidade

- **Semântica HTML**: Use elementos apropriados
- **ARIA labels**: Adicione onde necessário
- **Keyboard navigation**: Teste com teclado
- **Contraste**: WCAG AA mínimo

### Segurança

- **Validação**: Sempre valide entrada do usuário
- **Sanitização**: Sanitize dados antes de usar
- **SQL**: Use prepared statements
- **XSS**: Evite innerHTML, use React
- **Autenticação**: Verifique em todas as rotas protegidas

---

## 💬 Commits

### Conventional Commits

Formato: `<tipo>(<escopo>): <assunto>`

#### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção
- `ci`: CI/CD
- `build`: Build system

#### Escopo (opcional)

- `auth` - Autenticação
- `decks` - Baralhos
- `cards` - Flashcards
- `api` - API Routes
- `ui` - Interface
- `docs` - Documentação

#### Exemplos

```bash
feat(auth): add password recovery
fix(decks): correct card count calculation
docs(readme): update installation steps
refactor(api): simplify user validation
test(cards): add flashcard component tests
chore(deps): update dependencies
```

#### Breaking Changes

Para mudanças que quebram compatibilidade:

```bash
feat(api)!: change authentication endpoint

BREAKING CHANGE: Auth endpoint moved from /api/auth to /api/v2/auth
```

---

## 🔀 Pull Requests

### Antes de Abrir

- [ ] Código segue os padrões do projeto
- [ ] Testes passando (se aplicável)
- [ ] Documentação atualizada
- [ ] Lint sem erros/warnings
- [ ] Build sem erros
- [ ] Commits seguem Conventional Commits

### Template de PR

```markdown
## Descrição

[Descreva as mudanças realizadas]

## Tipo de Mudança

- [ ] Bug fix (mudança que corrige uma issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que quebra funcionalidade existente)
- [ ] Documentação

## Como Foi Testado?

[Descreva como você testou suas mudanças]

## Checklist

- [ ] Meu código segue os padrões deste projeto
- [ ] Fiz uma auto-revisão do código
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes (se aplicável)
- [ ] Todos os testes passam
- [ ] Testei em diferentes navegadores

## Screenshots (se aplicável)

[Adicione screenshots das mudanças visuais]

## Issues Relacionadas

Fixes #[número da issue]
```

### Revisão

Seu PR será revisado por mantenedores que podem:
- Aprovar e fazer merge
- Solicitar mudanças
- Fazer comentários

Seja receptivo ao feedback e faça as alterações solicitadas.

---

## 👀 Revisão de Código

### Para Revisores

Ao revisar um PR, verifique:

#### Funcionalidade
- [ ] O código faz o que se propõe?
- [ ] Existem bugs ou edge cases?

#### Qualidade
- [ ] Código é legível e mantível?
- [ ] Segue os padrões do projeto?
- [ ] Está bem documentado?

#### Testes
- [ ] Testes adequados foram adicionados?
- [ ] Cobertura é suficiente?

#### Segurança
- [ ] Não introduz vulnerabilidades?
- [ ] Valida entrada adequadamente?
- [ ] Não expõe dados sensíveis?

#### Performance
- [ ] Não degrada performance?
- [ ] Usa recursos eficientemente?

### Feedback Construtivo

- Seja respeitoso e construtivo
- Explique o "porquê" das sugestões
- Forneça exemplos quando possível
- Reconheça bom código

---

## 🚀 Workflow de Release

O projeto usa agentes automatizados para releases. Veja [AGENTS.md](AGENTS.md) para mais detalhes.

---

## 📚 Recursos

### Documentação do Projeto

- [README.md](README.md) - Visão geral
- [ARQUITETURA.md](ARQUITETURA.md) - Arquitetura técnica
- [GUIA_DE_USO.md](GUIA_DE_USO.md) - Guia do usuário
- [EXEMPLOS.md](EXEMPLOS.md) - Exemplos de código
- [FAQ.md](FAQ.md) - Perguntas frequentes
- [CLAUDE.md](CLAUDE.md) - Contexto para IA

### Documentação Externa

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🆘 Precisa de Ajuda?

- Consulte [SUPPORT.md](SUPPORT.md)
- Abra uma [issue](https://github.com/bernardopg/mvp-estetoscopio/issues)
- Veja [FAQ.md](FAQ.md)

---

## 🙏 Reconhecimentos

Obrigado a todos que contribuem para tornar este projeto melhor!

---

**Última Atualização**: 05/11/2025
**Versão**: 1.0

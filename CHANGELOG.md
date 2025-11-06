# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### 🐛 Corrigido

#### Correções de TypeScript

- **API Anki Export**: Corrigido import de `auth` para `getAuthUser` em `/api/anki/export/route.ts`
- **API Anki Import**: Corrigido import de `auth` para `getAuthUser` em `/api/anki/import/route.ts`
- **Anki Export Library**: Corrigido erro de sintaxe na interface `AnkiExportData` (faltava `>` no tipo `Array`)
- **Anki Parser Library**:
  - Removido uso de `any` em `Record<string, any>`, substituído por `Record<string, string>`
  - Criada interface `FieldDef` para tipar corretamente campos do Anki
  - Corrigido acesso a arquivos do ZIP: `Object.values(zip.files).find(...)` em vez de `zip.files.find(...)`
  - Alterado `let` para `const` em variáveis `notes` e `mediaFiles` que não são reatribuídas
- **Página de Comunidade**:
  - Removido uso de `await` fora de função async no import dinâmico
  - Implementada função local `showErrorToast` usando `useCallback`
  - Corrigido tratamento de erros em blocos `catch` com verificação de tipo `Error`
  - Adicionado `showErrorToast` às dependências do `useCallback`
  - Removido import não utilizado `setToastContext`
- **ToastContainer**:
  - Removido uso de `any` em `window`, criada interface `WindowWithToast` com tipagem adequada
  - Envolvido funções `showToast` e `removeToast` em `useCallback` para evitar re-renders
  - Adicionado import de `useCallback` do React
- **Layout**:
  - Removido import não utilizado `setToastContext`
  - Corrigido import de CSS: `import "./globals.css"` em vez de `import styles from "./globals.css"`
- **ShareDeckModal**: Substituído `<a>` por `<Link>` do Next.js para navegação interna

#### Qualidade de Código

- Eliminados todos os usos de `any` (TypeScript strict mode)
- Adicionada tipagem explícita em todos os parâmetros de função
- Corrigida lógica de tratamento de erros com verificação de tipos
- Melhorada performance com `useCallback` em componentes React

## [1.1.0] - 2025-11-05

### ✨ Adicionado

#### Sistema de Documentação MDX

- Sistema completo de documentação interativa com MDX
- Páginas de documentação renderizadas dinamicamente
- Componentes customizados para documentação:
  - `Callout`: Caixas de destaque (info, warning, success, error)
  - `Card`: Cartões para organização de conteúdo
  - `Step`: Passo a passo numerado
  - `CodeBlock`: Blocos de código com destaque
- Layout dedicado para documentação com navegação
- Breadcrumbs para orientação do usuário
- Suporte completo a modo escuro
- Rotas de documentação:
  - `/docs` - Índice da documentação
  - `/docs/guia` - Guia do usuário
  - `/docs/api` - Documentação da API
  - `/docs/arquitetura` - Arquitetura técnica
  - `/docs/exemplos` - Exemplos práticos
  - `/docs/faq` - Perguntas frequentes
  - `/docs/changelog` - Histórico de mudanças
  - `/docs/referencia` - Referência técnica

#### Componente MarkdownRenderer

- Novo componente `MarkdownRenderer.tsx` para renderização de Markdown
- Integração com biblioteca `marked` para parsing
- Suporte a sintaxe Markdown completa
- Breadcrumbs automáticos
- Links de navegação (anterior/próximo)
- Design responsivo com Tailwind CSS
- Suporte a modo escuro

#### Sistema de Repetição Espaçada

- Implementação do algoritmo de repetição espaçada (lib/spaced-repetition.ts)
- Cálculo de intervalos baseado em dificuldade
- Tracking de revisões por card
- Integração com API de progresso (`/api/decks/[id]/progress`)

#### Melhorias de API

- Nova rota `/api/profile` para gerenciamento de perfil
- Endpoint `/api/decks/[id]/progress` para tracking de progresso
- Validações aprimoradas em todas as rotas
- Melhor tratamento de erros com mensagens descritivas

### 🔄 Alterado

#### Componentes

- `Flashcard.tsx` agora suporta feedback visual ao virar
- `MediaFlashcard.tsx` com melhor tratamento de erros de mídia
- `AudioPlayer.tsx` com controles mais intuitivos
- `Sidebar.tsx` com indicador visual de página ativa

#### Interface

- Dashboard com métricas mais detalhadas
- Página de perfil reformulada (`/perfil`)
- Melhorias visuais nos gradientes e cores
- Animações mais suaves em transições
- Melhor responsividade em dispositivos móveis

#### Documentação

- README.md atualizado com todas as features
- Estrutura de documentação reorganizada
- Exemplos de código mais detalhados
- Links para documentação MDX

### 🛠️ Técnico

#### Dependências Atualizadas

- `@mdx-js/loader`: ^3.1.1
- `@mdx-js/react`: ^3.1.1
- `@next/mdx`: ^16.0.1
- `@types/mdx`: ^2.0.13
- `marked`: ^16.4.1
- `@tailwindcss/typography`: ^0.5.0-alpha.3

#### Configuração

- `next.config.ts` configurado para suportar MDX
- `mdx-components.tsx` adicionado na raiz
- Novo arquivo de tipagem para componentes MDX
- Configuração do Tailwind Typography para prose

### 📊 Métricas (v1.1.0)

- **Componentes**: 5 componentes reutilizáveis (+1)
- **Páginas**: 15 páginas (+7 de documentação)
- **API Routes**: 11 endpoints (+1)
- **Linhas de Código**: ~4.500 LOC (+1.500)
- **Documentos MDX**: 8 arquivos de documentação

---

## [1.0.0] - 2025-11-04

### 🎉 Lançamento Inicial

Primeira versão estável do MVP Estetoscópio.

### ✨ Adicionado

#### Autenticação

- Sistema completo de registro de usuários
- Login com email e senha
- Logout com limpeza de sessão
- Proteção de rotas com middleware JWT
- Cookies HTTP-only para segurança

#### Baralhos (Decks)

- Criação de baralhos personalizados
- Edição de baralhos existentes
- Exclusão de baralhos com confirmação
- Listagem de todos os baralhos do usuário
- Visualização de estatísticas por baralho

#### Flashcards

- Componente `Flashcard` básico com animação 3D
- Componente `MediaFlashcard` com suporte a múltiplos tipos de conteúdo:
  - Texto simples e HTML
  - Imagens (JPEG, PNG, GIF)
  - Áudio (MP3, WAV, OGG)
- Sistema de virar card com atalho de teclado (Espaço/Enter)
- Botões de avaliação estilo Anki (Novamente, Difícil, Bom, Fácil)

#### Dashboard

- Visão geral do perfil do usuário
- Estatísticas globais:
  - Total de baralhos criados
  - Total de cards em todos os baralhos
  - Média de cards por baralho
  - Maior baralho
- Lista de baralhos recentes
- Ações rápidas para criar novos baralhos

#### Modo de Estudo

- Página dedicada para estudar cada baralho
- Navegação sequencial pelos cards
- Contador de progresso
- Suporte a todos os tipos de conteúdo (texto, imagem, áudio)

#### Upload de Arquivos

- Sistema de upload para imagens e áudios
- Validação de tipo de arquivo
- Geração de nomes únicos com timestamp
- Armazenamento em `/public/uploads/`

#### Interface

- Sidebar de navegação responsiva
- Tema claro e escuro suportado
- Design moderno com Tailwind CSS
- Animações e transições suaves
- Componente `AudioPlayer` customizado
- Gradientes e efeitos visuais

#### Documentação

- README.md completo com visão geral
- GUIA_DE_USO.md para usuários finais
- EXEMPLOS.md com código pronto para usar
- ARQUITETURA.md para desenvolvedores
- CHANGELOG.md para histórico de versões

### 🛠️ Tecnologias Implementadas

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Estilização**: Tailwind CSS 4, Lucide React, Tailwind Typography
- **Backend**: Next.js API Routes, Better-SQLite3
- **Autenticação**: JWT, bcryptjs
- **Documentação**: MDX, Marked
- **Ferramentas**: ESLint, PostCSS

### 📊 Métricas (v1.0.0)

- **Componentes**: 4 componentes reutilizáveis
- **Páginas**: 8 páginas principais
- **API Routes**: 10 endpoints
- **Linhas de Código**: ~3.000 LOC

---

## [Unreleased]

### 🚧 Planejado para v1.2

#### Em Desenvolvimento

- [ ] Sistema de repetição espaçada aprimorado com algoritmo SM-2
- [ ] Estatísticas avançadas de estudo com gráficos
- [ ] Página de perfil completa com edição de dados
- [ ] Sistema de recuperação de senha por email

#### Em Análise

- [ ] Atalhos de teclado numéricos (1-4) para avaliação
- [ ] Modo noturno automático baseado no sistema
- [ ] Exportação de baralhos para JSON
- [ ] Importação de baralhos do Anki

### 🔮 Planejado para v2.0

#### Features Principais

- [ ] Exportação/importação de baralhos (JSON, CSV, Anki)
- [ ] Compartilhamento de baralhos entre usuários
- [ ] Sistema de tags e categorias
- [ ] Busca avançada com filtros
- [ ] Sistema de conquistas e gamificação

#### Melhorias Técnicas

- [ ] Migração para PostgreSQL
- [ ] Sistema de cache com Redis
- [ ] Rate limiting nas APIs
- [ ] Upload para S3 ou Cloudinary
- [ ] Testes automatizados (Jest, Playwright)

#### Mobile

- [ ] PWA (Progressive Web App)
- [ ] App mobile nativo (React Native)
- [ ] Sincronização offline

#### UX/UI

- [ ] Onboarding para novos usuários
- [ ] Tour guiado da interface
- [ ] Customização de temas
- [ ] Suporte a múltiplos idiomas (i18n)

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Descontinuado** para funcionalidades que serão removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correção de bugs
- **Segurança** para vulnerabilidades corrigidas

---

## Como Contribuir

Se você quiser sugerir uma nova feature ou reportar um bug:

1. Verifique se já não existe uma issue relacionada
2. Abra uma nova issue descrevendo detalhadamente
3. Aguarde feedback da comunidade
4. Implemente a mudança (se aprovada)
5. Abra um Pull Request referenciando a issue

---

## Links Úteis

- [Repositório GitHub](https://github.com/bernardopg/mvp-estetoscopio)
- [Documentação Completa](README.md)
- [Guia do Usuário](docs/guia.mdx)
- [Arquitetura](docs/arquitetura.mdx)
- [Exemplos](docs/exemplos.mdx)

---

**Versão Atual**: 1.1.0

**Última Atualização**: 05 de novembro de 2025

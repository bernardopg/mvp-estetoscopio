# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
- **Estilização**: Tailwind CSS 4, Lucide React
- **Backend**: Next.js API Routes, Better-SQLite3
- **Autenticação**: JWT, bcryptjs
- **Ferramentas**: ESLint, PostCSS

### 📊 Métricas

- **Componentes**: 4 componentes reutilizáveis
- **Páginas**: 8 páginas principais
- **API Routes**: 10 endpoints
- **Linhas de Código**: ~3.000 LOC

---

## [Unreleased]

### 🚧 Planejado para v1.1

#### Em Desenvolvimento

- [ ] Estatísticas avançadas de estudo
- [ ] Gráficos de progresso com Chart.js
- [ ] Atalhos de teclado numéricos (1-4) para avaliação
- [ ] Modo noturno automático baseado no sistema

#### Em Análise

- [ ] Página de perfil do usuário
- [ ] Edição de informações da conta
- [ ] Alteração de senha
- [ ] Sistema de recuperação de senha

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
- [Guia do Usuário](GUIA_DE_USO.md)
- [Arquitetura](ARQUITETURA.md)
- [Exemplos](EXEMPLOS.md)

---

**Versão Atual**: 1.0.0

**Última Atualização**: 04 de novembro de 2025

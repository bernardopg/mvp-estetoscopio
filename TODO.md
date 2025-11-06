### v1.1 (Concluído ✅)

- [x] Página de perfil do usuário completa
  - Upload de avatar com validação (máx 5MB, JPEG/PNG/WebP)
  - Edição de nome e email
  - Alteração de senha com validação
  - Visualização/ocultação de senha
  - Remoção de avatar
- [x] Recuperação de senha
  - Solicitação de reset via email
  - Token seguro com expiração (1 hora)
  - Validação de uso único
  - Páginas de solicitação e redefinição
  - Link na página de login
  - Pronto para integração SMTP
- [x] Upload de avatar no cadastro e perfil
  - Upload de arquivo (não URL) com preview
  - Validação client-side e server-side
  - Suporte a JPEG, PNG, WebP (máx 5MB)
  - Preview em tempo real
  - Botão de remover avatar
  - API completa (POST/DELETE) em `/api/profile/avatar`
  - Salvamento em `/public/uploads/avatars/`
  - Exclusão automática de avatar antigo

### v1.2 (Próxima versão)

- [x] Sistema de repetição espaçada aprimorado (algoritmo SM-2)
  - Implementação do algoritmo SM-2 oficial
  - Tabela `card_reviews` para rastrear revisões individuais
  - API `/api/decks/[id]/review` para salvar e recuperar revisões
  - Cálculo automático de intervalos e E-Factor
  - Suporte a 4 níveis de dificuldade (again, hard, good, easy)
  - Testes automatizados do algoritmo
  - Documentação completa em `docs/SM2-ALGORITHM.md`
- [x] Estatísticas avançadas de estudo na página de perfil
  - Total de baralhos criados
  - Total de flashcards
  - Cards estudados hoje/semana/mês
  - Sequência de dias estudando (streak)
- [x] Gráficos de progresso
  - Gráfico de desempenho semanal
  - Distribuição de dificuldade dos cards
  - Tempo médio de estudo
- [x] Dashboard atualizado com dados relevantes
  - Estatísticas de revisões pendentes
  - Cards a estudar hoje
  - Sidebar colapsável por seções
- [x] Sistema de organização de baralhos (Google Drive style)
  - Pastas hierárquicas (folders table)
  - Tags múltiplas por baralho (tags + deck_tags tables)
  - Sistema de favoritos/bookmarks
  - Cores e ícones personalizados
  - 11 índices de performance
  - 20 prepared statements
  - APIs completas de folders e tags
- [x] Componentes de organização
  - `Breadcrumbs.tsx` - Navegação estilo Google Drive
  - `FolderTree.tsx` - Árvore hierárquica expansível
  - `TagSelector.tsx` - Seletor múltiplo com criação inline
- [x] Página /baralhos com múltiplas visualizações
  - Visualização em Cards (grid 3 colunas)
  - Visualização em Lista (tabela detalhada)
  - Visualização em Árvore (hierárquica)
  - Sidebar com FolderTree e filtros
  - Busca em tempo real
  - Filtro por favoritos
  - Breadcrumbs para navegação
- [x] Sidebar global completo
  - Todas as rotas do app incluídas
  - Seção Principal (Início, Baralhos, Novo, Perfil)
  - Seção Exemplos (Demo Flashcards)
  - Seção Documentação (8 páginas)
  - Ícones apropriados para cada rota
- [ ] Modais de gerenciamento
  - Modal para criar/editar pastas
  - Modal para mover baralhos entre pastas
- [ ] Atualizar formulários de baralhos
  - Adicionar seletor de pasta em criar/editar
  - Integrar TagSelector em criar/editar
  - Toggle de favorito
  - Seletor de cor e ícone
- [ ] Completar APIs de organização
  - PUT/DELETE /api/tags/[id]
  - Atualizar GET /api/decks para incluir tags/folder (JOIN)
  - Atualizar POST/PUT /api/decks para salvar tags
- [ ] Atalhos de teclado numéricos para avaliação (1-4)
- [ ] Modo noturno automático (baseado no horário do sistema)
- [ ] Integração de email para recuperação de senha
  - Configuração SMTP (Nodemailer/SendGrid)
  - Templates de email profissionais
  - Testes de envio
- [ ] Drag-and-drop entre pastas (opcional)
- [ ] Atalhos de teclado (Ctrl+K busca, Ctrl+N novo)

### v2.0 (Futuro)

- [ ] Exportação/importação de baralhos (JSON, CSV, Anki)
- [ ] Compartilhamento de baralhos entre usuários
- [ ] Tags e categorias para organização
- [ ] Busca avançada e filtros
- [ ] Sistema de conquistas e gamificação
- [ ] Migração para PostgreSQL
- [ ] Sistema de cache com Redis
- [ ] Rate limiting nas APIs
- [ ] Upload para S3 ou Cloudinary
- [ ] Testes unitários e de integração

### v3.0 (Longo Prazo)

- [ ] App mobile nativo (React Native)
- [ ] Sincronização offline (PWA)
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Testes E2E completos (Playwright)
- [ ] Editor de cards WYSIWYG
- [ ] Suporte a LaTeX para fórmulas matemáticas
- [ ] Integração com APIs educacionais
- [ ] Sistema de notificações push
- [ ] Backup automático e restore
- [ ] Modo de estudo em grupo/colaborativo

### Melhorias Técnicas (Contínuas)

- [ ] Otimização de performance (lazy loading, code splitting)
- [ ] Melhoria de acessibilidade (WCAG 2.1 AA)
- [ ] Documentação completa da API
- [ ] Monitoramento e analytics
- [ ] CI/CD pipeline completo
- [ ] Docker e containerização
- [ ] Logs estruturados e rastreamento de erros

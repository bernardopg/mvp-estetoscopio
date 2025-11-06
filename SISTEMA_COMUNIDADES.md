# Sistema de Comunidades e Compartilhamento de Baralhos

## 📋 Resumo da Implementação

Este documento descreve o sistema de comunidades implementado no MVP Estetoscópio, que permite aos usuários criar comunidades, compartilhar baralhos e controlar permissões de acesso.

## 🎯 Funcionalidades Implementadas

### 1. **Banco de Dados**

#### Novas Tabelas

**`communities`** - Armazena informações das comunidades

- `id`: ID único da comunidade
- `name`: Nome da comunidade (máx. 100 caracteres)
- `description`: Descrição opcional
- `created_by`: ID do usuário criador
- `is_private`: 0 = pública, 1 = privada
- `member_count`: Cache do número de membros
- `deck_count`: Cache do número de baralhos compartilhados
- `icon`: Emoji ou ícone da comunidade
- `color`: Cor personalizada (hex)
- `created_at`, `updated_at`: Timestamps

**`community_members`** - Relaciona usuários com comunidades

- `id`: ID único
- `community_id`: ID da comunidade
- `user_id`: ID do usuário
- `role`: 'member', 'moderator' ou 'admin'
- `joined_at`: Data de entrada

**`shared_decks`** - Baralhos compartilhados em comunidades

- `id`: ID único
- `deck_id`: ID do baralho
- `community_id`: ID da comunidade
- `shared_by`: ID do usuário que compartilhou
- `permission`: 'view', 'edit' ou 'clone'
- `allow_comments`: 0 ou 1
- `downloads`: Contador de clones/downloads
- `created_at`, `updated_at`: Timestamps

**`deck_comments`** - Comentários em baralhos compartilhados

- `id`: ID único
- `shared_deck_id`: ID do baralho compartilhado
- `user_id`: ID do usuário
- `comment`: Texto do comentário
- `parent_comment_id`: ID do comentário pai (para threads)
- `created_at`, `updated_at`: Timestamps

#### Índices Adicionados

- `idx_communities_created_by`
- `idx_community_members_user`
- `idx_community_members_community`
- `idx_shared_decks_community`
- `idx_shared_decks_deck`
- `idx_deck_comments_shared_deck`

---

### 2. **APIs Implementadas**

#### Comunidades

**`GET /api/communities`** - Listar comunidades

- Query params: `filter=all|my|public`
- Retorna: lista de comunidades

**`POST /api/communities`** - Criar comunidade

- Body: `{ name, description, is_private, icon, color }`
- Retorna: comunidade criada

**`GET /api/communities/[id]`** - Obter detalhes

- Retorna: comunidade + papel do usuário + status de membro

**`PATCH /api/communities/[id]`** - Atualizar comunidade

- Apenas admin pode editar
- Body: `{ name, description, is_private, icon, color }`

**`DELETE /api/communities/[id]`** - Deletar comunidade

- Apenas o criador pode deletar

#### Membros

**`GET /api/communities/[id]/members`** - Listar membros

- Retorna: lista de membros com informações do usuário

**`PATCH /api/communities/[id]/members`** - Atualizar papel de membro

- Apenas admin pode alterar
- Body: `{ user_id, role }`

**`DELETE /api/communities/[id]/members?user_id=X`** - Remover membro

- Admin e moderadores podem remover

**`POST /api/communities/[id]/join`** - Entrar na comunidade

- Apenas comunidades públicas

**`POST /api/communities/[id]/leave`** - Sair da comunidade

- Criador não pode sair

#### Baralhos Compartilhados

**`GET /api/communities/[id]/decks`** - Listar baralhos da comunidade

- Retorna: baralhos compartilhados + metadata

**`POST /api/communities/[id]/decks`** - Compartilhar baralho

- Body: `{ deck_id, permission, allow_comments }`
- Permissões: 'view', 'edit', 'clone'

**`GET /api/shared-decks/[id]`** - Obter baralho compartilhado

- Retorna: shared_deck + deck completo

**`PATCH /api/shared-decks/[id]`** - Atualizar permissões

- Apenas o dono do baralho pode alterar
- Body: `{ permission, allow_comments }`

**`DELETE /api/shared-decks/[id]`** - Remover compartilhamento

- Dono do baralho ou admin da comunidade

**`POST /api/shared-decks/[id]/clone`** - Clonar baralho

- Apenas se permission = 'clone' ou 'edit'
- Cria cópia do baralho para o usuário

---

### 3. **TypeScript Types**

```typescript
interface Community {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  is_private: number;
  member_count: number;
  deck_count: number;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  role?: string; // Quando vem de JOIN com membros
}

interface CommunityMember {
  id: number;
  community_id: number;
  user_id: number;
  role: "member" | "moderator" | "admin";
  joined_at: string;
  name?: string;
  email?: string;
  profile_picture?: string;
}

interface SharedDeck {
  id: number;
  deck_id: number;
  community_id: number;
  shared_by: number;
  permission: "view" | "edit" | "clone";
  allow_comments: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  title?: string;
  cards?: string;
  shared_by_name?: string;
}

interface DeckComment {
  id: number;
  shared_deck_id: number;
  user_id: number;
  comment: string;
  parent_comment_id?: number;
  created_at: string;
  updated_at: string;
  name?: string;
  profile_picture?: string;
  replies?: DeckComment[];
}
```

---

### 4. **Componentes UI**

**`CommunityCard`** (`src/components/CommunityCard.tsx`)

- Card visual de comunidade
- Mostra: ícone, nome, descrição, estatísticas
- Badge de privacidade e papel do usuário
- Link para página de detalhes

---

### 5. **Páginas**

**`/comunidades`** (`src/app/comunidades/page.tsx`)

- Lista todas as comunidades
- Filtros: Todas, Minhas, Públicas
- Busca por nome/descrição
- Botão para criar nova comunidade

**`/comunidades/criar`** (`src/app/comunidades/criar/page.tsx`)

- Formulário de criação
- Campos: nome, descrição, privacidade, ícone, cor
- Pré-visualização em tempo real
- Validação de formulário

**`/comunidades/[id]`** (a ser implementado)

- Detalhes da comunidade
- Lista de baralhos compartilhados
- Gerenciamento de membros (se admin)
- Botões de entrar/sair

---

### 6. **Navegação**

Adicionado item "Comunidades" na Sidebar (`src/components/Sidebar.tsx`)

- Ícone: `Users` (Lucide React)
- Localizado na seção "Principal"
- Rota: `/comunidades`

---

## 🔐 Sistema de Permissões

### Papéis (Roles)

1. **Member** (Membro)
   - Pode ver baralhos compartilhados
   - Pode comentar (se permitido)
   - Pode clonar baralhos (se permitido)
   - Pode sair da comunidade

2. **Moderator** (Moderador)
   - Todas as permissões de Member
   - Pode remover membros
   - Não pode editar configurações da comunidade

3. **Admin** (Administrador)
   - Todas as permissões de Moderator
   - Pode editar comunidade
   - Pode alterar papéis de membros
   - Pode remover compartilhamentos

4. **Creator** (Criador)
   - É automaticamente admin
   - Único que pode deletar a comunidade
   - Não pode sair da comunidade

### Permissões de Baralhos

1. **View** (Visualizar)
   - Usuários podem apenas ver o baralho
   - Não podem editar ou clonar

2. **Edit** (Editar)
   - Usuários podem editar o baralho original
   - Também podem clonar

3. **Clone** (Clonar)
   - Usuários podem criar uma cópia
   - Cópia vira baralho pessoal do usuário

---

## 📊 Fluxo de Uso

### Criar Comunidade

1. Usuário clica em "Criar Comunidade"
2. Preenche formulário (nome, descrição, privacidade, etc)
3. Sistema cria comunidade e adiciona criador como admin
4. Redireciona para página da comunidade

### Entrar em Comunidade

1. Usuário navega para `/comunidades`
2. Filtra ou busca comunidade desejada
3. Clica na comunidade
4. Clica em "Entrar" (se pública)
5. Sistema adiciona usuário como member

### Compartilhar Baralho

1. Usuário entra na comunidade
2. Clica em "Compartilhar Baralho"
3. Seleciona baralho próprio
4. Define permissão (view/edit/clone)
5. Define se permite comentários
6. Sistema cria shared_deck

### Clonar Baralho

1. Usuário vê baralho compartilhado
2. Verifica se permissão permite clone
3. Clica em "Clonar"
4. Sistema cria cópia do baralho
5. Baralho aparece em "Meus Baralhos"

---

## 🚀 Próximos Passos Sugeridos

### Para Completar a Feature

1. **Página de Detalhes da Comunidade** (`/comunidades/[id]`)
   - Lista de baralhos compartilhados
   - Lista de membros
   - Painel de administração (se admin)

2. **Modal de Compartilhamento**
   - Componente para compartilhar baralho
   - Seletor de comunidades
   - Seletor de permissões

3. **Sistema de Comentários**
   - Componente de lista de comentários
   - Formulário de novo comentário
   - Suporte a threads/respostas

4. **Notificações**
   - Novo membro entrou
   - Novo baralho compartilhado
   - Novo comentário

5. **Busca Avançada**
   - Buscar baralhos dentro de comunidades
   - Filtrar por tags/categorias
   - Ordenar por popularidade/downloads

### Melhorias Futuras

- Sistema de convites para comunidades privadas
- Badges de conquistas para membros ativos
- Estatísticas da comunidade (gráficos)
- Feed de atividades
- Sistema de moderação avançado
- Relatórios de conteúdo
- Integração com Discord/Slack

---

## 📝 Notas Técnicas

- Todos os endpoints de API verificam autenticação via JWT
- Permissões são verificadas no backend (nunca confiar no frontend)
- Contadores de membros e baralhos são caches atualizados automaticamente
- Deleção em cascata configurada para evitar dados órfãos
- Índices criados para otimizar queries frequentes
- TypeScript estrito em todos os arquivos (sem `any`)

---

## 🎨 Design System

### Cores Disponíveis

14 cores predefinidas para comunidades (azul, roxo, rosa, vermelho, laranja, etc.)

### Ícones Disponíveis

12 emojis predefinidos (🏛️, 📚, 🎓, 💡, 🚀, 🌟, 🎯, 🔬, 🎨, 🎵, ⚡, 🌈)

### Estados Visuais

- Hover: sombra e border highlight
- Active: destaque azul
- Loading: spinner animado
- Empty state: ícone + mensagem + CTA

---

## 🔍 Testing Checklist

- [ ] Criar comunidade pública
- [ ] Criar comunidade privada
- [ ] Entrar em comunidade pública
- [ ] Tentar entrar em comunidade privada (deve falhar)
- [ ] Compartilhar baralho com permissão 'view'
- [ ] Compartilhar baralho com permissão 'clone'
- [ ] Clonar baralho compartilhado
- [ ] Atualizar permissões de baralho compartilhado
- [ ] Remover compartilhamento
- [ ] Alterar papel de membro (admin)
- [ ] Remover membro (admin/moderator)
- [ ] Sair de comunidade
- [ ] Tentar sair sendo criador (deve falhar)
- [ ] Editar comunidade (admin)
- [ ] Deletar comunidade (apenas criador)
- [ ] Buscar comunidades
- [ ] Filtrar comunidades (todas/minhas/públicas)

---

**Data de Implementação**: Novembro 2025
**Versão**: v1.2.0 (sugerida)
**Status**: Core implementado, páginas de detalhes pendentes

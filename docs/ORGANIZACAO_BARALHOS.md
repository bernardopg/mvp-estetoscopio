# Sistema de Organização de Baralhos - Implementação

## 📋 Visão Geral

Sistema completo de organização de baralhos com suporte a:

- ✅ **Pastas hierárquicas** (tipo Google Drive)
- ✅ **Tags múltiplas** por baralho
- ✅ **Bookmarks/Favoritos**
- ✅ **3 modos de visualização**: Cards, Lista, Árvore
- ✅ **Breadcrumbs** para navegação
- ✅ **Cores e ícones** personalizados

---

## 🗄️ Schema do Banco de Dados

### ✅ Implementado

#### Tabela `decks` (atualizada)

```sql
CREATE TABLE decks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  cards TEXT NOT NULL,
  category TEXT DEFAULT NULL, -- DEPRECATED - usar tags
  folder_id INTEGER DEFAULT NULL, -- Nova coluna
  color TEXT DEFAULT NULL, -- Nova coluna
  icon TEXT DEFAULT NULL, -- Nova coluna
  is_bookmarked INTEGER DEFAULT 0, -- Nova coluna
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
);
```

#### Tabela `folders` (nova)

```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  parent_id INTEGER DEFAULT NULL, -- Hierarquia
  color TEXT DEFAULT NULL,
  icon TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE
);
```

#### Tabela `tags` (nova)

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

#### Tabela `deck_tags` (nova - many-to-many)

```sql
CREATE TABLE deck_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(deck_id, tag_id),
  FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);
```

### Índices Adicionados

```sql
CREATE INDEX idx_decks_folder ON decks(folder_id);
CREATE INDEX idx_decks_bookmarked ON decks(user_id, is_bookmarked);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_user ON folders(user_id);
CREATE INDEX idx_deck_tags_deck ON deck_tags(deck_id);
CREATE INDEX idx_deck_tags_tag ON deck_tags(tag_id);
```

---

## 🔌 APIs Implementadas

### ✅ Folders API

#### `GET /api/folders`

- Retorna todas as pastas do usuário
- Inclui contagem de decks por pasta
- Exemplo de resposta:

```json
[
  {
    "id": 1,
    "name": "Medicina",
    "parent_id": null,
    "color": "#3b82f6",
    "icon": "Stethoscope",
    "deckCount": 5,
    "created_at": "2025-11-05T10:00:00.000Z"
  }
]
```

#### `POST /api/folders`

- Cria nova pasta
- Body:

```json
{
  "name": "Nova Pasta",
  "parent_id": 1, // null para pasta raiz
  "color": "#3b82f6",
  "icon": "Folder"
}
```

#### `GET /api/folders/[id]`

- Retorna pasta específica

#### `PUT /api/folders/[id]`

- Atualiza pasta (nome, parent_id, color, icon)

#### `DELETE /api/folders/[id]`

- Deleta pasta
- Move baralhos para raiz antes de deletar
- CASCADE deleta subpastas automaticamente

### ✅ Tags API

#### `GET /api/tags`

- Retorna todas as tags do usuário

#### `POST /api/tags`

- Cria nova tag
- Valida unicidade de nome por usuário
- Body:

```json
{
  "name": "Urgente",
  "color": "#ef4444"
}
```

### Prepared Statements Adicionados

```typescript
// Folders
getFolders: "SELECT * FROM folders WHERE user_id = ? ORDER BY name ASC"
getFolder: "SELECT * FROM folders WHERE id = ? AND user_id = ?"
getFoldersByParent: "SELECT * FROM folders WHERE user_id = ? AND parent_id IS ? ORDER BY name ASC"
createFolder: "INSERT INTO folders ..."
updateFolder: "UPDATE folders SET name = ?, parent_id = ?, color = ?, icon = ? ..."
deleteFolder: "DELETE FROM folders WHERE id = ? AND user_id = ?"
moveDeckToFolder: "UPDATE decks SET folder_id = ? WHERE id = ? AND user_id = ?"

// Tags
getTags: "SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC"
getTag: "SELECT * FROM tags WHERE id = ? AND user_id = ?"
getTagByName: "SELECT * FROM tags WHERE user_id = ? AND name = ?"
createTag: "INSERT INTO tags ..."
updateTag: "UPDATE tags SET name = ?, color = ? ..."
deleteTag: "DELETE FROM tags WHERE id = ? AND user_id = ?"

// Deck Tags
addTagToDeck: "INSERT INTO deck_tags (deck_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING"
removeTagFromDeck: "DELETE FROM deck_tags WHERE deck_id = ? AND tag_id = ?"
getDeckTags: "SELECT tags.* FROM tags INNER JOIN deck_tags ..."
getDecksByTag: "SELECT decks.* FROM decks INNER JOIN deck_tags ..."
clearDeckTags: "DELETE FROM deck_tags WHERE deck_id = ?"

// Bookmarks
toggleBookmark: "UPDATE decks SET is_bookmarked = NOT is_bookmarked ..."
getBookmarkedDecks: "SELECT * FROM decks WHERE user_id = ? AND is_bookmarked = 1 ..."

// Deck Metadata
updateDeckMetadata: "UPDATE decks SET title = ?, cards = ?, category = ?, folder_id = ?, color = ?, icon = ? ..."
```

---

## 🎨 Componentes UI Criados

### ✅ `Breadcrumbs.tsx`

Navegação breadcrumb estilo Google Drive

```tsx
<Breadcrumbs
  items={[
    { label: "Medicina", href: "/baralhos?folder=1", icon: Folder },
    { label: "Cardiologia", icon: FolderOpen }
  ]}
/>
```

**Recursos**:

- Ícone de home sempre visível
- Suporta ícones customizados
- Links clicáveis exceto último item
- Dark mode support

### ✅ `FolderTree.tsx`

Árvore de pastas hierárquica com expansão/colapso

```tsx
<FolderTree
  folders={folders}
  selectedFolderId={currentFolderId}
  onFolderSelect={(id) => setCurrentFolder(id)}
  onCreateFolder={(parentId) => handleCreate(parentId)}
/>
```

**Recursos**:

- Expansão/colapso de subpastas
- Indicador visual de pasta selecionada
- Contagem de decks por pasta
- Botão "+" para criar subpasta (hover)
- Suporta hierarquia ilimitada
- Cores customizadas por pasta

### ✅ `TagSelector.tsx`

Seletor de tags com criação inline

```tsx
<TagSelector
  availableTags={allTags}
  selectedTags={deckTags}
  onTagsChange={(tags) => setDeckTags(tags)}
  onCreateTag={async (name, color) => {
    const tag = await createTag(name, color);
    return tag;
  }}
/>
```

**Recursos**:

- Tags selecionadas aparecem como badges
- Tags disponíveis como botões clicáveis
- Criação inline de nova tag
- Seletor de cor (8 cores pré-definidas)
- Remover tag com "X"
- Preview em tempo real

---

## 🚧 Próximos Passos (Para Completar)

### 1. Atualizar Página de Baralhos (`/src/app/baralhos/page.tsx`)

#### a) Adicionar Toggle de Visualização

```tsx
const [viewMode, setViewMode] = useState<'cards' | 'list' | 'tree'>('cards');

// Botões de toggle
<div className="flex gap-2">
  <button onClick={() => setViewMode('cards')}>
    <LayoutGrid /> Cards
  </button>
  <button onClick={() => setViewMode('list')}>
    <List /> Lista
  </button>
  <button onClick={() => setViewMode('tree')}>
    <GitBranch /> Árvore
  </button>
</div>
```

#### b) Adicionar Sidebar com FolderTree

```tsx
<div className="flex gap-6">
  {/* Sidebar */}
  <aside className="w-64 shrink-0">
    <FolderTree
      folders={folders}
      selectedFolderId={currentFolder}
      onFolderSelect={setCurrentFolder}
      onCreateFolder={handleCreateFolder}
    />

    {/* Filtros */}
    <div className="mt-6">
      <button onClick={() => setShowBookmarked(!showBookmarked)}>
        <Bookmark /> Favoritos
      </button>
    </div>
  </aside>

  {/* Conteúdo Principal */}
  <main className="flex-1">
    <Breadcrumbs items={breadcrumbItems} />
    {/* Baralhos */}
  </main>
</div>
```

#### c) Implementar Visualizações

**Cards (atual - já existe)**

- Grid 3 colunas
- Card com preview
- Ícone de bookmark
- Tags como badges

**Lista Detalhada**

```tsx
{viewMode === 'list' && (
  <table className="w-full">
    <thead>
      <tr>
        <th>Título</th>
        <th>Pasta</th>
        <th>Tags</th>
        <th>Cards</th>
        <th>Progresso</th>
        <th>Última Revisão</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {decks.map(deck => (
        <tr key={deck.id}>
          <td>{deck.title}</td>
          <td>{deck.folder?.name}</td>
          <td>{deck.tags.map(t => <Badge>{t.name}</Badge>)}</td>
          <td>{deck.cards.length}</td>
          <td><ProgressBar value={deck.progress} /></td>
          <td>{formatDate(deck.last_studied)}</td>
          <td><Actions /></td>
        </tr>
      ))}
    </tbody>
  </table>
)}
```

**Árvore Hierárquica**

```tsx
{viewMode === 'tree' && (
  <div className="space-y-2">
    {/* Renderizar pastas e decks em árvore */}
    {renderFolderWithDecks(folders, decks)}
  </div>
)}
```

#### d) Adicionar Filtros

```tsx
const [filters, setFilters] = useState({
  folder: null,
  tags: [],
  bookmarked: false,
  search: '',
});

// Aplicar filtros
const filteredDecks = decks
  .filter(d => !filters.folder || d.folder_id === filters.folder)
  .filter(d => !filters.bookmarked || d.is_bookmarked)
  .filter(d => filters.tags.length === 0 || d.tags.some(t => filters.tags.includes(t.id)))
  .filter(d => !filters.search || d.title.toLowerCase().includes(filters.search.toLowerCase()));
```

### 2. Atualizar Página de Criar/Editar Baralho

```tsx
// /src/app/baralhos/criar/page.tsx
// /src/app/baralhos/[id]/editar/page.tsx

const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
const [isBookmarked, setIsBookmarked] = useState(false);
const [color, setColor] = useState<string | null>(null);
const [icon, setIcon] = useState<string | null>(null);

// No formulário
<div className="space-y-4">
  {/* Seletor de Pasta */}
  <div>
    <label>Pasta</label>
    <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
      <option value="">Raiz</option>
      {folders.map(f => (
        <option value={f.id}>{f.name}</option>
      ))}
    </select>
  </div>

  {/* Tag Selector */}
  <div>
    <label>Tags</label>
    <TagSelector
      availableTags={allTags}
      selectedTags={selectedTags}
      onTagsChange={setSelectedTags}
      onCreateTag={handleCreateTag}
    />
  </div>

  {/* Bookmark Toggle */}
  <button onClick={() => setIsBookmarked(!isBookmarked)}>
    <Bookmark fill={isBookmarked ? 'currentColor' : 'none'} />
    Marcar como favorito
  </button>

  {/* Cor personalizada */}
  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

  {/* Ícone */}
  <IconPicker value={icon} onChange={setIcon} />
</div>

// Ao salvar
const saveDeck = async () => {
  const response = await fetch('/api/decks', {
    method: 'POST',
    body: JSON.stringify({
      title,
      cards,
      folder_id: selectedFolder,
      color,
      icon,
      is_bookmarked: isBookmarked,
      tags: selectedTags.map(t => t.id),
    }),
  });
};
```

### 3. Atualizar API de Decks (`/src/app/api/decks/route.ts`)

```typescript
// GET /api/decks - incluir tags e folder
export async function GET() {
  const user = await getAuthUser();

  const decks = statements.getDecks.all(user.id);

  // Para cada deck, buscar tags
  const decksWithMetadata = decks.map(deck => {
    const tags = statements.getDeckTags.all(deck.id);
    const folder = deck.folder_id
      ? statements.getFolder.get(deck.folder_id, user.id)
      : null;

    return { ...deck, tags, folder };
  });

  return NextResponse.json(decksWithMetadata);
}

// POST /api/decks - salvar tags
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, cards, folder_id, color, icon, is_bookmarked, tags } = body;

  // Criar deck
  const result = statements.createDeck.run(user.id, title, cards, null);
  const deckId = result.lastInsertRowid;

  // Atualizar metadata
  statements.updateDeckMetadata.run(
    title, cards, null, folder_id, color, icon, deckId, user.id
  );

  // Adicionar tags
  if (tags && Array.isArray(tags)) {
    for (const tagId of tags) {
      statements.addTagToDeck.run(deckId, tagId);
    }
  }

  // Toggle bookmark
  if (is_bookmarked) {
    statements.toggleBookmark.run(deckId, user.id);
  }

  return NextResponse.json({ id: deckId });
}
```

### 4. Modais/Dialogs Necessários

#### CreateFolderModal

```tsx
<Modal open={showCreateFolder} onClose={() => setShowCreateFolder(false)}>
  <h2>Criar Nova Pasta</h2>
  <input value={folderName} onChange={(e) => setFolderName(e.target.value)} />
  <select value={parentFolder}>
    <option value="">Raiz</option>
    {folders.map(f => <option value={f.id}>{f.name}</option>)}
  </select>
  <ColorPicker value={folderColor} onChange={setFolderColor} />
  <button onClick={handleCreateFolder}>Criar</button>
</Modal>
```

#### MoveDeckModal

```tsx
<Modal open={showMoveModal} onClose={() => setShowMoveModal(false)}>
  <h2>Mover para Pasta</h2>
  <FolderTree
    folders={folders}
    selectedFolderId={targetFolder}
    onFolderSelect={setTargetFolder}
  />
  <button onClick={handleMove}>Mover</button>
</Modal>
```

### 5. Drag and Drop (Opcional - Avançado)

Usar `@dnd-kit/core` para arrastar baralhos entre pastas:

```tsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function DraggableDeck({ deck }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: deck.id,
    data: { type: 'deck', deck },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {/* Card do baralho */}
    </div>
  );
}

function DroppableFolder({ folder }) {
  const { setNodeRef } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folder },
  });

  return (
    <div ref={setNodeRef}>
      {/* Pasta */}
    </div>
  );
}

// No componente pai
<DndContext onDragEnd={handleDragEnd}>
  {/* Decks e Folders */}
</DndContext>
```

### 6. Atalhos de Teclado (Opcional)

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + N = Novo Baralho
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      router.push('/baralhos/criar');
    }

    // Ctrl/Cmd + K = Busca rápida
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setShowSearch(true);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 📊 Fluxo de Uso

### Cenário 1: Criar Pasta e Organizar

1. Usuário clica em "Nova Pasta" na sidebar
2. Insere nome, cor e ícone
3. Pasta aparece na árvore
4. Arrasta baralhos para a pasta (ou seleciona ao criar)

### Cenário 2: Filtrar por Tags

1. Usuário clica em tag na sidebar/filtro
2. Apenas baralhos com aquela tag aparecem
3. Breadcrumb mostra "Todos > Tag: Urgente"

### Cenário 3: Navegar Hierarquia

1. Usuário expande pasta "Medicina"
2. Vê subpasta "Cardiologia"
3. Clica em "Cardiologia"
4. Breadcrumb: Home > Medicina > Cardiologia
5. Lista mostra apenas baralhos dessa pasta

### Cenário 4: Visualização em Lista

1. Usuário troca para modo lista
2. Vê tabela com todas informações
3. Ordena por coluna (título, data, progresso)
4. Filtra combinando pasta + tags

---

## 🎯 Benefícios da Implementação

✅ **Organização Hierárquica**: Como Google Drive, pastas dentro de pastas
✅ **Flexibilidade**: Tags permitem múltiplas categorizações
✅ **Favoritos**: Acesso rápido a baralhos importantes
✅ **Múltiplas Visualizações**: Cada usuário escolhe sua preferência
✅ **Breadcrumbs**: Navegação clara e contextual
✅ **Personalização**: Cores e ícones para identidade visual
✅ **Performance**: Índices otimizados para consultas rápidas
✅ **Escalável**: Suporta milhares de baralhos organizados

---

## 📝 Checklist de Implementação

### Banco de Dados

- [x] Schema de folders
- [x] Schema de tags
- [x] Schema de deck_tags
- [x] Atualizar decks com folder_id, color, icon, is_bookmarked
- [x] Índices de performance
- [x] Prepared statements

### Backend (APIs)

- [x] GET/POST /api/folders
- [x] GET/PUT/DELETE /api/folders/[id]
- [x] GET/POST /api/tags
- [ ] GET/PUT/DELETE /api/tags/[id]
- [ ] Atualizar GET /api/decks (incluir tags e folder)
- [ ] Atualizar POST/PUT /api/decks (salvar tags)
- [ ] POST /api/decks/[id]/bookmark (toggle)
- [ ] POST /api/decks/[id]/move (mover para pasta)

### Frontend - Componentes

- [x] Breadcrumbs.tsx
- [x] FolderTree.tsx
- [x] TagSelector.tsx
- [ ] ViewModeToggle.tsx (cards/list/tree)
- [ ] DeckListView.tsx (visualização em lista)
- [ ] DeckTreeView.tsx (visualização em árvore)
- [ ] CreateFolderModal.tsx
- [ ] MoveDeckModal.tsx
- [ ] TagFilterBar.tsx

### Frontend - Páginas

- [ ] Atualizar /baralhos/page.tsx (sidebar + 3 modos + filtros)
- [ ] Atualizar /baralhos/criar/page.tsx (folder + tags + bookmark)
- [ ] Atualizar /baralhos/[id]/editar/page.tsx (mesmas alterações)

### Extras (Opcional)

- [ ] Drag and drop entre pastas
- [ ] Atalhos de teclado
- [ ] Busca rápida (Ctrl+K)
- [ ] Exportar/importar estrutura
- [ ] Compartilhar pasta/tag

---

## 🚀 Como Continuar

1. **Testar Schema**: Reinicie o servidor para criar novas tabelas
2. **Testar APIs**: Use Postman/Thunder Client para testar endpoints
3. **Integrar Componentes**: Adicione FolderTree na sidebar de baralhos
4. **Implementar Visualizações**: Crie os 3 modos de visualização
5. **Adicionar Filtros**: Implemente filtragem por pasta/tags/bookmarks
6. **UI/UX**: Adicione modais e interações

**Próximo passo recomendado**: Atualizar `/src/app/baralhos/page.tsx` para incluir sidebar com `FolderTree` e toggle de visualização.

# Referência Técnica - MVP Estetoscópio

> Guia de referência rápida para desenvolvedores

## 📚 Sumário

- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [API Endpoints](#api-endpoints)
- [Componentes Principais](#componentes-principais)
- [Hooks e Utilidades](#hooks-e-utilidades)
- [Banco de Dados](#banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## 🛠 Stack Tecnológica

### Frontend

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **TypeScript**: 5
- **Estilização**: Tailwind CSS 4
- **Ícones**: Lucide React

### Backend

- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (serverless)
- **Banco de Dados**: Better-SQLite3 (embedded)
- **Autenticação**: JWT + HTTP-only cookies
- **Senha**: bcryptjs

### Ferramentas

- **Linter**: ESLint
- **Package Manager**: npm
- **Build**: Turbopack (Next.js 16)

---

## 📁 Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação (login, logout, signup)
│   │   ├── dashboard/    # Dashboard stats
│   │   ├── decks/        # CRUD de baralhos
│   │   ├── profile/      # Perfil do usuário
│   │   └── upload/       # Upload de arquivos
│   ├── baralhos/         # Páginas de baralhos
│   ├── docs/             # Documentação MDX
│   ├── flashcards/       # Demo de flashcards
│   ├── login/            # Login
│   ├── perfil/           # Perfil
│   ├── signup/           # Cadastro
│   ├── layout.tsx        # Layout raiz
│   ├── page.tsx          # Home/Dashboard
│   └── globals.css       # Estilos globais
├── components/            # Componentes React
│   ├── AudioPlayer.tsx
│   ├── Flashcard.tsx
│   ├── MediaFlashcard.tsx
│   ├── MarkdownRenderer.tsx
│   └── Sidebar.tsx
├── lib/                   # Bibliotecas e utilidades
│   ├── auth.ts           # Funções de autenticação
│   ├── db.ts             # Configuração do banco
│   └── spaced-repetition.ts  # Algoritmo de repetição
└── types/                 # Tipos TypeScript
    └── globals.d.ts
```

---

## 🌐 API Endpoints

### Autenticação

#### POST `/api/auth/signup`

Criar nova conta de usuário.

**Body:**

```typescript
{
  name: string;
  email: string;
  password: string;
}
```

**Response:**

```typescript
{
  success: true;
  user: {
    id: number;
    name: string;
    email: string;
  }
}
```

#### POST `/api/auth/login`

Fazer login.

**Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Response:**

```typescript
{
  success: true;
  user: {
    id: number;
    name: string;
    email: string;
  }
}
```

#### POST `/api/auth/logout`

Fazer logout.

**Response:**

```typescript
{
  success: true;
}
```

### Baralhos (Decks)

#### GET `/api/decks`

Listar todos os baralhos do usuário autenticado.

**Headers:**

```
Cookie: token=<JWT_TOKEN>
```

**Response:**

```typescript
{
  decks: Array<{
    id: number;
    title: string;
    cards: Card[];
    created_at: string;
    updated_at: string;
  }>
}
```

#### POST `/api/decks`

Criar novo baralho.

**Body:**

```typescript
{
  title: string;
  cards: Card[];
}
```

**Response:**

```typescript
{
  success: true;
  deckId: number;
}
```

#### GET `/api/decks/[id]`

Obter detalhes de um baralho específico.

**Response:**

```typescript
{
  deck: {
    id: number;
    title: string;
    cards: Card[];
    created_at: string;
    updated_at: string;
  }
}
```

#### PUT `/api/decks/[id]`

Atualizar baralho existente.

**Body:**

```typescript
{
  title?: string;
  cards?: Card[];
}
```

**Response:**

```typescript
{
  success: true;
}
```

#### DELETE `/api/decks/[id]`

Deletar baralho.

**Response:**

```typescript
{
  success: true;
}
```

#### POST `/api/decks/[id]/progress`

Atualizar progresso de um card.

**Body:**

```typescript
{
  cardId: string;
  difficulty: "again" | "hard" | "good" | "easy";
}
```

**Response:**

```typescript
{
  success: true;
  nextReview: string;  // ISO date
}
```

### Outros Endpoints

#### GET `/api/dashboard`

Obter estatísticas do dashboard.

**Response:**

```typescript
{
  totalDecks: number;
  totalCards: number;
  cardsToReview: number;
  studyStreak: number;
}
```

#### GET `/api/profile`

Obter perfil do usuário.

**Response:**

```typescript
{
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  }
}
```

#### POST `/api/upload`

Upload de arquivo (imagem ou áudio).

**Content-Type:** `multipart/form-data`

**Form Data:**

```
file: File
```

**Response:**

```typescript
{
  success: true;
  url: string;  // URL pública do arquivo
}
```

---

## 🧩 Componentes Principais

### Flashcard

Componente de flashcard com flip 3D.

```tsx
import Flashcard from "@/components/Flashcard";

<Flashcard
  front="Pergunta"
  back="Resposta"
  onRate={(difficulty) => console.log(difficulty)}
/>
```

**Props:**

```typescript
interface FlashcardProps {
  front: string;
  back: string;
  onRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
}
```

### MediaFlashcard

Flashcard com suporte a mídia (imagens e áudio).

```tsx
import MediaFlashcard from "@/components/MediaFlashcard";

<MediaFlashcard
  front={{ type: "text", content: "Pergunta" }}
  back={{ type: "image", content: "/path/to/image.jpg" }}
  onRate={(difficulty) => console.log(difficulty)}
/>
```

**Props:**

```typescript
interface CardContent {
  type: "text" | "image" | "audio";
  content: string;
  text?: string;  // Para legendas em imagens/áudio
}

interface MediaFlashcardProps {
  front: CardContent;
  back: CardContent;
  onRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
}
```

### AudioPlayer

Player de áudio customizado.

```tsx
import AudioPlayer from "@/components/AudioPlayer";

<AudioPlayer src="/path/to/audio.mp3" />
```

### Sidebar

Barra lateral de navegação.

```tsx
import Sidebar from "@/components/Sidebar";

<Sidebar />
```

### MarkdownRenderer

Renderizador de conteúdo Markdown/HTML.

```tsx
import MarkdownRenderer from "@/components/MarkdownRenderer";

<MarkdownRenderer
  content="<h1>Título</h1>"
  title="Página"
/>
```

---

## 🔧 Hooks e Utilidades

### Autenticação (`lib/auth.ts`)

#### `hashPassword(password: string): Promise<string>`

Hash de senha usando bcrypt.

```typescript
import { hashPassword } from "@/lib/auth";

const hashedPassword = await hashPassword("minha_senha");
```

#### `comparePassword(password: string, hash: string): Promise<boolean>`

Comparar senha com hash.

```typescript
import { comparePassword } from "@/lib/auth";

const isValid = await comparePassword("minha_senha", hashedPassword);
```

#### `generateToken(userId: number): string`

Gerar JWT token.

```typescript
import { generateToken } from "@/lib/auth";

const token = generateToken(userId);
```

#### `verifyToken(request: NextRequest): Promise<User | null>`

Verificar token JWT de uma requisição.

```typescript
import { verifyToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

### Banco de Dados (`lib/db.ts`)

#### `getDb(): Database`

Obter instância do banco SQLite.

```typescript
import { getDb } from "@/lib/db";

const db = getDb();
const users = db.prepare("SELECT * FROM users").all();
```

### Repetição Espaçada (`lib/spaced-repetition.ts`)

#### `calculateNextReview(difficulty: Difficulty, lastReview?: Date): Date`

Calcular próxima data de revisão baseado na dificuldade.

```typescript
import { calculateNextReview } from "@/lib/spaced-repetition";

const nextReview = calculateNextReview("good", new Date());
console.log(nextReview); // Data futura
```

**Intervalos:**

- `again`: 10 minutos
- `hard`: 1 dia
- `good`: 3 dias
- `easy`: 7 dias

---

## 💾 Banco de Dados

### Schema

#### Tabela `users`

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela `decks`

```sql
CREATE TABLE decks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  cards TEXT NOT NULL,  -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Estrutura de Cards (JSON)

```typescript
interface Card {
  id: string;
  front: CardContent;
  back: CardContent;
  progress?: {
    reviews: number;
    lastReview: string;      // ISO date
    nextReview: string;      // ISO date
    difficulty: "again" | "hard" | "good" | "easy";
  };
}

interface CardContent {
  type: "text" | "image" | "audio";
  content: string;
  text?: string;
}
```

### Queries Comuns

**Buscar usuário por email:**

```typescript
const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
```

**Criar novo deck:**

```typescript
const stmt = db.prepare(
  "INSERT INTO decks (user_id, title, cards) VALUES (?, ?, ?)"
);
stmt.run(userId, title, JSON.stringify(cards));
```

**Buscar decks de um usuário:**

```typescript
const decks = db.prepare(
  "SELECT * FROM decks WHERE user_id = ?"
).all(userId);
```

**Atualizar deck:**

```typescript
const stmt = db.prepare(
  "UPDATE decks SET title = ?, cards = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
);
stmt.run(title, JSON.stringify(cards), deckId);
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# JWT Secret (obrigatório)
JWT_SECRET=sua_chave_secreta_aqui

# Ambiente (opcional, padrão: development)
NODE_ENV=development

# Porta (opcional, padrão: 3000)
PORT=3000
```

### Gerando JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 TypeScript Types

### Tipos Globais (`src/types/globals.d.ts`)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  created_at?: string;
}

interface Deck {
  id: number;
  user_id: number;
  title: string;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

interface Card {
  id: string;
  front: CardContent;
  back: CardContent;
  progress?: CardProgress;
}

interface CardContent {
  type: "text" | "image" | "audio";
  content: string;
  text?: string;
}

interface CardProgress {
  reviews: number;
  lastReview: string;
  nextReview: string;
  difficulty: "again" | "hard" | "good" | "easy";
}

type Difficulty = "again" | "hard" | "good" | "easy";
```

---

## 🎨 Estilos Tailwind

### Cores Principais

- **Primary**: `blue-500` to `purple-600`
- **Secondary**: `emerald-500` to `teal-600`
- **Neutral**: `zinc-50` to `zinc-900`
- **Danger**: `red-500`, `red-600`
- **Success**: `green-500`, `green-600`

### Classes Comuns

**Container:**

```tsx
<div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
```

**Card:**

```tsx
<div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
```

**Botão Primary:**

```tsx
<button className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
```

**Input:**

```tsx
<input className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

---

## 🔄 Fluxos Principais

### Autenticação

1. Usuário preenche formulário de login/signup
2. Frontend envia POST para `/api/auth/login` ou `/api/auth/signup`
3. Backend valida credenciais
4. Backend gera JWT token
5. Backend define cookie HTTP-only com token
6. Frontend redireciona para dashboard

### Criação de Deck

1. Usuário clica em "Criar Baralho"
2. Frontend renderiza formulário
3. Usuário adiciona título e cards
4. Frontend envia POST para `/api/decks` com dados
5. Backend salva deck no banco
6. Frontend redireciona para página do deck

### Estudo com Flashcards

1. Usuário acessa página de estudo `/baralhos/[id]/estudar`
2. Frontend busca cards do deck
3. Exibe card com front
4. Usuário clica para ver back
5. Usuário escolhe dificuldade (Again/Hard/Good/Easy)
6. Frontend envia POST para `/api/decks/[id]/progress`
7. Backend calcula próxima revisão usando algoritmo de repetição espaçada
8. Próximo card é exibido

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento

# Produção
npm run build            # Build de produção
npm start                # Iniciar servidor de produção

# Code Quality
npm run lint             # Executar ESLint
npm run lint -- --fix    # Corrigir erros automaticamente

# Git
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

---

## 📚 Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better-SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [JWT Documentation](https://jwt.io/introduction)

---

## 🤝 Contribuindo

Consulte `CONTRIBUTING.md` para diretrizes de contribuição.

---

**Versão**: 1.1.0
**Última Atualização**: 2025-11-05

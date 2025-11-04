# 🏗️ Arquitetura Técnica - MVP Estetoscópio

Documentação técnica completa do sistema de flashcards.

## Sumário

- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Arquitetura da Aplicação](#arquitetura-da-aplicação)
- [Banco de Dados](#banco-de-dados)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [API Routes](#api-routes)
- [Fluxo de Dados](#fluxo-de-dados)
- [Componentes](#componentes)
- [Estilização](#estilização)
- [Performance](#performance)
- [Segurança](#segurança)

---

## 📚 Stack Tecnológica

### Frontend

- **Next.js 15** (App Router) - Framework React com SSR/SSG
- **React 19.2** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones

### Backend

- **Next.js API Routes** - Backend serverless
- **Better-SQLite3** - Banco de dados SQL embutido
- **JWT** (jsonwebtoken) - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas

### DevOps & Tools

- **ESLint** - Linter de código
- **PostCSS** - Processador CSS
- **npm** - Gerenciador de pacotes

---

## 📁 Estrutura de Diretórios

```
mvp-estetoscopio/
├── public/                      # Arquivos estáticos públicos
│   └── uploads/                 # Uploads de mídia (imagens/áudios)
│
├── src/
│   ├── app/                     # App Router (Next.js 15)
│   │   ├── api/                # API Routes (Backend)
│   │   │   ├── auth/          # Endpoints de autenticação
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── signup/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   ├── decks/         # CRUD de baralhos
│   │   │   │   ├── route.ts   # GET/POST
│   │   │   │   └── [id]/route.ts  # GET/PUT/DELETE
│   │   │   └── upload/route.ts
│   │   │
│   │   ├── baralhos/          # Páginas de baralhos
│   │   │   ├── page.tsx       # Lista de baralhos
│   │   │   ├── criar/page.tsx # Criar baralho
│   │   │   └── [id]/
│   │   │       ├── editar/page.tsx
│   │   │       └── estudar/page.tsx
│   │   │
│   │   ├── flashcards/        # Página de demonstração
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/             # Autenticação
│   │   │   └── page.tsx
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx         # Layout raiz (Sidebar)
│   │   ├── page.tsx           # Dashboard/Home
│   │   └── globals.css        # Estilos globais + animações
│   │
│   ├── components/            # Componentes reutilizáveis
│   │   ├── AudioPlayer.tsx    # Player de áudio customizado
│   │   ├── Flashcard.tsx      # Componente flashcard básico
│   │   ├── MediaFlashcard.tsx # Flashcard com mídia
│   │   └── Sidebar.tsx        # Navegação lateral
│   │
│   ├── lib/                   # Utilitários e helpers
│   │   ├── auth.ts            # Funções de autenticação JWT
│   │   └── db.ts              # Configuração do SQLite
│   │
│   ├── types/                 # Definições TypeScript
│   │   └── globals.d.ts       # Tipos globais
│   │
│   └── middleware.ts          # Middleware de autenticação
│
├── .github/
│   └── copilot-instructions.md
│
├── eslint.config.mjs          # Configuração ESLint
├── next.config.ts             # Configuração Next.js
├── postcss.config.mjs         # Configuração PostCSS
├── tailwind.config.ts         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
├── package.json               # Dependências
├── README.md                  # Documentação principal
├── GUIA_DE_USO.md            # Guia do usuário
└── EXEMPLOS.md               # Exemplos de código
```

---

## 🏛️ Arquitetura da Aplicação

### Padrão Arquitetural

O projeto segue a arquitetura **Next.js App Router** com:

- **Server Components** (padrão)
- **Client Components** (quando necessário)
- **API Routes** para backend

```
┌─────────────────────────────────────────┐
│           Cliente (Browser)             │
│  ┌───────────────────────────────────┐  │
│  │   React Components (Client)       │  │
│  │   - Flashcard, AudioPlayer, etc   │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │   Next.js Pages (App Router)      │  │
│  │   - page.tsx, layout.tsx          │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │ HTTP Requests
┌──────────────────▼───────────────────────┐
│        Next.js Server (Backend)          │
│  ┌───────────────────────────────────┐  │
│  │     Middleware (Auth Check)        │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │      API Routes (route.ts)         │  │
│  │   - /api/auth/*                    │  │
│  │   - /api/decks/*                   │  │
│  │   - /api/dashboard                 │  │
│  │   - /api/upload                    │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │    Business Logic (lib/)           │  │
│  │   - auth.ts, db.ts                 │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │   SQLite Database (better-sqlite3)│  │
│  │   - users, decks                   │  │
│  └───────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Rendering Strategy

- **Server Side Rendering (SSR)**: Páginas dinâmicas (dashboard, baralhos)
- **Static Site Generation (SSG)**: Páginas estáticas (/flashcards)
- **Client Side Rendering (CSR)**: Componentes interativos (Flashcard, AudioPlayer)

---

## 🗄️ Banco de Dados

### Schema SQLite

```sql
-- Tabela de usuários
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de baralhos (decks)
CREATE TABLE decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    cards TEXT NOT NULL,  -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_users_email ON users(email);
```

### Estrutura de Cards (JSON)

```typescript
type CardContent = {
  type: "text" | "image" | "audio";
  content: string;
  text?: string; // Texto adicional para mídia
};

type Card = {
  front: CardContent;
  back: CardContent;
};

type CardsJSON = Card[];
```

### Exemplo de Dados

```json
{
  "id": 1,
  "user_id": 1,
  "title": "Biologia - Células",
  "cards": [
    {
      "front": {
        "type": "text",
        "content": "O que é mitocôndria?"
      },
      "back": {
        "type": "text",
        "content": "Organela responsável pela respiração celular"
      }
    },
    {
      "front": {
        "type": "image",
        "content": "/uploads/nucleus.jpg",
        "text": "Que estrutura é esta?"
      },
      "back": {
        "type": "text",
        "content": "Núcleo"
      }
    }
  ],
  "created_at": "2025-11-04T10:00:00Z",
  "updated_at": "2025-11-04T15:30:00Z"
}
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /api/auth/signup ou /api/auth/login
       │    { email, password }
       ▼
┌──────────────┐
│  API Route   │
│  (route.ts)  │
└──────┬───────┘
       │ 2. Valida credenciais
       │ 3. Hash da senha (bcryptjs)
       ▼
┌──────────────┐
│   Database   │
│   (SQLite)   │
└──────┬───────┘
       │ 4. Retorna user data
       ▼
┌──────────────┐
│  auth.ts     │
│  signToken() │
└──────┬───────┘
       │ 5. Gera JWT token
       ▼
┌──────────────┐
│  Set Cookie  │
│  (HTTP-only) │
└──────┬───────┘
       │ 6. Retorna token ao cliente
       ▼
┌─────────────┐
│   Cliente   │
│  (logado)   │
└─────────────┘
```

### JWT Token Structure

```typescript
{
  userId: number;
  email: string;
  iat: number;  // Issued at
  exp: number;  // Expiration (24h)
}
```

### Middleware de Proteção

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Rotas públicas
  const publicPaths = ["/login", "/signup", "/api/auth"];

  // Se não tem token e tenta acessar rota protegida
  if (!token && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Valida o token
  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

---

## 🛣️ API Routes

### Autenticação

#### POST `/api/auth/signup`

```typescript
Request Body:
{
  name: string;
  email: string;
  password: string;
}

Response (200):
{
  message: "Conta criada com sucesso",
  user: { id, name, email }
}

Errors:
400 - Email já cadastrado
500 - Erro interno
```

#### POST `/api/auth/login`

```typescript
Request Body:
{
  email: string;
  password: string;
}

Response (200):
{
  message: "Login realizado com sucesso",
  user: { id, name, email }
}
+ Cookie: token=<jwt>

Errors:
400 - Credenciais inválidas
500 - Erro interno
```

#### POST `/api/auth/logout`

```typescript
Response (200):
{
  message: "Logout realizado com sucesso"
}
+ Cookie: token=deleted
```

### Dashboard

#### GET `/api/dashboard`

```typescript
Headers:
Cookie: token=<jwt>

Response (200):
{
  user: {
    name: string;
    email: string;
    accountAge: number;
  };
  stats: {
    totalDecks: number;
    totalCards: number;
    averageCardsPerDeck: number;
    largestDeck: {
      id: number;
      title: string;
      cardCount: number;
    } | null;
  };
  recentDecks: Deck[];
}
```

### Decks (Baralhos)

#### GET `/api/decks`

```typescript
Headers:
Cookie: token=<jwt>

Response (200):
Deck[]
```

#### POST `/api/decks`

```typescript
Headers:
Cookie: token=<jwt>

Request Body:
{
  title: string;
  cards: Card[];
}

Response (201):
{
  message: "Baralho criado com sucesso",
  deckId: number
}
```

#### GET `/api/decks/[id]`

```typescript
Response (200):
{
  id: number;
  title: string;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

Errors:
404 - Baralho não encontrado
403 - Não autorizado
```

#### PUT `/api/decks/[id]`

```typescript
Request Body:
{
  title?: string;
  cards?: Card[];
}

Response (200):
{
  message: "Baralho atualizado com sucesso"
}
```

#### DELETE `/api/decks/[id]`

```typescript
Response (200):
{
  message: "Baralho deletado com sucesso"
}
```

### Upload

#### POST `/api/upload`

```typescript
Content-Type: multipart/form-data

Request Body:
FormData {
  file: File
}

Response (200):
{
  url: string  // "/uploads/1699123456789-filename.jpg"
}

Errors:
400 - Nenhum arquivo enviado
400 - Tipo de arquivo não suportado
500 - Erro ao salvar arquivo
```

---

## 🔄 Fluxo de Dados

### Criação de Baralho

```
┌─────────────────┐
│ User (Browser)  │
└────────┬────────┘
         │ 1. Preenche formulário
         │    + Upload de arquivos
         ▼
┌─────────────────┐
│ /baralhos/criar │
│   (page.tsx)    │
└────────┬────────┘
         │ 2. POST /api/upload (por arquivo)
         ▼
┌─────────────────┐
│  /api/upload    │
│   (route.ts)    │
└────────┬────────┘
         │ 3. Salva em /public/uploads/
         │ 4. Retorna URL
         ▼
┌─────────────────┐
│ /baralhos/criar │
│   (atualiza)    │
└────────┬────────┘
         │ 5. POST /api/decks
         │    { title, cards }
         ▼
┌─────────────────┐
│   /api/decks    │
│   (route.ts)    │
└────────┬────────┘
         │ 6. Valida dados
         │ 7. INSERT INTO decks
         ▼
┌─────────────────┐
│   Database      │
└────────┬────────┘
         │ 8. Retorna deckId
         ▼
┌─────────────────┐
│ /baralhos       │
│ (redirecionado) │
└─────────────────┘
```

### Modo de Estudo

```
┌─────────────────┐
│ /baralhos/[id]/ │
│   estudar       │
└────────┬────────┘
         │ 1. GET /api/decks/[id]
         ▼
┌─────────────────┐
│  /api/decks/[id]│
└────────┬────────┘
         │ 2. SELECT deck + cards
         ▼
┌─────────────────┐
│   Database      │
└────────┬────────┘
         │ 3. Retorna deck data
         ▼
┌─────────────────┐
│ MediaFlashcard  │
│   (renderiza)   │
└────────┬────────┘
         │ 4. User interage
         │    - Vira card (Espaço)
         │    - Avalia dificuldade
         ▼
┌─────────────────┐
│ Estado Local    │
│ (currentIndex,  │
│  flipped, etc)  │
└─────────────────┘
```

---

## 🧩 Componentes

### Hierarquia de Componentes

```
app/layout.tsx
├── Sidebar
│   ├── Logo/Title
│   ├── Navigation Links
│   │   ├── Dashboard
│   │   ├── Baralhos
│   │   ├── Flashcards
│   │   └── Logout
│   └── User Info
│
└── children (páginas)
    ├── page.tsx (Dashboard)
    │   ├── Stats Cards
    │   └── Recent Decks List
    │
    ├── baralhos/page.tsx
    │   ├── Deck Card
    │   │   ├── Title
    │   │   ├── Stats
    │   │   └── Actions (Estudar, Editar, Deletar)
    │   └── Delete Modal
    │
    ├── baralhos/criar/page.tsx
    │   ├── Title Input
    │   ├── Card Creator
    │   │   ├── Type Selector
    │   │   ├── Content Input
    │   │   └── File Upload
    │   └── Preview
    │
    ├── baralhos/[id]/estudar/page.tsx
    │   ├── Progress Indicator
    │   ├── MediaFlashcard
    │   │   ├── Card Content (Front/Back)
    │   │   ├── Flip Button
    │   │   ├── Difficulty Buttons
    │   │   └── AudioPlayer (if audio)
    │   └── Navigation (Prev/Next)
    │
    └── flashcards/page.tsx
        └── Flashcard (demo)
            ├── Card Face
            ├── Flip Button
            └── Difficulty Buttons
```

### Componentes Reutilizáveis

#### Flashcard

- **Props**: front, back, initialFlipped, onFlipChange, showControls, labels
- **Estado**: flipped (boolean)
- **Eventos**: toggle(), keyboard shortcuts
- **Estilo**: Animação 3D flip

#### MediaFlashcard

- **Props**: front (CardContent), back (CardContent), ...
- **Lógica**: renderCardContent() - switch por tipo
- **Subcomponentes**: AudioPlayer, Image (Next.js)

#### AudioPlayer

- **Props**: src (string)
- **Estado**: playing, currentTime, duration
- **Controles**: play/pause, seek, volume

#### Sidebar

- **Props**: nenhum
- **Estado**: nenhum (server component)
- **Links**: Link do Next.js para navegação

---

## 🎨 Estilização

### Tailwind CSS

#### Paleta de Cores

```css
/* Primária - Blue/Purple */
bg-linear-to-br from-blue-500 to-purple-600

/* Secundária - Emerald/Teal */
bg-linear-to-br from-emerald-500 to-teal-600

/* Neutra - Zinc */
zinc-50, zinc-100, ..., zinc-900

/* Modo Escuro */
dark:bg-zinc-900
dark:text-zinc-50
```

#### Animações Customizadas

```css
/* globals.css */

/* Flip 3D do Flashcard */
.flashcard {
  perspective: 1000px;
}

.flashcard-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-face {
  backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}
```

### Responsividade

```tsx
// Mobile-first approach
<div className="
  px-4 md:px-6 lg:px-8          // Padding responsivo
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  // Grid
  text-sm md:text-base lg:text-lg  // Tamanho de texto
">
```

---

## ⚡ Performance

### Otimizações Implementadas

1. **Static Generation** para páginas estáticas

```tsx
export const dynamic = "force-static";
```

2. **Image Optimization** com Next.js Image

```tsx
<Image src={url} alt="..." fill className="object-contain" />
```

3. **Code Splitting** automático pelo Next.js

4. **Server Components** por padrão (menos JavaScript no cliente)

5. **SQLite** embutido (sem latência de rede)

### Métricas de Performance

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3s
- **Bundle Size**: ~200KB (gzipped)

---

## 🔒 Segurança

### Implementações de Segurança

1. **Senha hasheada com bcrypt** (10 rounds)

```typescript
const hash = await bcrypt.hash(password, 10);
```

2. **JWT com expiração** (24 horas)

```typescript
jwt.sign(payload, SECRET, { expiresIn: "24h" });
```

3. **HTTP-only cookies** (não acessível via JavaScript)

```typescript
response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict"
});
```

4. **Middleware de autenticação** em todas as rotas protegidas

5. **Validação de entrada** em todas as APIs

6. **SQL Injection Prevention** (prepared statements do better-sqlite3)

7. **File upload validation**

```typescript
const allowedTypes = ["image/jpeg", "image/png", "audio/mpeg"];
if (!allowedTypes.includes(file.type)) {
  return error;
}
```

### Vulnerabilidades Conhecidas

⚠️ **Para Produção, Resolver**:

- JWT secret hardcoded (usar variável de ambiente)
- SQLite não é ideal para produção (considerar PostgreSQL)
- Sem rate limiting nas APIs
- Sem sanitização de HTML em cards
- Sem validação de tamanho de arquivo no backend
- Uploads não são verificados por malware

---

## 🚀 Deploy

### Requisitos de Produção

1. **Variáveis de Ambiente**

```env
JWT_SECRET=<secret-forte-e-aleatório>
NODE_ENV=production
```

2. **Banco de Dados**

- Para produção, migrar de SQLite para PostgreSQL ou MySQL
- Configurar backups automáticos

3. **File Storage**

- Usar S3, Cloudinary ou similar para uploads
- Não usar /public/uploads/ em produção

4. **HTTPS**

- Obrigatório para cookies seguros

5. **CDN**

- Usar CDN para assets estáticos

### Checklist de Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Migrar para banco de dados produção
- [ ] Configurar storage externo para uploads
- [ ] Habilitar HTTPS
- [ ] Configurar domínio customizado
- [ ] Setup de backups
- [ ] Monitoring e logs
- [ ] Rate limiting
- [ ] Sanitização de inputs
- [ ] Testes end-to-end

---

**Última atualização**: 04 de novembro de 2025

**Versão**: 1.0.0

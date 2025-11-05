# Copilot Instructions - MVP Estetoscópio

## 📋 Project Overview

**Name**: MVP Estetoscópio
**Version**: v1.1.0
**Type**: Next.js 15 Educational Platform
**Description**: Sistema de flashcards com repetição espaçada (estilo Anki)

---

## 🏗️ Project Structure

### Framework & Language
- **Framework**: Next.js 15 (App Router) - Use ONLY App Router, not Pages Router
- **Language**: TypeScript 5 - Always use strict typing, no `any`
- **React**: Version 19.2 - Use modern hooks and patterns
- **Node**: 18+ required

### Styling & UI
- **CSS Framework**: Tailwind CSS 4 - Use utility classes, no CSS modules
- **Icons**: Lucide React - Consistent icon library
- **Typography**: Tailwind Typography for prose content
- **Theme**: Support for dark mode with `dark:` variants

### Backend & Database
- **API**: Next.js API Routes (serverless architecture)
- **Database**: Better-SQLite3 (synchronous, embedded)
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs with 10 rounds

### Documentation
- **Markdown**: Standard .md files in root
- **MDX**: Interactive documentation in `/docs` folder
- **Components**: Custom MDX components (Callout, Card, Step, CodeBlock)

### Code Quality
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm (use `npm install`, not yarn/pnpm)
- **Git**: Conventional Commits format

---

## 📁 Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── dashboard/      # Dashboard data
│   │   ├── decks/          # Deck CRUD
│   │   ├── profile/        # User profile
│   │   └── upload/         # File uploads
│   ├── baralhos/           # Deck pages
│   ├── docs/               # Documentation pages (MDX)
│   ├── flashcards/         # Flashcard demo
│   ├── login/              # Login page
│   ├── perfil/             # Profile page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home/Dashboard
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── AudioPlayer.tsx
│   ├── Flashcard.tsx
│   ├── MediaFlashcard.tsx
│   ├── MarkdownRenderer.tsx
│   └── Sidebar.tsx
├── lib/                     # Utilities
│   ├── auth.ts             # Auth functions
│   ├── db.ts               # Database config
│   └── spaced-repetition.ts # Learning algorithm
└── types/                   # TypeScript types
    └── globals.d.ts
```

---

## 🎯 Key Features

### 1. Authentication System
- JWT-based authentication with HTTP-only cookies
- User registration with validation
- Protected routes via middleware
- Secure password hashing

### 2. Flashcard System
- Three content types: text, image, audio
- 3D flip animation
- Keyboard shortcuts (Space/Enter to flip)
- Anki-style difficulty buttons (Again, Hard, Good, Easy)

### 3. Deck Management
- Create, read, update, delete operations
- Statistics per deck
- Study mode with progress tracking
- File upload for media (images, audio)

### 4. Spaced Repetition
- Algorithm in `lib/spaced-repetition.ts`
- Tracks review history per card
- Calculates next review dates
- API endpoint: `/api/decks/[id]/progress`

### 5. Documentation (MDX)
- 8 interactive documentation pages
- Custom components: Callout, Card, Step, CodeBlock
- Breadcrumb navigation
- Dark mode support

---

## 💻 Coding Guidelines

### TypeScript
```typescript
// ✅ DO: Always type everything
interface ComponentProps {
  title: string;
  count: number;
}

export default function Component({ title, count }: ComponentProps) {
  // implementation
}

// ❌ DON'T: Use 'any'
function badFunction(data: any) { } // NEVER do this
```

### React Components
```tsx
// ✅ DO: Use "use client" only when needed
"use client";

import { useState } from "react";

interface Props {
  initialValue: string;
}

export default function MyComponent({ initialValue }: Props) {
  const [value, setValue] = useState<string>(initialValue);

  return <div>{value}</div>;
}
```

### API Routes
```typescript
// ✅ DO: Proper error handling
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Logic here
    return NextResponse.json({ data: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Tailwind CSS
```tsx
// ✅ DO: Use Tailwind utility classes
<div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
  <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
    Title
  </h1>
</div>

// ❌ DON'T: Use inline styles or CSS modules
<div style={{ minHeight: "100vh" }}> // AVOID
```

### Naming Conventions
- **Components**: PascalCase (`AudioPlayer.tsx`)
- **Utilities**: camelCase (`auth.ts`, `spaced-repetition.ts`)
- **Types/Interfaces**: PascalCase (`UserData`, `CardContent`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **API Routes**: kebab-case folders (`/api/auth/login`)

---

## 🔒 Security Best Practices

1. **Authentication**: Always verify JWT tokens in protected routes
2. **Passwords**: Use bcryptjs with salt rounds = 10
3. **Cookies**: HTTP-only, secure in production
4. **Input Validation**: Validate all user input on the server
5. **SQL Injection**: Use prepared statements (SQLite)
6. **XSS Prevention**: Sanitize HTML content

---

## 📦 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Decks Table
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

### Card Structure (JSON)
```typescript
interface Card {
  id: string;
  front: CardContent;
  back: CardContent;
  progress?: {
    reviews: number;
    lastReview: string;
    nextReview: string;
    difficulty: 'again' | 'hard' | 'good' | 'easy';
  };
}

interface CardContent {
  type: 'text' | 'image' | 'audio';
  content: string;
  text?: string;
}
```

---

## 🎨 UI/UX Guidelines

### Color Palette
- **Primary**: Blue/Purple gradient (`from-blue-500 to-purple-600`)
- **Secondary**: Emerald/Teal (`from-emerald-500 to-teal-600`)
- **Neutral**: Zinc scale (zinc-50 to zinc-900)
- **Danger**: Red (red-500, red-600)
- **Success**: Green (green-500, green-600)

### Spacing
- Use Tailwind spacing scale: `p-4`, `m-6`, `gap-8`
- Consistent padding: `px-6 py-4` for containers
- Margins between sections: `mb-8` or `space-y-8`

### Typography
- Headings: `text-4xl font-bold` (h1), `text-2xl font-semibold` (h2)
- Body: `text-base` (default)
- Small text: `text-sm text-zinc-600 dark:text-zinc-400`

### Animations
- Transitions: `transition-colors`, `transition-transform`
- Hover states: `hover:bg-zinc-100 dark:hover:bg-zinc-800`
- Focus: `focus-visible:ring-2 focus-visible:ring-blue-500`

---

## 🔄 Git Workflow

### Commit Messages (Conventional Commits)
```bash
# Format: <type>(<scope>): <subject>

feat(docs): add MDX documentation system
fix(auth): correct token expiration handling
docs(readme): update installation instructions
refactor(components): simplify Flashcard logic
perf(db): optimize deck queries
test(api): add tests for auth endpoints
chore(deps): update dependencies
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

---

## 📚 Documentation Guidelines

### When Creating New Features
1. **Code**: Implement with proper TypeScript types
2. **Tests**: Add unit tests (if applicable)
3. **Docs**: Update relevant documentation:
   - `README.md` - Add to features section
   - `EXEMPLOS.md` - Add usage examples
   - `docs/*.mdx` - Update MDX documentation
   - `CHANGELOG.md` - Add to [Unreleased] section

### MDX Components
Use these custom components in documentation:

```mdx
<Callout type="info" title="Important">
This is an information callout.
</Callout>

<Card title="Example">
Card content here.
</Card>

<Step number={1} title="First Step">
Step instructions here.
</Step>
```

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" error
**Solution**: Check import paths use `@/` alias for `src/` directory

### Issue: SQLite database locked
**Solution**: Ensure you're not running multiple dev servers

### Issue: JWT token expired
**Solution**: Check token expiration time in `lib/auth.ts`

### Issue: Tailwind classes not working
**Solution**: Restart dev server, check `tailwind.config.ts`

### Issue: MDX not rendering
**Solution**: Check `next.config.ts` has MDX configuration

---

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint -- --fix    # Auto-fix lint issues

# Git
git status               # Check current changes
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push origin main     # Push to remote
```

---

## 📊 Current Status

### Version: v1.1.0 (Released: 2025-11-05)

### Progress Tracking
- [x] Verificar requisitos do projeto
- [x] Configurar estrutura do projeto Next.js
- [x] Instalar dependências
- [x] Sistema de autenticação completo
- [x] CRUD de baralhos e flashcards
- [x] Sistema de repetição espaçada
- [x] Upload de mídia (imagens e áudio)
- [x] Dashboard com estatísticas
- [x] Documentação MDX interativa
- [x] Documentação Markdown completa
- [x] Sistema de versionamento (Semantic Versioning)
- [x] Agentes de IA (Release Manager, etc)

### Next Steps (v1.2.0)
- [ ] Sistema de repetição espaçada aprimorado (SM-2 algorithm)
- [ ] Estatísticas avançadas com gráficos
- [ ] Página de perfil completa com edição
- [ ] Sistema de recuperação de senha

---

## 🤖 AI Agent Integration

This project uses AI agents for automation:

### Release Manager Agent
- Automates versioning and changelog
- Updates all .md and .mdx documentation
- Creates release notes
- Manages git tags

**See**: `/AGENTS.md` for complete documentation

### How to Use
```
Read /CLAUDE.md first, then use the Release Manager Agent
to prepare the next release following the complete workflow.
```

---

## 📖 Additional Resources

- **[CLAUDE.md](../CLAUDE.md)** - Complete project context for AI
- **[AGENTS.md](../AGENTS.md)** - AI agents documentation
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history
- **[README.md](../README.md)** - Project overview
- **[ARQUITETURA.md](../ARQUITETURA.md)** - Technical architecture

---

## ✅ Code Review Checklist

Before committing, ensure:
- [ ] TypeScript types are complete (no `any`)
- [ ] ESLint shows no errors
- [ ] Component is properly tested
- [ ] Documentation is updated
- [ ] Commit follows Conventional Commits
- [ ] Dark mode is supported (if UI change)
- [ ] Mobile responsive (if UI change)
- [ ] Accessibility (ARIA labels, keyboard nav)

---

**Last Updated**: 2025-11-05
**Project Version**: v1.1.0
**Document Version**: 2.0.0

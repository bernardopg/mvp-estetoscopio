# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MVP Estetoscópio** is a flashcard learning platform with spaced repetition (Anki-style) built with Next.js 16, TypeScript, and SQLite. Users create decks with text, image, or audio cards, and study them using the SM-2 spaced repetition algorithm.

**Current Version**: v1.1.0
**Framework**: Next.js 16 (App Router only)
**Language**: TypeScript 5 (strict mode, no `any`)
**Database**: Better-SQLite3 (synchronous, embedded)

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run docs:check       # Check documentation links

# Database location
# ./mvp-estetoscopio.db in project root
```

## Core Architecture

### Key System Components

1. **Authentication System** (`src/lib/auth.ts`)
   - JWT-based with HTTP-only cookies (7-day expiration)
   - Token payload: `{ id, name, email, profile_picture }`
   - Password hashing: bcryptjs (10 rounds)
   - Middleware: `src/proxy.ts` protects all routes except `/login`, `/signup`, and API routes

2. **Database Schema** (`src/lib/db.ts`)
   - Tables: users, decks, folders, tags, deck_tags, deck_progress, card_reviews, study_sessions, media, password_reset_tokens
   - Decks store cards as JSON strings in `cards` column
   - All prepared statements exported from `statements` object
   - Automatic migrations run on startup (see `migrateDecksTable()`)
   - Important: Decks have optional `folder_id`, `color`, `icon`, `is_bookmarked` columns

3. **Spaced Repetition** (`src/lib/spaced-repetition.ts`)
   - SM-2 algorithm implementation
   - Difficulty levels: "again" (0), "hard" (2), "good" (4), "easy" (5)
   - Tracks: easeFactor (≥1.3), interval (days), repetitions, nextReviewDate
   - Card reviews stored in `card_reviews` table

4. **Card Structure**
   ```typescript
   {
     front: { type: "text" | "image" | "audio", content: string, text?: string },
     back: { type: "text" | "image" | "audio", content: string, text?: string }
   }
   ```

### Critical API Endpoints

- **Auth**: `/api/auth/{login,signup,logout,forgot-password,reset-password}`
- **Decks**: `/api/decks` (GET/POST), `/api/decks/[id]` (GET/PUT/DELETE)
- **Reviews**: `/api/decks/[id]/review` (POST) - submits card review with SM-2 calculation
- **Progress**: `/api/decks/[id]/progress` (GET/POST) - tracks deck completion
- **Folders/Tags**: `/api/folders`, `/api/tags` - organization features
- **Upload**: `/api/upload` - handles media files to `public/uploads/`
- **Dashboard**: `/api/dashboard` - user stats and recent decks
- **Profile**: `/api/profile`, `/api/profile/stats`, `/api/profile/avatar`

### File Organization

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes (all protected except auth)
│   ├── baralhos/            # Deck management pages
│   │   ├── criar/          # Create deck
│   │   ├── [id]/editar/    # Edit deck
│   │   └── [id]/estudar/   # Study mode
│   ├── docs/               # MDX documentation pages
│   ├── login/, signup/     # Auth pages
│   ├── perfil/             # User profile
│   └── page.tsx            # Dashboard
├── components/
│   ├── Flashcard.tsx        # Basic flashcard with 3D flip
│   ├── MediaFlashcard.tsx   # Supports text/image/audio
│   ├── AudioPlayer.tsx      # Custom audio controls
│   ├── MarkdownRenderer.tsx # MDX/Markdown display
│   └── Sidebar.tsx          # Navigation
├── lib/
│   ├── auth.ts              # JWT utilities
│   ├── db.ts                # SQLite setup + prepared statements
│   └── spaced-repetition.ts # SM-2 algorithm
├── types/
│   └── globals.d.ts
└── proxy.ts                 # Auth middleware (NOT middleware.ts!)
```

## Important Implementation Details

### Authentication Flow

1. Login/signup sets `auth_token` HTTP-only cookie with JWT
2. Middleware (`src/proxy.ts`) checks cookie on protected routes
3. API routes use `getAuthUser()` to verify token and get user info
4. Always call `getAuthUser()` at the start of protected API routes

### Database Prepared Statements

Always use the exported `statements` object from `src/lib/db.ts`:

```typescript
import db, { statements } from "@/lib/db";

// Example: Get user's decks
const decks = statements.getDecks.all(userId);

// Example: Create deck
const result = statements.createDeck.run(userId, title, cardsJSON, null);
const deckId = result.lastInsertRowid;
```

### Working with Cards

- Cards are stored as JSON string in `decks.cards` column
- Parse with `JSON.parse(deck.cards)` when reading
- Stringify with `JSON.stringify(cards)` when writing
- Card reviews are separate records in `card_reviews` table
- Use `processCardReview()` from spaced-repetition.ts to calculate next review

### Folder and Tag System

- Decks can belong to one folder (`folder_id`)
- Decks can have multiple tags (many-to-many via `deck_tags`)
- Use prepared statements: `getFolders`, `getTags`, `getDeckTags`, `addTagToDeck`, etc.
- When creating/editing decks, handle folders and tags separately after deck creation

### Media Uploads

- Files saved to `public/uploads/{timestamp}-{filename}`
- Return URL as `/uploads/{timestamp}-{filename}`
- Client-side uses this URL in card content
- Allowed types: images (jpeg, png, gif), audio (mp3, wav, ogg)

## Coding Standards

### TypeScript
- No `any` types - always provide proper types
- Use interfaces for component props and data structures
- Import types: `import type { NextRequest } from "next/server"`

### React Components
- Use `"use client"` directive only when needed (state, events, browser APIs)
- Default to Server Components
- Props interface named `{ComponentName}Props`

### API Routes
- Always return `NextResponse.json()`
- Error handling pattern:
  ```typescript
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ... logic
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  ```

### Tailwind CSS
- Use utility classes, no inline styles or CSS modules
- Dark mode: `dark:` variants
- Gradients: `bg-gradient-to-br from-blue-500 to-purple-600`
- Responsive: mobile-first with `md:`, `lg:` prefixes

### Git Commits
Follow Conventional Commits:
```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
refactor(scope): refactor code
```

## Testing Changes

When modifying features:

1. **Auth changes**: Test login/logout flow, check cookie behavior
2. **Deck CRUD**: Verify all CRUD operations and card JSON parsing
3. **Study mode**: Test card flipping, review submission, SM-2 calculations
4. **Database**: Check prepared statements still work after schema changes
5. **UI**: Test both light and dark modes, mobile responsiveness

## Common Pitfalls

1. **Don't** use `middleware.ts` - auth middleware is in `src/proxy.ts`
2. **Don't** forget to parse `deck.cards` JSON when reading from DB
3. **Don't** use `any` type - TypeScript strict mode is enabled
4. **Don't** create CSS modules - use Tailwind utilities only
5. **Remember** to handle folder_id and tags when creating/updating decks
6. **Remember** card reviews are separate from deck data
7. **Remember** to check auth with `getAuthUser()` in API routes

## Documentation Files

- `README.md` - User-facing documentation
- `.github/copilot-instructions.md` - Detailed project context
- `docs/developer/architecture.md` - Technical architecture
- `docs/developer/api-reference.md` - API documentation
- `CHANGELOG.md` - Version history

## Project-Specific Notes

- JWT secret is in `src/lib/auth.ts` (should use env var in production)
- SQLite DB file: `mvp-estetoscopio.db` in project root
- Media files: `public/uploads/` directory
- MDX documentation uses custom components (Callout, Card, Step, CodeBlock)
- Spaced repetition quality mapping: again=0, hard=2, good=4, easy=5
- Database includes study statistics: study_sessions table tracks daily study metrics

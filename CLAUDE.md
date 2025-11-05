# 🤖 Guia Claude AI - MVP Estetoscópio

Este documento fornece contexto completo sobre o projeto para assistentes de IA (Claude, GPT, etc).

---

## 📋 Visão Geral do Projeto

### Nome
**MVP Estetoscópio** - Sistema de flashcards com repetição espaçada

### Propósito
Plataforma de estudos inspirada no Anki para criar e estudar flashcards com suporte a múltiplos tipos de mídia (texto, imagem, áudio).

### Versão Atual
**v1.1.0** (05 de novembro de 2025)

---

## 🏗️ Arquitetura

### Stack Tecnológica

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript 5
- **UI Library**: React 19.2
- **Estilização**: Tailwind CSS 4
- **Ícones**: Lucide React
- **Documentação**: MDX com componentes customizados

#### Backend
- **API**: Next.js API Routes (serverless)
- **Banco de Dados**: Better-SQLite3 (embutido)
- **Autenticação**: JWT (jsonwebtoken)
- **Hash de Senhas**: bcryptjs

#### DevOps
- **Linting**: ESLint
- **Versionamento**: Git + Semantic Versioning
- **Commits**: Conventional Commits
- **Package Manager**: npm

### Estrutura de Pastas

```
mvp-estetoscopio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Rotas da API
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── decks/        # CRUD de baralhos
│   │   │   ├── profile/      # Perfil
│   │   │   └── upload/       # Upload de mídia
│   │   ├── baralhos/         # Páginas de baralhos
│   │   ├── docs/             # Documentação MDX
│   │   ├── flashcards/       # Demo
│   │   ├── login/            # Login
│   │   ├── perfil/           # Perfil
│   │   ├── signup/           # Registro
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Home/Dashboard
│   │   └── globals.css       # Estilos globais
│   ├── components/           # Componentes React
│   │   ├── AudioPlayer.tsx
│   │   ├── Flashcard.tsx
│   │   ├── MediaFlashcard.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── Sidebar.tsx
│   ├── lib/                  # Utilitários
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── spaced-repetition.ts
│   └── types/                # Tipos TypeScript
├── docs/                     # Arquivos MDX
│   ├── components/           # Componentes MDX customizados
│   └── *.mdx                 # Páginas de documentação
├── public/
│   └── uploads/              # Mídia enviada
└── [config files]
```

---

## 🎯 Funcionalidades Principais

### 1. Sistema de Autenticação
- Registro de usuários com validação
- Login com JWT (cookies HTTP-only)
- Proteção de rotas via middleware
- Logout com limpeza de sessão

### 2. Gestão de Baralhos
- Criar baralhos com múltiplos cards
- Editar baralhos existentes
- Excluir baralhos
- Visualizar estatísticas

### 3. Flashcards
- **Tipos de conteúdo**:
  - Texto (com HTML)
  - Imagem (JPEG, PNG, GIF)
  - Áudio (MP3, WAV, OGG)
- **Interação**:
  - Animação 3D ao virar
  - Atalhos de teclado (Espaço/Enter)
  - Botões de avaliação (Novamente, Difícil, Bom, Fácil)

### 4. Sistema de Repetição Espaçada
- Algoritmo baseado em dificuldade
- Tracking de revisões
- Cálculo de intervalos

### 5. Dashboard
- Estatísticas gerais:
  - Total de baralhos
  - Total de cards
  - Média de cards por baralho
  - Maior baralho
- Baralhos recentes
- Ações rápidas

### 6. Documentação Interativa (MDX)
- 8 páginas de documentação
- Componentes customizados:
  - `<Callout>`: Avisos (info, warning, success, error)
  - `<Card>`: Organização de conteúdo
  - `<Step>`: Tutoriais passo a passo
  - `<CodeBlock>`: Blocos de código
- Breadcrumbs e navegação
- Suporte a modo escuro

---

## 📊 Banco de Dados

### Schema SQLite

#### Tabela: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: decks
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

### Estrutura de Card (JSON)

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
  content: string;  // Texto, URL da imagem, ou URL do áudio
  text?: string;    // Texto adicional para imagem/áudio
}
```

---

## 🔌 API Endpoints

### Autenticação

#### POST `/api/auth/signup`
Cria nova conta.
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### POST `/api/auth/login`
Faz login.
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST `/api/auth/logout`
Faz logout.

### Dashboard

#### GET `/api/dashboard`
Retorna estatísticas do usuário.

### Baralhos

#### GET `/api/decks`
Lista todos os baralhos do usuário.

#### POST `/api/decks`
Cria novo baralho.
```json
{
  "title": "string",
  "cards": Card[]
}
```

#### GET `/api/decks/[id]`
Retorna baralho específico.

#### PUT `/api/decks/[id]`
Atualiza baralho.

#### DELETE `/api/decks/[id]`
Remove baralho.

#### POST `/api/decks/[id]/progress`
Atualiza progresso de um card.

### Profile

#### GET `/api/profile`
Retorna dados do perfil.

### Upload

#### POST `/api/upload`
Faz upload de arquivo.
```
FormData: { file: File }
```

---

## 🎨 Componentes React

### Flashcard
Componente básico de flashcard.

**Props:**
```typescript
interface FlashcardProps {
  front: ReactNode;
  back: ReactNode;
  initialFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  showControls?: boolean;
  labels?: {
    flip: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
}
```

### MediaFlashcard
Flashcard com suporte a mídia.

**Props:**
```typescript
interface MediaFlashcardProps {
  front: CardContent;
  back: CardContent;
  onEvaluate?: (difficulty: string) => void;
}
```

### AudioPlayer
Player de áudio customizado.

**Props:**
```typescript
interface AudioPlayerProps {
  src: string;
}
```

### MarkdownRenderer
Renderizador de Markdown.

**Props:**
```typescript
interface MarkdownRendererProps {
  content: string;
  title?: string;
}
```

### Sidebar
Barra lateral de navegação.

---

## 📝 Padrões de Código

### Nomenclatura

- **Componentes**: PascalCase (`AudioPlayer.tsx`)
- **Utilitários**: camelCase (`auth.ts`)
- **Tipos**: PascalCase com prefixo (`UserData`, `CardContent`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Estrutura de Componente

```tsx
"use client"; // Se necessário

import { useState } from "react";
import { Icon } from "lucide-react";

interface ComponentProps {
  prop: string;
}

export default function Component({ prop }: ComponentProps) {
  const [state, setState] = useState<string>("");

  const handleAction = () => {
    // Lógica
  };

  return (
    <div className="classe-tailwind">
      {/* JSX */}
    </div>
  );
}
```

### Estrutura de API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Lógica
    const db = getDb();
    const data = db.prepare("SELECT ...").all();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

1. **Senhas**: Hash com bcryptjs (10 rounds)
2. **JWT**: Tokens assinados com secret
3. **Cookies**: HTTP-only, secure em produção
4. **Middleware**: Proteção de rotas autenticadas
5. **Validação**: Entrada validada em todas as APIs
6. **CORS**: Configurado para origem específica

### Variáveis de Ambiente

```env
JWT_SECRET=seu-secret-aqui
NODE_ENV=development|production
```

---

## 🎯 Versionamento

### Semantic Versioning

O projeto segue **Semantic Versioning 2.0.0**:

- **MAJOR.MINOR.PATCH** (ex: 1.1.0)
- **MAJOR**: Breaking changes
- **MINOR**: Novas features (compatível)
- **PATCH**: Bug fixes (compatível)

### Conventional Commits

Formato: `<type>(<scope>): <subject>`

**Types:**
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção
- `ci`: CI/CD
- `build`: Build system

**Exemplos:**
```
feat(docs): add MDX documentation system
fix(auth): correct token expiration
docs(readme): update installation guide
chore(release): bump version to 1.1.0
```

---

## 📚 Documentação

### Arquivos Principais

1. **README.md**: Visão geral e quick start
2. **CHANGELOG.md**: Histórico de versões
3. **GUIA_DE_USO.md**: Guia completo do usuário
4. **EXEMPLOS.md**: Exemplos de código
5. **ARQUITETURA.md**: Documentação técnica
6. **FAQ.md**: Perguntas frequentes
7. **REFERENCIA.md**: Referência técnica
8. **AGENTS.md**: Agentes de automação
9. **CLAUDE.md**: Este arquivo

### Documentação MDX

Localização: `/docs/*.mdx`

- `index.mdx`: Índice principal
- `guia.mdx`: Guia do usuário
- `api.mdx`: Documentação da API
- `arquitetura.mdx`: Arquitetura
- `exemplos.mdx`: Exemplos
- `faq.mdx`: FAQ
- `changelog.mdx`: Changelog
- `referencia.mdx`: Referência

---

## 🤖 Trabalhando com IA

### Contexto Importante

Ao trabalhar neste projeto, sempre considere:

1. **Versão atual**: v1.1.0
2. **Framework**: Next.js 15 (App Router, não Pages Router)
3. **TypeScript**: Sempre tipado, sem `any`
4. **Estilização**: Tailwind CSS (não CSS modules)
5. **Banco**: SQLite (síncrono, não async)
6. **Docs**: Manter .md e .mdx sincronizados

### Perguntas Frequentes para IA

#### "Como adicionar uma nova feature?"

1. Implementar código em `src/`
2. Adicionar tipos em `src/types/`
3. Criar testes (se aplicável)
4. Atualizar documentação:
   - README.md (seção relevante)
   - EXEMPLOS.md (adicionar exemplo)
   - docs/*.mdx (sincronizar)
5. Atualizar CHANGELOG.md (seção [Unreleased])

#### "Como criar uma nova página?"

```tsx
// src/app/nova-pagina/page.tsx
export default function NovaPagina() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Conteúdo */}
    </div>
  );
}
```

#### "Como criar uma nova API?"

```typescript
// src/app/api/nova-rota/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Lógica
    return NextResponse.json({ data: "..." });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro" },
      { status: 500 }
    );
  }
}
```

#### "Como adicionar um novo componente?"

```tsx
// src/components/NovoComponente.tsx
"use client";

interface NovoComponenteProps {
  prop: string;
}

export default function NovoComponente({ prop }: NovoComponenteProps) {
  return <div>{prop}</div>;
}
```

Depois, documentar em:
- EXEMPLOS.md
- docs/exemplos.mdx
- README.md (seção Componentes)

#### "Como preparar um release?"

Use o **Release Manager Agent** (veja AGENTS.md):

1. Analisar commits desde última release
2. Determinar versão (MAJOR.MINOR.PATCH)
3. Atualizar todos os .md
4. Sincronizar .mdx
5. Criar RELEASE_NOTES_vX.Y.Z.md
6. Atualizar package.json
7. Commit + tag + push
8. Criar release no GitHub

---

## 🚀 Roadmap

### v1.2.0 (Próxima)
- Sistema de repetição espaçada aprimorado (algoritmo SM-2)
- Estatísticas avançadas com gráficos
- Página de perfil completa
- Sistema de recuperação de senha

### v2.0.0
- Migração para PostgreSQL
- Sistema de cache com Redis
- Exportação/importação de baralhos
- Compartilhamento entre usuários
- Tags e categorias

### v3.0.0
- App mobile (React Native)
- PWA com offline sync
- Internacionalização (i18n)
- Editor WYSIWYG
- Suporte a LaTeX

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Linting
npm run lint

# Criar nova branch de feature
git checkout -b feature/nome-da-feature

# Commit seguindo Conventional Commits
git commit -m "feat(scope): descrição"

# Criar tag de versão
git tag -a v1.2.0 -m "Release v1.2.0"

# Push com tags
git push origin main --tags
```

---

## 📊 Métricas Atuais (v1.1.0)

- **Componentes**: 5
- **Páginas**: 15 (8 de documentação)
- **API Endpoints**: 11
- **Linhas de Código**: ~4.500
- **Arquivos Markdown**: 9
- **Arquivos MDX**: 8
- **Dependências**: 21

---

## 🎓 Boas Práticas

### Para Desenvolvedores

1. **Sempre tipar**: Use TypeScript adequadamente
2. **Componentizar**: Componentes pequenos e reutilizáveis
3. **Documentar**: JSDoc em funções públicas
4. **Testar**: Escrever testes para código crítico
5. **Acessibilidade**: ARIA labels, keyboard navigation
6. **Performance**: Memoização, lazy loading
7. **Segurança**: Validar entrada, escapar saída

### Para IA

1. **Entender contexto**: Ler este arquivo primeiro
2. **Seguir padrões**: Usar convenções estabelecidas
3. **Atualizar docs**: Sempre sincronizar .md e .mdx
4. **Validar código**: Verificar TypeScript e ESLint
5. **Pensar em versões**: Considerar breaking changes
6. **Ser consistente**: Manter estilo do projeto

---

## 📞 Suporte

### Links Úteis

- **Repositório**: https://github.com/bernardopg/mvp-estetoscopio
- **Issues**: https://github.com/bernardopg/mvp-estetoscopio/issues
- **Documentação**: `/docs`

### Reportar Problemas

Ao encontrar bugs ou problemas:

1. Verificar se já existe issue
2. Criar nova issue com:
   - Descrição clara
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, OS)

---

## 🏆 Contribuindo

Veja AGENTS.md para guias de automação e workflows.

---

**Versão do Documento**: 1.0.0  
**Última Atualização**: 05/11/2025  
**Mantido por**: @bernardopg

---

## 💡 Dicas para Claude/GPT

Ao trabalhar neste projeto:

1. ✅ **SEMPRE** leia este arquivo primeiro
2. ✅ **SEMPRE** verifique a versão atual
3. ✅ **SEMPRE** use TypeScript tipado
4. ✅ **SEMPRE** atualize documentação
5. ✅ **SEMPRE** sincronize .md e .mdx
6. ✅ **SEMPRE** siga Conventional Commits
7. ✅ **SEMPRE** considere breaking changes
8. ✅ **SEMPRE** teste antes de commitar

❌ **NUNCA** use `any` em TypeScript  
❌ **NUNCA** esqueça de atualizar CHANGELOG  
❌ **NUNCA** quebre a API sem documentar  
❌ **NUNCA** faça commit sem mensagem clara  
❌ **NUNCA** ignore ESLint errors

---

**Este documento é a fonte única de verdade sobre o projeto.**  
**Mantenha-o atualizado sempre que houver mudanças significativas.**

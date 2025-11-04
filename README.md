# 🎓 MVP Estetoscópio

> Sistema de flashcards estilo Anki para estudos com repetição espaçada

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[README.md](README.md)** | Visão geral, instalação e configuração |
| **[GUIA_DE_USO.md](GUIA_DE_USO.md)** | Guia completo para usuários finais |
| **[EXEMPLOS.md](EXEMPLOS.md)** | Exemplos de código e uso dos componentes |
| **[ARQUITETURA.md](ARQUITETURA.md)** | Documentação técnica e arquitetura do sistema |
| **[FAQ.md](FAQ.md)** | Perguntas frequentes e resolução de problemas |
| **[CHANGELOG.md](CHANGELOG.md)** | Histórico de versões e mudanças |

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Início Rápido](#início-rápido)
- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API](#api)
- [Componentes](#componentes)
- [Documentação Completa](#documentação-completa)

---

## ⚡ Início Rápido

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd mvp-estetoscopio

# Instale as dependências
npm install

# Inicie o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e comece a usar!

**Primeira vez?**

1. Crie sua conta em `/signup`
2. Faça login em `/login`
3. Crie seu primeiro baralho em `/baralhos/criar`
4. Comece a estudar!

---

O **MVP Estetoscópio** é uma plataforma de estudos baseada em flashcards que utiliza o conceito de repetição espaçada (similar ao Anki). O sistema permite criar baralhos personalizados com diferentes tipos de conteúdo: texto, imagens e áudio.

### Características Principais

✨ **Sistema de Flashcards**

- Flashcards viráveis com animação 3D
- Suporte a múltiplos tipos de conteúdo (texto, imagem, áudio)
- Atalhos de teclado (Espaço/Enter para virar)
- Botões de avaliação estilo Anki (Novamente, Difícil, Bom, Fácil)

📚 **Gestão de Baralhos**

- Criar, editar e excluir baralhos
- Visualizar estatísticas de cada baralho
- Modo de estudo dedicado
- Upload de mídia (imagens e áudios)

📊 **Dashboard Inteligente**

- Estatísticas gerais de estudo
- Baralhos recentes
- Progresso de aprendizado
- Informações do usuário

🔐 **Sistema de Autenticação**

- Registro de usuários
- Login seguro com JWT
- Proteção de rotas
- Gerenciamento de sessão

## 🛠 Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Banco de Dados**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **Autenticação**: JWT com bcryptjs
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Linting**: ESLint

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun

### Passos

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd mvp-estetoscopio
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria a build de produção
npm start        # Inicia o servidor de produção
npm run lint     # Executa o linter
```

## 🚀 Como Usar

### 1. Criar uma Conta

Acesse `/signup` e crie sua conta fornecendo:

- Nome
- Email
- Senha

### 2. Fazer Login

Acesse `/login` com suas credenciais.

### 3. Criar um Baralho

1. No Dashboard, clique em "Novo Baralho" ou acesse `/baralhos/criar`
2. Preencha o título do baralho
3. Adicione cards com diferentes tipos de conteúdo:
   - **Texto**: Digite diretamente na frente e no verso
   - **Imagem**: Faça upload de uma imagem (JPEG, PNG, GIF)
   - **Áudio**: Faça upload de um arquivo de áudio (MP3, WAV, OGG)
4. Clique em "Criar Baralho"

### 4. Estudar

1. Acesse `/baralhos` para ver todos os seus baralhos
2. Clique em "Estudar" no baralho desejado
3. Use os controles para:
   - **Espaço/Enter**: Virar o card
   - **Botões de avaliação**: Marcar dificuldade (Novamente, Difícil, Bom, Fácil)

### 5. Editar Baralhos

1. Na lista de baralhos, clique em "Editar"
2. Modifique o título ou os cards
3. Adicione ou remova cards conforme necessário
4. Salve as alterações

## 📁 Estrutura do Projeto

```
mvp-estetoscopio/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/               # Rotas da API
│   │   │   ├── auth/         # Autenticação (login, signup, logout)
│   │   │   ├── dashboard/    # Dashboard do usuário
│   │   │   ├── decks/        # CRUD de baralhos
│   │   │   └── upload/       # Upload de arquivos
│   │   ├── baralhos/         # Páginas de baralhos
│   │   │   ├── criar/        # Criar novo baralho
│   │   │   ├── [id]/
│   │   │   │   ├── editar/   # Editar baralho
│   │   │   │   └── estudar/  # Modo de estudo
│   │   │   └── page.tsx      # Lista de baralhos
│   │   ├── flashcards/       # Página de demonstração
│   │   ├── login/            # Página de login
│   │   ├── signup/           # Página de registro
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Dashboard/Home
│   │   └── globals.css       # Estilos globais
│   ├── components/           # Componentes React
│   │   ├── AudioPlayer.tsx   # Player de áudio
│   │   ├── Flashcard.tsx     # Componente de flashcard básico
│   │   ├── MediaFlashcard.tsx # Flashcard com mídia
│   │   └── Sidebar.tsx       # Barra lateral de navegação
│   ├── lib/                  # Utilitários
│   │   ├── auth.ts           # Funções de autenticação
│   │   └── db.ts             # Configuração do banco de dados
│   └── types/                # Tipos TypeScript
│       └── globals.d.ts      # Tipos globais
├── public/
│   └── uploads/              # Arquivos de mídia enviados
├── package.json              # Dependências do projeto
├── tsconfig.json             # Configuração do TypeScript
├── tailwind.config.ts        # Configuração do Tailwind
└── next.config.ts            # Configuração do Next.js
```

## 🔌 API

### Autenticação

#### POST `/api/auth/signup`

Cria uma nova conta de usuário.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST `/api/auth/login`

Faz login no sistema.

**Body:**

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST `/api/auth/logout`

Faz logout do usuário atual.

### Dashboard

#### GET `/api/dashboard`

Retorna estatísticas e informações do usuário.

**Resposta:**

```json
{
  "user": {
    "name": "João Silva",
    "email": "joao@example.com",
    "accountAge": 15
  },
  "stats": {
    "totalDecks": 5,
    "totalCards": 42,
    "averageCardsPerDeck": 8.4,
    "largestDeck": {
      "id": 1,
      "title": "Biologia",
      "cardCount": 20
    }
  },
  "recentDecks": [...]
}
```

### Baralhos (Decks)

#### GET `/api/decks`

Lista todos os baralhos do usuário.

#### POST `/api/decks`

Cria um novo baralho.

**Body:**

```json
{
  "title": "Matemática Básica",
  "cards": [
    {
      "front": { "type": "text", "content": "2 + 2 = ?" },
      "back": { "type": "text", "content": "4" }
    }
  ]
}
```

#### GET `/api/decks/[id]`

Retorna um baralho específico.

#### PUT `/api/decks/[id]`

Atualiza um baralho existente.

#### DELETE `/api/decks/[id]`

Remove um baralho.

### Upload

#### POST `/api/upload`

Faz upload de arquivos de mídia.

**Form Data:**

- `file`: Arquivo (imagem ou áudio)

**Resposta:**

```json
{
  "url": "/uploads/1699123456789-arquivo.jpg"
}
```

## 🧩 Componentes

### Flashcard

Componente básico de flashcard com texto.

```tsx
import Flashcard from "@/components/Flashcard";

<Flashcard
  front={<>Qual é a capital da França?</>}
  back={<>Paris</>}
  showControls={true}
  onFlipChange={(flipped) => console.log(flipped)}
/>
```

**Props:**

- `front`: Conteúdo da frente (ReactNode)
- `back`: Conteúdo do verso (ReactNode)
- `initialFlipped`: Se inicia virado (boolean)
- `onFlipChange`: Callback ao virar (function)
- `showControls`: Mostra controles de avaliação (boolean)
- `labels`: Textos personalizados (object)

### MediaFlashcard

Flashcard com suporte a mídia (texto, imagem, áudio).

```tsx
import { MediaFlashcard } from "@/components/MediaFlashcard";

<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/imagem.jpg",
    text: "O que é isso?"
  }}
  back={{
    type: "text",
    content: "Uma célula"
  }}
/>
```

**Tipos de conteúdo:**

- `text`: Texto simples ou HTML
- `image`: URL da imagem + texto opcional
- `audio`: URL do áudio + texto opcional

### AudioPlayer

Player de áudio customizado.

```tsx
import AudioPlayer from "@/components/AudioPlayer";

<AudioPlayer src="/uploads/audio.mp3" />
```

### Sidebar

Barra lateral de navegação.

```tsx
import Sidebar from "@/components/Sidebar";

<Sidebar />
```

## 🎨 Estilização

O projeto usa Tailwind CSS 4 com tema escuro suportado. Classes principais:

- `bg-linear-to-br`: Gradientes de fundo
- `dark:`: Variantes para modo escuro
- `hover:`: Estados de hover
- `focus-visible:`: Estados de foco acessíveis

### Cores Principais

- **Primária**: Blue/Purple gradient (`from-blue-500 to-purple-600`)
- **Secundária**: Emerald/Teal (`from-emerald-500 to-teal-600`)
- **Neutra**: Zinc scale (`zinc-50` to `zinc-900`)

## 🔐 Segurança

- Senhas hasheadas com bcryptjs
- Autenticação baseada em JWT
- Cookies HTTP-only para tokens
- Middleware de proteção de rotas
- Validação de entrada em todas as APIs

## 🚢 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente (se necessário)
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:

- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

**Observação**: Como o projeto usa SQLite, considere usar um banco de dados persistente em produção (PostgreSQL, MySQL, etc.).

---

## 📖 Documentação Completa

### 👥 Para Usuários

📘 **[GUIA_DE_USO.md](GUIA_DE_USO.md)** - Guia completo do usuário

Aprenda tudo sobre como usar o sistema:

- Primeiros passos (criando conta, login)
- Gerenciamento de baralhos (criar, editar, excluir)
- Tipos de flashcards (texto, imagem, áudio)
- Modo de estudo e sistema de repetição espaçada
- Upload de arquivos
- Atalhos de teclado
- Dicas e boas práticas
- Troubleshooting

### 👨‍💻 Para Desenvolvedores

🔧 **[ARQUITETURA.md](ARQUITETURA.md)** - Documentação técnica

Entenda a arquitetura do sistema:

- Stack tecnológica completa
- Estrutura de diretórios detalhada
- Padrões arquiteturais
- Schema do banco de dados
- Sistema de autenticação (JWT)
- Documentação completa da API
- Fluxos de dados
- Componentes e hierarquia
- Otimizações de performance
- Implementações de segurança
- Checklist de deploy

💡 **[EXEMPLOS.md](EXEMPLOS.md)** - Exemplos práticos

Exemplos de código prontos para usar:

- Uso básico e avançado do `Flashcard`
- Uso do `MediaFlashcard` com todos os tipos de conteúdo
- Implementação do `AudioPlayer`
- Casos de uso reais (vocabulário, anatomia, música)
- Exemplos de baralhos completos
- Dicas de implementação e performance

---

## 📚 Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Reportando Bugs

Encontrou um bug? Abra uma issue com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (navegador, OS, etc.)

### Sugerindo Melhorias

Tem uma ideia? Abra uma issue com:

- Descrição detalhada da feature
- Por que ela seria útil
- Exemplos de uso
- Mockups/wireframes (se aplicável)

---

## 🎯 Roadmap

### v1.1 (Próxima versão)

- [ ] Estatísticas avançadas de estudo
- [ ] Gráficos de progresso
- [ ] Atalhos de teclado numéricos para avaliação
- [ ] Modo noturno automático

### v2.0 (Futuro)

- [ ] Exportação/importação de baralhos (JSON, CSV)
- [ ] Compartilhamento de baralhos entre usuários
- [ ] Tags e categorias para organização
- [ ] Busca avançada e filtros
- [ ] Sistema de conquistas e gamificação
- [ ] App mobile nativo (React Native)
- [ ] Sincronização offline (PWA)
- [ ] Suporte a múltiplos idiomas (i18n)

---

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework incrível
- [Vercel](https://vercel.com/) - Hospedagem e deploy
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Ícones lindos
- Comunidade open source

---

## ⭐ Star History

Se este projeto foi útil para você, considere dar uma ⭐!

---

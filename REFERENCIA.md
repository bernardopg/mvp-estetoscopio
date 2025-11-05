# ⚡ Referência Rápida - MVP Estetoscópio

Guia de consulta rápida com comandos, atalhos e informações essenciais.

---

## 🔗 Links Importantes

| Item | URL |
|------|-----|
| Home/Dashboard | `/` |
| Login | `/login` |
| Cadastro | `/signup` |
| Meus Baralhos | `/baralhos` |
| Criar Baralho | `/baralhos/criar` |
| Editar Baralho | `/baralhos/[id]/editar` |
| Estudar Baralho | `/baralhos/[id]/estudar` |
| Demo Flashcards | `/flashcards` |

---

## ⌨️ Atalhos de Teclado

### No Modo de Estudo

| Tecla | Ação |
|-------|------|
| `Espaço` | Virar card / Mostrar resposta |
| `Enter` | Virar card / Mostrar resposta |

### Planejados para v1.1

| Tecla | Ação |
|-------|------|
| `1` | Avaliar como "Novamente" |
| `2` | Avaliar como "Difícil" |
| `3` | Avaliar como "Bom" |
| `4` | Avaliar como "Fácil" |
| `←` | Card anterior |
| `→` | Próximo card |

---

## 📊 Limites e Restrições

| Item | Limite |
|------|--------|
| Tamanho máximo - Imagem | 5 MB |
| Tamanho máximo - Áudio | 10 MB |
| Formatos de imagem | JPEG, PNG, GIF |
| Formatos de áudio | MP3, WAV, OGG |
| Duração da sessão | 24 horas |
| Baralhos por usuário | Ilimitado |
| Cards por baralho | Ilimitado |

---

## 🎨 Tipos de Conteúdo

### Texto

```typescript
{
  type: "text",
  content: "Seu texto aqui"
}
```

### Imagem

```typescript
{
  type: "image",
  content: "/uploads/imagem.jpg",
  text: "Descrição opcional"
}
```

### Áudio

```typescript
{
  type: "audio",
  content: "/uploads/audio.mp3",
  text: "Descrição opcional"
}
```

---

## 🔌 API Endpoints

### Autenticação

```
POST   /api/auth/signup    # Criar conta
POST   /api/auth/login     # Fazer login
POST   /api/auth/logout    # Fazer logout
```

### Dashboard

```
GET    /api/dashboard      # Dados do dashboard
```

### Baralhos

```
GET    /api/decks          # Listar todos
POST   /api/decks          # Criar novo
GET    /api/decks/[id]     # Ver específico
PUT    /api/decks/[id]     # Atualizar
DELETE /api/decks/[id]     # Deletar
```

### Upload

```
POST   /api/upload         # Upload de arquivo
```

---

## 🗂️ Estrutura de Dados

### Card Básico

```json
{
  "front": {
    "type": "text",
    "content": "Pergunta"
  },
  "back": {
    "type": "text",
    "content": "Resposta"
  }
}
```

### Baralho Completo

```json
{
  "id": 1,
  "user_id": 1,
  "title": "Nome do Baralho",
  "cards": [
    {
      "front": { "type": "text", "content": "Q1" },
      "back": { "type": "text", "content": "A1" }
    }
  ],
  "created_at": "2025-11-04T10:00:00Z",
  "updated_at": "2025-11-04T15:00:00Z"
}
```

---

## 🛠️ Comandos NPM

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Cria build otimizada
npm start            # Inicia servidor de produção

# Qualidade
npm run lint         # Executa linter
```

---

## 🎯 Sistema de Avaliação

| Botão | Significado | Quando Usar |
|-------|-------------|-------------|
| 🔴 Novamente | Não sabia | Errou completamente |
| 🟡 Difícil | Sabia com dificuldade | Hesitou muito |
| 🟢 Bom | Acertou normalmente | Esforço moderado |
| 🔵 Fácil | Acertou facilmente | Sem pensar |

---

## 📱 Componentes Principais

### Flashcard

```tsx
<Flashcard
  front={<>Pergunta</>}
  back={<>Resposta</>}
  showControls={true}
/>
```

### MediaFlashcard

```tsx
<MediaFlashcard
  front={{ type: "text", content: "Q" }}
  back={{ type: "text", content: "A" }}
/>
```

### AudioPlayer

```tsx
<AudioPlayer src="/uploads/audio.mp3" />
```

### Sidebar

```tsx
<Sidebar />
```

---

## 🎨 Classes Tailwind Principais

### Gradientes

```css
bg-linear-to-br from-blue-500 to-purple-600     /* Primário */
bg-linear-to-br from-emerald-500 to-teal-600    /* Secundário */
```

### Cores

```css
zinc-50, zinc-100, ..., zinc-900    /* Neutro */
dark:bg-zinc-900                    /* Modo escuro */
dark:text-zinc-50                   /* Texto escuro */
```

### Sombras

```css
shadow-lg                           /* Sombra grande */
shadow-xl shadow-blue-500/30        /* Sombra colorida */
```

---

## 🔐 Variáveis de Ambiente

```env
# JWT Secret (Produção)
JWT_SECRET=seu-secret-super-seguro

# Ambiente
NODE_ENV=production

# Banco de Dados (Produção)
DATABASE_URL=postgresql://...
```

---

## 🚀 Deploy Rápido

### Vercel

```bash
# 1. Instalar CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Deploy para produção
vercel --prod
```

### Docker (Exemplo)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 Estrutura do Banco

### Tabela: users

```sql
id          INTEGER PRIMARY KEY
name        TEXT NOT NULL
email       TEXT UNIQUE NOT NULL
password    TEXT NOT NULL
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Tabela: decks

```sql
id          INTEGER PRIMARY KEY
user_id     INTEGER NOT NULL (FK users.id)
title       TEXT NOT NULL
cards       TEXT NOT NULL (JSON)
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução Rápida |
|----------|----------------|
| Não consigo logar | Limpe cookies e tente novamente |
| Erro 401 | Faça logout e login novamente |
| Upload falha | Verifique tamanho e formato |
| Card não vira | Clique primeiro, depois pressione Espaço |
| Áudio não toca | Clique no botão play manualmente |

---

## 📞 Contato Rápido

| Canal | Link |
|-------|------|
| Issues | [GitHub Issues](https://github.com/bernardopg/mvp-estetoscopio/issues) |
| Discussions | [GitHub Discussions](https://github.com/bernardopg/mvp-estetoscopio/discussions) |
| Email | <bernardo.gomes@bebitterbebetter.com.br> |

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:

- 📘 [GUIA_DE_USO.md](GUIA_DE_USO.md) - Guia completo do usuário
- 🔧 [ARQUITETURA.md](ARQUITETURA.md) - Documentação técnica
- 💡 [EXEMPLOS.md](EXEMPLOS.md) - Exemplos de código
- ❓ [FAQ.md](FAQ.md) - Perguntas frequentes
- 📝 [CHANGELOG.md](CHANGELOG.md) - Histórico de versões

---

## 📦 Versão Atual

**v1.0.0** - 04 de novembro de 2025

---

## 🔗 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)

---

**🚀 Atalho para começar:**

```bash
git clone <repo> && cd mvp-estetoscopio && npm install && npm run dev
```

Acesse <http://localhost:3000> e boa sorte nos estudos! 📚

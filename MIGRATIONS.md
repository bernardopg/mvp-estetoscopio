# Migrações do Banco de Dados

Este arquivo documenta as migrações manuais necessárias no banco de dados SQLite.

## v1.0.1 - Adição da coluna category

**Data**: 4 de novembro de 2025

**Problema**: A tabela `decks` não tinha a coluna `category` que estava definida no schema do código, causando erro ao executar queries.

**Solução**: Executar o seguinte comando SQL:

```sql
ALTER TABLE decks ADD COLUMN category TEXT DEFAULT NULL;
```

**Como aplicar**:

```bash
sqlite3 mvp-estetoscopio.db "ALTER TABLE decks ADD COLUMN category TEXT DEFAULT NULL;"
```

**Verificar**:

```bash
sqlite3 mvp-estetoscopio.db "PRAGMA table_info(decks);"
```

---

## Como Aplicar Migrações

Se você clonou o projeto e o banco de dados já existe, execute:

```bash
# Na raiz do projeto
sqlite3 mvp-estetoscopio.db < migrations/v1.0.1.sql
```

---

## Estrutura Atual das Tabelas

### users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### decks

```sql
CREATE TABLE decks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  cards TEXT NOT NULL,
  category TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### deck_progress

```sql
CREATE TABLE deck_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cards_completed INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,
  average_difficulty REAL DEFAULT 0.0,
  last_studied_at DATETIME DEFAULT NULL,
  marked_for_review INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  study_sessions INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(deck_id, user_id),
  FOREIGN KEY (deck_id) REFERENCES decks (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### media

```sql
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## Próximas Migrações

Se você adicionar novas colunas ou tabelas no código, documente aqui e crie scripts SQL correspondentes.

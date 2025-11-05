import Database from "better-sqlite3";
import path from "path";

// Caminho para o banco de dados local
const dbPath = path.join(process.cwd(), "mvp-estetoscopio.db");
const db = new Database(dbPath);

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    cards TEXT NOT NULL, -- JSON string com estrutura: [{frente: {type, content}, verso: {type, content}}]
    category TEXT DEFAULT NULL, -- Categoria/bookmark do deck
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS deck_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    cards_completed INTEGER DEFAULT 0,
    total_cards INTEGER DEFAULT 0,
    average_difficulty REAL DEFAULT 0.0,
    last_studied_at DATETIME DEFAULT NULL,
    marked_for_review INTEGER DEFAULT 0, -- 0 = não, 1 = sim
    completed INTEGER DEFAULT 0, -- 0 = não completou, 1 = completou
    study_sessions INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(deck_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;

// Prepared statements
export const statements = {
  getDecks: db.prepare(
    "SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC"
  ),
  getDeck: db.prepare("SELECT * FROM decks WHERE id = ? AND user_id = ?"),
  createDeck: db.prepare(
    "INSERT INTO decks (user_id, title, cards, category) VALUES (?, ?, ?, ?)"
  ),
  updateDeck: db.prepare(
    "UPDATE decks SET title = ?, cards = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
  ),
  deleteDeck: db.prepare("DELETE FROM decks WHERE id = ? AND user_id = ?"),
  // Deck progress statements
  getDeckProgress: db.prepare(
    "SELECT * FROM deck_progress WHERE deck_id = ? AND user_id = ?"
  ),
  createDeckProgress: db.prepare(
    "INSERT INTO deck_progress (deck_id, user_id, cards_completed, total_cards, average_difficulty, last_studied_at, marked_for_review, completed, study_sessions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(deck_id, user_id) DO UPDATE SET cards_completed = excluded.cards_completed, total_cards = excluded.total_cards, average_difficulty = excluded.average_difficulty, last_studied_at = excluded.last_studied_at, marked_for_review = excluded.marked_for_review, completed = excluded.completed, study_sessions = excluded.study_sessions, updated_at = CURRENT_TIMESTAMP"
  ),
  updateDeckProgress: db.prepare(
    "UPDATE deck_progress SET cards_completed = ?, total_cards = ?, average_difficulty = ?, last_studied_at = ?, marked_for_review = ?, completed = ?, study_sessions = ?, updated_at = CURRENT_TIMESTAMP WHERE deck_id = ? AND user_id = ?"
  ),
  getUser: db.prepare("SELECT * FROM users WHERE id = ?"),
  getUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  createUser: db.prepare(
    "INSERT INTO users (name, email, password, profile_picture) VALUES (?, ?, ?, ?)"
  ),
  updateUser: db.prepare(
    "UPDATE users SET name = ?, email = ?, profile_picture = ? WHERE id = ?"
  ),
  updateUserPassword: db.prepare("UPDATE users SET password = ? WHERE id = ?"),
  // Media statements
  createMedia: db.prepare(
    "INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)"
  ),
  getMedia: db.prepare("SELECT * FROM media WHERE id = ?"),
  deleteMedia: db.prepare("DELETE FROM media WHERE id = ?"),
};

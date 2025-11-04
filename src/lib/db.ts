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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
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
    "INSERT INTO decks (user_id, title, cards) VALUES (?, ?, ?)"
  ),
  updateDeck: db.prepare(
    "UPDATE decks SET title = ?, cards = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
  ),
  deleteDeck: db.prepare("DELETE FROM decks WHERE id = ? AND user_id = ?"),
  getUser: db.prepare("SELECT * FROM users WHERE id = ?"),
  getUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  createUser: db.prepare(
    "INSERT INTO users (name, email, password, profile_picture) VALUES (?, ?, ?, ?)"
  ),
  // Media statements
  createMedia: db.prepare(
    "INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)"
  ),
  getMedia: db.prepare("SELECT * FROM media WHERE id = ?"),
  deleteMedia: db.prepare("DELETE FROM media WHERE id = ?"),
};

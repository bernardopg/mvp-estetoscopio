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

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0, -- 0 = não usado, 1 = usado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    deck_id INTEGER NOT NULL,
    cards_studied INTEGER DEFAULT 0,
    cards_again INTEGER DEFAULT 0, -- Cards marcados como "Again"
    cards_hard INTEGER DEFAULT 0, -- Cards marcados como "Hard"
    cards_good INTEGER DEFAULT 0, -- Cards marcados como "Good"
    cards_easy INTEGER DEFAULT 0, -- Cards marcados como "Easy"
    time_spent INTEGER DEFAULT 0, -- Tempo em segundos
    session_date DATE DEFAULT (date('now')), -- Data da sessão
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS card_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    deck_id INTEGER NOT NULL,
    card_id TEXT NOT NULL, -- ID do card dentro do deck
    quality INTEGER NOT NULL, -- 0-5 (SM-2 quality)
    ease_factor REAL NOT NULL, -- E-Factor (≥ 1.3)
    interval INTEGER NOT NULL, -- Intervalo em dias
    repetitions INTEGER NOT NULL, -- Repetições consecutivas corretas
    next_review_date DATE NOT NULL, -- Data da próxima revisão
    difficulty TEXT NOT NULL, -- again, hard, good, easy
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
  );

  -- Índices para melhorar performance de consultas
  CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, session_date);
  CREATE INDEX IF NOT EXISTS idx_study_sessions_deck ON study_sessions(deck_id);
  CREATE INDEX IF NOT EXISTS idx_card_reviews_user_deck ON card_reviews(user_id, deck_id);
  CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(deck_id, card_id);
  CREATE INDEX IF NOT EXISTS idx_card_reviews_next_date ON card_reviews(next_review_date);
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
  // Password reset statements
  createPasswordResetToken: db.prepare(
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
  ),
  getPasswordResetToken: db.prepare(
    "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
  ),
  markTokenAsUsed: db.prepare(
    "UPDATE password_reset_tokens SET used = 1 WHERE token = ?"
  ),
  deleteExpiredTokens: db.prepare(
    "DELETE FROM password_reset_tokens WHERE expires_at < datetime('now')"
  ),
  // Study sessions statements
  createStudySession: db.prepare(
    "INSERT INTO study_sessions (user_id, deck_id, cards_studied, cards_again, cards_hard, cards_good, cards_easy, time_spent, session_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ),
  getStudySessionsByUser: db.prepare(
    "SELECT * FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC"
  ),
  getStudySessionsByDate: db.prepare(
    "SELECT * FROM study_sessions WHERE user_id = ? AND session_date >= ? AND session_date <= ? ORDER BY session_date DESC"
  ),
  getStudyStreak: db.prepare(`
    SELECT COUNT(*) as streak FROM (
      SELECT session_date
      FROM study_sessions
      WHERE user_id = ?
      GROUP BY session_date
      ORDER BY session_date DESC
    ) WHERE session_date >= date('now', '-' || (
      SELECT COUNT(DISTINCT session_date)
      FROM study_sessions
      WHERE user_id = ?
      AND session_date >= date('now', '-30 days')
    ) || ' days')
  `),
  // Card reviews statements (SM-2 algorithm)
  createCardReview: db.prepare(
    "INSERT INTO card_reviews (user_id, deck_id, card_id, quality, ease_factor, interval, repetitions, next_review_date, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ),
  getLatestCardReview: db.prepare(
    "SELECT * FROM card_reviews WHERE user_id = ? AND deck_id = ? AND card_id = ? ORDER BY review_date DESC LIMIT 1"
  ),
  getCardReviewsByDeck: db.prepare(`
    SELECT * FROM card_reviews
    WHERE user_id = ? AND deck_id = ?
    AND id IN (
      SELECT MAX(id) FROM card_reviews
      WHERE user_id = ? AND deck_id = ?
      GROUP BY card_id
    )
    ORDER BY review_date DESC
  `),
  getDueCards: db.prepare(`
    SELECT card_id, MIN(next_review_date) as next_review_date
    FROM card_reviews
    WHERE user_id = ? AND deck_id = ? AND next_review_date <= date('now')
    GROUP BY card_id
    ORDER BY next_review_date ASC
  `),
  getAllCardReviews: db.prepare(
    "SELECT * FROM card_reviews WHERE user_id = ? AND deck_id = ? ORDER BY review_date DESC"
  ),
  getCardReviewStats: db.prepare(`
    SELECT
      COUNT(DISTINCT card_id) as total_cards,
      AVG(ease_factor) as avg_ease_factor,
      AVG(interval) as avg_interval,
      SUM(CASE WHEN repetitions >= 2 THEN 1 ELSE 0 END) as mature_cards,
      SUM(CASE WHEN repetitions = 1 THEN 1 ELSE 0 END) as young_cards,
      SUM(CASE WHEN repetitions = 0 THEN 1 ELSE 0 END) as new_cards
    FROM (
      SELECT * FROM card_reviews
      WHERE user_id = ? AND deck_id = ?
      AND id IN (
        SELECT MAX(id) FROM card_reviews
        WHERE user_id = ? AND deck_id = ?
        GROUP BY card_id
      )
    )
  `),
};

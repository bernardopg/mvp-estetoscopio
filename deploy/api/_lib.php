<?php
/**
 * Bootstrap comum de todos os endpoints: banco (PDO SQLite), sessão e
 * helpers de resposta/erro. Porte de src/lib/db.ts + src/lib/auth.ts.
 *
 * Este arquivo é apenas incluído pelos endpoints; o .htaccess bloqueia o
 * acesso direto a ele.
 */
declare(strict_types=1);

class ApiError extends RuntimeException {}

/** @return never */
function send_json(int $status, $body) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/** @return never */
function fail(int $status, string $message) {
    send_json($status, ['error' => $message]);
}

/**
 * Caminho do arquivo SQLite. Em produção fica fora do docroot público
 * (ao lado do config.php do hub); em dev local cai em deploy/data/.
 */
function db_path(): string {
    $prod = __DIR__ . '/../../../private/estetoscopio.db';
    if (is_dir(dirname($prod))) {
        return $prod;
    }
    return __DIR__ . '/../data/estetoscopio.db';
}

function get_db(): PDO {
    static $db = null;
    if ($db !== null) {
        return $db;
    }

    $path = db_path();
    @mkdir(dirname($path), 0770, true);

    $db = new PDO('sqlite:' . $path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $db->exec('PRAGMA foreign_keys = ON');

    migrate_schema($db);

    return $db;
}

function column_exists(PDO $db, string $table, string $column): bool {
    $stmt = $db->query("PRAGMA table_info($table)");
    foreach ($stmt->fetchAll() as $col) {
        if ($col['name'] === $column) {
            return true;
        }
    }
    return false;
}

function migrate_schema(PDO $db): void {
    // Migração: colunas novas na tabela decks, se a tabela já existir.
    $decksExists = $db
        ->query("SELECT name FROM sqlite_master WHERE type='table' AND name='decks'")
        ->fetch();

    if ($decksExists) {
        foreach ([
            'folder_id' => 'INTEGER DEFAULT NULL',
            'color' => 'TEXT DEFAULT NULL',
            'icon' => 'TEXT DEFAULT NULL',
            'is_bookmarked' => 'INTEGER DEFAULT 0',
        ] as $column => $def) {
            if (!column_exists($db, 'decks', $column)) {
                $db->exec("ALTER TABLE decks ADD COLUMN $column $def");
            }
        }
    }

    $db->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        parent_id INTEGER DEFAULT NULL,
        color TEXT DEFAULT NULL,
        icon TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        cards TEXT NOT NULL,
        category TEXT DEFAULT NULL,
        folder_id INTEGER DEFAULT NULL,
        color TEXT DEFAULT NULL,
        icon TEXT DEFAULT NULL,
        is_bookmarked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS deck_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(deck_id, tag_id),
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deck_progress (
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
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
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

    CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        deck_id INTEGER NOT NULL,
        cards_studied INTEGER DEFAULT 0,
        cards_again INTEGER DEFAULT 0,
        cards_hard INTEGER DEFAULT 0,
        cards_good INTEGER DEFAULT 0,
        cards_easy INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        session_date DATE DEFAULT (date('now')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        deck_id INTEGER NOT NULL,
        card_id TEXT NOT NULL,
        quality INTEGER NOT NULL,
        ease_factor REAL NOT NULL,
        interval INTEGER NOT NULL,
        repetitions INTEGER NOT NULL,
        next_review_date DATE NOT NULL,
        difficulty TEXT NOT NULL,
        review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_by INTEGER NOT NULL,
        is_private INTEGER DEFAULT 0,
        member_count INTEGER DEFAULT 1,
        deck_count INTEGER DEFAULT 0,
        icon TEXT DEFAULT NULL,
        color TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        community_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(community_id, user_id),
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shared_decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        community_id INTEGER NOT NULL,
        shared_by INTEGER NOT NULL,
        permission TEXT DEFAULT 'view',
        allow_comments INTEGER DEFAULT 1,
        downloads INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(deck_id, community_id),
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deck_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shared_deck_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        parent_comment_id INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shared_deck_id) REFERENCES shared_decks (id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES deck_comments (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER DEFAULT NULL,
        related_type TEXT DEFAULT NULL,
        is_read INTEGER DEFAULT 0,
        action_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        email_notifications INTEGER DEFAULT 1,
        community_notifications INTEGER DEFAULT 1,
        comment_notifications INTEGER DEFAULT 1,
        deck_share_notifications INTEGER DEFAULT 1,
        new_follower_notifications INTEGER DEFAULT 1,
        study_reminders INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_decks_folder ON decks(folder_id);
    CREATE INDEX IF NOT EXISTS idx_decks_bookmarked ON decks(user_id, is_bookmarked);
    CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
    CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);
    CREATE INDEX IF NOT EXISTS idx_deck_tags_deck ON deck_tags(deck_id);
    CREATE INDEX IF NOT EXISTS idx_deck_tags_tag ON deck_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, session_date);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_deck ON study_sessions(deck_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_user_deck ON card_reviews(user_id, deck_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(deck_id, card_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_next_date ON card_reviews(next_review_date);
    CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
    CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
    CREATE INDEX IF NOT EXISTS idx_shared_decks_community ON shared_decks(community_id);
    CREATE INDEX IF NOT EXISTS idx_shared_decks_deck ON shared_decks(deck_id);
    CREATE INDEX IF NOT EXISTS idx_deck_comments_shared_deck ON deck_comments(shared_deck_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    SQL);
}

/**
 * Login é do hub, não do app: a sessão (SCALPELSESS, cookie de
 * .scalpel.com.br) e a tabela de usuários vivem em hub/_boot.php e
 * private/hub.db. Este app só inclui o boot do hub e usa o id do usuário
 * como user_id local (decks, folders, etc.) — sem tabela `users` própria.
 *
 * @return array{id:int,name:string,email:string,avatar_url:?string,tier:string}|null
 */
function optional_hub_user(): ?array {
    $hubBoot = __DIR__ . '/../../_boot.php';
    if (!is_file($hubBoot)) {
        // Ambiente sem o hub ao lado (ex.: dev local isolado): sem sessão.
        return null;
    }
    require_once $hubBoot;
    return current_user();
}

function require_auth(): array {
    $user = optional_hub_user();
    if ($user === null) {
        fail(401, 'Não autorizado');
    }
    return $user;
}

/** Lê e decodifica o corpo JSON da requisição. */
function json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : [];
}

<?php
/**
 * GET  /api/decks/index.php  — lista os decks do usuário autenticado
 * POST /api/decks/index.php  — cria um deck
 *
 * Porte de src/app/api/decks/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC');
    $stmt->execute([$user['id']]);
    $decks = $stmt->fetchAll();

    $progressStmt = $db->prepare('SELECT * FROM deck_progress WHERE deck_id = ? AND user_id = ?');
    $tagsStmt = $db->prepare(
        'SELECT tags.* FROM tags INNER JOIN deck_tags ON tags.id = deck_tags.tag_id WHERE deck_tags.deck_id = ? ORDER BY tags.name ASC'
    );
    $folderStmt = $db->prepare('SELECT id, name, color, icon FROM folders WHERE id = ? AND user_id = ?');

    $result = array_map(function ($deck) use ($progressStmt, $tagsStmt, $folderStmt, $user) {
        $progressStmt->execute([$deck['id'], $user['id']]);
        $progress = $progressStmt->fetch();

        $tagsStmt->execute([$deck['id']]);
        $tags = $tagsStmt->fetchAll();

        $folder = null;
        if ($deck['folder_id']) {
            $folderStmt->execute([$deck['folder_id'], $user['id']]);
            $folder = $folderStmt->fetch() ?: null;
        }

        $deck['is_bookmarked'] = $deck['is_bookmarked'] === 1;
        $deck['tags'] = $tags;
        $deck['folder'] = $folder;
        $deck['progress'] = $progress ? [
            'cards_completed' => $progress['cards_completed'],
            'total_cards' => $progress['total_cards'],
            'average_difficulty' => $progress['average_difficulty'],
            'last_studied_at' => $progress['last_studied_at'],
            'marked_for_review' => $progress['marked_for_review'] === 1,
            'completed' => $progress['completed'] === 1,
            'study_sessions' => $progress['study_sessions'],
        ] : null;

        return $deck;
    }, $decks);

    send_json(200, $result);
}

if ($method === 'POST') {
    $body = json_body();
    $title = $body['title'] ?? null;
    $cards = $body['cards'] ?? null;

    if (!$title || !is_array($cards)) {
        fail(400, 'Título e cartas são obrigatórios');
    }

    $stmt = $db->prepare(
        'INSERT INTO decks (user_id, title, cards, category, folder_id, color, icon, is_bookmarked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $user['id'],
        $title,
        json_encode($cards, JSON_UNESCAPED_UNICODE),
        $body['category'] ?? null,
        $body['folder_id'] ?? null,
        $body['color'] ?? null,
        $body['icon'] ?? null,
        !empty($body['is_bookmarked']) ? 1 : 0,
    ]);
    $deckId = (int) $db->lastInsertId();

    if (!empty($body['tags']) && is_array($body['tags'])) {
        $addTag = $db->prepare('INSERT INTO deck_tags (deck_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING');
        foreach ($body['tags'] as $tagId) {
            $addTag->execute([$deckId, $tagId]);
        }
    }

    $stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$deckId, $user['id']]);
    send_json(201, $stmt->fetch());
}

fail(405, 'Método não permitido');

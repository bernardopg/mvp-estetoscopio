<?php
/**
 * GET/PUT/DELETE /api/decks/detail.php?id=  — deck único.
 * Porte de src/app/api/decks/[id]/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID inválido');
}

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    $deck = $stmt->fetch();
    if (!$deck) {
        fail(404, 'Baralho não encontrado');
    }
    send_json(200, $deck);
}

if ($method === 'PUT') {
    $body = json_body();
    $title = $body['title'] ?? null;
    $cards = $body['cards'] ?? null;

    if (!$title || !is_array($cards)) {
        fail(400, 'Título e cartas são obrigatórios');
    }

    $stmt = $db->prepare(
        'UPDATE decks SET title = ?, cards = ?, category = ?, folder_id = ?, color = ?, icon = ?, is_bookmarked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    );
    $stmt->execute([
        $title,
        json_encode($cards, JSON_UNESCAPED_UNICODE),
        $body['category'] ?? null,
        $body['folder_id'] ?? null,
        $body['color'] ?? null,
        $body['icon'] ?? null,
        !empty($body['is_bookmarked']) ? 1 : 0,
        $id,
        $user['id'],
    ]);

    if ($stmt->rowCount() === 0) {
        fail(404, 'Baralho não encontrado');
    }

    if (isset($body['tags']) && is_array($body['tags'])) {
        $db->prepare('DELETE FROM deck_tags WHERE deck_id = ?')->execute([$id]);
        $addTag = $db->prepare('INSERT INTO deck_tags (deck_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING');
        foreach ($body['tags'] as $tagId) {
            $addTag->execute([$id, $tagId]);
        }
    }

    $stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    send_json(200, $stmt->fetch());
}

if ($method === 'DELETE') {
    $stmt = $db->prepare('DELETE FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if ($stmt->rowCount() === 0) {
        fail(404, 'Baralho não encontrado');
    }
    send_json(200, ['message' => 'Baralho deletado com sucesso']);
}

fail(405, 'Método não permitido');

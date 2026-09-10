<?php
/**
 * GET/POST/PUT/DELETE /api/shared-decks/comments.php?id=  — porte de
 * src/app/api/shared-decks/[id]/comments/route.ts.
 *
 * Nota: o original em TS usava DEFAULT_USER_ID fixo (bug); aqui usa o
 * usuário autenticado de fato.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';
require __DIR__ . '/../_notifications.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$sharedDeckId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($sharedDeckId === false || $sharedDeckId === null) {
    fail(400, 'ID de baralho compartilhado inválido');
}

if ($method === 'GET') {
    $stmt = $db->prepare(
        'SELECT dc.*, u.name as user_name, u.email as user_email
         FROM deck_comments dc INNER JOIN users u ON dc.user_id = u.id
         WHERE dc.shared_deck_id = ? ORDER BY dc.created_at DESC'
    );
    $stmt->execute([$sharedDeckId]);
    $comments = $stmt->fetchAll();

    $result = array_map(fn($c) => [
        'id' => $c['id'],
        'shared_deck_id' => $c['shared_deck_id'],
        'user_id' => $c['user_id'],
        'content' => $c['comment'],
        'parent_comment_id' => $c['parent_comment_id'],
        'created_at' => $c['created_at'],
        'updated_at' => $c['updated_at'],
        'user' => ['id' => $c['user_id'], 'name' => $c['user_name'], 'email' => $c['user_email']],
    ], $comments);

    send_json(200, $result);
}

if ($method === 'POST') {
    $body = json_body();
    $content = trim((string) ($body['content'] ?? ''));
    $parentCommentId = $body['parent_comment_id'] ?? null;

    if ($content === '') {
        fail(400, 'Conteúdo é obrigatório');
    }

    $stmt = $db->prepare('SELECT * FROM shared_decks WHERE id = ?');
    $stmt->execute([$sharedDeckId]);
    $sharedDeck = $stmt->fetch();
    if (!$sharedDeck) {
        fail(404, 'Deck compartilhado não encontrado');
    }

    $stmt = $db->prepare('INSERT INTO deck_comments (shared_deck_id, user_id, comment, parent_comment_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$sharedDeckId, $user['id'], $content, $parentCommentId ?: null]);
    $commentId = (int) $db->lastInsertId();

    $stmt = $db->prepare(
        'SELECT dc.*, u.name as user_name, u.email as user_email FROM deck_comments dc
         INNER JOIN users u ON dc.user_id = u.id WHERE dc.id = ?'
    );
    $stmt->execute([$commentId]);
    $newComment = $stmt->fetch();

    $stmt = $db->prepare('SELECT title FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$sharedDeck['deck_id'], $sharedDeck['shared_by']]);
    $deckData = $stmt->fetch();

    if ($deckData) {
        if ($parentCommentId) {
            notify_comment_reply($user['id'], (int) $parentCommentId, $deckData['title'], $content, (int) $sharedDeck['community_id']);
        } else {
            notify_new_comment($user['id'], $sharedDeckId, $deckData['title'], $content, (int) $sharedDeck['community_id']);
        }
    }

    send_json(201, $newComment);
}

if ($method === 'PUT') {
    $body = json_body();
    $commentId = $body['comment_id'] ?? null;
    $content = trim((string) ($body['content'] ?? ''));

    if (!$commentId || $content === '') {
        fail(400, 'ID do comentário e conteúdo são obrigatórios');
    }

    $stmt = $db->prepare('SELECT * FROM deck_comments WHERE id = ?');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch();
    if (!$comment) {
        fail(404, 'Comentário não encontrado');
    }
    if ((int) $comment['user_id'] !== $user['id']) {
        fail(403, 'Você não tem permissão para editar este comentário');
    }

    $db->prepare('UPDATE deck_comments SET comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([$content, $commentId]);

    $stmt = $db->prepare('SELECT id, comment, updated_at FROM deck_comments WHERE id = ?');
    $stmt->execute([$commentId]);
    $updated = $stmt->fetch();

    send_json(200, ['id' => $updated['id'], 'content' => $updated['comment'], 'updated_at' => $updated['updated_at']]);
}

if ($method === 'DELETE') {
    $body = json_body();
    $commentId = $body['comment_id'] ?? null;

    if (!$commentId) {
        fail(400, 'ID do comentário é obrigatório');
    }

    $stmt = $db->prepare('SELECT * FROM deck_comments WHERE id = ?');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch();
    if (!$comment) {
        fail(404, 'Comentário não encontrado');
    }
    if ((int) $comment['user_id'] !== $user['id']) {
        fail(403, 'Você não tem permissão para deletar este comentário');
    }

    $db->prepare('DELETE FROM deck_comments WHERE id = ?')->execute([$commentId]);

    send_json(200, ['message' => 'Comentário deletado com sucesso']);
}

fail(405, 'Método não permitido');

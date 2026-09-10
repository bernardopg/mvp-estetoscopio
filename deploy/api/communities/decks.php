<?php
/**
 * GET/POST /api/communities/decks.php?id=  — baralhos compartilhados na
 * comunidade. Porte de src/app/api/communities/[id]/decks/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';
require __DIR__ . '/../_notifications.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$communityId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($communityId === false || $communityId === null) {
    fail(400, 'ID de comunidade inválido');
}

$stmt = $db->prepare('SELECT * FROM communities WHERE id = ?');
$stmt->execute([$communityId]);
$community = $stmt->fetch();
if (!$community) {
    fail(404, 'Comunidade não encontrada');
}

$stmt = $db->prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ?');
$stmt->execute([$communityId, $user['id']]);
$membership = $stmt->fetch();

if ($method === 'GET') {
    if ($community['is_private'] === 1 && !$membership) {
        fail(403, 'Acesso negado a esta comunidade privada');
    }

    $stmt = $db->prepare(
        'SELECT sd.*, d.title, d.cards, u.name as shared_by_name
         FROM shared_decks sd
         INNER JOIN decks d ON sd.deck_id = d.id
         INNER JOIN users u ON sd.shared_by = u.id
         WHERE sd.community_id = ? ORDER BY sd.created_at DESC'
    );
    $stmt->execute([$communityId]);
    send_json(200, ['decks' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $body = json_body();
    $deckId = $body['deck_id'] ?? null;
    $permission = $body['permission'] ?? null;

    if (!$deckId) {
        fail(400, 'deck_id é obrigatório');
    }
    if ($permission !== null && !in_array($permission, ['view', 'edit', 'clone'], true)) {
        fail(400, 'Permissão inválida. Use: view, edit ou clone');
    }
    if (!$membership) {
        fail(403, 'Você precisa ser membro da comunidade para compartilhar baralhos');
    }

    $stmt = $db->prepare('SELECT id, title FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$deckId, $user['id']]);
    $deck = $stmt->fetch();
    if (!$deck) {
        fail(404, 'Baralho não encontrado ou você não tem permissão');
    }

    $stmt = $db->prepare('SELECT id FROM shared_decks WHERE deck_id = ? AND community_id = ?');
    $stmt->execute([$deckId, $communityId]);
    if ($stmt->fetch()) {
        fail(400, 'Este baralho já está compartilhado nesta comunidade');
    }

    $stmt = $db->prepare(
        'INSERT INTO shared_decks (deck_id, community_id, shared_by, permission, allow_comments) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $deckId,
        $communityId,
        $user['id'],
        $permission ?? 'view',
        !array_key_exists('allow_comments', $body) || $body['allow_comments'] ? 1 : 0,
    ]);
    $sharedDeckId = (int) $db->lastInsertId();

    $db->prepare('UPDATE communities SET deck_count = deck_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([$communityId]);

    notify_deck_shared($user['id'], $communityId, (int) $deckId, $deck['title'], $community['name']);

    $stmt = $db->prepare('SELECT * FROM shared_decks WHERE id = ?');
    $stmt->execute([$sharedDeckId]);
    send_json(201, ['shared_deck' => $stmt->fetch()]);
}

fail(405, 'Método não permitido');

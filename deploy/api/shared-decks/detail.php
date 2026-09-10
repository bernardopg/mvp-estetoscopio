<?php
/**
 * GET/PATCH/DELETE /api/shared-decks/detail.php?id=  — porte de
 * src/app/api/shared-decks/[id]/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID de baralho compartilhado inválido');
}

$stmt = $db->prepare('SELECT * FROM shared_decks WHERE id = ?');
$stmt->execute([$id]);
$sharedDeck = $stmt->fetch();
if (!$sharedDeck) {
    fail(404, 'Baralho compartilhado não encontrado');
}

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ?');
    $stmt->execute([$sharedDeck['community_id'], $user['id']]);
    $membership = $stmt->fetch();

    $stmt = $db->prepare('SELECT is_private FROM communities WHERE id = ?');
    $stmt->execute([$sharedDeck['community_id']]);
    $community = $stmt->fetch();

    if ($community && $community['is_private'] === 1 && !$membership) {
        fail(403, 'Acesso negado a este baralho');
    }

    $stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$sharedDeck['deck_id'], $sharedDeck['shared_by']]);
    $deckDetails = $stmt->fetch();

    send_json(200, ['shared_deck' => $sharedDeck, 'deck' => $deckDetails ?: null]);
}

if ($method === 'PATCH') {
    if ((int) $sharedDeck['shared_by'] !== $user['id']) {
        fail(403, 'Apenas o dono do baralho pode alterar permissões');
    }

    $body = json_body();
    $permission = $body['permission'] ?? null;
    if ($permission !== null && !in_array($permission, ['view', 'edit', 'clone'], true)) {
        fail(400, 'Permissão inválida. Use: view, edit ou clone');
    }

    $db->prepare('UPDATE shared_decks SET permission = ?, allow_comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([
            $permission ?: $sharedDeck['permission'],
            array_key_exists('allow_comments', $body) ? (!empty($body['allow_comments']) ? 1 : 0) : $sharedDeck['allow_comments'],
            $id,
        ]);

    $stmt = $db->prepare('SELECT * FROM shared_decks WHERE id = ?');
    $stmt->execute([$id]);
    send_json(200, ['shared_deck' => $stmt->fetch()]);
}

if ($method === 'DELETE') {
    $stmt = $db->prepare('SELECT role FROM community_members WHERE community_id = ? AND user_id = ?');
    $stmt->execute([$sharedDeck['community_id'], $user['id']]);
    $membership = $stmt->fetch();

    $isOwner = (int) $sharedDeck['shared_by'] === $user['id'];
    $isAdmin = $membership && $membership['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {
        fail(403, 'Apenas o dono do baralho ou administradores podem remover o compartilhamento');
    }

    $db->prepare('DELETE FROM shared_decks WHERE id = ?')->execute([$id]);
    $db->prepare('UPDATE communities SET deck_count = deck_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([$sharedDeck['community_id']]);

    send_json(200, ['message' => 'Compartilhamento removido com sucesso']);
}

fail(405, 'Método não permitido');

<?php
/**
 * POST /api/shared-decks/clone.php?id=  — porte de
 * src/app/api/shared-decks/[id]/clone/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

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

if (!in_array($sharedDeck['permission'], ['clone', 'edit'], true)) {
    fail(403, 'Este baralho não permite clonagem');
}

$stmt = $db->prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?');
$stmt->execute([$sharedDeck['community_id'], $user['id']]);
if (!$stmt->fetch()) {
    fail(403, 'Você precisa ser membro da comunidade para clonar baralhos');
}

$stmt = $db->prepare('SELECT title, cards, category FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$sharedDeck['deck_id'], $sharedDeck['shared_by']]);
$originalDeck = $stmt->fetch();
if (!$originalDeck) {
    fail(404, 'Baralho original não encontrado');
}

$stmt = $db->prepare('INSERT INTO decks (user_id, title, cards, category) VALUES (?, ?, ?, ?)');
$stmt->execute([$user['id'], $originalDeck['title'] . ' (cópia)', $originalDeck['cards'], $originalDeck['category'] ?: null]);
$newDeckId = (int) $db->lastInsertId();

$db->prepare('UPDATE shared_decks SET downloads = downloads + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    ->execute([$id]);

$stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$newDeckId, $user['id']]);

send_json(201, ['message' => 'Baralho clonado com sucesso', 'deck' => $stmt->fetch()]);

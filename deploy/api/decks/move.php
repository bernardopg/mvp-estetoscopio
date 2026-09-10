<?php
/**
 * PATCH /api/decks/move.php?id=  — move deck para outra pasta (ou raiz).
 * Porte de src/app/api/decks/[id]/move/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'PATCH') {
    fail(405, 'Método não permitido');
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID inválido');
}

$body = json_body();
$folderId = $body['folder_id'] ?? null;

if ($folderId !== null && !is_int($folderId)) {
    fail(400, 'folder_id deve ser um número ou null');
}

$stmt = $db->prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $user['id']]);
if (!$stmt->fetch()) {
    fail(404, 'Baralho não encontrado');
}

if ($folderId !== null) {
    $stmt = $db->prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$folderId, $user['id']]);
    if (!$stmt->fetch()) {
        fail(404, 'Pasta não encontrada');
    }
}

$stmt = $db->prepare('UPDATE decks SET folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
$stmt->execute([$folderId, $id, $user['id']]);

if ($stmt->rowCount() === 0) {
    fail(500, 'Erro ao mover baralho');
}

send_json(200, [
    'message' => 'Baralho movido com sucesso',
    'deck_id' => $id,
    'folder_id' => $folderId,
]);

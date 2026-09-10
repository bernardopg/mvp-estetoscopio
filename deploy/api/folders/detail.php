<?php
/**
 * GET/PUT/DELETE /api/folders/detail.php?id=  — porte de
 * src/app/api/folders/[id]/route.ts.
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
    $stmt = $db->prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    $folder = $stmt->fetch();
    if (!$folder) {
        fail(404, 'Pasta não encontrada');
    }
    send_json(200, $folder);
}

if ($method === 'PUT') {
    $body = json_body();
    $name = trim((string) ($body['name'] ?? ''));
    $parentId = $body['parent_id'] ?? null;

    if ($name === '') {
        fail(400, 'Nome da pasta é obrigatório');
    }

    $stmt = $db->prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) {
        fail(404, 'Pasta não encontrada');
    }

    if ($parentId === $id) {
        fail(400, 'Uma pasta não pode ser filha de si mesma');
    }

    $stmt = $db->prepare('UPDATE folders SET name = ?, parent_id = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    $stmt->execute([$name, $parentId, $body['color'] ?? null, $body['icon'] ?? null, $id, $user['id']]);

    $stmt = $db->prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    send_json(200, $stmt->fetch());
}

if ($method === 'DELETE') {
    $stmt = $db->prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) {
        fail(404, 'Pasta não encontrada');
    }

    // Mover baralhos para raiz antes de deletar.
    $db->prepare('UPDATE decks SET folder_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE folder_id = ? AND user_id = ?')
        ->execute([$id, $user['id']]);

    // CASCADE remove subpastas.
    $db->prepare('DELETE FROM folders WHERE id = ? AND user_id = ?')->execute([$id, $user['id']]);

    send_json(200, ['message' => 'Pasta deletada com sucesso']);
}

fail(405, 'Método não permitido');

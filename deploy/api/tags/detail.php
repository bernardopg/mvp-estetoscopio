<?php
/**
 * PUT/DELETE /api/tags/detail.php?id=  — porte de src/app/api/tags/[id]/route.ts.
 *
 * Nota: o original em TS usava DEFAULT_USER_ID fixo (bug); aqui usa o
 * usuário autenticado de fato, como nos demais endpoints.
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

$stmt = $db->prepare('SELECT id FROM tags WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $user['id']]);
if (!$stmt->fetch()) {
    fail(404, 'Tag não encontrada');
}

if ($method === 'PUT') {
    $body = json_body();
    $name = $body['name'] ?? null;
    $color = $body['color'] ?? null;

    if (!$name || !$color) {
        fail(400, 'Nome e cor são obrigatórios');
    }

    $db->prepare('UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?')
        ->execute([$name, $color, $id, $user['id']]);

    $stmt = $db->prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    send_json(200, $stmt->fetch());
}

if ($method === 'DELETE') {
    $stmt = $db->prepare('DELETE FROM tags WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if ($stmt->rowCount() === 0) {
        fail(500, 'Erro ao deletar tag');
    }
    send_json(200, ['message' => 'Tag deletada com sucesso']);
}

fail(405, 'Método não permitido');

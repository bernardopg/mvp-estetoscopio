<?php
/**
 * PATCH/DELETE /api/notifications/detail.php?id=  — porte de
 * src/app/api/notifications/[id]/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID de notificação inválido');
}

if ($method === 'PATCH') {
    $stmt = $db->prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) {
        fail(404, 'Notificação não encontrada');
    }

    $body = json_body();
    if (array_key_exists('is_read', $body)) {
        if (!in_array($body['is_read'], [0, 1], true)) {
            fail(400, 'Valor de is_read inválido (deve ser 0 ou 1)');
        }
        $db->prepare('UPDATE notifications SET is_read = ? WHERE id = ?')->execute([$body['is_read'], $id]);
    }

    $stmt = $db->prepare('SELECT * FROM notifications WHERE id = ?');
    $stmt->execute([$id]);
    send_json(200, $stmt->fetch());
}

if ($method === 'DELETE') {
    $stmt = $db->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if ($stmt->rowCount() === 0) {
        fail(404, 'Notificação não encontrada');
    }
    send_json(200, ['message' => 'Notificação deletada com sucesso']);
}

fail(405, 'Método não permitido');

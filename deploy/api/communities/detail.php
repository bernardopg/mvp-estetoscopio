<?php
/**
 * GET/PATCH/DELETE /api/communities/detail.php?id=  — porte de
 * src/app/api/communities/[id]/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID de comunidade inválido');
}

$stmt = $db->prepare('SELECT * FROM communities WHERE id = ?');
$stmt->execute([$id]);
$community = $stmt->fetch();

$stmt = $db->prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ?');
$stmt->execute([$id, $user['id']]);
$membership = $stmt->fetch();

if ($method === 'GET') {
    if (!$community) {
        fail(404, 'Comunidade não encontrada');
    }
    if ($community['is_private'] === 1 && !$membership) {
        fail(403, 'Acesso negado a esta comunidade privada');
    }

    send_json(200, [
        'community' => $community,
        'is_member' => $membership !== false,
        'role' => $membership ? $membership['role'] : null,
    ]);
}

if ($method === 'PATCH') {
    if (!$membership || $membership['role'] !== 'admin') {
        fail(403, 'Apenas administradores podem editar a comunidade');
    }

    $body = json_body();
    $name = $body['name'] ?? null;
    if ($name !== null) {
        if (trim($name) === '') {
            fail(400, 'Nome da comunidade não pode estar vazio');
        }
        if (mb_strlen($name) > 100) {
            fail(400, 'Nome da comunidade muito longo (máximo 100 caracteres)');
        }
    }

    $stmt = $db->prepare(
        'UPDATE communities SET name = ?, description = ?, is_private = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    $stmt->execute([
        $name !== null && trim($name) !== '' ? trim($name) : $community['name'],
        isset($body['description']) ? trim($body['description']) ?: null : null,
        array_key_exists('is_private', $body) ? (!empty($body['is_private']) ? 1 : 0) : $community['is_private'],
        array_key_exists('icon', $body) ? $body['icon'] : $community['icon'],
        array_key_exists('color', $body) ? $body['color'] : $community['color'],
        $id,
    ]);

    $stmt = $db->prepare('SELECT * FROM communities WHERE id = ?');
    $stmt->execute([$id]);
    send_json(200, ['community' => $stmt->fetch()]);
}

if ($method === 'DELETE') {
    if (!$community) {
        fail(404, 'Comunidade não encontrada');
    }
    if ((int) $community['created_by'] !== $user['id']) {
        fail(403, 'Apenas o criador pode deletar a comunidade');
    }

    $db->prepare('DELETE FROM communities WHERE id = ?')->execute([$id]);
    send_json(200, ['message' => 'Comunidade deletada com sucesso']);
}

fail(405, 'Método não permitido');

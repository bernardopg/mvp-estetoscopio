<?php
/**
 * GET/PATCH/DELETE /api/communities/members.php?id=  — porte de
 * src/app/api/communities/[id]/members/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$communityId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($communityId === false || $communityId === null) {
    fail(400, 'ID de comunidade inválido');
}

$stmt = $db->prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ?');
$stmt->execute([$communityId, $user['id']]);
$membership = $stmt->fetch();

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM communities WHERE id = ?');
    $stmt->execute([$communityId]);
    $community = $stmt->fetch();
    if (!$community) {
        fail(404, 'Comunidade não encontrada');
    }
    if ($community['is_private'] === 1 && !$membership) {
        fail(403, 'Acesso negado a esta comunidade privada');
    }

    $stmt = $db->prepare(
        'SELECT cm.*, u.name, u.email, u.profile_picture
         FROM community_members cm INNER JOIN users u ON cm.user_id = u.id
         WHERE cm.community_id = ? ORDER BY cm.role DESC, cm.joined_at ASC'
    );
    $stmt->execute([$communityId]);
    send_json(200, ['members' => $stmt->fetchAll()]);
}

if ($method === 'PATCH') {
    $body = json_body();
    $targetUserId = $body['user_id'] ?? null;
    $role = $body['role'] ?? null;

    if (!$targetUserId || !$role) {
        fail(400, 'user_id e role são obrigatórios');
    }
    if (!in_array($role, ['member', 'moderator', 'admin'], true)) {
        fail(400, 'Role inválido');
    }
    if (!$membership || $membership['role'] !== 'admin') {
        fail(403, 'Apenas administradores podem alterar papéis');
    }

    $stmt = $db->prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?');
    $stmt->execute([$communityId, $targetUserId]);
    if (!$stmt->fetch()) {
        fail(404, 'Membro não encontrado');
    }

    $db->prepare('UPDATE community_members SET role = ? WHERE community_id = ? AND user_id = ?')
        ->execute([$role, $communityId, $targetUserId]);

    send_json(200, ['message' => 'Papel do membro atualizado com sucesso']);
}

if ($method === 'DELETE') {
    $userIdToRemove = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
    if ($userIdToRemove === false || $userIdToRemove === null) {
        fail(400, 'user_id inválido');
    }

    if (!$membership || !in_array($membership['role'], ['admin', 'moderator'], true)) {
        fail(403, 'Apenas administradores e moderadores podem remover membros');
    }

    $stmt = $db->prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?');
    $stmt->execute([$communityId, $userIdToRemove]);
    if (!$stmt->fetch()) {
        fail(404, 'Membro não encontrado');
    }

    $stmt = $db->prepare('SELECT created_by FROM communities WHERE id = ?');
    $stmt->execute([$communityId]);
    $community = $stmt->fetch();
    if ($community && (int) $community['created_by'] === $userIdToRemove) {
        fail(400, 'Não é possível remover o criador da comunidade');
    }

    $db->prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?')
        ->execute([$communityId, $userIdToRemove]);
    $db->prepare('UPDATE communities SET member_count = member_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        ->execute([$communityId]);

    send_json(200, ['message' => 'Membro removido com sucesso']);
}

fail(405, 'Método não permitido');

<?php
/**
 * POST /api/communities/leave.php?id=  — porte de
 * src/app/api/communities/[id]/leave/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

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

$stmt = $db->prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?');
$stmt->execute([$communityId, $user['id']]);
if (!$stmt->fetch()) {
    fail(400, 'Você não é membro desta comunidade');
}

if ((int) $community['created_by'] === $user['id']) {
    fail(400, 'O criador não pode sair da comunidade. Delete-a se necessário.');
}

$db->prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?')
    ->execute([$communityId, $user['id']]);
$db->prepare('UPDATE communities SET member_count = member_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    ->execute([$communityId]);

send_json(200, ['message' => 'Você saiu da comunidade com sucesso']);

<?php
/**
 * GET/POST /api/communities/index.php  — porte de src/app/api/communities/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $filter = $_GET['filter'] ?? null;

    if ($filter === 'my') {
        $stmt = $db->prepare(
            'SELECT c.*, cm.role FROM communities c
             INNER JOIN community_members cm ON c.id = cm.community_id
             WHERE cm.user_id = ? ORDER BY c.updated_at DESC'
        );
        $stmt->execute([$user['id']]);
    } elseif ($filter === 'public') {
        $stmt = $db->query('SELECT * FROM communities WHERE is_private = 0 ORDER BY updated_at DESC');
    } else {
        $stmt = $db->query('SELECT * FROM communities ORDER BY updated_at DESC');
    }

    send_json(200, ['communities' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $body = json_body();
    $name = trim((string) ($body['name'] ?? ''));

    if ($name === '') {
        fail(400, 'Nome da comunidade é obrigatório');
    }
    if (mb_strlen($name) > 100) {
        fail(400, 'Nome da comunidade muito longo (máximo 100 caracteres)');
    }

    $description = isset($body['description']) ? trim((string) $body['description']) : null;

    $stmt = $db->prepare(
        'INSERT INTO communities (name, description, created_by, is_private, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $name,
        $description ?: null,
        $user['id'],
        !empty($body['is_private']) ? 1 : 0,
        $body['icon'] ?? null,
        $body['color'] ?? null,
    ]);
    $communityId = (int) $db->lastInsertId();

    $db->prepare('INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, ?)')
        ->execute([$communityId, $user['id'], 'admin']);

    $stmt = $db->prepare('SELECT * FROM communities WHERE id = ?');
    $stmt->execute([$communityId]);
    send_json(201, ['community' => $stmt->fetch()]);
}

fail(405, 'Método não permitido');

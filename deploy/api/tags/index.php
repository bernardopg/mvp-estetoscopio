<?php
/**
 * GET/POST /api/tags/index.php  — porte de src/app/api/tags/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC');
    $stmt->execute([$user['id']]);
    send_json(200, $stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_body();
    $name = trim((string) ($body['name'] ?? ''));

    if ($name === '') {
        fail(400, 'Nome da tag é obrigatório');
    }

    $stmt = $db->prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?');
    $stmt->execute([$user['id'], $name]);
    if ($stmt->fetch()) {
        fail(409, 'Tag com este nome já existe');
    }

    $stmt = $db->prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $name, $body['color'] ?? null]);
    $tagId = (int) $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?');
    $stmt->execute([$tagId, $user['id']]);
    send_json(201, $stmt->fetch());
}

fail(405, 'Método não permitido');

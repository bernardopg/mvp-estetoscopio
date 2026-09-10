<?php
/**
 * GET/POST /api/folders/index.php  — porte de src/app/api/folders/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY name ASC');
    $stmt->execute([$user['id']]);
    $folders = $stmt->fetchAll();

    $stmt = $db->prepare('SELECT id, folder_id FROM decks WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $decks = $stmt->fetchAll();

    $result = array_map(function ($folder) use ($decks) {
        $folder['deckCount'] = count(array_filter($decks, fn($d) => $d['folder_id'] == $folder['id']));
        return $folder;
    }, $folders);

    send_json(200, $result);
}

if ($method === 'POST') {
    $body = json_body();
    $name = trim((string) ($body['name'] ?? ''));
    $parentId = $body['parent_id'] ?? null;

    if ($name === '') {
        fail(400, 'Nome da pasta é obrigatório');
    }

    if ($parentId !== null) {
        $stmt = $db->prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?');
        $stmt->execute([$parentId, $user['id']]);
        if (!$stmt->fetch()) {
            fail(404, 'Pasta pai não encontrada');
        }
    }

    $stmt = $db->prepare('INSERT INTO folders (user_id, name, parent_id, color, icon) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$user['id'], $name, $parentId, $body['color'] ?? null, $body['icon'] ?? null]);
    $folderId = (int) $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?');
    $stmt->execute([$folderId, $user['id']]);
    send_json(201, $stmt->fetch());
}

fail(405, 'Método não permitido');

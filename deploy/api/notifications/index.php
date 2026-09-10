<?php
/**
 * GET/POST/DELETE /api/notifications/index.php  — porte de
 * src/app/api/notifications/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';
require __DIR__ . '/../_notifications.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $isRead = $_GET['is_read'] ?? null;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

    $query = 'SELECT * FROM notifications WHERE user_id = ?';
    $params = [$user['id']];

    if ($isRead !== null) {
        $query .= ' AND is_read = ?';
        $params[] = (int) $isRead;
    }

    $query .= ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();

    $stmt = $db->prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
    $stmt->execute([$user['id']]);
    $unreadCount = (int) $stmt->fetch()['count'];

    send_json(200, [
        'notifications' => $notifications,
        'unreadCount' => $unreadCount,
        'limit' => $limit,
        'offset' => $offset,
    ]);
}

if ($method === 'POST') {
    $body = json_body();

    if (empty($body['type']) || empty($body['title']) || empty($body['message'])) {
        fail(400, 'Campos obrigatórios: type, title, message');
    }

    $validTypes = ['deck_shared', 'comment', 'comment_reply', 'system'];
    if (!in_array($body['type'], $validTypes, true)) {
        fail(400, 'Tipo de notificação inválido');
    }

    $notificationId = create_notification([
        'user_id' => $body['user_id'] ?? $user['id'],
        'type' => $body['type'],
        'title' => $body['title'],
        'message' => $body['message'],
        'related_id' => $body['related_id'] ?? null,
        'related_type' => $body['related_type'] ?? null,
        'action_url' => $body['action_url'] ?? null,
    ]);

    $stmt = $db->prepare('SELECT * FROM notifications WHERE id = ?');
    $stmt->execute([$notificationId]);
    send_json(201, $stmt->fetch());
}

if ($method === 'DELETE') {
    $idsParam = $_GET['ids'] ?? null;
    $readOnly = ($_GET['read_only'] ?? '') === 'true';

    if ($idsParam) {
        $ids = array_map('intval', explode(',', $idsParam));
        if ($ids === []) {
            fail(400, 'IDs inválidos');
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $db->prepare("DELETE FROM notifications WHERE id IN ($placeholders) AND user_id = ?");
        $stmt->execute([...$ids, $user['id']]);

        send_json(200, ['message' => 'Notificações deletadas com sucesso', 'deleted' => $stmt->rowCount()]);
    }

    $query = 'DELETE FROM notifications WHERE user_id = ?';
    if ($readOnly) {
        $query .= ' AND is_read = 1';
    }
    $stmt = $db->prepare($query);
    $stmt->execute([$user['id']]);

    send_json(200, [
        'message' => $readOnly ? 'Notificações lidas limpas com sucesso' : 'Todas as notificações limpas com sucesso',
        'deleted' => $stmt->rowCount(),
    ]);
}

fail(405, 'Método não permitido');

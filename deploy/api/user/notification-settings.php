<?php
/**
 * GET/PUT /api/user/notification-settings.php  — porte de
 * src/app/api/user/notification-settings/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM notification_settings WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $settings = $stmt->fetch();

    if (!$settings) {
        $db->prepare(
            'INSERT INTO notification_settings (user_id, email_notifications, community_notifications, comment_notifications, deck_share_notifications, new_follower_notifications, study_reminders)
             VALUES (?, 1, 1, 1, 1, 1, 1)'
        )->execute([$user['id']]);

        $stmt = $db->prepare('SELECT * FROM notification_settings WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        send_json(200, $stmt->fetch());
    }

    send_json(200, $settings);
}

if ($method === 'PUT') {
    $body = json_body();
    $fields = [
        'emailNotifications', 'communityNotifications', 'commentNotifications',
        'deckShareNotifications', 'newFollowerNotifications', 'studyReminders',
    ];
    foreach ($fields as $field) {
        if (!array_key_exists($field, $body) || !is_bool($body[$field])) {
            fail(400, 'Dados inválidos');
        }
    }

    $emailInt = $body['emailNotifications'] ? 1 : 0;
    $communityInt = $body['communityNotifications'] ? 1 : 0;
    $commentInt = $body['commentNotifications'] ? 1 : 0;
    $deckShareInt = $body['deckShareNotifications'] ? 1 : 0;
    $newFollowerInt = $body['newFollowerNotifications'] ? 1 : 0;
    $studyRemindersInt = $body['studyReminders'] ? 1 : 0;

    $stmt = $db->prepare('SELECT id FROM notification_settings WHERE user_id = ?');
    $stmt->execute([$user['id']]);

    if ($stmt->fetch()) {
        $db->prepare(
            'UPDATE notification_settings SET
                email_notifications = ?, community_notifications = ?, comment_notifications = ?,
                deck_share_notifications = ?, new_follower_notifications = ?, study_reminders = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?'
        )->execute([$emailInt, $communityInt, $commentInt, $deckShareInt, $newFollowerInt, $studyRemindersInt, $user['id']]);
    } else {
        $db->prepare(
            'INSERT INTO notification_settings (user_id, email_notifications, community_notifications, comment_notifications, deck_share_notifications, new_follower_notifications, study_reminders)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$user['id'], $emailInt, $communityInt, $commentInt, $deckShareInt, $newFollowerInt, $studyRemindersInt]);
    }

    $stmt = $db->prepare('SELECT * FROM notification_settings WHERE user_id = ?');
    $stmt->execute([$user['id']]);

    send_json(200, ['message' => 'Configurações atualizadas com sucesso', 'settings' => $stmt->fetch()]);
}

fail(405, 'Método não permitido');

<?php
/**
 * Criação de notificações. Porte de src/lib/notifications.ts.
 */
declare(strict_types=1);

function create_notification(array $data): int {
    $stmt = get_db()->prepare(
        'INSERT INTO notifications (user_id, type, title, message, related_id, related_type, action_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $data['user_id'],
        $data['type'],
        $data['title'],
        $data['message'],
        $data['related_id'] ?? null,
        $data['related_type'] ?? null,
        $data['action_url'] ?? null,
    ]);
    return (int) get_db()->lastInsertId();
}

function notify_deck_shared(int $sharedBy, int $communityId, int $deckId, string $deckTitle, string $communityName): int {
    $stmt = get_db()->prepare('SELECT user_id FROM community_members WHERE community_id = ? AND user_id != ?');
    $stmt->execute([$communityId, $sharedBy]);
    $members = $stmt->fetchAll();

    foreach ($members as $member) {
        create_notification([
            'user_id' => $member['user_id'],
            'type' => 'deck_shared',
            'title' => 'Novo baralho compartilhado',
            'message' => "O baralho \"$deckTitle\" foi compartilhado na comunidade \"$communityName\".",
            'related_id' => $deckId,
            'related_type' => 'deck',
            'action_url' => "/comunidades/detalhe?id=$communityId",
        ]);
    }

    return count($members);
}

function notify_new_comment(int $commentedBy, int $sharedDeckId, string $deckTitle, string $comment, int $communityId): int {
    $stmt = get_db()->prepare(
        'SELECT d.user_id FROM shared_decks sd JOIN decks d ON sd.deck_id = d.id WHERE sd.id = ?'
    );
    $stmt->execute([$sharedDeckId]);
    $deckOwner = $stmt->fetch();

    if ($deckOwner && (int) $deckOwner['user_id'] !== $commentedBy) {
        $excerpt = mb_substr($comment, 0, 100) . (mb_strlen($comment) > 100 ? '...' : '');
        create_notification([
            'user_id' => $deckOwner['user_id'],
            'type' => 'comment',
            'title' => 'Novo comentário no seu baralho',
            'message' => "Alguém comentou no baralho \"$deckTitle\": \"$excerpt\"",
            'related_id' => $sharedDeckId,
            'related_type' => 'deck',
            'action_url' => "/comunidades/detalhe?id=$communityId",
        ]);
        return 1;
    }

    return 0;
}

function notify_comment_reply(int $repliedBy, int $parentCommentId, string $deckTitle, string $reply, int $communityId): int {
    $stmt = get_db()->prepare('SELECT user_id FROM deck_comments WHERE id = ?');
    $stmt->execute([$parentCommentId]);
    $parentComment = $stmt->fetch();

    if ($parentComment && (int) $parentComment['user_id'] !== $repliedBy) {
        $excerpt = mb_substr($reply, 0, 100) . (mb_strlen($reply) > 100 ? '...' : '');
        create_notification([
            'user_id' => $parentComment['user_id'],
            'type' => 'comment_reply',
            'title' => 'Nova resposta ao seu comentário',
            'message' => "Alguém respondeu ao seu comentário no baralho \"$deckTitle\": \"$excerpt\"",
            'related_id' => $parentCommentId,
            'related_type' => 'comment',
            'action_url' => "/comunidades/detalhe?id=$communityId",
        ]);
        return 1;
    }

    return 0;
}

<?php
/**
 * GET/POST /api/decks/progress.php?id=  — progresso de estudo do deck.
 * Porte de src/app/api/decks/[id]/progress/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    fail(400, 'ID inválido');
}

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM deck_progress WHERE deck_id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    $progress = $stmt->fetch();

    if (!$progress) {
        send_json(200, [
            'cards_completed' => 0,
            'total_cards' => 0,
            'average_difficulty' => 0,
            'last_studied_at' => null,
            'marked_for_review' => false,
            'completed' => false,
            'study_sessions' => 0,
        ]);
    }

    send_json(200, [
        'cards_completed' => $progress['cards_completed'],
        'total_cards' => $progress['total_cards'],
        'average_difficulty' => $progress['average_difficulty'],
        'last_studied_at' => $progress['last_studied_at'],
        'marked_for_review' => $progress['marked_for_review'] === 1,
        'completed' => $progress['completed'] === 1,
        'study_sessions' => $progress['study_sessions'],
    ]);
}

if ($method === 'POST') {
    $body = json_body();

    $stmt = $db->prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) {
        fail(404, 'Baralho não encontrado');
    }

    $stmt = $db->prepare('SELECT study_sessions FROM deck_progress WHERE deck_id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    $existing = $stmt->fetch();
    $studySessions = $existing ? ((int) $existing['study_sessions']) + 1 : 1;

    $stmt = $db->prepare(
        'INSERT INTO deck_progress (deck_id, user_id, cards_completed, total_cards, average_difficulty, last_studied_at, marked_for_review, completed, study_sessions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(deck_id, user_id) DO UPDATE SET
           cards_completed = excluded.cards_completed,
           total_cards = excluded.total_cards,
           average_difficulty = excluded.average_difficulty,
           last_studied_at = excluded.last_studied_at,
           marked_for_review = excluded.marked_for_review,
           completed = excluded.completed,
           study_sessions = excluded.study_sessions,
           updated_at = CURRENT_TIMESTAMP'
    );
    $stmt->execute([
        $id,
        $user['id'],
        $body['cards_completed'] ?? 0,
        $body['total_cards'] ?? 0,
        $body['average_difficulty'] ?? 0,
        (new DateTimeImmutable())->format('Y-m-d\TH:i:s.v\Z'),
        !empty($body['marked_for_review']) ? 1 : 0,
        !empty($body['completed']) ? 1 : 0,
        $studySessions,
    ]);

    send_json(200, ['message' => 'Progresso salvo com sucesso', 'study_sessions' => $studySessions]);
}

fail(405, 'Método não permitido');

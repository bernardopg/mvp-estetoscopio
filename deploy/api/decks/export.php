<?php
/**
 * GET /api/decks/export.php?id=  — exporta deck completo em JSON.
 * Porte de src/app/api/decks/[id]/export/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    fail(405, 'Método não permitido');
}

$deckId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($deckId === false || $deckId === null) {
    fail(400, 'ID inválido');
}

$stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$deckId, $user['id']]);
$deck = $stmt->fetch();
if (!$deck) {
    fail(404, 'Deck não encontrado');
}

$stmt = $db->prepare(
    'SELECT tags.name as tag_name, tags.color as tag_color FROM tags
     INNER JOIN deck_tags ON tags.id = deck_tags.tag_id
     WHERE deck_tags.deck_id = ? ORDER BY tags.name ASC'
);
$stmt->execute([$deckId]);
$tags = $stmt->fetchAll();

$stmt = $db->prepare('SELECT * FROM deck_progress WHERE deck_id = ? AND user_id = ?');
$stmt->execute([$deckId, $user['id']]);
$progress = $stmt->fetch();

$exportData = [
    'version' => '1.0',
    'exported_at' => (new DateTimeImmutable())->format('Y-m-d\TH:i:s.v\Z'),
    'deck' => [
        'title' => $deck['title'],
        'category' => $deck['category'],
        'color' => $deck['color'],
        'icon' => $deck['icon'],
        'is_bookmarked' => $deck['is_bookmarked'] === 1,
        'created_at' => $deck['created_at'],
        'updated_at' => $deck['updated_at'],
    ],
    'cards' => json_decode($deck['cards'], true),
    'tags' => array_map(fn($t) => ['name' => $t['tag_name'], 'color' => $t['tag_color']], $tags),
    'progress' => $progress ? [
        'cards_completed' => $progress['cards_completed'],
        'total_cards' => $progress['total_cards'],
        'average_difficulty' => $progress['average_difficulty'],
        'last_studied_at' => $progress['last_studied_at'],
        'marked_for_review' => $progress['marked_for_review'] === 1,
        'completed' => $progress['completed'] === 1,
        'study_sessions' => $progress['study_sessions'],
    ] : null,
];

$filename = strtolower((string) preg_replace('/[^a-z0-9]/i', '_', $deck['title'])) . '_' . time() . '.json';

http_response_code(200);
header('Content-Type: application/json');
header("Content-Disposition: attachment; filename=\"$filename\"");
echo json_encode($exportData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

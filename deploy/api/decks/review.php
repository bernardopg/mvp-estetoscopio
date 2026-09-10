<?php
/**
 * POST /api/decks/review.php?id=  — registra revisão de card (SM-2).
 * GET  /api/decks/review.php?id=  — estatísticas de revisão e cards devidos.
 * Porte de src/app/api/decks/[id]/review/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';
require __DIR__ . '/../_spaced_repetition.php';

$user = require_auth();
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

$deckId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($deckId === false || $deckId === null) {
    fail(400, 'ID de baralho inválido');
}

$stmt = $db->prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$deckId, $user['id']]);
if (!$stmt->fetch()) {
    fail(404, 'Baralho não encontrado');
}

if ($method === 'POST') {
    $body = json_body();
    $cardId = $body['cardId'] ?? null;
    $difficulty = $body['difficulty'] ?? null;

    if (!$cardId || !$difficulty) {
        fail(400, 'cardId e difficulty são obrigatórios');
    }
    if (!in_array($difficulty, ['again', 'hard', 'good', 'easy'], true)) {
        fail(400, 'difficulty deve ser: again, hard, good ou easy');
    }

    $stmt = $db->prepare(
        'SELECT * FROM card_reviews WHERE user_id = ? AND deck_id = ? AND card_id = ? ORDER BY review_date DESC LIMIT 1'
    );
    $stmt->execute([$user['id'], $deckId, $cardId]);
    $lastReview = $stmt->fetch() ?: null;

    $newReview = process_card_review($difficulty, $lastReview);

    $stmt = $db->prepare(
        'INSERT INTO card_reviews (user_id, deck_id, card_id, quality, ease_factor, interval, repetitions, next_review_date, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $user['id'],
        $deckId,
        $cardId,
        $newReview['quality'],
        $newReview['ease_factor'],
        $newReview['interval'],
        $newReview['repetitions'],
        substr($newReview['next_review_date'], 0, 10),
        $newReview['difficulty'],
    ]);

    send_json(200, [
        'success' => true,
        'review' => [
            'cardId' => $cardId,
            'quality' => $newReview['quality'],
            'easeFactor' => $newReview['ease_factor'],
            'interval' => $newReview['interval'],
            'repetitions' => $newReview['repetitions'],
            'nextReviewDate' => $newReview['next_review_date'],
            'difficulty' => $newReview['difficulty'],
        ],
        'message' => "Card revisado! Próxima revisão em {$newReview['interval']} " . ($newReview['interval'] === 1 ? 'dia' : 'dias'),
    ]);
}

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT cards FROM decks WHERE id = ? AND user_id = ?');
    $stmt->execute([$deckId, $user['id']]);
    $deck = $stmt->fetch();
    $totalCards = count(json_decode($deck['cards'], true) ?: []);

    $stmt = $db->prepare(
        "SELECT card_id, MIN(next_review_date) as next_review_date
         FROM card_reviews
         WHERE user_id = ? AND deck_id = ? AND next_review_date <= date('now')
         GROUP BY card_id
         ORDER BY next_review_date ASC"
    );
    $stmt->execute([$user['id'], $deckId]);
    $dueCards = $stmt->fetchAll();

    $stmt = $db->prepare(
        'SELECT
            COUNT(DISTINCT card_id) as total_cards,
            AVG(ease_factor) as avg_ease_factor,
            AVG(interval) as avg_interval,
            SUM(CASE WHEN repetitions >= 2 THEN 1 ELSE 0 END) as mature_cards,
            SUM(CASE WHEN repetitions = 1 THEN 1 ELSE 0 END) as young_cards,
            SUM(CASE WHEN repetitions = 0 THEN 1 ELSE 0 END) as new_cards
         FROM (
            SELECT * FROM card_reviews
            WHERE user_id = ? AND deck_id = ?
            AND id IN (
                SELECT MAX(id) FROM card_reviews
                WHERE user_id = ? AND deck_id = ?
                GROUP BY card_id
            )
         )'
    );
    $stmt->execute([$user['id'], $deckId, $user['id'], $deckId]);
    $stats = $stmt->fetch();

    $reviewedCardsCount = (int) ($stats['total_cards'] ?? 0);
    $newCardsCount = $totalCards - $reviewedCardsCount;

    send_json(200, [
        'deckId' => $deckId,
        'totalCards' => $totalCards,
        'dueCards' => [
            'count' => count($dueCards),
            'cards' => array_column($dueCards, 'card_id'),
        ],
        'stats' => [
            'reviewed' => $reviewedCardsCount,
            'new' => $newCardsCount,
            'mature' => (int) ($stats['mature_cards'] ?? 0),
            'young' => (int) ($stats['young_cards'] ?? 0),
            'avgEaseFactor' => $stats['avg_ease_factor'] ? round((float) $stats['avg_ease_factor'], 2) : 2.5,
            'avgInterval' => (int) round((float) ($stats['avg_interval'] ?? 0)),
        ],
    ]);
}

fail(405, 'Método não permitido');

<?php
/**
 * GET /api/dashboard/index.php  — porte de src/app/api/dashboard/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    fail(405, 'Método não permitido');
}

$user = require_auth();
$db = get_db();
$userId = $user['id'];

$stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$dbUser = $stmt->fetch();
if (!$dbUser) {
    fail(404, 'Usuário não encontrado');
}

$stmt = $db->prepare('SELECT COUNT(*) as count FROM decks WHERE user_id = ?');
$stmt->execute([$userId]);
$deckCount = (int) $stmt->fetch()['count'];

$stmt = $db->prepare('SELECT id, title, cards FROM decks WHERE user_id = ?');
$stmt->execute([$userId]);
$allDecksInfo = $stmt->fetchAll();

$totalCards = 0;
$largestDeck = null;
$maxCards = 0;
foreach ($allDecksInfo as $deck) {
    $cards = json_decode($deck['cards'], true);
    if (!is_array($cards)) {
        continue;
    }
    $totalCards += count($cards);
    if (count($cards) > $maxCards) {
        $maxCards = count($cards);
        $largestDeck = ['id' => $deck['id'], 'title' => $deck['title'], 'cardCount' => count($cards)];
    }
}

$stmt = $db->prepare('SELECT id, title, created_at, updated_at FROM decks WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5');
$stmt->execute([$userId]);
$recentDecks = $stmt->fetchAll();

$accountAge = 0;
try {
    $createdDate = new DateTimeImmutable(str_replace(' ', 'T', $dbUser['created_at']));
    $accountAge = max(0, (new DateTimeImmutable())->diff($createdDate)->days);
} catch (Exception $e) {
    $accountAge = 0;
}

$today = (new DateTimeImmutable())->format('Y-m-d');
$weekAgo = (new DateTimeImmutable('-7 days'))->format('Y-m-d');

$stmt = $db->prepare('SELECT * FROM study_sessions WHERE user_id = ? AND session_date >= ? ORDER BY session_date DESC');
$stmt->execute([$userId, $weekAgo]);
$studySessions = $stmt->fetchAll();

$cardsStudiedToday = array_sum(array_map(
    fn($s) => $s['session_date'] === $today ? (int) $s['cards_studied'] : 0,
    $studySessions
));
$cardsStudiedWeek = array_sum(array_column($studySessions, 'cards_studied'));

$stmt = $db->prepare('SELECT DISTINCT session_date FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC');
$stmt->execute([$userId]);
$uniqueDates = array_column($stmt->fetchAll(), 'session_date');

$streak = 0;
$currentTs = (new DateTimeImmutable('today'))->getTimestamp();
foreach ($uniqueDates as $dateStr) {
    $sessionTs = (new DateTimeImmutable($dateStr))->setTime(0, 0, 0)->getTimestamp();
    $diffDays = (int) round(($currentTs - $sessionTs) / 86400);
    if ($diffDays === $streak) {
        $streak++;
        $currentTs = $sessionTs;
    } elseif ($diffDays > $streak) {
        break;
    }
}

$stmt = $db->prepare("SELECT COUNT(DISTINCT card_id) as count FROM card_reviews WHERE user_id = ? AND next_review_date <= date('now')");
$stmt->execute([$userId]);
$cardsDueToday = (int) ($stmt->fetch()['count'] ?? 0);

$stmt = $db->prepare(
    'SELECT
        COUNT(DISTINCT card_id) as total_reviewed,
        SUM(CASE WHEN repetitions >= 2 THEN 1 ELSE 0 END) as mature_cards,
        SUM(CASE WHEN repetitions = 1 THEN 1 ELSE 0 END) as young_cards
     FROM (
        SELECT card_id, repetitions FROM card_reviews
        WHERE user_id = ?
        AND id IN (
            SELECT MAX(id) FROM card_reviews WHERE user_id = ? GROUP BY card_id
        )
     )'
);
$stmt->execute([$userId, $userId]);
$reviewStats = $stmt->fetch();
$totalReviewed = (int) ($reviewStats['total_reviewed'] ?? 0);

send_json(200, [
    'user' => [
        'name' => $dbUser['name'],
        'email' => $dbUser['email'],
        'accountAge' => $accountAge,
    ],
    'stats' => [
        'totalDecks' => $deckCount,
        'totalCards' => $totalCards,
        'averageCardsPerDeck' => $deckCount > 0 ? (int) round($totalCards / $deckCount) : 0,
        'largestDeck' => $largestDeck,
        'cardsStudiedToday' => $cardsStudiedToday,
        'cardsStudiedWeek' => $cardsStudiedWeek,
        'streak' => $streak,
        'cardsDueToday' => $cardsDueToday,
        'totalReviewed' => $totalReviewed,
        'matureCards' => (int) ($reviewStats['mature_cards'] ?? 0),
        'youngCards' => (int) ($reviewStats['young_cards'] ?? 0),
        'newCards' => $totalCards - $totalReviewed,
    ],
    'recentDecks' => $recentDecks,
]);

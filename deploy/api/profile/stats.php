<?php
/**
 * GET /api/profile/stats.php  — porte de src/app/api/profile/stats/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    fail(405, 'Método não permitido');
}

$user = require_auth();
$db = get_db();
$userId = $user['id'];

$stmt = $db->prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC');
$stmt->execute([$userId]);
$decks = $stmt->fetchAll();

$totalFlashcards = 0;
$cardsWithProgress = 0;
foreach ($decks as $deck) {
    $cards = json_decode($deck['cards'], true);
    if (!is_array($cards)) {
        continue;
    }
    $totalFlashcards += count($cards);
    $cardsWithProgress += count(array_filter($cards, fn($c) => !empty($c['progress'])));
}

$stmt = $db->prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC');
$stmt->execute([$userId]);
$allSessions = $stmt->fetchAll();

$today = (new DateTimeImmutable())->format('Y-m-d');
$weekAgo = (new DateTimeImmutable('-7 days'))->format('Y-m-d');
$monthAgo = (new DateTimeImmutable('-30 days'))->format('Y-m-d');

$sessionsToday = array_values(array_filter($allSessions, fn($s) => $s['session_date'] === $today));
$sessionsWeek = array_values(array_filter($allSessions, fn($s) => $s['session_date'] >= $weekAgo));
$sessionsMonth = array_values(array_filter($allSessions, fn($s) => $s['session_date'] >= $monthAgo));

$cardsStudiedToday = array_sum(array_column($sessionsToday, 'cards_studied'));
$cardsStudiedWeek = array_sum(array_column($sessionsWeek, 'cards_studied'));
$cardsStudiedMonth = array_sum(array_column($sessionsMonth, 'cards_studied'));

$uniqueDates = array_values(array_unique(array_column($allSessions, 'session_date')));
rsort($uniqueDates);

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

$totalDifficulty = [
    'again' => array_sum(array_column($allSessions, 'cards_again')),
    'hard' => array_sum(array_column($allSessions, 'cards_hard')),
    'good' => array_sum(array_column($allSessions, 'cards_good')),
    'easy' => array_sum(array_column($allSessions, 'cards_easy')),
];

$totalTimeSpent = array_sum(array_column($allSessions, 'time_spent'));
$averageStudyTime = count($allSessions) > 0 ? $totalTimeSpent / count($allSessions) / 60 : 0;

$weeklyData = [];
$weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
for ($i = 6; $i >= 0; $i--) {
    $date = new DateTimeImmutable("-$i days");
    $dateStr = $date->format('Y-m-d');
    $daySessions = array_values(array_filter($allSessions, fn($s) => $s['session_date'] === $dateStr));

    $weeklyData[] = [
        'date' => $dateStr,
        'day' => $weekdayNames[(int) $date->format('w')],
        'cardsStudied' => array_sum(array_column($daySessions, 'cards_studied')),
        'timeSpent' => (int) round(array_sum(array_column($daySessions, 'time_spent')) / 60),
    ];
}

$retentionRate = $totalFlashcards > 0 ? (int) round(($cardsWithProgress / $totalFlashcards) * 100) : 0;

send_json(200, [
    'overview' => [
        'totalDecks' => count($decks),
        'totalFlashcards' => $totalFlashcards,
        'cardsStudiedToday' => $cardsStudiedToday,
        'cardsStudiedWeek' => $cardsStudiedWeek,
        'cardsStudiedMonth' => $cardsStudiedMonth,
        'streak' => $streak,
        'retentionRate' => $retentionRate,
    ],
    'difficulty' => $totalDifficulty,
    'performance' => [
        'averageStudyTime' => (int) round($averageStudyTime),
        'totalStudySessions' => count($allSessions),
        'totalTimeSpent' => (int) round($totalTimeSpent / 60),
    ],
    'weeklyData' => $weeklyData,
]);

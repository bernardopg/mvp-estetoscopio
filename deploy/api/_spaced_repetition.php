<?php
/**
 * Algoritmo SM-2 (SuperMemo 2). Porte de src/lib/spaced-repetition.ts.
 *
 * Referência:
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */
declare(strict_types=1);

const DIFFICULTY_QUALITY = [
    'again' => 0,
    'hard' => 2,
    'good' => 4,
    'easy' => 5,
];

function difficulty_to_quality(string $difficulty): int {
    if (!array_key_exists($difficulty, DIFFICULTY_QUALITY)) {
        throw new ApiError("Dificuldade inválida: $difficulty");
    }
    return DIFFICULTY_QUALITY[$difficulty];
}

/**
 * @return array{easeFactor:float,interval:int,repetitions:int,nextReviewDate:string}
 */
function calculate_sm2(int $quality, int $repetitions, float $easeFactor, int $interval): array {
    $newEaseFactor = $easeFactor + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02));
    if ($newEaseFactor < 1.3) {
        $newEaseFactor = 1.3;
    }

    $newRepetitions = $repetitions;
    $newInterval = $interval;

    if ($quality < 3) {
        $newRepetitions = 0;
        $newInterval = 1;
    } else {
        $newRepetitions += 1;
        if ($newRepetitions === 1) {
            $newInterval = 1;
        } elseif ($newRepetitions === 2) {
            $newInterval = 6;
        } else {
            $newInterval = (int) round($interval * $newEaseFactor);
        }
    }

    $nextReviewDate = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $nextReviewDate = $nextReviewDate->modify("+$newInterval day");

    return [
        'easeFactor' => round($newEaseFactor, 2),
        'interval' => $newInterval,
        'repetitions' => $newRepetitions,
        'nextReviewDate' => $nextReviewDate->format('Y-m-d\TH:i:s.v\Z'),
    ];
}

/**
 * Processa a revisão de um card e devolve o registro pronto para gravar
 * em card_reviews. $lastReview é a última linha de card_reviews, ou null
 * se o card nunca foi revisado.
 *
 * @param ?array{ease_factor:float,interval:int,repetitions:int} $lastReview
 * @return array{quality:int,ease_factor:float,interval:int,repetitions:int,next_review_date:string,difficulty:string}
 */
function process_card_review(string $difficulty, ?array $lastReview): array {
    $quality = difficulty_to_quality($difficulty);

    $easeFactor = $lastReview['ease_factor'] ?? 2.5;
    $interval = $lastReview['interval'] ?? 0;
    $repetitions = $lastReview['repetitions'] ?? 0;

    $result = calculate_sm2($quality, (int) $repetitions, (float) $easeFactor, (int) $interval);

    return [
        'quality' => $quality,
        'ease_factor' => $result['easeFactor'],
        'interval' => $result['interval'],
        'repetitions' => $result['repetitions'],
        'next_review_date' => $result['nextReviewDate'],
        'difficulty' => $difficulty,
    ];
}

function calculate_review_stats(array $reviews): array {
    if (count($reviews) === 0) {
        return [
            'totalReviews' => 0,
            'averageEaseFactor' => 2.5,
            'averageInterval' => 0,
            'matureCards' => 0,
            'youngCards' => 0,
            'newCards' => 0,
        ];
    }

    $totalEaseFactor = array_sum(array_column($reviews, 'ease_factor'));
    $totalInterval = array_sum(array_column($reviews, 'interval'));
    $matureCards = count(array_filter($reviews, fn($r) => $r['repetitions'] >= 2));
    $youngCards = count(array_filter($reviews, fn($r) => $r['repetitions'] === 1));
    $newCards = count(array_filter($reviews, fn($r) => $r['repetitions'] === 0));

    return [
        'totalReviews' => count($reviews),
        'averageEaseFactor' => round($totalEaseFactor / count($reviews), 2),
        'averageInterval' => (int) round($totalInterval / count($reviews)),
        'matureCards' => $matureCards,
        'youngCards' => $youngCards,
        'newCards' => $newCards,
    ];
}

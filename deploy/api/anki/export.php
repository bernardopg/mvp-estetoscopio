<?php
/**
 * POST /api/anki/export.php  — exporta cards selecionados em .apkg (formato
 * JSON+ZIP próprio, não o binário SQLite real do Anki). Porte de
 * src/app/api/anki/export/route.ts + src/lib/anki-export.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

$body = json_body();
$deckId = $body['deckId'] ?? null;
$flashcardIds = $body['flashcardIds'] ?? null;

if (!$deckId || !is_array($flashcardIds) || count($flashcardIds) === 0) {
    fail(400, 'Deck ID e flashcard IDs são obrigatórios');
}

$stmt = $db->prepare('SELECT id, title, cards FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$deckId, $user['id']]);
$deck = $stmt->fetch();
if (!$deck) {
    fail(404, 'Deck não encontrado');
}

$allCards = json_decode($deck['cards'], true) ?: [];

$selectedCards = [];
foreach ($allCards as $index => $card) {
    $cardId = $card['id'] ?? (string) $index;
    if (in_array($cardId, $flashcardIds, true)) {
        $selectedCards[] = $card;
    }
}

if ($selectedCards === []) {
    fail(404, 'Nenhum flashcard encontrado com os IDs fornecidos');
}

function anki_side_content(array $side): string {
    $content = $side['content'] ?? '';
    $text = $side['text'] ?? null;
    $extra = $text ? "<br><br>$text" : '';

    return match ($side['type'] ?? 'text') {
        'image' => "<img src=\"$content\" />$extra",
        'audio' => "[sound:$content]$extra",
        default => $content,
    };
}

$flashcardsForExport = [];
foreach ($selectedCards as $index => $card) {
    $flashcardsForExport[] = [
        'front' => anki_side_content($card['frente'] ?? []),
        'back' => anki_side_content($card['verso'] ?? []),
        'tags' => ['exportado'],
    ];
}

function generate_guid(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$collectionData = [
    'creator' => 'MVP Estetoscópio',
    'version' => '2.1',
    'deck_name' => $deck['title'],
    'decks' => [['id' => 1, 'name' => $deck['title'], 'mid' => '1']],
    'models' => [
        '1' => [
            'kind' => 'notetype',
            'name' => 'Basic',
            'flds' => [['name' => 'Front', 'ord' => 0], ['name' => 'Back', 'ord' => 1]],
            'css' => ".card {\n  font-family: Arial;\n  font-size: 20px;\n  text-align: center;\n}",
        ],
    ],
    'config' => ['collapse_time' => 0],
];

$notes = array_map(fn($card) => [
    'guid' => generate_guid(),
    'model' => '1',
    'data' => [
        'version' => '2.1',
        'fields' => ['Front' => $card['front'], 'Back' => $card['back']],
        'tags' => $card['tags'],
    ],
], $flashcardsForExport);

$tmpFile = tempnam(sys_get_temp_dir(), 'apkg_');
$zip = new ZipArchive();
$zip->open($tmpFile, ZipArchive::OVERWRITE);
$zip->addFromString('collection.anki2', json_encode($collectionData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
$zip->addFromString('notes.json', json_encode($notes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
$zip->close();

$safeFileName = strtolower(str_replace(' ', '_', preg_replace('/[^a-zA-Z0-9\s-]/', '', $deck['title'])));
$filename = ($safeFileName !== '' ? $safeFileName : "deck_$deckId") . '.apkg';

http_response_code(200);
header('Content-Type: application/zip');
header("Content-Disposition: attachment; filename=\"$filename\"");
header('Content-Length: ' . filesize($tmpFile));
readfile($tmpFile);
unlink($tmpFile);

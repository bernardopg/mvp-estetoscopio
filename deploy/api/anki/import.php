<?php
/**
 * POST /api/anki/import.php  — importa .apkg (formato JSON+ZIP próprio).
 * Porte de src/app/api/anki/import/route.ts + src/lib/anki.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

if (empty($_FILES['file'])) {
    fail(400, 'Nenhum arquivo enviado');
}

$file = $_FILES['file'];
if (!str_ends_with($file['name'], '.apkg')) {
    fail(400, 'Apenas arquivos .apkg são suportados');
}

$zip = new ZipArchive();
if ($zip->open($file['tmp_name']) !== true) {
    fail(400, 'Arquivo .apkg inválido');
}

$collectionRaw = $zip->getFromName('collection.anki2');
if ($collectionRaw === false) {
    $zip->close();
    fail(400, 'Arquivo .apkg inválido: collection.anki2 não encontrado');
}

$collection = json_decode($collectionRaw, true);
if (!is_array($collection)) {
    $zip->close();
    fail(400, 'Arquivo .apkg inválido: collection.anki2 corrompido');
}

$deckName = $collection['decks'][0]['name'] ?? 'Deck Importado';

$notes = [];
for ($i = 0; $i < $zip->numFiles; $i++) {
    $entryName = $zip->getNameIndex($i);
    if ($entryName === 'collection.anki2' || str_ends_with($entryName, '.anki2')) {
        continue;
    }

    $content = $zip->getFromIndex($i);
    $decoded = json_decode((string) $content, true);
    if (!is_array($decoded) || !array_is_list($decoded)) {
        continue;
    }

    foreach ($decoded as $note) {
        if (isset($note['data'])) {
            $notes[] = $note;
        }
    }
}
$zip->close();

$flashcards = [];
foreach ($notes as $note) {
    $fields = $note['data']['fields'] ?? [];
    $frontKey = null;
    $backKey = null;
    foreach (array_keys($fields) as $key) {
        $lower = mb_strtolower($key);
        if ($frontKey === null && (str_contains($lower, 'front') || str_contains($lower, 'frente'))) {
            $frontKey = $key;
        }
        if ($backKey === null && (str_contains($lower, 'back') || str_contains($lower, 'verso'))) {
            $backKey = $key;
        }
    }
    if ($frontKey === null || $backKey === null) {
        foreach (array_keys($fields) as $key) {
            $lower = mb_strtolower($key);
            if ($frontKey === null && (str_contains($lower, 'pergunta') || str_contains($lower, 'question'))) {
                $frontKey = $key;
            }
            if ($backKey === null && (str_contains($lower, 'resposta') || str_contains($lower, 'answer'))) {
                $backKey = $key;
            }
        }
    }

    if ($frontKey !== null && $backKey !== null) {
        $flashcards[] = [
            'front' => $fields[$frontKey],
            'back' => $fields[$backKey],
            'tags' => $note['data']['tags'] ?? [],
        ];
    }
}

if ($flashcards === []) {
    fail(422, 'Nenhuma flashcard compatível encontrada. Verifique se as notas possuem campos Front/Back (ou Frente/Verso).');
}

send_json(200, [
    'success' => true,
    'data' => [
        'deck' => $deckName,
        'flashcards' => $flashcards,
        'total' => count($flashcards),
    ],
]);

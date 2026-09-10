<?php
/**
 * POST /api/decks/import.php  — importa deck de JSON exportado.
 * Porte de src/app/api/decks/import/route.ts.
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

function validate_import_data(array $data): array {
    $deck = $data['deck'] ?? null;
    if (!is_array($deck)) {
        throw new ApiError('Dados do deck são obrigatórios');
    }
    if (empty($deck['title']) || !is_string($deck['title'])) {
        throw new ApiError('Título do deck é obrigatório');
    }

    $cards = $data['cards'] ?? null;
    if (!is_array($cards) || count($cards) === 0) {
        throw new ApiError('O deck deve conter pelo menos um card');
    }

    foreach ($cards as $card) {
        if (empty($card['id']) || empty($card['front']) || empty($card['back'])) {
            throw new ApiError('Card com estrutura inválida');
        }
        $frontType = $card['front']['type'] ?? null;
        $backType = $card['back']['type'] ?? null;
        if (!in_array($frontType, ['text', 'image', 'audio'], true) || !in_array($backType, ['text', 'image', 'audio'], true)) {
            throw new ApiError('Tipo de card inválido');
        }
        if (empty($card['front']['content']) || empty($card['back']['content'])) {
            throw new ApiError('Card sem conteúdo');
        }
    }

    return $data;
}

$body = json_body();

try {
    $importData = validate_import_data($body);
} catch (ApiError $e) {
    fail(400, $e->getMessage());
}

$stmt = $db->prepare('INSERT INTO decks (user_id, title, cards, category, folder_id, color, icon, is_bookmarked) VALUES (?, ?, ?, NULL, NULL, NULL, NULL, 0)');
$stmt->execute([$user['id'], $importData['deck']['title'], json_encode($importData['cards'], JSON_UNESCAPED_UNICODE)]);
$deckId = (int) $db->lastInsertId();

$updates = [];
$params = [];
if (!empty($importData['deck']['color'])) {
    $updates[] = 'color = ?';
    $params[] = $importData['deck']['color'];
}
if (!empty($importData['deck']['icon'])) {
    $updates[] = 'icon = ?';
    $params[] = $importData['deck']['icon'];
}
if (!empty($importData['deck']['is_bookmarked'])) {
    $updates[] = 'is_bookmarked = ?';
    $params[] = 1;
}
if ($updates !== []) {
    $params[] = $deckId;
    $db->prepare('UPDATE decks SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);
}

if (!empty($importData['tags']) && is_array($importData['tags'])) {
    $getTag = $db->prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?');
    $createTag = $db->prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)');
    $linkTag = $db->prepare('INSERT INTO deck_tags (deck_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING');

    foreach ($importData['tags'] as $tag) {
        $getTag->execute([$user['id'], $tag['name']]);
        $existing = $getTag->fetch();

        if ($existing) {
            $tagId = (int) $existing['id'];
        } else {
            $createTag->execute([$user['id'], $tag['name'], $tag['color'] ?? null]);
            $tagId = (int) $db->lastInsertId();
        }

        $linkTag->execute([$deckId, $tagId]);
    }
}

$stmt = $db->prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?');
$stmt->execute([$deckId, $user['id']]);

send_json(201, ['message' => 'Deck importado com sucesso', 'deck' => $stmt->fetch()]);

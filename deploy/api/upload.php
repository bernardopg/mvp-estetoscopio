<?php
/**
 * POST /api/upload.php  — porte de src/app/api/upload/route.ts (mídia de cards).
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

$user = require_auth();
$db = get_db();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Método não permitido');
}

if (empty($_FILES['file'])) {
    fail(400, 'Nenhum arquivo enviado');
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    fail(400, 'Erro ao enviar arquivo');
}

if ($file['size'] > MAX_FILE_SIZE) {
    fail(400, 'Arquivo muito grande. Tamanho máximo: 10MB');
}

$validTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $validTypes, true)) {
    fail(400, 'Tipo de arquivo não suportado');
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = ((int) (microtime(true) * 1000)) . ($ext !== '' ? ".$ext" : '');

$uploadsDir = __DIR__ . '/../uploads';
@mkdir($uploadsDir, 0770, true);
$filepath = "$uploadsDir/$filename";

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    fail(500, 'Erro ao salvar arquivo');
}

$publicPath = "/uploads/$filename";

$stmt = $db->prepare('INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$filename, $file['name'], $mimeType, $file['size'], $publicPath]);

send_json(200, [
    'id' => (int) $db->lastInsertId(),
    'filename' => $filename,
    'originalName' => $file['name'],
    'mimeType' => $mimeType,
    'size' => $file['size'],
    'url' => $publicPath,
]);

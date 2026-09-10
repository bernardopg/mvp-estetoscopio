<?php
/**
 * Usado pelo AuthGate no client pra saber se a sessão do hub está ativa.
 * Delega inteiramente pro hub (ver optional_hub_user em ../_lib.php).
 */
declare(strict_types=1);
require __DIR__ . '/../_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    fail(405, 'Método não permitido');
}

$user = optional_hub_user();
if ($user === null) {
    fail(401, 'Não autorizado');
}

send_json(200, ['user' => $user]);

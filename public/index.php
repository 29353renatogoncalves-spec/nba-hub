<?php

// Ativar visualização de erros para diagnosticar o erro 500
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

try {
    if (!file_exists(__DIR__.'/../vendor/autoload.php')) {
        throw new Exception("A pasta 'vendor' não foi encontrada ou está incompleta em: " . dirname(__DIR__) . "/vendor");
    }

    require __DIR__.'/../vendor/autoload.php';

    $app = require_once __DIR__.'/../bootstrap/app.php';

    $kernel = $app->make(Kernel::class);

    $response = $kernel->handle(
        $request = Request::capture()
    )->send();

    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    http_response_code(200); // Força HTTP 200 para o servidor não substituir pelo ecrã de 500
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Diagnóstico de Erro NBA Hub</title></head>';
    echo '<body style="background:#0f172a;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;padding:30px;line-height:1.6;">';
    echo '<div style="max-width:900px;margin:0 auto;background:#1e293b;border-radius:12px;padding:30px;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid #334155;">';
    echo '<h1 style="color:#f87171;margin-top:0;display:flex;align-items:center;gap:10px;">⚠️ Erro Detetado no Servidor</h1>';
    echo '<div style="background:#ef444420;border-left:4px solid #ef4444;padding:15px;margin:20px 0;border-radius:4px;">';
    echo '<h3 style="margin:0 0 5px 0;color:#fca5a5;">Mensagem do Erro:</h3>';
    echo '<div style="font-size:16px;font-weight:bold;color:#fff;">' . htmlspecialchars($e->getMessage()) . '</div>';
    echo '</div>';
    echo '<p style="color:#94a3b8;"><b>Ficheiro:</b> <code>' . htmlspecialchars($e->getFile()) . '</code> na linha <b>' . $e->getLine() . '</b></p>';
    echo '<details style="margin-top:20px;">';
    echo '<summary style="cursor:pointer;color:#38bdf8;font-weight:bold;">Ver Rastreio Completo (Stack Trace)</summary>';
    echo '<pre style="background:#090d16;color:#e2e8f0;padding:15px;border-radius:8px;overflow-x:auto;font-size:13px;margin-top:10px;">' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
    echo '</details>';
    echo '</div></body></html>';
    exit;
}

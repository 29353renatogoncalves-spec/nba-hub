<?php
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$results = [];

// 1. Versão do PHP
$phpVersion = phpversion();
$phpOk = version_compare($phpVersion, '8.1.0', '>=');
$results[] = [
    'title' => 'Versão do PHP',
    'status' => $phpOk,
    'detail' => "PHP {$phpVersion} detetado. (Requisito Laravel 10: PHP >= 8.1)",
    'fix' => $phpOk ? null : 'No cPanel do InfinityFree, clica em "Select PHP Version" e escolhe PHP 8.2.'
];

// 2. Ficheiro .env
$baseDir = dirname(__DIR__);
$envPath = $baseDir . '/.env';
$envExists = file_exists($envPath);
$results[] = [
    'title' => 'Ficheiro .env',
    'status' => $envExists,
    'detail' => $envExists ? "Encontrado em {$envPath}" : "Ficheiro .env não encontrado na raiz ({$baseDir})",
    'fix' => $envExists ? null : 'Cria o ficheiro .env na pasta raiz do teu projeto com as configurações da base de dados.'
];

// 3. Permissões de Storage
$storagePaths = [
    $baseDir . '/storage/framework/views',
    $baseDir . '/storage/framework/sessions',
    $baseDir . '/storage/framework/cache',
    $baseDir . '/storage/logs',
    $baseDir . '/bootstrap/cache',
];

$storageOk = true;
$storageDetails = [];
foreach ($storagePaths as $p) {
    if (!is_dir($p)) {
        @mkdir($p, 0777, true);
    }
    $writable = is_writable($p);
    $rel = str_replace($baseDir, '', $p);
    $storageDetails[] = "{$rel}: " . ($writable ? "OK (Gravável)" : "ERRO (Sem permissão de escrita)");
    if (!$writable) $storageOk = false;
}

$results[] = [
    'title' => 'Pastas de Storage e Cache',
    'status' => $storageOk,
    'detail' => implode('<br>', $storageDetails),
    'fix' => $storageOk ? null : 'No File Manager, clica com botão direito nas pastas storage e bootstrap/cache e define permissões 775 ou 777.'
];

// 4. Pasta Vendor / Autoload
$vendorAutoload = $baseDir . '/vendor/autoload.php';
$vendorOk = file_exists($vendorAutoload);
$results[] = [
    'title' => 'Dependências do Composer (vendor)',
    'status' => $vendorOk,
    'detail' => $vendorOk ? 'vendor/autoload.php presente' : 'vendor/autoload.php NÃO encontrado',
    'fix' => $vendorOk ? null : 'Faz o upload da pasta vendor completa para o servidor.'
];

// 5. Conexão à Base de Dados
$dbOk = false;
$dbDetail = '';
$dbFix = null;

if ($envExists) {
    $envContent = file_get_contents($envPath);
    preg_match('/DB_HOST=(.*)/', $envContent, $mHost);
    preg_match('/DB_DATABASE=(.*)/', $envContent, $mDb);
    preg_match('/DB_USERNAME=(.*)/', $envContent, $mUser);
    preg_match('/DB_PASSWORD=(.*)/', $envContent, $mPass);

    $dbHost = isset($mHost[1]) ? trim($mHost[1], " \t\n\r\0\x0B\"'") : 'localhost';
    $dbName = isset($mDb[1]) ? trim($mDb[1], " \t\n\r\0\x0B\"'") : '';
    $dbUser = isset($mUser[1]) ? trim($mUser[1], " \t\n\r\0\x0B\"'") : '';
    $dbPass = isset($mPass[1]) ? trim($mPass[1], " \t\n\r\0\x0B\"'") : '';

    if ($dbHost === 'localhost' || $dbHost === '127.0.0.1') {
        $dbDetail = "ATENÇÃO: DB_HOST está configurado como 'localhost'. No InfinityFree tens de usar 'sql310.infinityfree.com'.";
        $dbFix = 'Edita o ficheiro .env e coloca: DB_HOST=sql310.infinityfree.com';
    } else {
        try {
            $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5
            ]);
            
            // Contar tabelas
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            $tableCount = count($tables);
            
            if ($tableCount === 0) {
                $dbDetail = "Ligação com sucesso ao MySQL, mas a base de dados '{$dbName}' está VAZIA (0 tabelas)!";
                $dbFix = 'Abre o phpMyAdmin no cPanel do InfinityFree, escolhe a base de dados ' . $dbName . ', clica em "Importar" e envia o ficheiro nba_league_manager_pro.sql.';
            } else {
                $hasEpocas = in_array('epocas', $tables);
                if ($hasEpocas) {
                    $dbOk = true;
                    $dbDetail = "Ligação estabelecida! {$tableCount} tabelas encontradas (incluindo 'epocas' e 'jogos').";
                } else {
                    $dbDetail = "Ligação estabelecida ({$tableCount} tabelas), mas a tabela crucial 'epocas' não existe.";
                    $dbFix = 'Importa o ficheiro nba_league_manager_pro.sql no phpMyAdmin.';
                }
            }
        } catch (\PDOException $ex) {
            $dbDetail = "Erro ao ligar ao MySQL: " . $ex->getMessage();
            $dbFix = 'Verifica no ficheiro .env se DB_HOST=sql310.infinityfree.com, DB_DATABASE=if0_43372296_NBA, DB_USERNAME=if0_43372296 e a tua senha estão corretos.';
        }
    }
} else {
    $dbDetail = "Não foi possível testar porque o .env não existe.";
}

$results[] = [
    'title' => 'Base de Dados MySQL & Tabelas',
    'status' => $dbOk,
    'detail' => $dbDetail,
    'fix' => $dbFix
];

?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico InfinityFree - NBA Hub</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 30px; margin: 0; }
        .container { max-width: 850px; margin: 0 auto; background: #131c2e; border-radius: 12px; padding: 30px; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin-top: 0; border-bottom: 2px solid #1e293b; padding-bottom: 15px; }
        .item { padding: 18px; margin: 15px 0; border-radius: 8px; border: 1px solid; }
        .item.ok { background: #064e3b20; border-color: #059669; }
        .item.fail { background: #7f1d1d20; border-color: #dc2626; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 13px; text-transform: uppercase; }
        .badge.ok { background: #059669; color: #fff; }
        .badge.fail { background: #dc2626; color: #fff; }
        .title { font-size: 18px; font-weight: bold; margin-left: 10px; }
        .detail { margin: 10px 0 5px 0; font-size: 14px; color: #cbd5e1; }
        .fix { background: #1e293b; border-left: 4px solid #f59e0b; padding: 10px; margin-top: 10px; font-size: 13px; color: #fef08a; border-radius: 0 4px 4px 0; }
        .btn-refresh { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; transition: 0.2s; }
        .btn-refresh:hover { background: #1d4ed8; }
    </style>
</head>
<body>
<div class="container">
    <h1>🩺 Diagnóstico do Servidor InfinityFree</h1>
    <p style="color: #94a3b8;">Verificação automática dos componentes necessários para o <b>NBA Hub</b> funcionar:</p>

    <?php foreach ($results as $r): ?>
        <div class="item <?= $r['status'] ? 'ok' : 'fail' ?>">
            <div>
                <span class="badge <?= $r['status'] ? 'ok' : 'fail' ?>"><?= $r['status'] ? '✔ PASSOU' : '✖ FALHOU' ?></span>
                <span class="title"><?= htmlspecialchars($r['title']) ?></span>
            </div>
            <div class="detail"><?= $r['detail'] ?></div>
            <?php if (!$r['status'] && $r['fix']): ?>
                <div class="fix"><b>👉 Como resolver:</b> <?= $r['fix'] ?></div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>

    <div style="text-align: center; margin-top: 30px;">
        <a href="javascript:location.reload()" class="btn-refresh">🔄 Recarregar Diagnóstico</a>
    </div>
</div>
</body>
</html>

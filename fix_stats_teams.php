<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Jogador;
use App\Models\ContratoJogador;
use Illuminate\Support\Facades\DB;

// Fix equipa_id in estatisticas_jogador_epoca for season 5 to match active contract
$contracts = ContratoJogador::where('ativo', 1)->get()->keyBy('jogador_id');
$updated = 0;
foreach ($contracts as $jId => $c) {
    $affected = DB::table('estatisticas_jogador_epoca')
        ->where('epoca_id', 5)
        ->where('jogador_id', $jId)
        ->update(['equipa_id' => $c->equipa_id]);
    if ($affected) $updated += $affected;
}

echo "Updated $updated player stats with their correct 2026/27 team.\n";

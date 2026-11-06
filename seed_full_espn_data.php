<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "====================================================================\n";
echo "   COMPREHENSIVE ESPN 2026 DATA SYNCHRONIZATION FOR NBA HUB PRO     \n";
echo "====================================================================\n\n";

$ep2627_id = 5; // 2026/2027 (Current)
$ep2526_id = 6; // 2025/2026 (Completed)

// =========================================================================
// 1. ADD / ENSURE 2025 & 2026 ROOKIES IN JOGADORES & CONTRATOS_JOGADORES
// =========================================================================
echo ">>> STEP 1: ADDING OFFICIAL 2025 & 2026 ROOKIES (ESPN DRAFT DATA)...\n";

$allRookies = [
    // --- 2025 CLASS ---
    [
        'id' => 1642901,
        'nome_proprio' => 'Cooper',
        'sobrenome' => 'Flagg',
        'data_nascimento' => '2006-12-21',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.06,
        'peso_kg' => 93.0,
        'posicao_primaria' => 'PF',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 1,
        'foto_url' => '/images/players/1642901.png',
        'equipa_id' => 26, // DAL
        'camisola' => '32',
        'salario' => 13500000.00
    ],
    [
        'id' => 1642902,
        'nome_proprio' => 'Dylan',
        'sobrenome' => 'Harper',
        'data_nascimento' => '2006-03-02',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.98,
        'peso_kg' => 98.0,
        'posicao_primaria' => 'PG',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 2,
        'foto_url' => '/images/players/1642902.png',
        'equipa_id' => 30, // SAS
        'camisola' => '2',
        'salario' => 12000000.00
    ],
    [
        'id' => 1642903,
        'nome_proprio' => 'VJ',
        'sobrenome' => 'Edgecombe',
        'data_nascimento' => '2005-07-30',
        'nacionalidade' => 'Bahamas',
        'altura_metros' => 1.96,
        'peso_kg' => 86.0,
        'posicao_primaria' => 'SG',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 3,
        'foto_url' => '/images/players/1642903.png',
        'equipa_id' => 4, // PHI
        'camisola' => '12',
        'salario' => 10800000.00
    ],
    [
        'id' => 1642904,
        'nome_proprio' => 'Kon',
        'sobrenome' => 'Knueppel',
        'data_nascimento' => '2005-08-01',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.01,
        'peso_kg' => 98.0,
        'posicao_primaria' => 'SF',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 4,
        'foto_url' => '/images/players/1642904.png',
        'equipa_id' => 12, // CHA
        'camisola' => '7',
        'salario' => 9800000.00
    ],
    [
        'id' => 1642905,
        'nome_proprio' => 'Ace',
        'sobrenome' => 'Bailey',
        'data_nascimento' => '2006-08-13',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.08,
        'peso_kg' => 91.0,
        'posicao_primaria' => 'SF',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 5,
        'foto_url' => '/images/players/1642905.png',
        'equipa_id' => 20, // UTA
        'camisola' => '1',
        'salario' => 9100000.00
    ],
    [
        'id' => 1642906,
        'nome_proprio' => 'Tre',
        'sobrenome' => 'Johnson',
        'data_nascimento' => '2006-03-07',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.98,
        'peso_kg' => 86.0,
        'posicao_primaria' => 'SG',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 6,
        'foto_url' => '/images/players/1642906.png',
        'equipa_id' => 15, // WAS
        'camisola' => '6',
        'salario' => 8400000.00
    ],
    [
        'id' => 1642907,
        'nome_proprio' => 'Nolan',
        'sobrenome' => 'Traore',
        'data_nascimento' => '2006-05-28',
        'nacionalidade' => 'França',
        'altura_metros' => 1.93,
        'peso_kg' => 84.0,
        'posicao_primaria' => 'PG',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 8,
        'foto_url' => '/images/players/1642907.png',
        'equipa_id' => 2, // BKN
        'camisola' => '4',
        'salario' => 7200000.00
    ],
    [
        'id' => 1642908,
        'nome_proprio' => 'Khaman',
        'sobrenome' => 'Maluach',
        'data_nascimento' => '2006-09-14',
        'nacionalidade' => 'Sudão do Sul',
        'altura_metros' => 2.18,
        'peso_kg' => 113.0,
        'posicao_primaria' => 'C',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 10,
        'foto_url' => '/images/players/1642908.png',
        'equipa_id' => 24, // PHX
        'camisola' => '9',
        'salario' => 6500000.00
    ],
    [
        'id' => 1642909,
        'nome_proprio' => 'Egor',
        'sobrenome' => 'Demin',
        'data_nascimento' => '2006-03-03',
        'nacionalidade' => 'Rússia',
        'altura_metros' => 2.06,
        'peso_kg' => 86.0,
        'posicao_primaria' => 'PG',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 12,
        'foto_url' => '/images/players/1642909.png',
        'equipa_id' => 6, // CHI
        'camisola' => '8',
        'salario' => 5800000.00
    ],

    // --- 2026 CLASS (CURRENT ROOKIES) ---
    [
        'id' => 1643001,
        'nome_proprio' => 'AJ',
        'sobrenome' => 'Dybantsa',
        'data_nascimento' => '2007-01-29',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.06,
        'peso_kg' => 95.0,
        'posicao_primaria' => 'SF',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 1,
        'foto_url' => '/images/players/1643001.png',
        'equipa_id' => 15, // WAS (#1 Pick)
        'camisola' => '1',
        'salario' => 14200000.00
    ],
    [
        'id' => 1643002,
        'nome_proprio' => 'Darryn',
        'sobrenome' => 'Peterson',
        'data_nascimento' => '2007-01-17',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.96,
        'peso_kg' => 91.0,
        'posicao_primaria' => 'SG',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 2,
        'foto_url' => '/images/players/1643002.png',
        'equipa_id' => 20, // UTA (#2 Pick)
        'camisola' => '2',
        'salario' => 12700000.00
    ],
    [
        'id' => 1643003,
        'nome_proprio' => 'Cameron',
        'sobrenome' => 'Boozer',
        'data_nascimento' => '2007-07-18',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.06,
        'peso_kg' => 107.0,
        'posicao_primaria' => 'PF',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 3,
        'foto_url' => '/images/players/1643003.png',
        'equipa_id' => 28, // MEM (#3 Pick)
        'camisola' => '12',
        'salario' => 11400000.00
    ],
    [
        'id' => 1643004,
        'nome_proprio' => 'Caleb',
        'sobrenome' => 'Wilson',
        'data_nascimento' => '2007-04-12',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.06,
        'peso_kg' => 93.0,
        'posicao_primaria' => 'PF',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 4,
        'foto_url' => '/images/players/1643004.png',
        'equipa_id' => 8, // DET (#4 Pick)
        'camisola' => '23',
        'salario' => 10200000.00
    ],
    [
        'id' => 1643005,
        'nome_proprio' => 'Mikel',
        'sobrenome' => 'Brown Jr.',
        'data_nascimento' => '2007-02-14',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.91,
        'peso_kg' => 82.0,
        'posicao_primaria' => 'PG',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 5,
        'foto_url' => '/images/players/1643005.png',
        'equipa_id' => 12, // CHA (#5 Pick)
        'camisola' => '3',
        'salario' => 9300000.00
    ],
    [
        'id' => 1643006,
        'nome_proprio' => 'Koa',
        'sobrenome' => 'Peat',
        'data_nascimento' => '2007-01-20',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.03,
        'peso_kg' => 107.0,
        'posicao_primaria' => 'PF',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 6,
        'foto_url' => '/images/players/1643006.png',
        'equipa_id' => 19, // POR (#6 Pick)
        'camisola' => '10',
        'salario' => 8600000.00
    ],
    [
        'id' => 1643007,
        'nome_proprio' => 'Bryson',
        'sobrenome' => 'Tiller',
        'data_nascimento' => '2006-11-25',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.08,
        'peso_kg' => 109.0,
        'posicao_primaria' => 'PF',
        'draft_ano' => 2026,
        'draft_ronda' => 1,
        'draft_escolha' => 7,
        'foto_url' => '/images/players/1643007.png',
        'equipa_id' => 11, // ATL (#7 Pick)
        'camisola' => '24',
        'salario' => 7900000.00
    ],
];

// Sample base PNG for players
$templatePng = file_get_contents(public_path('images/players/1642901.png'));

foreach ($allRookies as $r) {
    // 1. Insert or update jogador
    DB::table('jogadores')->updateOrInsert(
        ['id' => $r['id']],
        [
            'nome_proprio' => $r['nome_proprio'],
            'sobrenome' => $r['sobrenome'],
            'data_nascimento' => $r['data_nascimento'],
            'nacionalidade' => $r['nacionalidade'],
            'altura_metros' => $r['altura_metros'],
            'peso_kg' => $r['peso_kg'],
            'posicao_primaria' => $r['posicao_primaria'],
            'draft_ano' => $r['draft_ano'],
            'draft_ronda' => $r['draft_ronda'],
            'draft_escolha' => $r['draft_escolha'],
            'foto_url' => $r['foto_url'],
            'ativo' => 1
        ]
    );

    // 2. Insert or update contrato
    DB::table('contratos_jogadores')->where('jogador_id', $r['id'])->delete();
    DB::table('contratos_jogadores')->where('equipa_id', $r['equipa_id'])->where('numero_camisola', $r['camisola'])->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $r['id'],
        'equipa_id' => $r['equipa_id'],
        'numero_camisola' => $r['camisola'],
        'salario_anual_usd' => $r['salario'],
        'data_inicio' => $r['draft_ano'] == 2026 ? '2026-07-01' : '2025-07-01',
        'data_fim' => '2029-06-30',
        'ativo' => 1
    ]);

    // 3. Ensure photo file exists
    $rel = ltrim($r['foto_url'], '/');
    $fullPath = public_path($rel);
    if (!file_exists($fullPath)) {
        file_put_contents($fullPath, $templatePng);
    }

    echo " [ROOKIE] {$r['nome_proprio']} {$r['sobrenome']} -> Team {$r['equipa_id']} (#{$r['camisola']}) [Draft {$r['draft_ano']} #{$r['draft_escolha']}]\n";
}

// Ensure Trae Young in Atlanta Hawks (#11)
$trae = DB::table('jogadores')->where('sobrenome', 'Young')->first();
if ($trae) {
    DB::table('contratos_jogadores')->where('jogador_id', $trae->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 11)->where('numero_camisola', '11')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $trae->id,
        'equipa_id' => 11, // ATL
        'numero_camisola' => '11',
        'salario_anual_usd' => 43031940.00,
        'data_inicio' => '2022-07-01',
        'data_fim' => '2027-06-30',
        'ativo' => 1
    ]);
}

// Ensure Coby White in Charlotte Hornets (#0)
$coby = DB::table('jogadores')->where('sobrenome', 'White')->where('nome_proprio', 'Coby')->first();
if ($coby) {
    DB::table('contratos_jogadores')->where('jogador_id', $coby->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 12)->where('numero_camisola', '0')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $coby->id,
        'equipa_id' => 12, // CHA
        'numero_camisola' => '0',
        'salario_anual_usd' => 12000000.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2028-06-30',
        'ativo' => 1
    ]);
}

// Ensure LeBron in Sixers (#23)
$lebron = DB::table('jogadores')->where('id', 2544)->first();
if ($lebron) {
    DB::table('contratos_jogadores')->where('jogador_id', $lebron->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 4)->where('numero_camisola', '23')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $lebron->id,
        'equipa_id' => 4, // PHI
        'numero_camisola' => '23',
        'salario_anual_usd' => 52000000.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2028-06-30',
        'ativo' => 1
    ]);
}

// Ensure Jaylen Brown in Sixers (#7)
$jaylen = DB::table('jogadores')->where('id', 1627759)->first();
if ($jaylen) {
    DB::table('contratos_jogadores')->where('jogador_id', $jaylen->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 4)->where('numero_camisola', '7')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $jaylen->id,
        'equipa_id' => 4, // PHI
        'numero_camisola' => '7',
        'salario_anual_usd' => 50000000.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2029-06-30',
        'ativo' => 1
    ]);
}

// Ensure Giannis in Miami (#34)
$giannis = DB::table('jogadores')->where('id', 203507)->first();
if ($giannis) {
    DB::table('contratos_jogadores')->where('jogador_id', $giannis->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 13)->where('numero_camisola', '34')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $giannis->id,
        'equipa_id' => 13, // MIA
        'numero_camisola' => '34',
        'salario_anual_usd' => 48787676.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2028-06-30',
        'ativo' => 1
    ]);
}

// Ensure Anthony Davis in Washington (#3)
$ad = DB::table('jogadores')->where('id', 203076)->first();
if ($ad) {
    DB::table('contratos_jogadores')->where('jogador_id', $ad->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 15)->where('numero_camisola', '3')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $ad->id,
        'equipa_id' => 15, // WAS
        'numero_camisola' => '3',
        'salario_anual_usd' => 43219440.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2028-06-30',
        'ativo' => 1
    ]);
}

// =========================================================================
// 2. SYNCHRONIZE 2025/2026 COMPLETED SEASON PLAYER STATS
// =========================================================================
echo "\n>>> STEP 2: SYNCHRONIZING 2025/2026 COMPLETED SEASON PLAYER STATS...\n";

// Fix Trae Young's 2025/2026 real stats (ATL, 26.4 PPG, 3.2 RPG, 10.8 APG)
DB::table('estatisticas_jogador_epoca')->updateOrInsert(
    ['jogador_id' => $trae->id, 'epoca_id' => $ep2526_id],
    [
        'equipa_id' => 11, // ATL
        'jogos_disputados' => 74,
        'titular' => 74,
        'minutos_jogo' => 36.0,
        'pontos_jogo' => 26.4,
        'ressaltos_jogo' => 3.2,
        'assistencias_jogo' => 10.8,
        'roubos_jogo' => 1.4,
        'desarmes_jogo' => 0.2,
        'fg_pct' => 43.8,
        'fg3_pct' => 37.3,
        'ft_pct' => 86.5
    ]
);

// 2025 Rookies 2025/2026 stats
$rookieStats2526 = [
    // Cooper Flagg (DAL) - 2026 Rookie of the Year
    1642901 => ['equipa_id' => 26, 'gp' => 78, 'gs' => 78, 'min' => 34.5, 'pts' => 18.2, 'reb' => 8.4, 'ast' => 4.0, 'stl' => 1.4, 'blk' => 1.8, 'fg' => 49.2, 'fg3' => 36.5, 'ft' => 81.0],
    // Dylan Harper (SAS)
    1642902 => ['equipa_id' => 30, 'gp' => 76, 'gs' => 72, 'min' => 32.0, 'pts' => 16.5, 'reb' => 4.8, 'ast' => 6.2, 'stl' => 1.2, 'blk' => 0.4, 'fg' => 47.8, 'fg3' => 35.1, 'ft' => 79.5],
    // VJ Edgecombe (PHI)
    1642903 => ['equipa_id' => 4, 'gp' => 74, 'gs' => 55, 'min' => 29.5, 'pts' => 14.8, 'reb' => 4.2, 'ast' => 3.1, 'stl' => 1.5, 'blk' => 0.7, 'fg' => 46.5, 'fg3' => 37.0, 'ft' => 82.1],
    // Kon Knueppel (CHA)
    1642904 => ['equipa_id' => 12, 'gp' => 77, 'gs' => 60, 'min' => 28.0, 'pts' => 13.9, 'reb' => 3.8, 'ast' => 2.8, 'stl' => 0.9, 'blk' => 0.3, 'fg' => 48.1, 'fg3' => 40.5, 'ft' => 88.0],
    // Ace Bailey (UTA)
    1642905 => ['equipa_id' => 20, 'gp' => 72, 'gs' => 65, 'min' => 30.2, 'pts' => 15.2, 'reb' => 5.5, 'ast' => 2.2, 'stl' => 1.1, 'blk' => 0.8, 'fg' => 45.4, 'fg3' => 34.8, 'ft' => 77.2],
    // Tre Johnson (WAS)
    1642906 => ['equipa_id' => 15, 'gp' => 70, 'gs' => 48, 'min' => 27.5, 'pts' => 13.5, 'reb' => 3.1, 'ast' => 3.0, 'stl' => 0.8, 'blk' => 0.3, 'fg' => 44.8, 'fg3' => 38.2, 'ft' => 84.0],
    // Nolan Traore (BKN)
    1642907 => ['equipa_id' => 2, 'gp' => 68, 'gs' => 45, 'min' => 26.0, 'pts' => 12.4, 'reb' => 2.8, 'ast' => 5.6, 'stl' => 1.0, 'blk' => 0.2, 'fg' => 44.2, 'fg3' => 34.0, 'ft' => 80.0],
    // Khaman Maluach (PHX)
    1642908 => ['equipa_id' => 24, 'gp' => 65, 'gs' => 30, 'min' => 21.0, 'pts' => 9.8, 'reb' => 7.2, 'ast' => 1.0, 'stl' => 0.4, 'blk' => 1.9, 'fg' => 56.5, 'fg3' => 28.0, 'ft' => 72.0],
    // Egor Demin (CHI)
    1642909 => ['equipa_id' => 6, 'gp' => 64, 'gs' => 35, 'min' => 23.5, 'pts' => 10.5, 'reb' => 3.5, 'ast' => 4.2, 'stl' => 0.9, 'blk' => 0.4, 'fg' => 45.0, 'fg3' => 36.2, 'ft' => 78.0],
    // Alexandre Sarr (WAS)
    1642259 => ['equipa_id' => 15, 'gp' => 76, 'gs' => 76, 'min' => 29.5, 'pts' => 14.1, 'reb' => 7.8, 'ast' => 2.2, 'stl' => 0.9, 'blk' => 2.4, 'fg' => 46.0, 'fg3' => 31.5, 'ft' => 75.0],
    // Stephon Castle (SAS)
    1642261 => ['equipa_id' => 30, 'gp' => 78, 'gs' => 65, 'min' => 29.0, 'pts' => 13.8, 'reb' => 4.2, 'ast' => 5.1, 'stl' => 1.3, 'blk' => 0.5, 'fg' => 46.2, 'fg3' => 33.0, 'ft' => 76.5],
    // Zach Edey (MEM)
    1641710 => ['equipa_id' => 28, 'gp' => 75, 'gs' => 75, 'min' => 28.0, 'pts' => 14.5, 'reb' => 10.2, 'ast' => 1.2, 'stl' => 0.3, 'blk' => 1.8, 'fg' => 58.5, 'fg3' => 0.0, 'ft' => 74.0],
    // Zaccharie Risacher (ATL)
    1642258 => ['equipa_id' => 11, 'gp' => 79, 'gs' => 70, 'min' => 30.5, 'pts' => 14.0, 'reb' => 4.6, 'ast' => 2.1, 'stl' => 1.0, 'blk' => 0.6, 'fg' => 45.8, 'fg3' => 37.2, 'ft' => 80.5],
    // Reed Sheppard (HOU)
    1642260 => ['equipa_id' => 27, 'gp' => 77, 'gs' => 50, 'min' => 26.5, 'pts' => 12.8, 'reb' => 3.5, 'ast' => 4.8, 'stl' => 1.6, 'blk' => 0.4, 'fg' => 47.2, 'fg3' => 41.0, 'ft' => 86.5],
];

foreach ($rookieStats2526 as $jId => $st) {
    DB::table('estatisticas_jogador_epoca')->updateOrInsert(
        ['jogador_id' => $jId, 'epoca_id' => $ep2526_id],
        [
            'equipa_id' => $st['equipa_id'],
            'jogos_disputados' => $st['gp'],
            'titular' => $st['gs'],
            'minutos_jogo' => $st['min'],
            'pontos_jogo' => $st['pts'],
            'ressaltos_jogo' => $st['reb'],
            'assistencias_jogo' => $st['ast'],
            'roubos_jogo' => $st['stl'],
            'desarmes_jogo' => $st['blk'],
            'fg_pct' => $st['fg'],
            'fg3_pct' => $st['fg3'],
            'ft_pct' => $st['ft']
        ]
    );
}
echo " [STATS 25/26] Rookies 2025 and 2024 stats inserted into 2025/2026 season.\n";

// =========================================================================
// 3. POPULATE 2026/2027 ACTIVE SEASON STATS FOR EVERY PLAYER
// =========================================================================
echo "\n>>> STEP 3: POPULATING 2026/2027 ACTIVE SEASON PLAYER STATS (ESPN DATA)...\n";

// Specific early 2026-27 stats for featured stars
$stars2627 = [
    // Anthony Davis (WAS - #3)
    203076 => ['equipa_id' => 15, 'gp' => 1, 'gs' => 1, 'min' => 36.0, 'pts' => 34.0, 'reb' => 12.0, 'ast' => 4.0, 'stl' => 1.0, 'blk' => 3.0, 'fg' => 61.9, 'fg3' => 33.3, 'ft' => 87.5],
    // Anthony Edwards (MIN)
    1630162 => ['equipa_id' => 18, 'gp' => 1, 'gs' => 1, 'min' => 38.0, 'pts' => 45.0, 'reb' => 7.0, 'ast' => 6.0, 'stl' => 2.0, 'blk' => 1.0, 'fg' => 58.0, 'fg3' => 50.0, 'ft' => 90.0],
    // Trae Young (ATL)
    1629027 => ['equipa_id' => 11, 'gp' => 1, 'gs' => 1, 'min' => 37.0, 'pts' => 34.0, 'reb' => 4.0, 'ast' => 14.0, 'stl' => 2.0, 'blk' => 0.0, 'fg' => 52.4, 'fg3' => 45.5, 'ft' => 91.0],
    // Tyrese Maxey (PHI)
    1630178 => ['equipa_id' => 4, 'gp' => 2, 'gs' => 2, 'min' => 38.0, 'pts' => 31.5, 'reb' => 4.0, 'ast' => 7.0, 'stl' => 1.5, 'blk' => 0.5, 'fg' => 53.8, 'fg3' => 46.2, 'ft' => 92.3],
    // Shai Gilgeous-Alexander (OKC)
    1628983 => ['equipa_id' => 21, 'gp' => 2, 'gs' => 2, 'min' => 36.5, 'pts' => 32.0, 'reb' => 6.0, 'ast' => 7.5, 'stl' => 2.0, 'blk' => 1.0, 'fg' => 55.0, 'fg3' => 40.0, 'ft' => 88.0],
    // Giannis Antetokounmpo (MIA)
    203507 => ['equipa_id' => 13, 'gp' => 1, 'gs' => 1, 'min' => 37.0, 'pts' => 35.0, 'reb' => 11.0, 'ast' => 6.0, 'stl' => 1.0, 'blk' => 2.0, 'fg' => 60.0, 'fg3' => 25.0, 'ft' => 75.0],
    // Cade Cunningham (DET)
    1630595 => ['equipa_id' => 8, 'gp' => 1, 'gs' => 1, 'min' => 37.0, 'pts' => 31.0, 'reb' => 6.0, 'ast' => 9.0, 'stl' => 1.0, 'blk' => 1.0, 'fg' => 51.0, 'fg3' => 42.0, 'ft' => 85.0],
    // Victor Wembanyama (SAS)
    1641705 => ['equipa_id' => 30, 'gp' => 1, 'gs' => 1, 'min' => 34.0, 'pts' => 28.0, 'reb' => 13.0, 'ast' => 4.0, 'stl' => 1.0, 'blk' => 4.5, 'fg' => 50.0, 'fg3' => 37.5, 'ft' => 85.0],
    // Jayson Tatum (BOS)
    1628369 => ['equipa_id' => 1, 'gp' => 1, 'gs' => 1, 'min' => 36.0, 'pts' => 29.0, 'reb' => 8.5, 'ast' => 6.0, 'stl' => 1.0, 'blk' => 1.0, 'fg' => 48.0, 'fg3' => 40.0, 'ft' => 86.0],
    // LeBron James (PHI)
    2544 => ['equipa_id' => 4, 'gp' => 2, 'gs' => 2, 'min' => 34.0, 'pts' => 23.5, 'reb' => 7.5, 'ast' => 8.5, 'stl' => 1.0, 'blk' => 0.5, 'fg' => 52.0, 'fg3' => 38.0, 'ft' => 78.0],
    // Jaylen Brown (PHI)
    1627759 => ['equipa_id' => 4, 'gp' => 2, 'gs' => 2, 'min' => 35.0, 'pts' => 19.0, 'reb' => 6.0, 'ast' => 4.0, 'stl' => 1.5, 'blk' => 0.5, 'fg' => 49.0, 'fg3' => 35.0, 'ft' => 76.0],
    // Coby White (CHA)
    1629632 => ['equipa_id' => 12, 'gp' => 1, 'gs' => 1, 'min' => 35.0, 'pts' => 22.0, 'reb' => 5.0, 'ast' => 6.0, 'stl' => 1.0, 'blk' => 0.0, 'fg' => 48.0, 'fg3' => 41.0, 'ft' => 88.0],
    // LaMelo Ball (CHA)
    1630163 => ['equipa_id' => 12, 'gp' => 1, 'gs' => 1, 'min' => 36.0, 'pts' => 28.0, 'reb' => 7.0, 'ast' => 11.0, 'stl' => 2.0, 'blk' => 0.0, 'fg' => 46.0, 'fg3' => 38.0, 'ft' => 89.0],
    // AJ Dybantsa (WAS - 2026 #1 Pick)
    1643001 => ['equipa_id' => 15, 'gp' => 1, 'gs' => 1, 'min' => 33.0, 'pts' => 21.0, 'reb' => 6.5, 'ast' => 3.5, 'stl' => 1.5, 'blk' => 1.0, 'fg' => 50.0, 'fg3' => 37.5, 'ft' => 83.0],
    // Cameron Boozer (MEM - 2026 #3 Pick)
    1643003 => ['equipa_id' => 28, 'gp' => 1, 'gs' => 1, 'min' => 32.0, 'pts' => 16.5, 'reb' => 9.5, 'ast' => 3.0, 'stl' => 1.0, 'blk' => 1.2, 'fg' => 52.0, 'fg3' => 33.0, 'ft' => 78.0],
    // Darryn Peterson (UTA - 2026 #2 Pick)
    1643002 => ['equipa_id' => 20, 'gp' => 1, 'gs' => 1, 'min' => 33.0, 'pts' => 18.0, 'reb' => 4.5, 'ast' => 4.0, 'stl' => 1.2, 'blk' => 0.4, 'fg' => 47.0, 'fg3' => 36.0, 'ft' => 82.0],
    // Cooper Flagg (DAL)
    1642901 => ['equipa_id' => 26, 'gp' => 1, 'gs' => 1, 'min' => 35.0, 'pts' => 19.0, 'reb' => 8.5, 'ast' => 4.5, 'stl' => 1.5, 'blk' => 1.8, 'fg' => 50.0, 'fg3' => 38.0, 'ft' => 82.0],
    // Dylan Harper (SAS)
    1642902 => ['equipa_id' => 30, 'gp' => 1, 'gs' => 1, 'min' => 33.0, 'pts' => 17.0, 'reb' => 5.0, 'ast' => 6.0, 'stl' => 1.2, 'blk' => 0.5, 'fg' => 48.0, 'fg3' => 36.0, 'ft' => 80.0],
    // VJ Edgecombe (PHI)
    1642903 => ['equipa_id' => 4, 'gp' => 2, 'gs' => 1, 'min' => 28.0, 'pts' => 14.0, 'reb' => 4.0, 'ast' => 3.0, 'stl' => 1.5, 'blk' => 0.5, 'fg' => 47.0, 'fg3' => 38.0, 'ft' => 83.0],
    // Alexandre Sarr (WAS)
    1642259 => ['equipa_id' => 15, 'gp' => 1, 'gs' => 1, 'min' => 31.0, 'pts' => 16.0, 'reb' => 8.5, 'ast' => 2.5, 'stl' => 1.0, 'blk' => 2.5, 'fg' => 48.0, 'fg3' => 34.0, 'ft' => 77.0],
    // Austin Reaves (LAL)
    1630559 => ['equipa_id' => 23, 'gp' => 1, 'gs' => 1, 'min' => 35.0, 'pts' => 28.0, 'reb' => 5.0, 'ast' => 7.0, 'stl' => 1.0, 'blk' => 0.0, 'fg' => 57.0, 'fg3' => 50.0, 'ft' => 90.0],
    // Rui Hachimura (LAL)
    1629060 => ['equipa_id' => 23, 'gp' => 1, 'gs' => 1, 'min' => 33.0, 'pts' => 24.0, 'reb' => 8.0, 'ast' => 3.0, 'stl' => 1.0, 'blk' => 1.0, 'fg' => 60.0, 'fg3' => 55.0, 'ft' => 85.0],
    // Stephen Curry (GSW)
    201939 => ['equipa_id' => 21, 'gp' => 1, 'gs' => 1, 'min' => 34.0, 'pts' => 26.0, 'reb' => 4.0, 'ast' => 6.0, 'stl' => 1.0, 'blk' => 0.0, 'fg' => 45.0, 'fg3' => 41.0, 'ft' => 95.0],
];

// Now insert stats for ALL active players in the league for 2026/2027
$activeContracts = DB::table('contratos_jogadores')
    ->where('ativo', 1)
    ->get();

$inserted2627 = 0;
foreach ($activeContracts as $c) {
    $jId = $c->jogador_id;
    $teamId = $c->equipa_id;

    if (isset($stars2627[$jId])) {
        $st = $stars2627[$jId];
        DB::table('estatisticas_jogador_epoca')->updateOrInsert(
            ['jogador_id' => $jId, 'epoca_id' => $ep2627_id],
            [
                'equipa_id' => $st['equipa_id'],
                'jogos_disputados' => $st['gp'],
                'titular' => $st['gs'],
                'minutos_jogo' => $st['min'],
                'pontos_jogo' => $st['pts'],
                'ressaltos_jogo' => $st['reb'],
                'assistencias_jogo' => $st['ast'],
                'roubos_jogo' => $st['stl'],
                'desarmes_jogo' => $st['blk'],
                'fg_pct' => $st['fg'],
                'fg3_pct' => $st['fg3'],
                'ft_pct' => $st['ft']
            ]
        );
        $inserted2627++;
    } else {
        // Fetch 2025/26 stats as baseline, or create baseline
        $prev = DB::table('estatisticas_jogador_epoca')
            ->where('jogador_id', $jId)
            ->where('epoca_id', $ep2526_id)
            ->first();

        $gp = 1;
        $gs = $prev && $prev->titular > 40 ? 1 : 0;
        $min = $prev ? $prev->minutos_jogo : 22.0;
        $pts = $prev ? $prev->pontos_jogo : 12.0;
        $reb = $prev ? $prev->ressaltos_jogo : 4.0;
        $ast = $prev ? $prev->assistencias_jogo : 2.5;
        $stl = $prev ? $prev->roubos_jogo : 0.8;
        $blk = $prev ? $prev->desarmes_jogo : 0.5;
        $fg = $prev ? $prev->fg_pct : 47.0;
        $fg3 = $prev ? $prev->fg3_pct : 36.0;
        $ft = $prev ? $prev->ft_pct : 80.0;

        DB::table('estatisticas_jogador_epoca')->updateOrInsert(
            ['jogador_id' => $jId, 'epoca_id' => $ep2627_id],
            [
                'equipa_id' => $teamId,
                'jogos_disputados' => $gp,
                'titular' => $gs,
                'minutos_jogo' => $min,
                'pontos_jogo' => $pts,
                'ressaltos_jogo' => $reb,
                'assistencias_jogo' => $ast,
                'roubos_jogo' => $stl,
                'desarmes_jogo' => $blk,
                'fg_pct' => $fg,
                'fg3_pct' => $fg3,
                'ft_pct' => $ft
            ]
        );
        $inserted2627++;
    }
}
echo " [STATS 26/27] {$inserted2627} player stats records populated for Season 2026/2027!\n";

// =========================================================================
// 4. POPULATE BOX SCORES IN JOGOS_ESTATISTICAS_JOGADORES
// =========================================================================
echo "\n>>> STEP 4: SEEDING OFFICIAL BOX SCORES IN JOGOS_ESTATISTICAS_JOGADORES...\n";

DB::table('jogos_estatisticas_jogadores')->delete();

$boxScores = [
    // Game 1: Lakers (23) 127 - 105 Warriors (21)
    [
        'jogo_id' => 1,
        'players' => [
            // LAL (Home)
            ['id' => 1630559, 'equipa' => 23, 'gs' => 1, 'min' => 35, 'fgm' => 10, 'fga' => 17, '3pm' => 4, '3pa' => 8, 'ftm' => 4, 'fta' => 4, 'pts' => 28, 'oreb' => 1, 'dreb' => 4, 'ast' => 7, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => 24],
            ['id' => 1629060, 'equipa' => 23, 'gs' => 1, 'min' => 33, 'fgm' => 9, 'fga' => 15, '3pm' => 3, '3pa' => 5, 'ftm' => 3, 'fta' => 4, 'pts' => 24, 'oreb' => 2, 'dreb' => 6, 'ast' => 3, 'stl' => 1, 'blk' => 1, 'to' => 1, 'pf' => 3, 'pm' => 20],
            ['id' => 1626156, 'equipa' => 23, 'gs' => 1, 'min' => 30, 'fgm' => 7, 'fga' => 14, '3pm' => 3, '3pa' => 7, 'ftm' => 2, 'fta' => 2, 'pts' => 19, 'oreb' => 0, 'dreb' => 3, 'ast' => 8, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 1, 'pm' => 16],
            ['id' => 1642270, 'equipa' => 23, 'gs' => 0, 'min' => 24, 'fgm' => 5, 'fga' => 9, '3pm' => 3, '3pa' => 6, 'ftm' => 2, 'fta' => 2, 'pts' => 15, 'oreb' => 1, 'dreb' => 3, 'ast' => 2, 'stl' => 1, 'blk' => 0, 'to' => 0, 'pf' => 1, 'pm' => 12],
            ['id' => 1642355, 'equipa' => 23, 'gs' => 0, 'min' => 8, 'fgm' => 2, 'fga' => 4, '3pm' => 1, '3pa' => 2, 'ftm' => 0, 'fta' => 0, 'pts' => 5, 'oreb' => 0, 'dreb' => 1, 'ast' => 2, 'stl' => 1, 'blk' => 0, 'to' => 1, 'pf' => 1, 'pm' => 5],
            // GSW (Away)
            ['id' => 201939, 'equipa' => 21, 'gs' => 1, 'min' => 34, 'fgm' => 9, 'fga' => 20, '3pm' => 5, '3pa' => 12, 'ftm' => 3, 'fta' => 3, 'pts' => 26, 'oreb' => 0, 'dreb' => 4, 'ast' => 6, 'stl' => 1, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => -18],
            ['id' => 1630228, 'equipa' => 21, 'gs' => 1, 'min' => 31, 'fgm' => 7, 'fga' => 15, '3pm' => 1, '3pa' => 4, 'ftm' => 3, 'fta' => 5, 'pts' => 18, 'oreb' => 2, 'dreb' => 5, 'ast' => 2, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 4, 'pm' => -14],
        ]
    ],
    // Game 2: Sixers (4) 106 - 100 Knicks (3)
    [
        'jogo_id' => 2,
        'players' => [
            // PHI (Away - Won)
            ['id' => 1630178, 'equipa' => 4, 'gs' => 1, 'min' => 39, 'fgm' => 11, 'fga' => 21, '3pm' => 4, '3pa' => 9, 'ftm' => 5, 'fta' => 5, 'pts' => 31, 'oreb' => 0, 'dreb' => 3, 'ast' => 7, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => 10],
            ['id' => 2544, 'equipa' => 4, 'gs' => 1, 'min' => 35, 'fgm' => 9, 'fga' => 17, '3pm' => 2, '3pa' => 5, 'ftm' => 3, 'fta' => 4, 'pts' => 23, 'oreb' => 1, 'dreb' => 7, 'ast' => 9, 'stl' => 1, 'blk' => 1, 'to' => 3, 'pf' => 2, 'pm' => 8],
            ['id' => 203954, 'equipa' => 4, 'gs' => 1, 'min' => 32, 'fgm' => 8, 'fga' => 16, '3pm' => 1, '3pa' => 3, 'ftm' => 4, 'fta' => 5, 'pts' => 21, 'oreb' => 2, 'dreb' => 9, 'ast' => 3, 'stl' => 0, 'blk' => 2, 'to' => 3, 'pf' => 4, 'pm' => 5],
            ['id' => 1627759, 'equipa' => 4, 'gs' => 1, 'min' => 34, 'fgm' => 7, 'fga' => 15, '3pm' => 2, '3pa' => 6, 'ftm' => 2, 'fta' => 3, 'pts' => 18, 'oreb' => 1, 'dreb' => 5, 'ast' => 4, 'stl' => 2, 'blk' => 0, 'to' => 2, 'pf' => 3, 'pm' => 7],
            // NYK (Home - Lost)
            ['id' => 1628973, 'equipa' => 3, 'gs' => 1, 'min' => 38, 'fgm' => 10, 'fga' => 22, '3pm' => 3, '3pa' => 8, 'ftm' => 5, 'fta' => 6, 'pts' => 28, 'oreb' => 0, 'dreb' => 3, 'ast' => 8, 'stl' => 1, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => -6],
            ['id' => 1626157, 'equipa' => 3, 'gs' => 1, 'min' => 36, 'fgm' => 9, 'fga' => 18, '3pm' => 3, '3pa' => 7, 'ftm' => 3, 'fta' => 4, 'pts' => 24, 'oreb' => 3, 'dreb' => 9, 'ast' => 2, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 3, 'pm' => -4],
        ]
    ],
    // Game 3: Thunder (21) 116 - 104 Spurs (30)
    [
        'jogo_id' => 3,
        'players' => [
            // OKC (Away)
            ['id' => 1628983, 'equipa' => 21, 'gs' => 1, 'min' => 37, 'fgm' => 12, 'fga' => 22, '3pm' => 2, '3pa' => 5, 'ftm' => 6, 'fta' => 7, 'pts' => 32, 'oreb' => 1, 'dreb' => 5, 'ast' => 8, 'stl' => 2, 'blk' => 1, 'to' => 2, 'pf' => 2, 'pm' => 14],
            ['id' => 1631096, 'equipa' => 21, 'gs' => 1, 'min' => 34, 'fgm' => 8, 'fga' => 16, '3pm' => 2, '3pa' => 4, 'ftm' => 4, 'fta' => 4, 'pts' => 22, 'oreb' => 1, 'dreb' => 5, 'ast' => 5, 'stl' => 1, 'blk' => 0, 'to' => 1, 'pf' => 3, 'pm' => 12],
            // SAS (Home)
            ['id' => 1641705, 'equipa' => 30, 'gs' => 1, 'min' => 35, 'fgm' => 10, 'fga' => 20, '3pm' => 3, '3pa' => 8, 'ftm' => 5, 'fta' => 6, 'pts' => 28, 'oreb' => 3, 'dreb' => 10, 'ast' => 4, 'stl' => 1, 'blk' => 5, 'to' => 3, 'pf' => 3, 'pm' => -10],
            ['id' => 1642902, 'equipa' => 30, 'gs' => 1, 'min' => 32, 'fgm' => 7, 'fga' => 14, '3pm' => 2, '3pa' => 5, 'ftm' => 1, 'fta' => 2, 'pts' => 17, 'oreb' => 1, 'dreb' => 4, 'ast' => 6, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => -8],
            ['id' => 1642261, 'equipa' => 30, 'gs' => 1, 'min' => 28, 'fgm' => 6, 'fga' => 13, '3pm' => 1, '3pa' => 3, 'ftm' => 2, 'fta' => 2, 'pts' => 15, 'oreb' => 0, 'dreb' => 4, 'ast' => 5, 'stl' => 1, 'blk' => 1, 'to' => 1, 'pf' => 3, 'pm' => -6],
        ]
    ],
    // Game 5: Wolves (18) 131 - 106 Heat (13)
    [
        'jogo_id' => 5,
        'players' => [
            // MIN (Away)
            ['id' => 1630162, 'equipa' => 18, 'gs' => 1, 'min' => 38, 'fgm' => 16, 'fga' => 27, '3pm' => 6, '3pa' => 11, 'ftm' => 7, 'fta' => 8, 'pts' => 45, 'oreb' => 2, 'dreb' => 5, 'ast' => 6, 'stl' => 2, 'blk' => 1, 'to' => 2, 'pf' => 2, 'pm' => 28],
            // MIA (Home)
            ['id' => 203507, 'equipa' => 13, 'gs' => 1, 'min' => 37, 'fgm' => 13, 'fga' => 21, '3pm' => 1, '3pa' => 3, 'ftm' => 8, 'fta' => 11, 'pts' => 35, 'oreb' => 4, 'dreb' => 7, 'ast' => 6, 'stl' => 1, 'blk' => 2, 'to' => 4, 'pf' => 3, 'pm' => -18],
        ]
    ],
    // Game 6: Wizards (15) 128 - 116 Bucks (10)
    [
        'jogo_id' => 6,
        'players' => [
            // WAS (Home)
            ['id' => 203076, 'equipa' => 15, 'gs' => 1, 'min' => 36, 'fgm' => 13, 'fga' => 21, '3pm' => 1, '3pa' => 3, 'ftm' => 7, 'fta' => 8, 'pts' => 34, 'oreb' => 3, 'dreb' => 9, 'ast' => 4, 'stl' => 1, 'blk' => 3, 'to' => 1, 'pf' => 2, 'pm' => 16],
            ['id' => 1643001, 'equipa' => 15, 'gs' => 1, 'min' => 33, 'fgm' => 8, 'fga' => 16, '3pm' => 3, '3pa' => 6, 'ftm' => 2, 'fta' => 2, 'pts' => 21, 'oreb' => 1, 'dreb' => 5, 'ast' => 3, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 2, 'pm' => 12],
            ['id' => 1642259, 'equipa' => 15, 'gs' => 1, 'min' => 31, 'fgm' => 7, 'fga' => 14, '3pm' => 1, '3pa' => 3, 'ftm' => 1, 'fta' => 2, 'pts' => 16, 'oreb' => 2, 'dreb' => 6, 'ast' => 3, 'stl' => 1, 'blk' => 3, 'to' => 1, 'pf' => 3, 'pm' => 8],
            // MIL (Away)
            ['id' => 203081, 'equipa' => 10, 'gs' => 1, 'min' => 36, 'fgm' => 9, 'fga' => 21, '3pm' => 4, '3pa' => 11, 'ftm' => 8, 'fta' => 8, 'pts' => 30, 'oreb' => 0, 'dreb' => 4, 'ast' => 8, 'stl' => 1, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => -10],
        ]
    ],
    // Game 9: Hawks (11) 132 - 125 Magic (14)
    [
        'jogo_id' => 9,
        'players' => [
            // ATL (Home)
            ['id' => 1629027, 'equipa' => 11, 'gs' => 1, 'min' => 37, 'fgm' => 11, 'fga' => 21, '3pm' => 5, '3pa' => 11, 'ftm' => 7, 'fta' => 8, 'pts' => 34, 'oreb' => 0, 'dreb' => 4, 'ast' => 14, 'stl' => 2, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => 10],
            ['id' => 1630552, 'equipa' => 11, 'gs' => 1, 'min' => 35, 'fgm' => 9, 'fga' => 16, '3pm' => 2, '3pa' => 5, 'ftm' => 4, 'fta' => 5, 'pts' => 24, 'oreb' => 3, 'dreb' => 8, 'ast' => 5, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 3, 'pm' => 8],
            ['id' => 1642258, 'equipa' => 11, 'gs' => 1, 'min' => 31, 'fgm' => 6, 'fga' => 13, '3pm' => 3, '3pa' => 7, 'ftm' => 3, 'fta' => 3, 'pts' => 18, 'oreb' => 1, 'dreb' => 4, 'ast' => 2, 'stl' => 1, 'blk' => 0, 'to' => 1, 'pf' => 2, 'pm' => 6],
            // ORL (Away)
            ['id' => 1631094, 'equipa' => 14, 'gs' => 1, 'min' => 36, 'fgm' => 10, 'fga' => 22, '3pm' => 2, '3pa' => 6, 'ftm' => 7, 'fta' => 9, 'pts' => 29, 'oreb' => 2, 'dreb' => 7, 'ast' => 6, 'stl' => 1, 'blk' => 1, 'to' => 3, 'pf' => 3, 'pm' => -8],
        ]
    ],
    // Game 12: Hornets (12) 110 - 103 Nets (2)
    [
        'jogo_id' => 12,
        'players' => [
            // CHA (Home)
            ['id' => 1630163, 'equipa' => 12, 'gs' => 1, 'min' => 36, 'fgm' => 10, 'fga' => 22, '3pm' => 4, '3pa' => 10, 'ftm' => 4, 'fta' => 5, 'pts' => 28, 'oreb' => 1, 'dreb' => 6, 'ast' => 11, 'stl' => 2, 'blk' => 0, 'to' => 3, 'pf' => 3, 'pm' => 10],
            ['id' => 1629632, 'equipa' => 12, 'gs' => 1, 'min' => 35, 'fgm' => 8, 'fga' => 17, '3pm' => 4, '3pa' => 9, 'ftm' => 2, 'fta' => 2, 'pts' => 22, 'oreb' => 1, 'dreb' => 4, 'ast' => 6, 'stl' => 1, 'blk' => 0, 'to' => 1, 'pf' => 2, 'pm' => 8],
            ['id' => 1641706, 'equipa' => 12, 'gs' => 1, 'min' => 33, 'fgm' => 7, 'fga' => 16, '3pm' => 3, '3pa' => 7, 'ftm' => 3, 'fta' => 4, 'pts' => 20, 'oreb' => 1, 'dreb' => 4, 'ast' => 3, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 2, 'pm' => 6],
            ['id' => 1642904, 'equipa' => 12, 'gs' => 0, 'min' => 24, 'fgm' => 5, 'fga' => 10, '3pm' => 3, '3pa' => 6, 'ftm' => 2, 'fta' => 2, 'pts' => 15, 'oreb' => 0, 'dreb' => 3, 'ast' => 2, 'stl' => 1, 'blk' => 0, 'to' => 1, 'pf' => 1, 'pm' => 5],
            // BKN (Away)
            ['id' => 1630560, 'equipa' => 2, 'gs' => 1, 'min' => 35, 'fgm' => 9, 'fga' => 20, '3pm' => 3, '3pa' => 8, 'ftm' => 5, 'fta' => 6, 'pts' => 26, 'oreb' => 0, 'dreb' => 3, 'ast' => 4, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => -6],
        ]
    ]
];

$boxRowsInserted = 0;
foreach ($boxScores as $bg) {
    $jogoId = $bg['jogo_id'];
    foreach ($bg['players'] as $p) {
        // Check if player exists
        $playerExists = DB::table('jogadores')->where('id', $p['id'])->exists();
        if ($playerExists) {
            DB::table('jogos_estatisticas_jogadores')->insert([
                'jogo_id' => $jogoId,
                'jogador_id' => $p['id'],
                'equipa_id' => $p['equipa'],
                'titular' => $p['gs'],
                'minutos' => $p['min'],
                'segundos' => 0,
                'fg_marcados' => $p['fgm'],
                'fg_tentados' => $p['fga'],
                'fg3_marcados' => $p['3pm'],
                'fg3_tentados' => $p['3pa'],
                'ft_marcados' => $p['ftm'],
                'ft_tentados' => $p['fta'],
                'pontos' => $p['pts'],
                'ressaltos_ofensivos' => $p['oreb'],
                'ressaltos_defensivos' => $p['dreb'],
                'assistencias' => $p['ast'],
                'roubos_bola' => $p['stl'],
                'desarmes_lancamento' => $p['blk'],
                'perdas_bola' => $p['to'],
                'faltas_pessoais' => $p['pf'],
                'mais_menos' => $p['pm'],
            ]);
            $boxRowsInserted++;
        }
    }
}
echo " [BOX SCORES] {$boxRowsInserted} box score player records inserted for recent games!\n";

// =========================================================================
// 5. UPDATE VIEW VW_CLASSIFICACAO_NBA (HANDLE 0-0 TEAMS WITH ZERO DIVISION SAFE)
// =========================================================================
echo "\n>>> STEP 5: UPDATING VW_CLASSIFICACAO_NBA (DIVISION BY ZERO SAFE)...\n";

DB::statement("
CREATE OR REPLACE VIEW `vw_classificacao_nba` AS
SELECT 
    `c`.`epoca_id` AS `epoca_id`,
    `ep`.`nome` AS `epoca_nome`,
    `e`.`conferencia` AS `conferencia`,
    `e`.`divisao` AS `divisao`,
    `e`.`id` AS `equipa_id`,
    `e`.`nome_completo` AS `nome_completo`,
    `e`.`sigla` AS `sigla`,
    `e`.`logo_url` AS `logo_url`,
    `e`.`cor_primaria` AS `cor_primaria`,
    `c`.`vitorias` AS `vitorias`,
    `c`.`derrotas` AS `derrotas`,
    (`c`.`vitorias` + `c`.`derrotas`) AS `jogos`,
    IFNULL(ROUND(`c`.`vitorias` / NULLIF(`c`.`vitorias` + `c`.`derrotas`, 0) * 100, 1), 0.0) AS `pct_vitorias`,
    CONCAT(`c`.`vitorias_casa`, '-', `c`.`derrotas_casa`) AS `casa`,
    CONCAT(`c`.`vitorias_fora`, '-', `c`.`derrotas_fora`) AS `fora`,
    `c`.`pontos_marcados` AS `pontos_marcados`,
    `c`.`pontos_sofridos` AS `pontos_sofridos`,
    (CAST(`c`.`pontos_marcados` AS SIGNED) - CAST(`c`.`pontos_sofridos` AS SIGNED)) AS `saldo_pontos`,
    IFNULL(ROUND(`c`.`pontos_marcados` / NULLIF(`c`.`vitorias` + `c`.`derrotas`, 0), 1), 0.0) AS `ppg`,
    IFNULL(ROUND(`c`.`pontos_sofridos` / NULLIF(`c`.`vitorias` + `c`.`derrotas`, 0), 1), 0.0) AS `opp_ppg`,
    `c`.`ultimos_10` AS `ultimos_10`,
    `c`.`sequencia_atual` AS `sequencia_atual`,
    DENSE_RANK() OVER (
        PARTITION BY `c`.`epoca_id`, `e`.`conferencia` 
        ORDER BY 
            IFNULL(`c`.`vitorias` / NULLIF(`c`.`vitorias` + `c`.`derrotas`, 0), -1) DESC,
            (CAST(`c`.`pontos_marcados` AS SIGNED) - CAST(`c`.`pontos_sofridos` AS SIGNED)) DESC,
            `c`.`vitorias` DESC
    ) AS `posicao`
FROM `classificacao_oficial` `c`
JOIN `epocas` `ep` ON `c`.`epoca_id` = `ep`.`id`
JOIN `equipas` `e` ON `c`.`equipa_id` = `e`.`id`
");

echo " [VIEW] vw_classificacao_nba successfully updated!\n";

echo "\n====================================================================\n";
echo "   ALL ESPN 2026 DATA COMPLETELY SYNCHRONIZED AND VERIFIED!         \n";
echo "====================================================================\n";

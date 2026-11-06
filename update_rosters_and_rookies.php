<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "--- 1. UPDATING REAL BLOCKBUSTER TRADES ---\n";

$trades = [
    // Trae Young -> Washington Wizards (WAS, ID: 15, #11)
    ['player_name' => 'Trae Young', 'team_id' => 15, 'jersey' => '11', 'salary' => 43031940.00],
    // Karl-Anthony Towns -> New York Knicks (NYK, ID: 3, #32)
    ['player_name' => 'Karl-Anthony Towns', 'team_id' => 3, 'jersey' => '32', 'salary' => 49205800.00],
    // Mikal Bridges -> New York Knicks (NYK, ID: 3, #25)
    ['player_name' => 'Mikal Bridges', 'team_id' => 3, 'jersey' => '25', 'salary' => 23300000.00],
    // Paul George -> Philadelphia 76ers (PHI, ID: 4, #8)
    ['player_name' => 'Paul George', 'team_id' => 4, 'jersey' => '8', 'salary' => 49205800.00],
    // Klay Thompson -> Dallas Mavericks (DAL, ID: 26, #31)
    ['player_name' => 'Klay Thompson', 'team_id' => 26, 'jersey' => '31', 'salary' => 15873016.00],
    // DeMar DeRozan -> Sacramento Kings (SAC, ID: 25, #10)
    ['player_name' => 'DeMar DeRozan', 'team_id' => 25, 'jersey' => '10', 'salary' => 23400000.00],
    // Alex Caruso -> Oklahoma City Thunder (OKC, ID: 18, #9)
    ['player_name' => 'Alex Caruso', 'team_id' => 18, 'jersey' => '9', 'salary' => 9890000.00],
    // Isaiah Hartenstein -> Oklahoma City Thunder (OKC, ID: 18, #55)
    ['player_name' => 'Isaiah Hartenstein', 'team_id' => 18, 'jersey' => '55', 'salary' => 29000000.00],
    // Chris Paul -> San Antonio Spurs (SAS, ID: 30, #3)
    ['player_name' => 'Chris Paul', 'team_id' => 30, 'jersey' => '3', 'salary' => 11000000.00],
    // Russell Westbrook -> Denver Nuggets (DEN, ID: 16, #4)
    ['player_name' => 'Russell Westbrook', 'team_id' => 16, 'jersey' => '4', 'salary' => 3303771.00],
    // Buddy Hield -> Golden State Warriors (GSW, ID: 21, #7)
    ['player_name' => 'Buddy Hield', 'team_id' => 21, 'jersey' => '7', 'salary' => 8780000.00],
    // Harrison Barnes -> San Antonio Spurs (SAS, ID: 30, #40)
    ['player_name' => 'Harrison Barnes', 'team_id' => 30, 'jersey' => '40', 'salary' => 18000000.00],
    // Caleb Martin -> Philadelphia 76ers (PHI, ID: 4, #16)
    ['player_name' => 'Caleb Martin', 'team_id' => 4, 'jersey' => '16', 'salary' => 8130000.00],
    // Kentavious Caldwell-Pope -> Orlando Magic (ORL, ID: 14, #3)
    ['player_name' => 'Kentavious Caldwell-Pope', 'team_id' => 14, 'jersey' => '3', 'salary' => 22000000.00],
    // Kyle Anderson -> Golden State Warriors (GSW, ID: 21, #1)
    ['player_name' => 'Kyle Anderson', 'team_id' => 21, 'jersey' => '1', 'salary' => 8780000.00],
    // CJ McCollum -> Atlanta Hawks (ATL, ID: 11, #3)
    ['player_name' => 'CJ McCollum', 'team_id' => 11, 'jersey' => '3', 'salary' => 33333333.00],
];

foreach ($trades as $t) {
    $player = DB::table('jogadores')->where('nome_completo', 'like', "%{$t['player_name']}%")->first();
    if ($player) {
        // Clear conflicting jersey number on target team
        DB::table('contratos_jogadores')
            ->where('equipa_id', $t['team_id'])
            ->where('numero_camisola', $t['jersey'])
            ->delete();

        // Clear existing contract of this player
        DB::table('contratos_jogadores')->where('jogador_id', $player->id)->delete();

        // Insert updated contract
        DB::table('contratos_jogadores')->insert([
            'jogador_id' => $player->id,
            'equipa_id' => $t['team_id'],
            'numero_camisola' => $t['jersey'],
            'salario_anual_usd' => $t['salary'],
            'data_inicio' => '2025-07-01',
            'data_fim' => '2028-06-30',
            'ativo' => 1
        ]);
        $team = DB::table('equipas')->find($t['team_id']);
        echo " [TRADE] {$player->nome_completo} -> {$team->sigla} ({$team->nome_completo}) #{$t['jersey']}\n";
    }
}

echo "\n--- 2. INSERTING 2024 & 2025 ROOKIES ---\n";
$newRookies = [
    // Cooper Flagg - No. 1 Pick 2025 -> Dallas Mavericks
    [
        'id' => 1642901,
        'nome_proprio' => 'Cooper',
        'sobrenome' => 'Flagg',
        'data_nascimento' => '2006-12-21',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.06,
        'peso_kg' => 93.0,
        'posicao_primaria' => 'SF',
        'draft_ano' => 2025,
        'draft_ronda' => 1,
        'draft_escolha' => 1,
        'foto_url' => '/images/players/1642901.png',
        'equipa_id' => 26, // DAL
        'camisola' => '32',
        'salario' => 12500000.00
    ],
    // Dylan Harper - No. 2 Pick 2025 -> San Antonio Spurs
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
        'salario' => 11200000.00
    ],
    // VJ Edgecombe - No. 3 Pick 2025 -> Philadelphia 76ers
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
        'salario' => 10100000.00
    ],
    // Ace Bailey - No. 5 Pick 2025 -> Utah Jazz
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
        'salario' => 8300000.00
    ],
    // Dalton Knecht - Pick 17 2024 -> Los Angeles Lakers
    [
        'id' => 1642270,
        'nome_proprio' => 'Dalton',
        'sobrenome' => 'Knecht',
        'data_nascimento' => '2001-04-19',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.98,
        'peso_kg' => 97.0,
        'posicao_primaria' => 'SG',
        'draft_ano' => 2024,
        'draft_ronda' => 1,
        'draft_escolha' => 17,
        'foto_url' => '/images/players/1642261.png',
        'equipa_id' => 23, // LAL
        'camisola' => '4',
        'salario' => 3819120.00
    ],
    // Bronny James - Pick 55 2024 -> Los Angeles Lakers
    [
        'id' => 1642355,
        'nome_proprio' => 'Bronny',
        'sobrenome' => 'James',
        'data_nascimento' => '2004-10-06',
        'nacionalidade' => 'EUA',
        'altura_metros' => 1.88,
        'peso_kg' => 95.0,
        'posicao_primaria' => 'PG',
        'draft_ano' => 2024,
        'draft_ronda' => 2,
        'draft_escolha' => 55,
        'foto_url' => '/images/players/1642355.png',
        'equipa_id' => 23, // LAL
        'camisola' => '9',
        'salario' => 1157153.00
    ],
    // Matas Buzelis - Pick 11 2024 -> Chicago Bulls
    [
        'id' => 1642266,
        'nome_proprio' => 'Matas',
        'sobrenome' => 'Buzelis',
        'data_nascimento' => '2004-10-13',
        'nacionalidade' => 'Lituânia',
        'altura_metros' => 2.08,
        'peso_kg' => 95.0,
        'posicao_primaria' => 'SF',
        'draft_ano' => 2024,
        'draft_ronda' => 1,
        'draft_escolha' => 11,
        'foto_url' => '/images/players/1642266.png',
        'equipa_id' => 6, // CHI
        'camisola' => '14',
        'salario' => 5192160.00
    ],
    // Donovan Clingan - Pick 7 2024 -> Portland Trail Blazers
    [
        'id' => 1642264,
        'nome_proprio' => 'Donovan',
        'sobrenome' => 'Clingan',
        'data_nascimento' => '2004-02-23',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.18,
        'peso_kg' => 127.0,
        'posicao_primaria' => 'C',
        'draft_ano' => 2024,
        'draft_ronda' => 1,
        'draft_escolha' => 7,
        'foto_url' => '/images/players/1642264.png',
        'equipa_id' => 19, // POR
        'camisola' => '23',
        'salario' => 6837720.00
    ]
];

foreach ($newRookies as $r) {
    $equipaId = $r['equipa_id'];
    $camisola = $r['camisola'];
    $salario = $r['salario'];
    $nome = $r['nome_proprio'] . ' ' . $r['sobrenome'];
    unset($r['equipa_id'], $r['camisola'], $r['salario']);

    DB::table('jogadores')->updateOrInsert(['id' => $r['id']], $r);

    DB::table('contratos_jogadores')
        ->where('equipa_id', $equipaId)
        ->where('numero_camisola', $camisola)
        ->delete();

    DB::table('contratos_jogadores')->where('jogador_id', $r['id'])->delete();

    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $r['id'],
        'equipa_id' => $equipaId,
        'numero_camisola' => $camisola,
        'salario_anual_usd' => $salario,
        'data_inicio' => '2025-07-01',
        'data_fim' => '2028-06-30',
        'ativo' => 1
    ]);
    echo " [ROOKIE] {$nome} -> Team {$equipaId} (#{$camisola})\n";
}

// 3. ATUALIZAR JOGOS RECENTES DA SEMANA DE ABERTURA 2026/27 (20 a 22 de Outubro de 2026)
echo "\n--- 3. UPDATING RECENT GAMES (OPENING WEEK OCTOBER 20-22, 2026) ---\n";
$ep2627 = DB::table('epocas')->where('nome', '2026/2027')->first();

DB::statement("SET FOREIGN_KEY_CHECKS = 0;");
DB::table('jogos_periodos')->truncate();
DB::table('jogos')->truncate();
DB::statement("SET FOREIGN_KEY_CHECKS = 1;");

$recentGames2026 = [
    [
        'id' => 1,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 1, // TD Garden
        'equipa_casa_id' => 1, // BOS
        'equipa_fora_id' => 3, // NYK (Towns & Bridges)
        'data_hora' => '2026-10-20 19:30:00',
        'pontos_casa' => 132,
        'pontos_fora' => 109,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 1,
        'publico_presente' => 19156,
        'canal_tv' => 'TNT / NBA League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 43, 'pontos_fora' => 24],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 31, 'pontos_fora' => 31],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 39, 'pontos_fora' => 32],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 19, 'pontos_fora' => 22],
        ]
    ],
    [
        'id' => 2,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 23, // Crypto.com Arena
        'equipa_casa_id' => 23, // LAL (LeBron, Bronny, Davis)
        'equipa_fora_id' => 17, // MIN (Anthony Edwards)
        'data_hora' => '2026-10-20 22:00:00',
        'pontos_casa' => 110,
        'pontos_fora' => 103,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 18997,
        'canal_tv' => 'TNT / NBA League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 22, 'pontos_fora' => 23],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 33, 'pontos_fora' => 19],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 27, 'pontos_fora' => 32],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 28, 'pontos_fora' => 29],
        ]
    ],
    [
        'id' => 3,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 26, // American Airlines Center
        'equipa_casa_id' => 26, // DAL (Luka, Cooper Flagg, Klay)
        'equipa_fora_id' => 30, // SAS (Wembanyama, Dylan Harper, CP3)
        'data_hora' => '2026-10-22 19:30:00',
        'pontos_casa' => 120,
        'pontos_fora' => 109,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 20413,
        'canal_tv' => 'TNT / NBA League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 20, 'pontos_fora' => 22],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 27, 'pontos_fora' => 27],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 40, 'pontos_fora' => 31],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 33, 'pontos_fora' => 29],
        ]
    ],
    [
        'id' => 4,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 15, // Capital One Arena
        'equipa_casa_id' => 15, // WAS (Trae Young, Alex Sarr, Poole)
        'equipa_fora_id' => 11, // ATL (Risacher, CJ McCollum, Jalen Johnson)
        'data_hora' => '2026-10-22 19:00:00',
        'pontos_casa' => 118,
        'pontos_fora' => 112,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 18400,
        'canal_tv' => 'Monumental Sports / League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 31, 'pontos_fora' => 26],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 28, 'pontos_fora' => 30],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 32, 'pontos_fora' => 29],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 27, 'pontos_fora' => 27],
        ]
    ],
    [
        'id' => 5,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 16, // Ball Arena
        'equipa_casa_id' => 16, // DEN (Jokić, Westbrook)
        'equipa_fora_id' => 18, // OKC (Shai, Caruso, Hartenstein)
        'data_hora' => '2026-10-22 22:00:00',
        'pontos_casa' => 87,
        'pontos_fora' => 102,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 19789,
        'canal_tv' => 'TNT / NBA League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 19, 'pontos_fora' => 31],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 32, 'pontos_fora' => 27],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 17, 'pontos_fora' => 27],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 19, 'pontos_fora' => 17],
        ]
    ],
    [
        'id' => 6,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 4, // Wells Fargo Center
        'equipa_casa_id' => 4, // PHI (Paul George, Embiid, VJ Edgecombe)
        'equipa_fora_id' => 10, // MIL (Giannis, Lillard)
        'data_hora' => '2026-10-21 19:30:00',
        'pontos_casa' => 109,
        'pontos_fora' => 124,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 19761,
        'canal_tv' => 'ESPN / NBA League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 23, 'pontos_fora' => 22],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 24, 'pontos_fora' => 36],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 34, 'pontos_fora' => 42],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 28, 'pontos_fora' => 24],
        ]
    ],
    [
        'id' => 7,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 25, // Golden 1 Center
        'equipa_casa_id' => 25, // SAC (DeRozan, Fox, Sabonis)
        'equipa_fora_id' => 17, // MIN (Anthony Edwards)
        'data_hora' => '2026-10-21 22:00:00',
        'pontos_casa' => 115,
        'pontos_fora' => 117,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 18061,
        'canal_tv' => 'NBCS California / League Pass',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 32, 'pontos_fora' => 29],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 27, 'pontos_fora' => 26],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 29, 'pontos_fora' => 34],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 27, 'pontos_fora' => 28],
        ]
    ],
    [
        'id' => 8,
        'epoca_id' => $ep2627->id,
        'fase_id' => 1,
        'arena_id' => 19, // Moda Center
        'equipa_casa_id' => 19, // POR (Clingan, Sharpe, Grant)
        'equipa_fora_id' => 21, // GSW (Curry, Buddy Hield, Green)
        'data_hora' => '2026-10-21 22:00:00',
        'pontos_casa' => 104,
        'pontos_fora' => 139,
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'destaque_hero' => 0,
        'publico_presente' => 19480,
        'canal_tv' => 'NBC Sports Bay Area',
        'quarters' => [
            ['periodo' => 'Q1', 'ordem' => 1, 'pontos_casa' => 21, 'pontos_fora' => 21],
            ['periodo' => 'Q2', 'ordem' => 2, 'pontos_casa' => 29, 'pontos_fora' => 41],
            ['periodo' => 'Q3', 'ordem' => 3, 'pontos_casa' => 22, 'pontos_fora' => 37],
            ['periodo' => 'Q4', 'ordem' => 4, 'pontos_casa' => 32, 'pontos_fora' => 40],
        ]
    ]
];

foreach ($recentGames2026 as $g) {
    $quarters = $g['quarters'];
    unset($g['quarters']);

    DB::table('jogos')->insert($g);

    foreach ($quarters as $q) {
        $q['jogo_id'] = $g['id'];
        DB::table('jogos_periodos')->insert($q);
    }
}

echo "SUCCESS: All trades, 2024/2025 rookies, and recent October 2026 games synchronized!\n";

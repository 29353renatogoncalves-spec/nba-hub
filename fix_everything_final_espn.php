<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DEFINITIVE ESPN 2026/27 DATA CORRECTION ===\n";

$ep2627_id = 5;
$ep2526_id = 6;

// -------------------------------------------------------------
// 1. ROSTER MOVES (ESPN 2026 BLOCKBUSTERS)
// -------------------------------------------------------------
echo "1. Applying Roster Moves...\n";

// 1.1 Luka Dončić -> Los Angeles Lakers (equipa_id = 23, #77)
$luka = DB::table('jogadores')->where('sobrenome', 'Doncic')->first();
if ($luka) {
    DB::table('contratos_jogadores')->where('jogador_id', $luka->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 23)->where('numero_camisola', '77')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $luka->id,
        'equipa_id' => 23, // LAL
        'numero_camisola' => '77',
        'salario_anual_usd' => 46000000.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2029-06-30',
        'ativo' => 1
    ]);
    echo " -> Luka Dončić to Los Angeles Lakers (#77)\n";
}

// 1.2 Walker Kessler -> Los Angeles Lakers (equipa_id = 23, #24)
$kessler = DB::table('jogadores')->where('sobrenome', 'Kessler')->first();
if (!$kessler) {
    $kesslerId = DB::table('jogadores')->insertGetId([
        'id' => 1631117,
        'nome_proprio' => 'Walker',
        'sobrenome' => 'Kessler',
        'data_nascimento' => '2001-07-26',
        'nacionalidade' => 'EUA',
        'altura_metros' => 2.13,
        'peso_kg' => 111.0,
        'posicao_primaria' => 'C',
        'draft_ano' => 2022,
        'draft_ronda' => 1,
        'draft_escolha' => 22,
        'foto_url' => '/images/players/1631117.png',
        'ativo' => 1
    ]);
    $kessler = (object)['id' => 1631117];
    // Copy photo if needed
    @copy(public_path('images/players/1642901.png'), public_path('images/players/1631117.png'));
}
DB::table('contratos_jogadores')->where('jogador_id', $kessler->id)->delete();
DB::table('contratos_jogadores')->where('equipa_id', 23)->where('numero_camisola', '24')->delete();
DB::table('contratos_jogadores')->insert([
    'jogador_id' => $kessler->id,
    'equipa_id' => 23, // LAL
    'numero_camisola' => '24',
    'salario_anual_usd' => 15000000.00,
    'data_inicio' => '2026-07-01',
    'data_fim' => '2029-06-30',
    'ativo' => 1
]);
echo " -> Walker Kessler to Los Angeles Lakers (#24)\n";

// 1.3 Kevin Durant -> Houston Rockets (equipa_id = 27, #35)
$kd = DB::table('jogadores')->where('id', 201142)->first();
if ($kd) {
    DB::table('contratos_jogadores')->where('jogador_id', $kd->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 27)->where('numero_camisola', '35')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $kd->id,
        'equipa_id' => 27, // HOU
        'numero_camisola' => '35',
        'salario_anual_usd' => 51179021.00,
        'data_inicio' => '2026-07-01',
        'data_fim' => '2027-06-30',
        'ativo' => 1
    ]);
    echo " -> Kevin Durant to Houston Rockets (#35)\n";
}

// 1.4 Cooper Flagg -> Dallas Mavericks (equipa_id = 26, #32)
$flagg = DB::table('jogadores')->where('id', 1642901)->first();
if ($flagg) {
    DB::table('contratos_jogadores')->where('jogador_id', $flagg->id)->delete();
    DB::table('contratos_jogadores')->where('equipa_id', 26)->where('numero_camisola', '32')->delete();
    DB::table('contratos_jogadores')->insert([
        'jogador_id' => $flagg->id,
        'equipa_id' => 26, // DAL
        'numero_camisola' => '32',
        'salario_anual_usd' => 13500000.00,
        'data_inicio' => '2025-07-01',
        'data_fim' => '2029-06-30',
        'ativo' => 1
    ]);
    echo " -> Cooper Flagg on Dallas Mavericks (#32)\n";
}

// -------------------------------------------------------------
// 2. SEED ALL 16 OPENING WEEK GAMES WITH CORRECT HOME/AWAY & ARENAS
// -------------------------------------------------------------
echo "\n2. Seeding ALL 16 Official Games with Exact Home/Away & Arenas...\n";

DB::table('jogos')->where('epoca_id', $ep2627_id)->delete();
DB::table('jogos_periodos')->delete();

$real16Games = [
    // 1. HERO GAME: LAL 127 - GSW 105 (21 Out, Crypto.com Arena, ESPN)
    [
        'id' => 1,
        'data_hora' => '2026-10-21 22:00:00',
        'casa_id' => 23, // LAL
        'fora_id' => 21, // GSW
        'arena_id' => 14, // Crypto.com Arena
        'pts_casa' => 127,
        'pts_fora' => 105,
        'tv' => 'ESPN',
        'hero' => 1,
        'quarters' => [
            ['q' => 'Q1', 'c' => 34, 'f' => 28],
            ['q' => 'Q2', 'c' => 36, 'f' => 26],
            ['q' => 'Q3', 'c' => 31, 'f' => 27],
            ['q' => 'Q4', 'c' => 26, 'f' => 24]
        ]
    ],
    // 2. PHI 106 - NYK 100 (20 Out, Madison Square Garden - NYK é CASA!)
    [
        'id' => 2,
        'data_hora' => '2026-10-20 19:30:00',
        'casa_id' => 3, // NYK (Home - Ring Night)
        'fora_id' => 4, // PHI (Away)
        'arena_id' => 20, // Madison Square Garden
        'pts_casa' => 100,
        'pts_fora' => 106,
        'tv' => 'NBC/Peacock',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 26, 'f' => 29],
            ['q' => 'Q2', 'c' => 25, 'f' => 24],
            ['q' => 'Q3', 'c' => 23, 'f' => 28],
            ['q' => 'Q4', 'c' => 26, 'f' => 25]
        ]
    ],
    // 3. OKC 116 - SAS 104 (20 Out, Frost Bank Center - SAS é CASA!)
    [
        'id' => 3,
        'data_hora' => '2026-10-20 22:00:00',
        'casa_id' => 30, // SAS (Home)
        'fora_id' => 18, // OKC (Away)
        'arena_id' => 27, // Frost Bank Center
        'pts_casa' => 104,
        'pts_fora' => 116,
        'tv' => 'NBC/Peacock',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 28, 'f' => 32],
            ['q' => 'Q2', 'c' => 26, 'f' => 28],
            ['q' => 'Q3', 'c' => 26, 'f' => 29],
            ['q' => 'Q4', 'c' => 24, 'f' => 27]
        ]
    ],
    // 4. DET 121 - BOS 113 (20 Out, Little Caesars Arena - DET é CASA!)
    [
        'id' => 4,
        'data_hora' => '2026-10-20 19:00:00',
        'casa_id' => 8, // DET (Home)
        'fora_id' => 1, // BOS (Away)
        'arena_id' => 9, // Little Caesars Arena
        'pts_casa' => 121,
        'pts_fora' => 113,
        'tv' => 'NBC/Peacock',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 28, 'f' => 32],
            ['q' => 'Q2', 'c' => 30, 'f' => 26],
            ['q' => 'Q3', 'c' => 31, 'f' => 29],
            ['q' => 'Q4', 'c' => 32, 'f' => 26]
        ]
    ],
    // 5. MIN 131 - MIA 106 (21 Out, Kaseya Center - MIA é CASA!)
    [
        'id' => 5,
        'data_hora' => '2026-10-21 19:30:00',
        'casa_id' => 13, // MIA (Home)
        'fora_id' => 17, // MIN (Away)
        'arena_id' => 16, // Kaseya Center
        'pts_casa' => 106,
        'pts_fora' => 131,
        'tv' => 'ESPN',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 26, 'f' => 35],
            ['q' => 'Q2', 'c' => 25, 'f' => 34],
            ['q' => 'Q3', 'c' => 28, 'f' => 32],
            ['q' => 'Q4', 'c' => 27, 'f' => 30]
        ]
    ],
    // 6. WAS 128 - MIL 116 (21 Out, Capital One Arena - WAS é CASA!)
    [
        'id' => 6,
        'data_hora' => '2026-10-21 19:00:00',
        'casa_id' => 15, // WAS (Home)
        'fora_id' => 10, // MIL (Away)
        'arena_id' => 30, // Capital One Arena
        'pts_casa' => 128,
        'pts_fora' => 116,
        'tv' => 'Monumental',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 33, 'f' => 28],
            ['q' => 'Q2', 'c' => 32, 'f' => 30],
            ['q' => 'Q3', 'c' => 31, 'f' => 28],
            ['q' => 'Q4', 'c' => 32, 'f' => 30]
        ]
    ],
    // 7. PHI 114 - CLE 106 (22 Out, Wells Fargo Center - PHI é CASA!)
    [
        'id' => 7,
        'data_hora' => '2026-10-22 19:00:00',
        'casa_id' => 4, // PHI (Home)
        'fora_id' => 7, // CLE (Away)
        'arena_id' => 23, // Wells Fargo Center
        'pts_casa' => 114,
        'pts_fora' => 106,
        'tv' => 'ESPN',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 22, 'f' => 38],
            ['q' => 'Q2', 'c' => 23, 'f' => 31],
            ['q' => 'Q3', 'c' => 35, 'f' => 18],
            ['q' => 'Q4', 'c' => 34, 'f' => 19]
        ]
    ],
    // 8. OKC 96 - DEN 84 (22 Out, Paycom Center - OKC é CASA!)
    [
        'id' => 8,
        'data_hora' => '2026-10-22 21:30:00',
        'casa_id' => 18, // OKC (Home)
        'fora_id' => 16, // DEN (Away)
        'arena_id' => 21, // Paycom Center
        'pts_casa' => 96,
        'pts_fora' => 84,
        'tv' => 'ESPN',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 24, 'f' => 20],
            ['q' => 'Q2', 'c' => 26, 'f' => 21],
            ['q' => 'Q3', 'c' => 22, 'f' => 22],
            ['q' => 'Q4', 'c' => 24, 'f' => 21]
        ]
    ],
    // 9. ATL 132 - ORL 125 (21 Out, Kia Center - ORL é CASA!)
    [
        'id' => 9,
        'data_hora' => '2026-10-21 19:30:00',
        'casa_id' => 14, // ORL (Home)
        'fora_id' => 11, // ATL (Away)
        'arena_id' => 22, // Kia Center
        'pts_casa' => 125,
        'pts_fora' => 132,
        'tv' => 'Bally Sports FL',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 32, 'f' => 36],
            ['q' => 'Q2', 'c' => 31, 'f' => 33],
            ['q' => 'Q3', 'c' => 30, 'f' => 31],
            ['q' => 'Q4', 'c' => 32, 'f' => 32]
        ]
    ],
    // 10. TOR 135 - CHI 92 (21 Out, Scotiabank Arena - TOR é CASA!)
    [
        'id' => 10,
        'data_hora' => '2026-10-21 19:30:00',
        'casa_id' => 5, // TOR (Home)
        'fora_id' => 6, // CHI (Away)
        'arena_id' => 28, // Scotiabank Arena
        'pts_casa' => 135,
        'pts_fora' => 92,
        'tv' => 'TSN',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 38, 'f' => 22],
            ['q' => 'Q2', 'c' => 34, 'f' => 24],
            ['q' => 'Q3', 'c' => 33, 'f' => 22],
            ['q' => 'Q4', 'c' => 30, 'f' => 24]
        ]
    ],
    // 11. LAC 121 - SAC 96 (21 Out, Intuit Dome - LAC é CASA!)
    [
        'id' => 11,
        'data_hora' => '2026-10-21 22:30:00',
        'casa_id' => 22, // LAC (Home)
        'fora_id' => 25, // SAC (Away)
        'arena_id' => 13, // Intuit Dome
        'pts_casa' => 121,
        'pts_fora' => 96,
        'tv' => 'Bally Sports SoCal',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 32, 'f' => 23],
            ['q' => 'Q2', 'c' => 31, 'f' => 25],
            ['q' => 'Q3', 'c' => 30, 'f' => 24],
            ['q' => 'Q4', 'c' => 28, 'f' => 24]
        ]
    ],
    // 12. CHA 110 - BKN 103 (21 Out, Barclays Center - BKN é CASA!)
    [
        'id' => 12,
        'data_hora' => '2026-10-21 19:00:00',
        'casa_id' => 2, // BKN (Home)
        'fora_id' => 12, // CHA (Away)
        'arena_id' => 3, // Barclays Center
        'pts_casa' => 103,
        'pts_fora' => 110,
        'tv' => 'YES Network',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 24, 'f' => 27],
            ['q' => 'Q2', 'c' => 28, 'f' => 29],
            ['q' => 'Q3', 'c' => 25, 'f' => 26],
            ['q' => 'Q4', 'c' => 26, 'f' => 28]
        ]
    ],
    // 13. HOU 128 - DAL 110 (21 Out, Toyota Center - HOU é CASA!)
    [
        'id' => 13,
        'data_hora' => '2026-10-21 20:00:00',
        'casa_id' => 27, // HOU (Home)
        'fora_id' => 26, // DAL (Away)
        'arena_id' => 11, // Toyota Center
        'pts_casa' => 128,
        'pts_fora' => 110,
        'tv' => 'Space City',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 34, 'f' => 26],
            ['q' => 'Q2', 'c' => 33, 'f' => 28],
            ['q' => 'Q3', 'c' => 31, 'f' => 28],
            ['q' => 'Q4', 'c' => 30, 'f' => 28]
        ]
    ],
    // 14. IND 123 - NOP 120 (21 Out, Smoothie King Center - NOP é CASA!)
    [
        'id' => 14,
        'data_hora' => '2026-10-21 20:00:00',
        'casa_id' => 29, // NOP (Home)
        'fora_id' => 9, // IND (Away)
        'arena_id' => 19, // Smoothie King Center
        'pts_casa' => 120,
        'pts_fora' => 123,
        'tv' => 'Bally Sports IN',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 29, 'f' => 30],
            ['q' => 'Q2', 'c' => 30, 'f' => 32],
            ['q' => 'Q3', 'c' => 31, 'f' => 29],
            ['q' => 'Q4', 'c' => 30, 'f' => 32]
        ]
    ],
    // 15. MEM 123 - UTA 103 (21 Out, FedExForum - MEM é CASA!)
    [
        'id' => 15,
        'data_hora' => '2026-10-21 20:00:00',
        'casa_id' => 28, // MEM (Home)
        'fora_id' => 20, // UTA (Away)
        'arena_id' => 15, // FedExForum
        'pts_casa' => 123,
        'pts_fora' => 103,
        'tv' => 'Bally Sports SE',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 33, 'f' => 24],
            ['q' => 'Q2', 'c' => 31, 'f' => 26],
            ['q' => 'Q3', 'c' => 30, 'f' => 27],
            ['q' => 'Q4', 'c' => 29, 'f' => 26]
        ]
    ],
    // 16. POR 124 - PHX 83 (21 Out, Moda Center - POR é CASA!)
    [
        'id' => 16,
        'data_hora' => '2026-10-21 22:00:00',
        'casa_id' => 19, // POR (Home)
        'fora_id' => 24, // PHX (Away)
        'arena_id' => 25, // Moda Center
        'pts_casa' => 124,
        'pts_fora' => 83,
        'tv' => 'ROOT Sports',
        'hero' => 0,
        'quarters' => [
            ['q' => 'Q1', 'c' => 32, 'f' => 18],
            ['q' => 'Q2', 'c' => 30, 'f' => 20],
            ['q' => 'Q3', 'c' => 32, 'f' => 22],
            ['q' => 'Q4', 'c' => 30, 'f' => 23]
        ]
    ]
];

foreach ($real16Games as $g) {
    DB::table('jogos')->insert([
        'id' => $g['id'],
        'epoca_id' => $ep2627_id,
        'fase_id' => 1,
        'arena_id' => $g['arena_id'],
        'equipa_casa_id' => $g['casa_id'],
        'equipa_fora_id' => $g['fora_id'],
        'data_hora' => $g['data_hora'],
        'estado' => 'concluido',
        'periodo_atual' => 'Final',
        'tempo_restante' => '00:00',
        'pontos_casa' => $g['pts_casa'],
        'pontos_fora' => $g['pts_fora'],
        'canal_tv' => $g['tv'],
        'destaque_hero' => $g['hero'],
    ]);

    $order = 1;
    foreach ($g['quarters'] as $q) {
        DB::table('jogos_periodos')->insert([
            'jogo_id' => $g['id'],
            'periodo' => $q['q'],
            'ordem' => $order++,
            'pontos_casa' => $q['c'],
            'pontos_fora' => $q['f'],
        ]);
    }
}
echo " -> All 16 opening games inserted with exact home/away teams, correct arenas and quarter scores!\n";

// -------------------------------------------------------------
// 3. DYNAMICALLY COMPUTE ACCURATE STANDINGS FOR 2026/2027
// -------------------------------------------------------------
echo "\n3. Computing Accurate Standings from All 16 Games...\n";

DB::table('classificacao_oficial')->where('epoca_id', $ep2627_id)->delete();

$teams = DB::table('equipas')->get();
foreach ($teams as $team) {
    $tId = $team->id;

    $homeGames = DB::table('jogos')->where('epoca_id', $ep2627_id)->where('equipa_casa_id', $tId)->get();
    $awayGames = DB::table('jogos')->where('epoca_id', $ep2627_id)->where('equipa_fora_id', $tId)->get();

    $vCasa = $homeGames->filter(function($g) { return $g->pontos_casa > $g->pontos_fora; })->count();
    $dCasa = $homeGames->filter(function($g) { return $g->pontos_casa < $g->pontos_fora; })->count();

    $vFora = $awayGames->filter(function($g) { return $g->pontos_fora > $g->pontos_casa; })->count();
    $dFora = $awayGames->filter(function($g) { return $g->pontos_fora < $g->pontos_casa; })->count();

    $totalV = $vCasa + $vFora;
    $totalD = $dCasa + $dFora;

    $ptsMarcados = $homeGames->sum('pontos_casa') + $awayGames->sum('pontos_fora');
    $ptsSofridos = $homeGames->sum('pontos_fora') + $awayGames->sum('pontos_casa');

    // Last games & streak
    $allGames = DB::table('jogos')
        ->where('epoca_id', $ep2627_id)
        ->where(function($q) use ($tId) {
            $q->where('equipa_casa_id', $tId)->orWhere('equipa_fora_id', $tId);
        })
        ->orderBy('data_hora', 'asc')
        ->get();

    $streak = '-';
    if ($allGames->isNotEmpty()) {
        $lastGame = $allGames->last();
        $isHome = ($lastGame->equipa_casa_id == $tId);
        $won = $isHome ? ($lastGame->pontos_casa > $lastGame->pontos_fora) : ($lastGame->pontos_fora > $lastGame->pontos_casa);
        $streak = $won ? ($totalV . 'V') : ($totalD . 'D');
    }

    DB::table('classificacao_oficial')->insert([
        'epoca_id' => $ep2627_id,
        'fase_id' => 1,
        'equipa_id' => $tId,
        'vitorias' => $totalV,
        'derrotas' => $totalD,
        'pontos_marcados' => $ptsMarcados,
        'pontos_sofridos' => $ptsSofridos,
        'vitorias_casa' => $vCasa,
        'derrotas_casa' => $dCasa,
        'vitorias_fora' => $vFora,
        'derrotas_fora' => $dFora,
        'ultimos_10' => "{$totalV}-{$totalD}",
        'sequencia_atual' => $streak,
        'atualizado_em' => now(),
    ]);
}
echo " -> 2026/27 Standings 100% matched with all 16 games!\n";

// -------------------------------------------------------------
// 4. BOX SCORES IN JOGOS_ESTATISTICAS_JOGADORES
// -------------------------------------------------------------
echo "\n4. Updating Box Scores in jogos_estatisticas_jogadores...\n";
DB::table('jogos_estatisticas_jogadores')->delete();

$boxScores = [
    // Game 1: Lakers 127 - Warriors 105
    // Luka Dončić 28 pts, 8 reb, 7 ast; Walker Kessler 26 pts, 9 reb; Reaves 23 pts
    1 => [
        ['id' => 1629029, 'equipa' => 23, 'gs' => 1, 'min' => 35, 'fgm' => 10, 'fga' => 19, '3pm' => 4, '3pa' => 8, 'ftm' => 4, 'fta' => 5, 'pts' => 28, 'oreb' => 1, 'dreb' => 7, 'ast' => 7, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => 22],
        ['id' => 1631117, 'equipa' => 23, 'gs' => 1, 'min' => 32, 'fgm' => 12, 'fga' => 12, '3pm' => 0, '3pa' => 0, 'ftm' => 2, 'fta' => 3, 'pts' => 26, 'oreb' => 4, 'dreb' => 5, 'ast' => 2, 'stl' => 1, 'blk' => 3, 'to' => 1, 'pf' => 3, 'pm' => 20],
        ['id' => 1630559, 'equipa' => 23, 'gs' => 1, 'min' => 33, 'fgm' => 8, 'fga' => 14, '3pm' => 3, '3pa' => 6, 'ftm' => 4, 'fta' => 4, 'pts' => 23, 'oreb' => 0, 'dreb' => 4, 'ast' => 6, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => 18],
        ['id' => 201939, 'equipa' => 21, 'gs' => 1, 'min' => 32, 'fgm' => 8, 'fga' => 18, '3pm' => 5, '3pa' => 11, 'ftm' => 2, 'fta' => 2, 'pts' => 23, 'oreb' => 0, 'dreb' => 4, 'ast' => 5, 'stl' => 1, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => -18],
    ],
    // Game 13: Rockets 128 - Mavericks 110
    // Durant 30 pts; Cooper Flagg 19 pts, 8 reb
    13 => [
        ['id' => 201142, 'equipa' => 27, 'gs' => 1, 'min' => 36, 'fgm' => 11, 'fga' => 19, '3pm' => 4, '3pa' => 7, 'ftm' => 4, 'fta' => 4, 'pts' => 30, 'oreb' => 1, 'dreb' => 6, 'ast' => 5, 'stl' => 1, 'blk' => 2, 'to' => 2, 'pf' => 2, 'pm' => 18],
        ['id' => 1642901, 'equipa' => 26, 'gs' => 1, 'min' => 35, 'fgm' => 7, 'fga' => 15, '3pm' => 2, '3pa' => 5, 'ftm' => 3, 'fta' => 4, 'pts' => 19, 'oreb' => 2, 'dreb' => 6, 'ast' => 4, 'stl' => 1, 'blk' => 2, 'to' => 2, 'pf' => 3, 'pm' => -14],
        ['id' => 202681, 'equipa' => 26, 'gs' => 1, 'min' => 36, 'fgm' => 9, 'fga' => 20, '3pm' => 3, '3pa' => 8, 'ftm' => 5, 'fta' => 5, 'pts' => 26, 'oreb' => 1, 'dreb' => 3, 'ast' => 6, 'stl' => 1, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => -12],
    ],
    // Game 7: Sixers 114 - Cavaliers 106
    7 => [
        ['id' => 1630178, 'equipa' => 4, 'gs' => 1, 'min' => 39, 'fgm' => 11, 'fga' => 21, '3pm' => 4, '3pa' => 8, 'ftm' => 6, 'fta' => 6, 'pts' => 32, 'oreb' => 0, 'dreb' => 3, 'ast' => 7, 'stl' => 1, 'blk' => 0, 'to' => 2, 'pf' => 2, 'pm' => 12],
        ['id' => 203954, 'equipa' => 4, 'gs' => 1, 'min' => 34, 'fgm' => 9, 'fga' => 17, '3pm' => 1, '3pa' => 3, 'ftm' => 5, 'fta' => 6, 'pts' => 24, 'oreb' => 3, 'dreb' => 8, 'ast' => 3, 'stl' => 0, 'blk' => 2, 'to' => 3, 'pf' => 3, 'pm' => 10],
        ['id' => 1627759, 'equipa' => 4, 'gs' => 1, 'min' => 35, 'fgm' => 8, 'fga' => 16, '3pm' => 2, '3pa' => 5, 'ftm' => 3, 'fta' => 4, 'pts' => 21, 'oreb' => 1, 'dreb' => 5, 'ast' => 4, 'stl' => 2, 'blk' => 0, 'to' => 2, 'pf' => 3, 'pm' => 8],
        ['id' => 2544, 'equipa' => 4, 'gs' => 1, 'min' => 33, 'fgm' => 6, 'fga' => 14, '3pm' => 1, '3pa' => 4, 'ftm' => 4, 'fta' => 5, 'pts' => 17, 'oreb' => 2, 'dreb' => 8, 'ast' => 8, 'stl' => 1, 'blk' => 1, 'to' => 2, 'pf' => 2, 'pm' => 8],
    ],
    // Game 8: Thunder 96 - Nuggets 84
    8 => [
        ['id' => 1631096, 'equipa' => 18, 'gs' => 1, 'min' => 35, 'fgm' => 8, 'fga' => 16, '3pm' => 2, '3pa' => 5, 'ftm' => 3, 'fta' => 3, 'pts' => 21, 'oreb' => 1, 'dreb' => 5, 'ast' => 5, 'stl' => 2, 'blk' => 0, 'to' => 1, 'pf' => 2, 'pm' => 14],
        ['id' => 1631099, 'equipa' => 18, 'gs' => 1, 'min' => 34, 'fgm' => 7, 'fga' => 13, '3pm' => 2, '3pa' => 4, 'ftm' => 3, 'fta' => 4, 'pts' => 19, 'oreb' => 3, 'dreb' => 8, 'ast' => 2, 'stl' => 1, 'blk' => 3, 'to' => 1, 'pf' => 3, 'pm' => 12],
    ],
    // Game 9: Hawks 132 - Magic 125
    9 => [
        ['id' => 1629027, 'equipa' => 11, 'gs' => 1, 'min' => 37, 'fgm' => 11, 'fga' => 21, '3pm' => 5, '3pa' => 11, 'ftm' => 7, 'fta' => 8, 'pts' => 34, 'oreb' => 0, 'dreb' => 4, 'ast' => 14, 'stl' => 2, 'blk' => 0, 'to' => 3, 'pf' => 2, 'pm' => 10],
        ['id' => 1631094, 'equipa' => 14, 'gs' => 1, 'min' => 36, 'fgm' => 10, 'fga' => 22, '3pm' => 2, '3pa' => 6, 'ftm' => 7, 'fta' => 9, 'pts' => 29, 'oreb' => 2, 'dreb' => 7, 'ast' => 6, 'stl' => 1, 'blk' => 1, 'to' => 3, 'pf' => 3, 'pm' => -8],
    ]
];

foreach ($boxScores as $jogoId => $players) {
    foreach ($players as $p) {
        if (DB::table('jogadores')->where('id', $p['id'])->exists()) {
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
        }
    }
}

// -------------------------------------------------------------
// 5. UPDATE PLAYER SEASON STATS (2026/27)
// -------------------------------------------------------------
echo "\n5. Updating Player Season Stats for 2026/2027...\n";
// Luka Doncic on Lakers
DB::table('estatisticas_jogador_epoca')->updateOrInsert(
    ['jogador_id' => $luka->id, 'epoca_id' => $ep2627_id],
    [
        'equipa_id' => 23, // LAL
        'jogos_disputados' => 1,
        'titular' => 1,
        'minutos_jogo' => 35.0,
        'pontos_jogo' => 28.0,
        'ressaltos_jogo' => 8.0,
        'assistencias_jogo' => 7.0,
        'roubos_jogo' => 1.0,
        'desarmes_jogo' => 0.0,
        'fg_pct' => 52.6,
        'fg3_pct' => 50.0,
        'ft_pct' => 80.0
    ]
);

// Kevin Durant on Rockets
DB::table('estatisticas_jogador_epoca')->updateOrInsert(
    ['jogador_id' => $kd->id, 'epoca_id' => $ep2627_id],
    [
        'equipa_id' => 27, // HOU
        'jogos_disputados' => 1,
        'titular' => 1,
        'minutos_jogo' => 36.0,
        'pontos_jogo' => 30.0,
        'ressaltos_jogo' => 7.0,
        'assistencias_jogo' => 5.0,
        'roubos_jogo' => 1.0,
        'desarmes_jogo' => 2.0,
        'fg_pct' => 57.9,
        'fg3_pct' => 57.1,
        'ft_pct' => 100.0
    ]
);

// Walker Kessler on Lakers
DB::table('estatisticas_jogador_epoca')->updateOrInsert(
    ['jogador_id' => $kessler->id, 'epoca_id' => $ep2627_id],
    [
        'equipa_id' => 23, // LAL
        'jogos_disputados' => 1,
        'titular' => 1,
        'minutos_jogo' => 32.0,
        'pontos_jogo' => 26.0,
        'ressaltos_jogo' => 9.0,
        'assistencias_jogo' => 2.0,
        'roubos_jogo' => 1.0,
        'desarmes_jogo' => 3.0,
        'fg_pct' => 100.0,
        'fg3_pct' => 0.0,
        'ft_pct' => 66.7
    ]
);

echo "\n=== ALL 16 ESPN 2026 GAMES & ROSTERS SYNCHRONIZED ===\n";

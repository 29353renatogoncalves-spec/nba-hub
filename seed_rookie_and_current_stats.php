<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "--- 1. SEEDING ROOKIE SEASON STATS FOR 2024/25 & 2025/26 ---\n";

$ep2526 = DB::table('epocas')->where('nome', '2025/2026')->first();
$ep2627 = DB::table('epocas')->where('nome', '2026/2027')->first();
$ep2425 = DB::table('epocas')->where('nome', '2024/2025')->first();

$ep2526_id = $ep2526 ? $ep2526->id : 6;
$ep2627_id = $ep2627 ? $ep2627->id : 5;
$ep2425_id = $ep2425 ? $ep2425->id : 1;

$rookieStats = [
    // Cooper Flagg - Dallas Mavericks (26)
    [
        'jogador_id' => 1642901,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 26,
        'jogos_disputados' => 76,
        'titular' => 76,
        'minutos_jogo' => 33.5,
        'pontos_jogo' => 18.8,
        'ressaltos_jogo' => 8.2,
        'assistencias_jogo' => 4.4,
        'roubos_jogo' => 1.6,
        'desarmes_jogo' => 1.8,
        'fg_pct' => 48.5,
        'fg3_pct' => 37.2,
        'ft_pct' => 81.4
    ],
    // Dylan Harper - San Antonio Spurs (30)
    [
        'jogador_id' => 1642902,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 30,
        'jogos_disputados' => 74,
        'titular' => 70,
        'minutos_jogo' => 31.0,
        'pontos_jogo' => 16.5,
        'ressaltos_jogo' => 4.8,
        'assistencias_jogo' => 5.8,
        'roubos_jogo' => 1.2,
        'desarmes_jogo' => 0.4,
        'fg_pct' => 46.8,
        'fg3_pct' => 36.5,
        'ft_pct' => 79.8
    ],
    // VJ Edgecombe - Philadelphia 76ers (4)
    [
        'jogador_id' => 1642903,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 4,
        'jogos_disputados' => 72,
        'titular' => 55,
        'minutos_jogo' => 29.5,
        'pontos_jogo' => 14.8,
        'ressaltos_jogo' => 5.2,
        'assistencias_jogo' => 3.4,
        'roubos_jogo' => 1.4,
        'desarmes_jogo' => 0.7,
        'fg_pct' => 45.9,
        'fg3_pct' => 35.8,
        'ft_pct' => 78.2
    ],
    // Ace Bailey - Utah Jazz (20)
    [
        'jogador_id' => 1642905,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 20,
        'jogos_disputados' => 75,
        'titular' => 68,
        'minutos_jogo' => 32.0,
        'pontos_jogo' => 17.6,
        'ressaltos_jogo' => 6.4,
        'assistencias_jogo' => 2.8,
        'roubos_jogo' => 1.1,
        'desarmes_jogo' => 1.0,
        'fg_pct' => 45.2,
        'fg3_pct' => 36.0,
        'ft_pct' => 77.5
    ],
    // Dalton Knecht - Los Angeles Lakers (23)
    [
        'jogador_id' => 1642270,
        'epoca_id' => $ep2425_id,
        'equipa_id' => 23,
        'jogos_disputados' => 74,
        'titular' => 18,
        'minutos_jogo' => 24.2,
        'pontos_jogo' => 11.8,
        'ressaltos_jogo' => 3.2,
        'assistencias_jogo' => 1.8,
        'roubos_jogo' => 0.7,
        'desarmes_jogo' => 0.3,
        'fg_pct' => 46.2,
        'fg3_pct' => 38.8,
        'ft_pct' => 82.5
    ],
    [
        'jogador_id' => 1642270,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 23,
        'jogos_disputados' => 78,
        'titular' => 42,
        'minutos_jogo' => 28.5,
        'pontos_jogo' => 15.4,
        'ressaltos_jogo' => 3.8,
        'assistencias_jogo' => 2.4,
        'roubos_jogo' => 0.9,
        'desarmes_jogo' => 0.4,
        'fg_pct' => 47.5,
        'fg3_pct' => 40.2,
        'ft_pct' => 84.8
    ],
    // Bronny James - Los Angeles Lakers (23) - 2024/25 e 2025/26
    [
        'jogador_id' => 1642355,
        'epoca_id' => $ep2425_id,
        'equipa_id' => 23,
        'jogos_disputados' => 28,
        'titular' => 2,
        'minutos_jogo' => 12.4,
        'pontos_jogo' => 4.2,
        'ressaltos_jogo' => 1.8,
        'assistencias_jogo' => 1.9,
        'roubos_jogo' => 0.6,
        'desarmes_jogo' => 0.2,
        'fg_pct' => 41.2,
        'fg3_pct' => 32.4,
        'ft_pct' => 75.0
    ],
    [
        'jogador_id' => 1642355,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 23,
        'jogos_disputados' => 46,
        'titular' => 8,
        'minutos_jogo' => 16.8,
        'pontos_jogo' => 6.5,
        'ressaltos_jogo' => 2.4,
        'assistencias_jogo' => 2.8,
        'roubos_jogo' => 0.9,
        'desarmes_jogo' => 0.4,
        'fg_pct' => 44.5,
        'fg3_pct' => 35.5,
        'ft_pct' => 78.0
    ],
    // Donovan Clingan - Portland Trail Blazers (19)
    [
        'jogador_id' => 1642264,
        'epoca_id' => $ep2425_id,
        'equipa_id' => 19,
        'jogos_disputados' => 68,
        'titular' => 32,
        'minutos_jogo' => 22.0,
        'pontos_jogo' => 9.4,
        'ressaltos_jogo' => 8.1,
        'assistencias_jogo' => 1.4,
        'roubos_jogo' => 0.4,
        'desarmes_jogo' => 1.9,
        'fg_pct' => 58.2,
        'fg3_pct' => 25.0,
        'ft_pct' => 68.5
    ],
    [
        'jogador_id' => 1642264,
        'epoca_id' => $ep2526_id,
        'equipa_id' => 19,
        'jogos_disputados' => 76,
        'titular' => 65,
        'minutos_jogo' => 27.5,
        'pontos_jogo' => 12.8,
        'ressaltos_jogo' => 10.4,
        'assistencias_jogo' => 2.0,
        'roubos_jogo' => 0.6,
        'desarmes_jogo' => 2.4,
        'fg_pct' => 59.8,
        'fg3_pct' => 31.0,
        'ft_pct' => 72.0
    ]
];

foreach ($rookieStats as $stat) {
    DB::table('estatisticas_jogador_epoca')->updateOrInsert(
        ['jogador_id' => $stat['jogador_id'], 'epoca_id' => $stat['epoca_id']],
        $stat
    );
    echo " [STAT] Jogador {$stat['jogador_id']} na época {$stat['epoca_id']} inserido/atualizado.\n";
}

echo "\n--- 2. SEEDING BOX SCORE (jogos_estatisticas_jogadores) FOR RECENT OPENING WEEK GAMES ---\n";

DB::table('jogos_estatisticas_jogadores')->truncate();

// 8 Jogos Recentes de 20 a 22 de Outubro de 2026:
// Jogo 1: BOS (132) vs NYK (109) - TD Garden
$boxScores = [
    // Boston Celtics
    ['jogo_id' => 1, 'jogador_id' => 1628369, 'equipa_id' => 1, 'titular' => 1, 'minutos' => 34, 'segundos' => 20, 'fg_marcados' => 14, 'fg_tentados' => 18, 'fg3_marcados' => 8, 'fg3_tentados' => 11, 'ft_marcados' => 1, 'ft_tentados' => 2, 'pontos' => 37, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 3, 'ressaltos_totais' => 4, 'assistencias' => 10, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 1, 'faltas_pessoais' => 2, 'mais_menos' => 26],
    ['jogo_id' => 1, 'jogador_id' => 1627759, 'equipa_id' => 1, 'titular' => 1, 'minutos' => 30, 'segundos' => 12, 'fg_marcados' => 8, 'fg_tentados' => 15, 'fg3_marcados' => 5, 'fg3_tentados' => 9, 'ft_marcados' => 2, 'ft_tentados' => 2, 'pontos' => 23, 'ressaltos_ofensivos' => 2, 'ressaltos_defensivos' => 5, 'ressaltos_totais' => 7, 'assistencias' => 3, 'roubos_bola' => 2, 'desarmes_lancamento' => 1, 'perdas_bola' => 2, 'faltas_pessoais' => 3, 'mais_menos' => 18],
    ['jogo_id' => 1, 'jogador_id' => 1628401, 'equipa_id' => 1, 'titular' => 1, 'minutos' => 29, 'segundos' => 45, 'fg_marcados' => 9, 'fg_tentados' => 13, 'fg3_marcados' => 6, 'fg3_tentados' => 10, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 24, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 3, 'ressaltos_totais' => 3, 'assistencias' => 4, 'roubos_bola' => 1, 'desarmes_lancamento' => 0, 'perdas_bola' => 1, 'faltas_pessoais' => 1, 'mais_menos' => 21],
    ['jogo_id' => 1, 'jogador_id' => 201950, 'equipa_id' => 1, 'titular' => 1, 'minutos' => 25, 'segundos' => 10, 'fg_marcados' => 4, 'fg_tentados' => 7, 'fg3_marcados' => 3, 'fg3_tentados' => 5, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 11, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 5, 'assistencias' => 2, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 0, 'faltas_pessoais' => 2, 'mais_menos' => 15],
    ['jogo_id' => 1, 'jogador_id' => 1629684, 'equipa_id' => 1, 'titular' => 1, 'minutos' => 26, 'segundos' => 18, 'fg_marcados' => 4, 'fg_tentados' => 9, 'fg3_marcados' => 3, 'fg3_tentados' => 7, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 11, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 5, 'ressaltos_totais' => 5, 'assistencias' => 5, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 1, 'faltas_pessoais' => 2, 'mais_menos' => 19],
    
    // New York Knicks (com KAT e Bridges)
    ['jogo_id' => 1, 'jogador_id' => 1628973, 'equipa_id' => 3, 'titular' => 1, 'minutos' => 32, 'segundos' => 15, 'fg_marcados' => 9, 'fg_tentados' => 14, 'fg3_marcados' => 1, 'fg3_tentados' => 2, 'ft_marcados' => 3, 'ft_tentados' => 3, 'pontos' => 22, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 1, 'ressaltos_totais' => 1, 'assistencias' => 4, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 2, 'faltas_pessoais' => 2, 'mais_menos' => -18],
    ['jogo_id' => 1, 'jogador_id' => 1626157, 'equipa_id' => 3, 'titular' => 1, 'minutos' => 28, 'segundos' => 30, 'fg_marcados' => 5, 'fg_tentados' => 10, 'fg3_marcados' => 1, 'fg3_tentados' => 2, 'ft_marcados' => 1, 'ft_tentados' => 2, 'pontos' => 12, 'ressaltos_ofensivos' => 3, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 7, 'assistencias' => 3, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 1, 'faltas_pessoais' => 4, 'mais_menos' => -20],
    ['jogo_id' => 1, 'jogador_id' => 1628969, 'equipa_id' => 3, 'titular' => 1, 'minutos' => 34, 'segundos' => 50, 'fg_marcados' => 7, 'fg_tentados' => 13, 'fg3_marcados' => 2, 'fg3_tentados' => 7, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 16, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 0, 'ressaltos_totais' => 0, 'assistencias' => 2, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 1, 'faltas_pessoais' => 2, 'mais_menos' => -24],
    ['jogo_id' => 1, 'jogador_id' => 1628384, 'equipa_id' => 3, 'titular' => 1, 'minutos' => 30, 'segundos' => 10, 'fg_marcados' => 4, 'fg_tentados' => 8, 'fg3_marcados' => 0, 'fg3_tentados' => 3, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 8, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 2, 'ressaltos_totais' => 3, 'assistencias' => 4, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 2, 'faltas_pessoais' => 3, 'mais_menos' => -15],

    // Jogo 2: LAL (110) vs MIN (103) - Crypto.com Arena
    // Los Angeles Lakers
    ['jogo_id' => 2, 'jogador_id' => 203076, 'equipa_id' => 23, 'titular' => 1, 'minutos' => 37, 'segundos' => 40, 'fg_marcados' => 11, 'fg_tentados' => 23, 'fg3_marcados' => 1, 'fg3_tentados' => 3, 'ft_marcados' => 13, 'ft_tentados' => 15, 'pontos' => 36, 'ressaltos_ofensivos' => 3, 'ressaltos_defensivos' => 13, 'ressaltos_totais' => 16, 'assistencias' => 4, 'roubos_bola' => 1, 'desarmes_lancamento' => 3, 'perdas_bola' => 1, 'faltas_pessoais' => 1, 'mais_menos' => 12],
    ['jogo_id' => 2, 'jogador_id' => 2544, 'equipa_id' => 23, 'titular' => 1, 'minutos' => 35, 'segundos' => 15, 'fg_marcados' => 7, 'fg_tentados' => 16, 'fg3_marcados' => 1, 'fg3_tentados' => 3, 'ft_marcados' => 1, 'ft_tentados' => 1, 'pontos' => 16, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 5, 'assistencias' => 4, 'roubos_bola' => 0, 'desarmes_lancamento' => 2, 'perdas_bola' => 2, 'faltas_pessoais' => 1, 'mais_menos' => 8],
    ['jogo_id' => 2, 'jogador_id' => 1630559, 'equipa_id' => 23, 'titular' => 1, 'minutos' => 35, 'segundos' => 20, 'fg_marcados' => 4, 'fg_tentados' => 14, 'fg3_marcados' => 0, 'fg3_tentados' => 5, 'ft_marcados' => 4, 'ft_tentados' => 4, 'pontos' => 12, 'ressaltos_ofensivos' => 2, 'ressaltos_defensivos' => 7, 'ressaltos_totais' => 9, 'assistencias' => 4, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 1, 'faltas_pessoais' => 2, 'mais_menos' => 10],
    ['jogo_id' => 2, 'jogador_id' => 1629060, 'equipa_id' => 23, 'titular' => 1, 'minutos' => 34, 'segundos' => 10, 'fg_marcados' => 7, 'fg_tentados' => 14, 'fg3_marcados' => 1, 'fg3_tentados' => 4, 'ft_marcados' => 3, 'ft_tentados' => 5, 'pontos' => 18, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 5, 'assistencias' => 1, 'roubos_bola' => 2, 'desarmes_lancamento' => 1, 'perdas_bola' => 0, 'faltas_pessoais' => 2, 'mais_menos' => 11],
    ['jogo_id' => 2, 'jogador_id' => 1642270, 'equipa_id' => 23, 'titular' => 0, 'minutos' => 16, 'segundos' => 20, 'fg_marcados' => 2, 'fg_tentados' => 4, 'fg3_marcados' => 1, 'fg3_tentados' => 3, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 5, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 1, 'ressaltos_totais' => 1, 'assistencias' => 2, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 0, 'faltas_pessoais' => 1, 'mais_menos' => 3],
    ['jogo_id' => 2, 'jogador_id' => 1642355, 'equipa_id' => 23, 'titular' => 0, 'minutos' => 3, 'segundos' => 0, 'fg_marcados' => 0, 'fg_tentados' => 2, 'fg3_marcados' => 0, 'fg3_tentados' => 1, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 0, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 0, 'ressaltos_totais' => 1, 'assistencias' => 0, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 0, 'faltas_pessoais' => 0, 'mais_menos' => -5],

    // Minnesota Timberwolves
    ['jogo_id' => 2, 'jogador_id' => 1630162, 'equipa_id' => 17, 'titular' => 1, 'minutos' => 39, 'segundos' => 25, 'fg_marcados' => 10, 'fg_tentados' => 25, 'fg3_marcados' => 5, 'fg3_tentados' => 13, 'ft_marcados' => 2, 'ft_tentados' => 3, 'pontos' => 27, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 6, 'ressaltos_totais' => 6, 'assistencias' => 3, 'roubos_bola' => 0, 'desarmes_lancamento' => 0, 'perdas_bola' => 3, 'faltas_pessoais' => 3, 'mais_menos' => -8],
    ['jogo_id' => 2, 'jogador_id' => 203497, 'equipa_id' => 17, 'titular' => 1, 'minutos' => 35, 'segundos' => 10, 'fg_marcados' => 8, 'fg_tentados' => 12, 'fg3_marcados' => 0, 'fg3_tentados' => 0, 'ft_marcados' => 4, 'ft_tentados' => 7, 'pontos' => 20, 'ressaltos_ofensivos' => 5, 'ressaltos_defensivos' => 9, 'ressaltos_totais' => 14, 'assistencias' => 2, 'roubos_bola' => 0, 'desarmes_lancamento' => 1, 'perdas_bola' => 2, 'faltas_pessoais' => 3, 'mais_menos' => -7],

    // Jogo 3: DAL (120) vs SAS (109) - American Airlines Center
    // Dallas Mavericks (Luka, Flagg, Klay)
    ['jogo_id' => 3, 'jogador_id' => 1629029, 'equipa_id' => 26, 'titular' => 1, 'minutos' => 38, 'segundos' => 10, 'fg_marcados' => 11, 'fg_tentados' => 25, 'fg3_marcados' => 4, 'fg3_tentados' => 11, 'ft_marcados' => 2, 'ft_tentados' => 2, 'pontos' => 28, 'ressaltos_ofensivos' => 2, 'ressaltos_defensivos' => 8, 'ressaltos_totais' => 10, 'assistencias' => 8, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 3, 'faltas_pessoais' => 2, 'mais_menos' => 15],
    ['jogo_id' => 3, 'jogador_id' => 202691, 'equipa_id' => 26, 'titular' => 1, 'minutos' => 26, 'segundos' => 15, 'fg_marcados' => 7, 'fg_tentados' => 13, 'fg3_marcados' => 6, 'fg3_tentados' => 10, 'ft_marcados' => 2, 'ft_tentados' => 2, 'pontos' => 22, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 7, 'ressaltos_totais' => 7, 'assistencias' => 1, 'roubos_bola' => 3, 'desarmes_lancamento' => 0, 'perdas_bola' => 0, 'faltas_pessoais' => 1, 'mais_menos' => 16],
    ['jogo_id' => 3, 'jogador_id' => 1642901, 'equipa_id' => 26, 'titular' => 1, 'minutos' => 32, 'segundos' => 40, 'fg_marcados' => 7, 'fg_tentados' => 14, 'fg3_marcados' => 2, 'fg3_tentados' => 5, 'ft_marcados' => 2, 'ft_tentados' => 2, 'pontos' => 18, 'ressaltos_ofensivos' => 3, 'ressaltos_defensivos' => 5, 'ressaltos_totais' => 8, 'assistencias' => 5, 'roubos_bola' => 2, 'desarmes_lancamento' => 2, 'perdas_bola' => 1, 'faltas_pessoais' => 2, 'mais_menos' => 14],
    ['jogo_id' => 3, 'jogador_id' => 202681, 'equipa_id' => 26, 'titular' => 1, 'minutos' => 31, 'segundos' => 20, 'fg_marcados' => 6, 'fg_tentados' => 17, 'fg3_marcados' => 2, 'fg3_tentados' => 7, 'ft_marcados' => 1, 'ft_tentados' => 2, 'pontos' => 15, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 3, 'ressaltos_totais' => 3, 'assistencias' => 2, 'roubos_bola' => 2, 'desarmes_lancamento' => 0, 'perdas_bola' => 2, 'faltas_pessoais' => 1, 'mais_menos' => 9],
    
    // San Antonio Spurs (Wemby, Dylan Harper, CP3)
    ['jogo_id' => 3, 'jogador_id' => 1641705, 'equipa_id' => 30, 'titular' => 1, 'minutos' => 28, 'segundos' => 30, 'fg_marcados' => 5, 'fg_tentados' => 18, 'fg3_marcados' => 1, 'fg3_tentados' => 8, 'ft_marcados' => 6, 'ft_tentados' => 6, 'pontos' => 17, 'ressaltos_ofensivos' => 2, 'ressaltos_defensivos' => 7, 'ressaltos_totais' => 9, 'assistencias' => 1, 'roubos_bola' => 0, 'desarmes_lancamento' => 1, 'perdas_bola' => 4, 'faltas_pessoais' => 2, 'mais_menos' => -9],
    ['jogo_id' => 3, 'jogador_id' => 1642902, 'equipa_id' => 30, 'titular' => 1, 'minutos' => 30, 'segundos' => 45, 'fg_marcados' => 6, 'fg_tentados' => 13, 'fg3_marcados' => 2, 'fg3_tentados' => 5, 'ft_marcados' => 4, 'ft_tentados' => 4, 'pontos' => 18, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 5, 'assistencias' => 6, 'roubos_bola' => 1, 'desarmes_lancamento' => 0, 'perdas_bola' => 2, 'faltas_pessoais' => 2, 'mais_menos' => -7],
    ['jogo_id' => 3, 'jogador_id' => 101108, 'equipa_id' => 30, 'titular' => 1, 'minutos' => 28, 'segundos' => 10, 'fg_marcados' => 1, 'fg_tentados' => 6, 'fg3_marcados' => 1, 'fg3_tentados' => 4, 'ft_marcados' => 0, 'ft_tentados' => 0, 'pontos' => 3, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 7, 'ressaltos_totais' => 7, 'assistencias' => 8, 'roubos_bola' => 1, 'desarmes_lancamento' => 0, 'perdas_bola' => 1, 'faltas_pessoais' => 3, 'mais_menos' => -10],

    // Jogo 4: WAS (118) vs ATL (112) - Capital One Arena
    // Washington Wizards (Trae Young, Alex Sarr, Kyle Kuzma, Jordan Poole)
    ['jogo_id' => 4, 'jogador_id' => 1629027, 'equipa_id' => 15, 'titular' => 1, 'minutos' => 36, 'segundos' => 40, 'fg_marcados' => 10, 'fg_tentados' => 21, 'fg3_marcados' => 5, 'fg3_tentados' => 10, 'ft_marcados' => 9, 'ft_tentados' => 10, 'pontos' => 34, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 3, 'ressaltos_totais' => 3, 'assistencias' => 13, 'roubos_bola' => 2, 'desarmes_lancamento' => 0, 'perdas_bola' => 3, 'faltas_pessoais' => 1, 'mais_menos' => 12],
    ['jogo_id' => 4, 'jogador_id' => 1642259, 'equipa_id' => 15, 'titular' => 1, 'minutos' => 31, 'segundos' => 15, 'fg_marcados' => 7, 'fg_tentados' => 12, 'fg3_marcados' => 2, 'fg3_tentados' => 4, 'ft_marcados' => 2, 'ft_tentados' => 3, 'pontos' => 18, 'ressaltos_ofensivos' => 2, 'ressaltos_defensivos' => 8, 'ressaltos_totais' => 10, 'assistencias' => 2, 'roubos_bola' => 1, 'desarmes_lancamento' => 3, 'perdas_bola' => 1, 'faltas_pessoais' => 3, 'mais_menos' => 9],
    ['jogo_id' => 4, 'jogador_id' => 1628398, 'equipa_id' => 15, 'titular' => 1, 'minutos' => 33, 'segundos' => 20, 'fg_marcados' => 9, 'fg_tentados' => 18, 'fg3_marcados' => 3, 'fg3_tentados' => 7, 'ft_marcados' => 3, 'ft_tentados' => 4, 'pontos' => 24, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 6, 'ressaltos_totais' => 7, 'assistencias' => 4, 'roubos_bola' => 0, 'desarmes_lancamento' => 1, 'perdas_bola' => 2, 'faltas_pessoais' => 2, 'mais_menos' => 7],
    ['jogo_id' => 4, 'jogador_id' => 1629673, 'equipa_id' => 15, 'titular' => 1, 'minutos' => 28, 'segundos' => 45, 'fg_marcados' => 6, 'fg_tentados' => 15, 'fg3_marcados' => 4, 'fg3_tentados' => 9, 'ft_marcados' => 3, 'ft_tentados' => 4, 'pontos' => 19, 'ressaltos_ofensivos' => 0, 'ressaltos_defensivos' => 2, 'ressaltos_totais' => 2, 'assistencias' => 5, 'roubos_bola' => 1, 'desarmes_lancamento' => 0, 'perdas_bola' => 3, 'faltas_pessoais' => 2, 'mais_menos' => 4],
    
    // Atlanta Hawks (Zaccharie Risacher, Jalen Johnson)
    ['jogo_id' => 4, 'jogador_id' => 1642258, 'equipa_id' => 11, 'titular' => 1, 'minutos' => 32, 'segundos' => 10, 'fg_marcados' => 8, 'fg_tentados' => 16, 'fg3_marcados' => 4, 'fg3_tentados' => 9, 'ft_marcados' => 2, 'ft_tentados' => 2, 'pontos' => 22, 'ressaltos_ofensivos' => 1, 'ressaltos_defensivos' => 4, 'ressaltos_totais' => 5, 'assistencias' => 3, 'roubos_bola' => 2, 'desarmes_lancamento' => 1, 'perdas_bola' => 1, 'faltas_pessoais' => 3, 'mais_menos' => -4],
    ['jogo_id' => 4, 'jogador_id' => 1630552, 'equipa_id' => 11, 'titular' => 1, 'minutos' => 35, 'segundos' => 0, 'fg_marcados' => 10, 'fg_tentados' => 19, 'fg3_marcados' => 2, 'fg3_tentados' => 5, 'ft_marcados' => 4, 'ft_tentados' => 6, 'pontos' => 26, 'ressaltos_ofensivos' => 3, 'ressaltos_defensivos' => 8, 'ressaltos_totais' => 11, 'assistencias' => 5, 'roubos_bola' => 1, 'desarmes_lancamento' => 1, 'perdas_bola' => 2, 'faltas_pessoais' => 2, 'mais_menos' => -6]
];

foreach ($boxScores as $box) {
    unset($box['ressaltos_totais']);
    DB::table('jogos_estatisticas_jogadores')->insert($box);
}

echo " [BOX SCORE] Inseridas estatísticas de jogadores para jogos da Opening Week.\n";

echo "SUCCESS: Todas as estatísticas de novatos e box scores foram sincronizados!\n";

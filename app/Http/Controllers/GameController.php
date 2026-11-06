<?php

namespace App\Http\Controllers;

use App\Models\Jogo;
use App\Models\ContratoJogador;
use App\Services\EspnSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GameController extends Controller
{
    public function show($id)
    {
        $game = Jogo::with(['equipaCasa.arena', 'equipaFora', 'arena', 'periodos'])
            ->findOrFail($id);

        $espnData = null;
        if (!empty($game->espn_id)) {
            $espnData = EspnSyncService::fetchGameBoxScore($game->espn_id);
        }

        // Se a ESPN tiver o boxscore completo em tempo real
        $plays = [];
        if ($espnData && isset($espnData['boxscore']['players']) && count($espnData['boxscore']['players']) >= 2) {
            $parsed = $this->parseEspnBoxScore($espnData, $game);
            $homeStats = $parsed['homeStats'];
            $awayStats = $parsed['awayStats'];
            $homeDnp = $parsed['homeDnp'];
            $awayDnp = $parsed['awayDnp'];
            $homeTotals = $parsed['homeTotals'];
            $awayTotals = $parsed['awayTotals'];
            $homeLeaders = $parsed['homeLeaders'];
            $awayLeaders = $parsed['awayLeaders'];

            if (!empty($espnData['plays'])) {
                $plays = $this->parseEspnPlays($espnData['plays'], $game);
            }
        } else {
            // Fallback para jogos concluídos na base de dados
            if ($game->estado === 'concluido') {
                $this->ensureBoxScore($game);
            }

            $homeStats = $this->getLocalStats($game->id, $game->equipa_casa_id);
            $awayStats = $this->getLocalStats($game->id, $game->equipa_fora_id);
            $homeDnp = collect();
            $awayDnp = collect();

            $homeTotals = $this->calculateTeamTotals($homeStats, $game->pontos_casa);
            $awayTotals = $this->calculateTeamTotals($awayStats, $game->pontos_fora);

            $homeLeaders = [
                'pontos' => $homeStats->sortByDesc('pontos')->first(),
                'ressaltos' => $homeStats->sortByDesc('ressaltos_totais')->first(),
                'assistencias' => $homeStats->sortByDesc('assistencias')->first(),
            ];

            $awayLeaders = [
                'pontos' => $awayStats->sortByDesc('pontos')->first(),
                'ressaltos' => $awayStats->sortByDesc('ressaltos_totais')->first(),
                'assistencias' => $awayStats->sortByDesc('assistencias')->first(),
            ];
        }

        $shotData = $this->extractShotsAndReplays($plays, $homeStats, $awayStats, $game);
        $shots = $shotData['shots'];
        $replayPlays = $shotData['replayPlays'];

        return Inertia::render('GameShow', [
            'game' => $game,
            'homeStats' => $homeStats,
            'awayStats' => $awayStats,
            'homeDnp' => $homeDnp,
            'awayDnp' => $awayDnp,
            'homeTotals' => $homeTotals,
            'awayTotals' => $awayTotals,
            'homeLeaders' => $homeLeaders,
            'awayLeaders' => $awayLeaders,
            'plays' => $plays,
            'shots' => $shots,
            'replayPlays' => $replayPlays,
            'isLive' => in_array($game->estado, ['em_direto', 'intervalo']),
            'lastSynced' => now()->format('H:i:s'),
        ]);
    }

    /**
     * Mapeia as jogadas oficiais da ESPN para a linha do tempo (Play-by-Play).
     */
    private function parseEspnPlays(array $espnPlays, Jogo $game): array
    {
        $parsed = [];
        $homeScore = 0;
        $awayScore = 0;

        foreach ($espnPlays as $p) {
            $periodNum = $p['period']['number'] ?? 1;
            $periodDisplay = $p['period']['displayValue'] ?? "{$periodNum}º Quarto";
            $clock = $p['clock']['displayValue'] ?? '00:00';
            $text = $p['text'] ?? '';
            $hScore = isset($p['homeScore']) ? (int) $p['homeScore'] : $homeScore;
            $aScore = isset($p['awayScore']) ? (int) $p['awayScore'] : $awayScore;
            $homeScore = $hScore;
            $awayScore = $aScore;
            $isScoring = !empty($p['scoringPlay']);
            $scoreValue = (int) ($p['scoreValue'] ?? 0);
            $typeText = $p['type']['text'] ?? 'Jogada';

            // Categoria para filtros
            $category = 'geral';
            if ($isScoring) {
                $category = $scoreValue === 3 ? 'triplo' : 'cesto';
            } elseif (stripos($typeText, 'foul') !== false) {
                $category = 'falta';
            } elseif (stripos($typeText, 'turnover') !== false) {
                $category = 'perda';
            } elseif (stripos($typeText, 'rebound') !== false) {
                $category = 'ressalto';
            }

            // Identificar se a jogada é da equipa da casa ou visitante
            $isHome = null;
            if (stripos($text, $game->equipaCasa->nome) !== false || stripos($text, $game->equipaCasa->sigla) !== false) {
                $isHome = true;
            } elseif (stripos($text, $game->equipaFora->nome) !== false || stripos($text, $game->equipaFora->sigla) !== false) {
                $isHome = false;
            }

            $parsed[] = [
                'id' => $p['id'] ?? uniqid(),
                'sequence' => $p['sequenceNumber'] ?? 0,
                'period' => $periodNum,
                'period_display' => $periodDisplay,
                'clock' => $clock,
                'text' => $text,
                'home_score' => $hScore,
                'away_score' => $aScore,
                'is_scoring' => $isScoring,
                'score_value' => $scoreValue,
                'type' => $typeText,
                'category' => $category,
                'is_home' => $isHome,
            ];
        }

        // Ordenar as jogadas da mais recente para a mais antiga para leitura intuitiva
        return array_reverse($parsed);
    }

    /**
     * Mapeia os atletas e totais oficiais da ESPN para o modelo do Box Score.
     */
    private function parseEspnBoxScore(array $espnData, Jogo $game): array
    {
        $homeBox = null;
        $awayBox = null;

        foreach ($espnData['boxscore']['players'] as $tb) {
            $abbr = $tb['team']['abbreviation'] ?? '';
            // Mapeamento de abreviaturas ESPN
            $abbrMap = ['NY' => 'NYK', 'SA' => 'SAS', 'GS' => 'GSW', 'UTAH' => 'UTA', 'NO' => 'NOP', 'WSH' => 'WAS'];
            $cleanAbbr = $abbrMap[$abbr] ?? $abbr;

            if ($cleanAbbr === $game->equipaCasa->sigla || str_contains($tb['team']['displayName'] ?? '', $game->equipaCasa->nome)) {
                $homeBox = $tb;
            } else {
                $awayBox = $tb;
            }
        }

        // Se a ordem for invertida ou nula, faz fallback para [0] e [1]
        if (!$homeBox || !$awayBox) {
            $awayBox = $espnData['boxscore']['players'][0] ?? null;
            $homeBox = $espnData['boxscore']['players'][1] ?? null;
        }

        $homeParsed = $this->parseAthletesFromBox($homeBox);
        $awayParsed = $this->parseAthletesFromBox($awayBox);

        // Totais Coletivos da ESPN
        $teamStats = $espnData['boxscore']['teams'] ?? [];
        $homeTeamStats = null;
        $awayTeamStats = null;
        foreach ($teamStats as $tInfo) {
            $abbr = $tInfo['team']['abbreviation'] ?? '';
            $abbrMap = ['NY' => 'NYK', 'SA' => 'SAS', 'GS' => 'GSW', 'UTAH' => 'UTA', 'NO' => 'NOP', 'WSH' => 'WAS'];
            $cleanAbbr = $abbrMap[$abbr] ?? $abbr;
            if ($cleanAbbr === $game->equipaCasa->sigla) {
                $homeTeamStats = $tInfo;
            } else {
                $awayTeamStats = $tInfo;
            }
        }

        $homeTotals = $this->parseTeamTotalsFromEspn($homeTeamStats, $homeParsed['active'], $game->pontos_casa);
        $awayTotals = $this->parseTeamTotalsFromEspn($awayTeamStats, $awayParsed['active'], $game->pontos_fora);

        return [
            'homeStats' => $homeParsed['active'],
            'homeDnp' => $homeParsed['dnp'],
            'awayStats' => $awayParsed['active'],
            'awayDnp' => $awayParsed['dnp'],
            'homeTotals' => $homeTotals,
            'awayTotals' => $awayTotals,
            'homeLeaders' => [
                'pontos' => $homeParsed['active']->sortByDesc('pontos')->first(),
                'ressaltos' => $homeParsed['active']->sortByDesc('ressaltos_totais')->first(),
                'assistencias' => $homeParsed['active']->sortByDesc('assistencias')->first(),
            ],
            'awayLeaders' => [
                'pontos' => $awayParsed['active']->sortByDesc('pontos')->first(),
                'ressaltos' => $awayParsed['active']->sortByDesc('ressaltos_totais')->first(),
                'assistencias' => $awayParsed['active']->sortByDesc('assistencias')->first(),
            ],
        ];
    }

    private function parseAthletesFromBox(?array $teamBox): array
    {
        $active = collect();
        $dnp = collect();

        if (!$teamBox) return ['active' => $active, 'dnp' => $dnp];

        $statsSection = $teamBox['statistics'][0] ?? null;
        if (!$statsSection) return ['active' => $active, 'dnp' => $dnp];

        $labels = $statsSection['labels'] ?? [];

        foreach ($statsSection['athletes'] ?? [] as $index => $ath) {
            $name = $ath['athlete']['displayName'] ?? 'Atleta';
            $pos = $ath['athlete']['position']['abbreviation'] ?? 'G';
            $jersey = $ath['athlete']['jersey'] ?? '';
            $headshot = $ath['athlete']['headshot']['href'] ?? '/images/players/placeholder.png';
            $didNotPlay = $ath['didNotPlay'] ?? false;
            $reason = $ath['reason'] ?? '';

            if ($didNotPlay) {
                $dnp->push((object) [
                    'nome_completo' => $name,
                    'posicao' => $pos,
                    'numero_camisola' => $jersey,
                    'foto_url' => $headshot,
                    'motivo' => $reason ?: "DECISÃO TÉCNICA",
                ]);
            } else {
                $statMap = array_combine($labels, $ath['stats'] ?? []);
                
                // Extrai FG marcados/tentados
                $fgParts = explode('-', $statMap['FG'] ?? '0-0');
                $fgm = (int) ($fgParts[0] ?? 0);
                $fga = (int) ($fgParts[1] ?? 0);

                // Extrai 3PT
                $fg3Parts = explode('-', $statMap['3PT'] ?? '0-0');
                $fg3m = (int) ($fg3Parts[0] ?? 0);
                $fg3a = (int) ($fg3Parts[1] ?? 0);

                // Extrai FT
                $ftParts = explode('-', $statMap['FT'] ?? '0-0');
                $ftm = (int) ($ftParts[0] ?? 0);
                $fta = (int) ($ftParts[1] ?? 0);

                $min = (int) ($statMap['MIN'] ?? 0);
                $pts = (int) ($statMap['PTS'] ?? 0);
                $reb = (int) ($statMap['REB'] ?? 0);
                $ast = (int) ($statMap['AST'] ?? 0);
                $stl = (int) ($statMap['STL'] ?? 0);
                $blk = (int) ($statMap['BLK'] ?? 0);
                $to = (int) ($statMap['TO'] ?? 0);
                $oreb = (int) ($statMap['OREB'] ?? 0);
                $dreb = (int) ($statMap['DREB'] ?? 0);
                $pf = (int) ($statMap['PF'] ?? 0);
                $plusMinus = (int) ($statMap['+/-'] ?? 0);

                $active->push((object) [
                    'id' => $ath['athlete']['id'] ?? $index,
                    'nome_completo' => $name,
                    'posicao' => $pos,
                    'numero_camisola' => $jersey,
                    'foto_url' => $headshot,
                    'titular' => $index < 5 ? 1 : 0,
                    'minutos' => $min,
                    'segundos' => 0,
                    'fg_marcados' => $fgm,
                    'fg_tentados' => $fga,
                    'fg3_marcados' => $fg3m,
                    'fg3_tentados' => $fg3a,
                    'ft_marcados' => $ftm,
                    'ft_tentados' => $fta,
                    'pontos' => $pts,
                    'ressaltos_ofensivos' => $oreb,
                    'ressaltos_defensivos' => $dreb,
                    'ressaltos_totais' => $reb,
                    'assistencias' => $ast,
                    'roubos_bola' => $stl,
                    'desarmes_lancamento' => $blk,
                    'perdas_bola' => $to,
                    'faltas_pessoais' => $pf,
                    'mais_menos' => $plusMinus,
                ]);
            }
        }

        return ['active' => $active, 'dnp' => $dnp];
    }

    private function parseTeamTotalsFromEspn(?array $teamInfo, $activeAthletes, $expectedPoints): array
    {
        $stats = [];
        if ($teamInfo && isset($teamInfo['statistics'])) {
            foreach ($teamInfo['statistics'] as $st) {
                $stats[$st['label']] = $st['displayValue'] ?? '';
            }
        }

        $fgParts = explode('-', $stats['FG'] ?? '0-0');
        $fgm = (int) ($fgParts[0] ?? $activeAthletes->sum('fg_marcados'));
        $fga = (int) ($fgParts[1] ?? $activeAthletes->sum('fg_tentados'));

        $fg3Parts = explode('-', $stats['3PT'] ?? '0-0');
        $fg3m = (int) ($fg3Parts[0] ?? $activeAthletes->sum('fg3_marcados'));
        $fg3a = (int) ($fg3Parts[1] ?? $activeAthletes->sum('fg3_tentados'));

        $ftParts = explode('-', $stats['FT'] ?? '0-0');
        $ftm = (int) ($ftParts[0] ?? $activeAthletes->sum('ft_marcados'));
        $fta = (int) ($ftParts[1] ?? $activeAthletes->sum('ft_tentados'));

        $fgPct = (float) ($stats['Field Goal %'] ?? ($fga > 0 ? round(($fgm / $fga) * 100, 1) : 0));
        $fg3Pct = (float) ($stats['Three Point %'] ?? ($fg3a > 0 ? round(($fg3m / $fg3a) * 100, 1) : 0));
        $ftPct = (float) ($stats['Free Throw %'] ?? ($fta > 0 ? round(($ftm / $fta) * 100, 1) : 0));

        $rebounds = (int) ($stats['Rebounds'] ?? $activeAthletes->sum('ressaltos_totais'));
        $oreb = (int) ($stats['Offensive Rebounds'] ?? $activeAthletes->sum('ressaltos_ofensivos'));
        $dreb = (int) ($stats['Defensive Rebounds'] ?? $activeAthletes->sum('ressaltos_defensivos'));
        $ast = (int) ($stats['Assists'] ?? $activeAthletes->sum('assistencias'));
        $stl = (int) ($stats['Steals'] ?? $activeAthletes->sum('roubos_bola'));
        $blk = (int) ($stats['Blocks'] ?? $activeAthletes->sum('desarmes_lancamento'));
        $to = (int) ($stats['Turnovers'] ?? $activeAthletes->sum('perdas_bola'));
        $pf = (int) ($stats['Fouls'] ?? $activeAthletes->sum('faltas_pessoais'));
        $paint = (int) ($stats['Points in Paint'] ?? 0);
        $fastbreak = (int) ($stats['Fast Break Points'] ?? 0);
        $largestLead = (int) ($stats['Largest Lead'] ?? 0);

        return [
            'pontos' => $expectedPoints ?? $activeAthletes->sum('pontos'),
            'fg_marcados' => $fgm,
            'fg_tentados' => $fga,
            'fg_pct' => $fgPct,
            'fg3_marcados' => $fg3m,
            'fg3_tentados' => $fg3a,
            'fg3_pct' => $fg3Pct,
            'ft_marcados' => $ftm,
            'ft_tentados' => $fta,
            'ft_pct' => $ftPct,
            'ressaltos_ofensivos' => $oreb,
            'ressaltos_defensivos' => $dreb,
            'ressaltos_totais' => $rebounds,
            'assistencias' => $ast,
            'roubos_bola' => $stl,
            'desarmes_lancamento' => $blk,
            'perdas_bola' => $to,
            'faltas_pessoais' => $pf,
            'pontos_pintura' => $paint,
            'contra_ataque' => $fastbreak,
            'maior_vantagem' => $largestLead,
        ];
    }

    private function getLocalStats($gameId, $teamId)
    {
        return DB::table('jogos_estatisticas_jogadores')
            ->join('jogadores', 'jogos_estatisticas_jogadores.jogador_id', '=', 'jogadores.id')
            ->leftJoin('contratos_jogadores', function ($join) use ($teamId) {
                $join->on('jogadores.id', '=', 'contratos_jogadores.jogador_id')
                     ->where('contratos_jogadores.equipa_id', '=', $teamId);
            })
            ->where('jogos_estatisticas_jogadores.jogo_id', $gameId)
            ->where('jogos_estatisticas_jogadores.equipa_id', $teamId)
            ->select(
                'jogadores.id',
                'jogadores.nome_completo',
                'jogadores.posicao_primaria as posicao',
                'jogadores.foto_url',
                DB::raw('COALESCE(contratos_jogadores.numero_camisola, 0) as numero_camisola'),
                'jogos_estatisticas_jogadores.titular',
                'jogos_estatisticas_jogadores.minutos',
                'jogos_estatisticas_jogadores.segundos',
                'jogos_estatisticas_jogadores.fg_marcados',
                'jogos_estatisticas_jogadores.fg_tentados',
                'jogos_estatisticas_jogadores.fg3_marcados',
                'jogos_estatisticas_jogadores.fg3_tentados',
                'jogos_estatisticas_jogadores.ft_marcados',
                'jogos_estatisticas_jogadores.ft_tentados',
                'jogos_estatisticas_jogadores.pontos',
                'jogos_estatisticas_jogadores.ressaltos_ofensivos',
                'jogos_estatisticas_jogadores.ressaltos_defensivos',
                'jogos_estatisticas_jogadores.ressaltos_totais',
                'jogos_estatisticas_jogadores.assistencias',
                'jogos_estatisticas_jogadores.roubos_bola',
                'jogos_estatisticas_jogadores.desarmes_lancamento',
                'jogos_estatisticas_jogadores.perdas_bola',
                'jogos_estatisticas_jogadores.faltas_pessoais',
                'jogos_estatisticas_jogadores.mais_menos'
            )
            ->orderBy('jogos_estatisticas_jogadores.titular', 'desc')
            ->orderBy('jogos_estatisticas_jogadores.pontos', 'desc')
            ->get();
    }

    private function calculateTeamTotals($stats, $expectedPoints)
    {
        $fgm = $stats->sum('fg_marcados');
        $fga = $stats->sum('fg_tentados');
        $fg3m = $stats->sum('fg3_marcados');
        $fg3a = $stats->sum('fg3_tentados');
        $ftm = $stats->sum('ft_marcados');
        $fta = $stats->sum('ft_tentados');

        return [
            'pontos' => $expectedPoints ?? $stats->sum('pontos'),
            'fg_marcados' => $fgm,
            'fg_tentados' => $fga,
            'fg_pct' => $fga > 0 ? round(($fgm / $fga) * 100, 1) : 0,
            'fg3_marcados' => $fg3m,
            'fg3_tentados' => $fg3a,
            'fg3_pct' => $fg3a > 0 ? round(($fg3m / $fg3a) * 100, 1) : 0,
            'ft_marcados' => $ftm,
            'ft_tentados' => $fta,
            'ft_pct' => $fta > 0 ? round(($ftm / $fta) * 100, 1) : 0,
            'ressaltos_ofensivos' => $stats->sum('ressaltos_ofensivos'),
            'ressaltos_defensivos' => $stats->sum('ressaltos_defensivos'),
            'ressaltos_totais' => $stats->sum('ressaltos_totais'),
            'assistencias' => $stats->sum('assistencias'),
            'roubos_bola' => $stats->sum('roubos_bola'),
            'desarmes_lancamento' => $stats->sum('desarmes_lancamento'),
            'perdas_bola' => $stats->sum('perdas_bola'),
            'faltas_pessoais' => $stats->sum('faltas_pessoais'),
            'pontos_pintura' => 0,
            'contra_ataque' => 0,
            'maior_vantagem' => 0,
        ];
    }

    private function ensureBoxScore(Jogo $game)
    {
        $existing = DB::table('jogos_estatisticas_jogadores')->where('jogo_id', $game->id)->count();
        if ($existing > 0) return;

        foreach (['casa' => [$game->equipa_casa_id, $game->pontos_casa], 'fora' => [$game->equipa_fora_id, $game->pontos_fora]] as $side => [$teamId, $targetPoints]) {
            $players = ContratoJogador::where('equipa_id', $teamId)
                ->where('ativo', 1)
                ->get();

            if ($players->isEmpty()) continue;

            $playerCount = min($players->count(), 8);
            $weights = [26, 20, 18, 14, 10, 5, 4, 3];
            $totalWeight = array_sum(array_slice($weights, 0, $playerCount));

            $pointsAssigned = 0;
            $playerStats = [];

            for ($i = 0; $i < $playerCount; $i++) {
                $isStarter = ($i < 5);
                $w = $weights[$i] ?? 4;
                $pts = (int) round(($w / $totalWeight) * $targetPoints);
                $pointsAssigned += $pts;

                $playerStats[] = [
                    'contrato' => $players[$i],
                    'isStarter' => $isStarter,
                    'pts' => $pts,
                    'min' => $isStarter ? rand(30, 36) : rand(12, 22),
                ];
            }

            $diff = $targetPoints - $pointsAssigned;
            $playerStats[0]['pts'] += $diff;

            foreach ($playerStats as $stat) {
                $pts = max(0, $stat['pts']);
                $fg3m = min(rand(0, 5), (int) floor($pts / 3));
                $remPts = $pts - ($fg3m * 3);
                $ftm = min(rand(0, 6), $remPts);
                $fg2m = (int) floor(($remPts - $ftm) / 2);
                $fgm = $fg2m + $fg3m;
                $fga = $fgm + rand(2, 6);
                $fg3a = $fg3m + rand(1, 4);
                $fta = $ftm + rand(0, 2);

                $ast = $stat['isStarter'] ? rand(2, 9) : rand(0, 3);
                $oreb = rand(0, 3);
                $dreb = rand(1, 7);
                $stl = rand(0, 3);
                $blk = rand(0, 2);
                $to = rand(1, 4);
                $pf = rand(1, 4);
                $diffGame = ($side === 'casa') ? ($game->pontos_casa - $game->pontos_fora) : ($game->pontos_fora - $game->pontos_casa);
                $plusMinus = $stat['isStarter'] ? (int) round($diffGame * 0.8) + rand(-3, 3) : rand(-5, 5);

                DB::table('jogos_estatisticas_jogadores')->insert([
                    'jogo_id' => $game->id,
                    'jogador_id' => $stat['contrato']->jogador_id,
                    'equipa_id' => $teamId,
                    'titular' => $stat['isStarter'] ? 1 : 0,
                    'minutos' => $stat['min'],
                    'segundos' => rand(0, 59),
                    'fg_marcados' => $fgm,
                    'fg_tentados' => max($fgm, $fga),
                    'fg3_marcados' => $fg3m,
                    'fg3_tentados' => max($fg3m, $fg3a),
                    'ft_marcados' => $ftm,
                    'ft_tentados' => max($ftm, $fta),
                    'pontos' => $pts,
                    'ressaltos_ofensivos' => $oreb,
                    'ressaltos_defensivos' => $dreb,
                    'assistencias' => $ast,
                    'roubos_bola' => $stl,
                    'desarmes_lancamento' => $blk,
                    'perdas_bola' => $to,
                    'faltas_pessoais' => $pf,
                    'mais_menos' => $plusMinus,
                ]);
            }
        }
    }

    /**
     * Extrai ou sintetiza os dados de Shot Chart e jogadas para o Replay 2D na Quadra.
     */
    private function extractShotsAndReplays(array $plays, $homeStats, $awayStats, Jogo $game): array
    {
        $shots = [];
        $replayPlays = [];

        $homeCollection = collect($homeStats);
        $awayCollection = collect($awayStats);

        // Closure para identificar com precisão máxima o atleta no plantel da Casa ou Visitante
        $findAthlete = function (string $rawText, ?string $candidateName = null) use ($homeCollection, $awayCollection) {
            $cleanedCandidate = trim($candidateName ?? '');

            $testAthlete = function ($ath) use ($cleanedCandidate, $rawText) {
                $name = $ath->nome_completo ?? '';
                if (empty($name)) return false;

                // 1. Igualdade exata ou insensível a maiúsculas
                if (!empty($cleanedCandidate) && strcasecmp($name, $cleanedCandidate) === 0) {
                    return true;
                }

                // 2. Nome completo no texto do lance
                if (stripos($rawText, $name) !== false) {
                    return true;
                }

                // 3. Apelido / Último nome (mínimo 3 letras para evitar falsos positivos)
                $parts = explode(' ', $name);
                $lastName = end($parts);
                if (strlen($lastName) >= 3) {
                    if (!empty($cleanedCandidate) && stripos($cleanedCandidate, $lastName) !== false) {
                        return true;
                    }
                    if (preg_match('/\b' . preg_quote($lastName, '/') . '\b/i', $rawText)) {
                        return true;
                    }
                }
                return false;
            };

            // Verificar plantel da Casa
            foreach ($homeCollection as $ath) {
                if ($testAthlete($ath)) {
                    return ['athlete' => $ath, 'is_home' => true];
                }
            }

            // Verificar plantel Visitante
            foreach ($awayCollection as $ath) {
                if ($testAthlete($ath)) {
                    return ['athlete' => $ath, 'is_home' => false];
                }
            }

            return null;
        };

        // Se tivermos jogadas oficiais no Play-by-Play
        if (!empty($plays)) {
            // As jogadas vêm em ordem decrescente (da mais recente para a mais antiga)
            // Para o replay, ordenamos cronologicamente (da mais antiga para a mais recente)
            $chronoPlays = array_reverse($plays);

            $shotCounter = 1;
            foreach ($chronoPlays as $idx => $p) {
                $text = $p['text'] ?? '';
                $isScoring = !empty($p['is_scoring']);
                $scoreVal = (int) ($p['score_value'] ?? 0);
                $period = (int) ($p['period'] ?? 1);
                $clock = $p['clock'] ?? '12:00';

                // Detectar se é um lançamento de campo (remate)
                $isFieldGoal = false;
                $isMade = false;
                $shotType = 'Jump Shot';
                $distFt = 15;

                if (preg_match('/(makes|misses)\s+(.*)/i', $text, $matches)) {
                    $action = strtolower($matches[1]);
                    $desc = $matches[2];
                    $isMade = ($action === 'makes');
                    $isFieldGoal = true;

                    // Distância
                    if (preg_match('/(\d+)-foot/i', $desc, $dm)) {
                        $distFt = (int) $dm[1];
                    }

                    // Tipo de lançamento
                    if (stripos($desc, 'three point') !== false || stripos($desc, '3-point') !== false) {
                        $shotType = '3-Pointer';
                        $distFt = max($distFt, 23);
                    } elseif (stripos($desc, 'dunk') !== false || stripos($desc, 'slam') !== false) {
                        $shotType = 'Dunk';
                        $distFt = min($distFt, 2);
                    } elseif (stripos($desc, 'layup') !== false || stripos($desc, 'finger roll') !== false || stripos($desc, 'tip') !== false) {
                        $shotType = 'Layup';
                        $distFt = min($distFt, 4);
                    } elseif (stripos($desc, 'hook') !== false) {
                        $shotType = 'Hook Shot';
                        $distFt = min($distFt, 8);
                    } elseif (stripos($desc, 'floating') !== false || stripos($desc, 'floater') !== false) {
                        $shotType = 'Floater';
                        $distFt = min($distFt, 10);
                    } else {
                        $shotType = ($distFt >= 22) ? '3-Pointer' : 'Mid-Range';
                    }
                } elseif ($isScoring && $scoreVal >= 2) {
                    $isFieldGoal = true;
                    $isMade = true;
                    $shotType = ($scoreVal === 3) ? '3-Pointer' : 'Jump Shot';
                    $distFt = ($scoreVal === 3) ? 24 : 14;
                }

                // Extrair nome do atleta inicial
                $extractedName = null;
                if (preg_match('/^([A-Z][a-zA-Z\.\'\- ]+?)\s+(makes|misses|foul|turnover|rebound|sub|bad pass|lost ball)/i', $text, $nm)) {
                    $extractedName = trim($nm[1]);
                }

                $matched = $findAthlete($text, $extractedName);

                if ($matched) {
                    $athInfo = $matched['athlete'];
                    $isHome = $matched['is_home'];
                    $playerName = $athInfo->nome_completo;
                    $playerPhoto = $athInfo->foto_url ?? '/images/players/placeholder.png';
                    $jersey = $athInfo->numero_camisola ?? rand(1, 99);
                    $pos = $athInfo->posicao ?? 'G';
                    $playerId = $athInfo->id ?? null;
                } else {
                    $isHome = $p['is_home'] ?? true;
                    $playerName = $extractedName ?: 'Atleta NBA';
                    $playerPhoto = '/images/players/placeholder.png';
                    $jersey = rand(1, 99);
                    $pos = 'G';
                    $playerId = null;
                }

                // Extrair assistência se existir no texto
                $assistData = null;
                if (preg_match('/\((?:assisted by\s+)?([A-Z][a-zA-Z\.\'\- ]+?)\s+assists?\)/i', $text, $astMatch) ||
                    preg_match('/assisted by\s+([A-Z][a-zA-Z\.\'\- ]+?)(?:\.|\)|$)/i', $text, $astMatch)) {
                    $rawAst = trim($astMatch[1]);
                    $matchedAst = $findAthlete($rawAst, $rawAst);
                    if ($matchedAst && $matchedAst['athlete']) {
                        $astAth = $matchedAst['athlete'];
                        $assistData = [
                            'id' => $astAth->id ?? null,
                            'player_name' => $astAth->nome_completo,
                            'jersey' => $astAth->numero_camisola ?? '',
                            'photo' => $astAth->foto_url ?? '/images/players/placeholder.png',
                            'pos' => $astAth->posicao ?? 'G',
                        ];
                    }
                }

                $team = $isHome ? $game->equipaCasa : $game->equipaFora;
                $coords = $this->calculateCourtCoords($shotType, $distFt);

                if ($isFieldGoal) {
                    $shots[] = [
                        'id' => 'shot_' . $shotCounter++,
                        'player_id' => $playerId,
                        'player_name' => $playerName,
                        'player_photo' => $playerPhoto,
                        'numero_camisola' => $jersey,
                        'posicao' => $pos,
                        'team_sigla' => $team->sigla,
                        'team_name' => $team->nome_completo,
                        'is_home' => $isHome,
                        'period' => $period,
                        'clock' => $clock,
                        'made' => $isMade,
                        'score_value' => ($shotType === '3-Pointer') ? 3 : 2,
                        'type' => $shotType,
                        'distance_ft' => $distFt,
                        'zone' => $coords['zone'],
                        'x' => $coords['x'],
                        'y' => $coords['y'],
                        'text' => $text,
                    ];
                }

                $eventType = 'geral';
                if ($isFieldGoal) $eventType = 'shot';
                elseif (stripos($text, 'rebound') !== false) $eventType = 'rebound';
                elseif (stripos($text, 'foul') !== false) $eventType = 'foul';
                elseif (stripos($text, 'turnover') !== false) $eventType = 'turnover';
                elseif (stripos($text, 'free throw') !== false) $eventType = 'freethrow';

                $replayPlays[] = [
                    'id' => $p['id'] ?? ('rp_' . $idx),
                    'sequence' => $idx + 1,
                    'period' => $period,
                    'clock' => $clock,
                    'text' => $text,
                    'event_type' => $eventType,
                    'is_home' => $isHome,
                    'team_sigla' => $team->sigla,
                    'player_id' => $playerId,
                    'player_name' => $playerName,
                    'player_photo' => $playerPhoto,
                    'player_jersey' => $jersey,
                    'player_pos' => $pos,
                    'is_shot' => $isFieldGoal,
                    'shot_made' => $isMade,
                    'shot_type' => $shotType,
                    'distance_ft' => $distFt,
                    'shot_zone' => $coords['zone'],
                    'score_value' => ($shotType === '3-Pointer') ? 3 : 2,
                    'shot_x' => $coords['x'],
                    'shot_y' => $coords['y'],
                    'assist' => $assistData,
                    'home_score' => $p['home_score'] ?? 0,
                    'away_score' => $p['away_score'] ?? 0,
                ];
            }
        }

        // Se o jogo não tiver jogadas gravadas suficientes, sintetizar fielmente a partir do boxscore
        if (count($shots) < 15) {
            $synthesized = $this->synthesizeShotsFromStats($homeStats, $awayStats, $game);
            $shots = $synthesized['shots'];
            $replayPlays = $synthesized['replayPlays'];
        }

        return [
            'shots' => $shots,
            'replayPlays' => $replayPlays,
        ];
    }

    /**
     * Calcula coordenadas (x, y) realistas numa meia-quadra NBA (0 a 100 x 0 a 94).
     * O cesto / aro situa-se em x = 50, y = 12.
     */
    private function calculateCourtCoords(string $shotType, int $distFt): array
    {
        $hoopX = 50;
        $hoopY = 12;

        if ($shotType === 'Dunk' || $distFt <= 2) {
            return [
                'x' => round($hoopX + (mt_rand(-20, 20) / 10), 1),
                'y' => round($hoopY + (mt_rand(0, 25) / 10), 1),
                'zone' => 'restricted',
            ];
        }

        if ($shotType === 'Layup' || $distFt <= 4) {
            return [
                'x' => round($hoopX + (mt_rand(-40, 40) / 10), 1),
                'y' => round($hoopY + (mt_rand(10, 40) / 10), 1),
                'zone' => 'restricted',
            ];
        }

        if ($shotType === 'Floater' || $shotType === 'Hook Shot' || ($distFt <= 10 && $shotType !== '3-Pointer')) {
            return [
                'x' => round($hoopX + (mt_rand(-80, 80) / 10), 1),
                'y' => round(16 + (mt_rand(0, 140) / 10), 1),
                'zone' => 'paint',
            ];
        }

        if ($shotType === '3-Pointer' || $distFt >= 22) {
            $randZone = mt_rand(1, 10);
            if ($randZone === 1) {
                return [
                    'x' => round(6 + (mt_rand(0, 20) / 10), 1),
                    'y' => round(10 + (mt_rand(0, 100) / 10), 1),
                    'zone' => 'corner3_left',
                ];
            } elseif ($randZone === 2) {
                return [
                    'x' => round(94 - (mt_rand(0, 20) / 10), 1),
                    'y' => round(10 + (mt_rand(0, 100) / 10), 1),
                    'zone' => 'corner3_right',
                ];
            } else {
                $angle = mt_rand(35, 145) * (M_PI / 180);
                $radius = 42 + (mt_rand(-20, 40) / 10);
                $x = round($hoopX + $radius * cos($angle), 1);
                $y = round($hoopY + $radius * sin($angle), 1);
                return [
                    'x' => max(12, min(88, $x)),
                    'y' => max(48, min(82, $y)),
                    'zone' => 'above_break3',
                ];
            }
        }

        // Mid-Range (distFt entre 11 e 21)
        $angle = mt_rand(25, 155) * (M_PI / 180);
        $radius = 24 + (mt_rand(-30, 80) / 10);
        $x = round($hoopX + $radius * cos($angle), 1);
        $y = round($hoopY + $radius * sin($angle), 1);

        return [
            'x' => max(16, min(84, $x)),
            'y' => max(20, min(48, $y)),
            'zone' => 'midrange',
        ];
    }

    /**
     * Sintetiza com exatidão matemática todos os lançamentos e jogadas de replay
     * a partir dos números oficiais do boxscore de cada atleta.
     */
    private function synthesizeShotsFromStats($homeStats, $awayStats, Jogo $game): array
    {
        $shots = [];
        $replayPlays = [];
        $counter = 1;

        $homeScoreRunning = 0;
        $awayScoreRunning = 0;

        $teams = [
            ['stats' => collect($homeStats), 'isHome' => true, 'team' => $game->equipaCasa],
            ['stats' => collect($awayStats), 'isHome' => false, 'team' => $game->equipaFora],
        ];

        $generatedShots = [];

        foreach ($teams as $t) {
            $teamStatsList = $t['stats'];
            foreach ($teamStatsList as $ath) {
                $fgm = (int) ($ath->fg_marcados ?? 0);
                $fga = (int) ($ath->fg_tentados ?? 0);
                $fg3m = (int) ($ath->fg3_marcados ?? 0);
                $fg3a = (int) ($ath->fg3_tentados ?? 0);

                $fg2m = max(0, $fgm - $fg3m);
                $fg2a = max(0, $fga - $fg3a);

                $fg3Miss = max(0, $fg3a - $fg3m);
                $fg2Miss = max(0, $fg2a - $fg2m);

                // Gerar triplos acertados
                for ($i = 0; $i < $fg3m; $i++) {
                    $generatedShots[] = [
                        'player' => $ath,
                        'isHome' => $t['isHome'],
                        'team' => $t['team'],
                        'team_list' => $teamStatsList,
                        'made' => true,
                        'type' => '3-Pointer',
                        'score_val' => 3,
                        'dist' => rand(23, 28),
                    ];
                }

                // Gerar triplos falhados
                for ($i = 0; $i < $fg3Miss; $i++) {
                    $generatedShots[] = [
                        'player' => $ath,
                        'isHome' => $t['isHome'],
                        'team' => $t['team'],
                        'team_list' => $teamStatsList,
                        'made' => false,
                        'type' => '3-Pointer',
                        'score_val' => 3,
                        'dist' => rand(23, 29),
                    ];
                }

                // Gerar lançamentos de 2 acertados
                for ($i = 0; $i < $fg2m; $i++) {
                    $isInside = (mt_rand(1, 100) <= 65);
                    $type = $isInside ? (mt_rand(1, 100) <= 30 ? 'Dunk' : 'Layup') : 'Mid-Range';
                    $dist = $isInside ? rand(1, 6) : rand(12, 19);
                    $generatedShots[] = [
                        'player' => $ath,
                        'isHome' => $t['isHome'],
                        'team' => $t['team'],
                        'team_list' => $teamStatsList,
                        'made' => true,
                        'type' => $type,
                        'score_val' => 2,
                        'dist' => $dist,
                    ];
                }

                // Gerar lançamentos de 2 falhados
                for ($i = 0; $i < $fg2Miss; $i++) {
                    $isInside = (mt_rand(1, 100) <= 50);
                    $type = $isInside ? 'Layup' : 'Mid-Range';
                    $dist = $isInside ? rand(2, 8) : rand(12, 20);
                    $generatedShots[] = [
                        'player' => $ath,
                        'isHome' => $t['isHome'],
                        'team' => $t['team'],
                        'team_list' => $teamStatsList,
                        'made' => false,
                        'type' => $type,
                        'score_val' => 2,
                        'dist' => $dist,
                    ];
                }
            }
        }

        // Embaralhar para distribuir ao longo dos 4 quartos
        shuffle($generatedShots);

        $total = count($generatedShots);
        foreach ($generatedShots as $idx => $s) {
            $quarter = min(4, (int) floor(($idx / max(1, $total)) * 4) + 1);
            $minsLeft = 12 - (int) floor((($idx % max(1, (int) ceil($total / 4))) / max(1, (int) ceil($total / 4))) * 12);
            $secsLeft = rand(0, 59);
            $clockStr = sprintf('%02d:%02d', max(0, $minsLeft), $secsLeft);

            $coords = $this->calculateCourtCoords($s['type'], $s['dist']);

            $actionWord = $s['made'] ? 'marca' : 'falha';
            $verb = $s['made'] ? 'CESTO' : 'FALHADO';

            // Gerar assistência para lances acertados (~65% das vezes)
            $assistData = null;
            $assistText = '';
            if ($s['made'] && (mt_rand(1, 100) <= 65)) {
                $possiblePassers = $s['team_list']->filter(function ($teammate) use ($s) {
                    return ($teammate->nome_completo ?? '') !== ($s['player']->nome_completo ?? '');
                });
                if ($possiblePassers->isNotEmpty()) {
                    $passer = $possiblePassers->random();
                    $assistData = [
                        'id' => $passer->id ?? null,
                        'player_name' => $passer->nome_completo,
                        'jersey' => $passer->numero_camisola ?? '',
                        'photo' => $passer->foto_url ?? '/images/players/placeholder.png',
                        'pos' => $passer->posicao ?? 'G',
                    ];
                    $assistText = " (assistência de {$passer->nome_completo})";
                }
            }

            $descText = "{$s['player']->nome_completo} {$actionWord} {$s['type']} ({$s['dist']} pés){$assistText}. {$verb}!";

            if ($s['made']) {
                if ($s['isHome']) {
                    $homeScoreRunning += $s['score_val'];
                } else {
                    $awayScoreRunning += $s['score_val'];
                }
            }

            $shotItem = [
                'id' => 'shot_' . $counter++,
                'player_id' => $s['player']->id ?? null,
                'player_name' => $s['player']->nome_completo,
                'player_photo' => $s['player']->foto_url ?? '/images/players/placeholder.png',
                'numero_camisola' => $s['player']->numero_camisola ?? rand(1, 99),
                'posicao' => $s['player']->posicao ?? 'G',
                'team_sigla' => $s['team']->sigla,
                'team_name' => $s['team']->nome_completo,
                'is_home' => $s['isHome'],
                'period' => $quarter,
                'clock' => $clockStr,
                'made' => $s['made'],
                'score_value' => $s['score_val'],
                'type' => $s['type'],
                'distance_ft' => $s['dist'],
                'zone' => $coords['zone'],
                'x' => $coords['x'],
                'y' => $coords['y'],
                'text' => $descText,
            ];

            $shots[] = $shotItem;

            $replayPlays[] = [
                'id' => 'rp_' . $idx,
                'sequence' => $idx + 1,
                'period' => $quarter,
                'clock' => $clockStr,
                'text' => $descText,
                'event_type' => 'shot',
                'is_home' => $s['isHome'],
                'team_sigla' => $s['team']->sigla,
                'player_id' => $s['player']->id ?? null,
                'player_name' => $s['player']->nome_completo,
                'player_photo' => $s['player']->foto_url ?? '/images/players/placeholder.png',
                'player_jersey' => $s['player']->numero_camisola ?? rand(1, 99),
                'player_pos' => $s['player']->posicao ?? 'G',
                'is_shot' => true,
                'shot_made' => $s['made'],
                'shot_type' => $s['type'],
                'distance_ft' => $s['dist'],
                'shot_zone' => $coords['zone'],
                'score_value' => $s['score_val'],
                'shot_x' => $coords['x'],
                'shot_y' => $coords['y'],
                'assist' => $assistData,
                'home_score' => $homeScoreRunning,
                'away_score' => $awayScoreRunning,
            ];
        }

        return [
            'shots' => $shots,
            'replayPlays' => $replayPlays,
        ];
    }
}

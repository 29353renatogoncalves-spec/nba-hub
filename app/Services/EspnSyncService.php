<?php

namespace App\Services;

use App\Models\Equipa;
use App\Models\Jogo;
use App\Models\JogoPeriodo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EspnSyncService
{
    protected static array $abbrMap = [
        'NY' => 'NYK',
        'SA' => 'SAS',
        'GS' => 'GSW',
        'UTAH' => 'UTA',
        'NO' => 'NOP',
        'WSH' => 'WAS',
    ];

    /**
     * Sincroniza automaticamente a cada 30 segundos (ou forçado).
     */
    public static function syncIfNeeded(): bool
    {
        if (Cache::has('espn_sync_cooldown')) {
            return false;
        }

        // Cooldown de 30 segundos para permitir atualizações frequentes ao vivo
        Cache::put('espn_sync_cooldown', true, 30);
        return self::syncAll();
    }

    /**
     * Executa a sincronização completa: Jogos Recentes, Jogos Ao Vivo e Tabela Oficial da ESPN.
     */
    public static function syncAll(bool $force = false): bool
    {
        try {
            self::syncStandingsFromEspn();
            self::syncRecentGames($force);
            self::syncAllPlayerSeasonStatsFromEspn();
            return true;
        } catch (\Throwable $e) {
            Log::error('Erro na sincronização completa ESPN: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Sincroniza a Tabela de Classificação Oficial diretamente da API da ESPN.
     */
    public static function syncStandingsFromEspn(): bool
    {
        try {
            $ch = curl_init('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            $res = curl_exec($ch);
            curl_close($ch);

            if (!$res) return false;

            $standings = json_decode($res, true);
            if (!isset($standings['children'])) return false;

            $teamsBySigla = Equipa::all()->keyBy('sigla');
            $seasonId = 5; // 2026/2027

            foreach ($standings['children'] as $conf) {
                foreach ($conf['standings']['entries'] ?? [] as $entry) {
                    $espnAbbr = $entry['team']['abbreviation'] ?? '';
                    $sigla = self::$abbrMap[$espnAbbr] ?? $espnAbbr;
                    $team = $teamsBySigla->get($sigla);

                    if (!$team) continue;

                    $stats = [];
                    foreach ($entry['stats'] ?? [] as $s) {
                        $stats[$s['name']] = $s['displayValue'] ?? $s['value'] ?? '';
                    }

                    $wins = (int) ($stats['wins'] ?? 0);
                    $losses = (int) ($stats['losses'] ?? 0);
                    $pointsFor = (int) ($stats['pointsFor'] ?? 0);
                    $pointsAgainst = (int) ($stats['pointsAgainst'] ?? 0);

                    $homeParts = explode('-', $stats['Home'] ?? '0-0');
                    $homeWins = (int) ($homeParts[0] ?? 0);
                    $homeLosses = (int) ($homeParts[1] ?? 0);

                    $roadParts = explode('-', $stats['Road'] ?? '0-0');
                    $roadWins = (int) ($roadParts[0] ?? 0);
                    $roadLosses = (int) ($roadParts[1] ?? 0);

                    $rawStreak = $stats['streak'] ?? '';
                    $streak = '-';
                    if (preg_match('/^([WL])(\d+)$/', $rawStreak, $m)) {
                        $streak = $m[2] . ($m[1] === 'W' ? 'V' : 'D');
                    } elseif (!empty($rawStreak)) {
                        $streak = $rawStreak;
                    }

                    $l10 = $stats['Last Ten Games'] ?? '0-0';

                    DB::table('classificacao_oficial')->updateOrInsert(
                        ['epoca_id' => $seasonId, 'equipa_id' => $team->id],
                        [
                            'fase_id' => 1,
                            'vitorias' => $wins,
                            'derrotas' => $losses,
                            'pontos_marcados' => $pointsFor,
                            'pontos_sofridos' => $pointsAgainst,
                            'vitorias_casa' => $homeWins,
                            'derrotas_casa' => $homeLosses,
                            'vitorias_fora' => $roadWins,
                            'derrotas_fora' => $roadLosses,
                            'ultimos_10' => $l10,
                            'sequencia_atual' => $streak,
                            'atualizado_em' => now(),
                        ]
                    );
                }
            }
            return true;
        } catch (\Throwable $e) {
            Log::error('Erro ao sincronizar classificação da ESPN: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Sincroniza todos os jogos (passados, de hoje ao vivo e agendados) via ESPN Scoreboard.
     */
    public static function syncRecentGames(bool $force = false): bool
    {
        try {
            $seasonId = 5; // 2026/2027

            // Gera intervalo dinâmico de datas desde a noite de abertura até amanhã
            $startDate = Carbon::create(2026, 10, 20);
            $endDate = Carbon::now('America/New_York')->addDays(2);

            $dates = [];
            $cur = $startDate->copy();
            while ($cur->lte($endDate)) {
                $dates[] = $cur->format('Ymd');
                $cur->addDay();
            }

            // Executa requisições assíncronas com curl_multi
            $mh = curl_multi_init();
            $handles = [];

            foreach ($dates as $date) {
                $ch = curl_init("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates={$date}");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                curl_multi_add_handle($mh, $ch);
                $handles[$date] = $ch;
            }

            $running = null;
            do {
                curl_multi_exec($mh, $running);
                curl_multi_select($mh);
            } while ($running > 0);

            $allEvents = [];
            foreach ($handles as $date => $ch) {
                $res = curl_multi_getcontent($ch);
                if ($res) {
                    $data = json_decode($res, true);
                    foreach ($data['events'] ?? [] as $ev) {
                        $allEvents[$ev['id']] = $ev;
                    }
                }
                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
            }
            curl_multi_close($mh);

            if (empty($allEvents)) {
                return false;
            }

            $teamsBySigla = Equipa::all()->keyBy('sigla');

            foreach ($allEvents as $espnId => $ev) {
                $competition = $ev['competitions'][0] ?? null;
                if (!$competition) continue;

                $homeComp = null;
                $awayComp = null;
                foreach ($competition['competitors'] ?? [] as $c) {
                    if ($c['homeAway'] === 'home') $homeComp = $c;
                    if ($c['homeAway'] === 'away') $awayComp = $c;
                }

                if (!$homeComp || !$awayComp) continue;

                $homeRaw = $homeComp['team']['abbreviation'] ?? '';
                $awayRaw = $awayComp['team']['abbreviation'] ?? '';

                $homeSigla = self::$abbrMap[$homeRaw] ?? $homeRaw;
                $awaySigla = self::$abbrMap[$awayRaw] ?? $awayRaw;

                $homeTeam = $teamsBySigla->get($homeSigla);
                $awayTeam = $teamsBySigla->get($awaySigla);

                if (!$homeTeam || !$awayTeam) continue;

                $state = $ev['status']['type']['state'] ?? 'pre';
                $statusName = $ev['status']['type']['name'] ?? '';
                $detail = $ev['status']['type']['detail'] ?? '';

                if ($state === 'post') {
                    $estado = 'concluido';
                    $periodoAtual = 'FINAL';
                    $tempoRestante = '00:00';
                } elseif ($state === 'in') {
                    $estado = ($statusName === 'STATUS_HALFTIME') ? 'intervalo' : 'em_direto';
                    $p = $ev['status']['period'] ?? 1;
                    $periodoAtual = ($p <= 4) ? "Q{$p}" : ("OT" . ($p - 4));
                    $tempoRestante = $ev['status']['displayClock'] ?? '12:00';
                } else {
                    $estado = 'agendado';
                    $periodoAtual = null;
                    $tempoRestante = null;
                }

                $pontosCasa = ($state === 'pre') ? null : (int) ($homeComp['score'] ?? 0);
                $pontosFora = ($state === 'pre') ? null : (int) ($awayComp['score'] ?? 0);

                $canalTv = $competition['broadcasts'][0]['names'][0] ?? 'NBA League Pass';
                $dataHora = Carbon::parse($ev['date'])->setTimezone('Europe/Lisbon')->format('Y-m-d H:i:s');
                $arenaId = $homeTeam->arena_id ?? 1;

                $jogo = Jogo::where('espn_id', $espnId)->first();
                if (!$jogo) {
                    $gameDate = Carbon::parse($ev['date'])->setTimezone('Europe/Lisbon')->format('Y-m-d');
                    $jogo = Jogo::where('epoca_id', $seasonId)
                        ->where('equipa_casa_id', $homeTeam->id)
                        ->where('equipa_fora_id', $awayTeam->id)
                        ->whereDate('data_hora', $gameDate)
                        ->first();
                }

                if ($jogo) {
                    $jogo->espn_id = $espnId;
                    $jogo->data_hora = $dataHora;
                    $jogo->pontos_casa = $pontosCasa;
                    $jogo->pontos_fora = $pontosFora;
                    $jogo->estado = $estado;
                    $jogo->periodo_atual = $periodoAtual;
                    $jogo->tempo_restante = $tempoRestante;
                    $jogo->canal_tv = $canalTv;
                    $jogo->arena_id = $arenaId;
                    $jogo->save();
                } else {
                    $jogo = Jogo::create([
                        'espn_id' => $espnId,
                        'epoca_id' => $seasonId,
                        'fase_id' => 1,
                        'arena_id' => $arenaId,
                        'equipa_casa_id' => $homeTeam->id,
                        'equipa_fora_id' => $awayTeam->id,
                        'data_hora' => $dataHora,
                        'pontos_casa' => $pontosCasa,
                        'pontos_fora' => $pontosFora,
                        'estado' => $estado,
                        'periodo_atual' => $periodoAtual,
                        'tempo_restante' => $tempoRestante,
                        'destaque_hero' => 0,
                        'publico_presente' => rand(17500, 20500),
                        'canal_tv' => $canalTv,
                    ]);
                }

                // Sincroniza parciais de quartos (Q1-Q4 / OT)
                $homeLinescores = $homeComp['linescores'] ?? [];
                $awayLinescores = $awayComp['linescores'] ?? [];
                if (!empty($homeLinescores) || !empty($awayLinescores)) {
                    JogoPeriodo::where('jogo_id', $jogo->id)->delete();
                    $totalPeriods = max(count($homeLinescores), count($awayLinescores));
                    for ($p = 1; $p <= $totalPeriods; $p++) {
                        $periodLabel = ($p <= 4) ? "Q{$p}" : ("OT" . ($p - 4));
                        JogoPeriodo::create([
                            'jogo_id' => $jogo->id,
                            'periodo' => $periodLabel,
                            'ordem' => $p,
                            'pontos_casa' => $homeLinescores[$p - 1]['value'] ?? 0,
                            'pontos_fora' => $awayLinescores[$p - 1]['value'] ?? 0,
                        ]);
                    }
                }
            }

            Cache::put('espn_last_sync_time', now()->format('d/m/Y H:i:s'), 86400);

            return true;
        } catch (\Throwable $e) {
            Log::error('Erro ao sincronizar jogos da ESPN: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtém o Box Score oficial e completo de um jogo diretamente da ESPN Summary API.
     */
    public static function fetchGameBoxScore(string $espnId): ?array
    {
        return Cache::remember("espn_game_summary_{$espnId}", 45, function () use ($espnId) {
            try {
                $ch = curl_init("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={$espnId}");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                $res = curl_exec($ch);
                curl_close($ch);

                if (!$res) return null;

                $data = json_decode($res, true);
                return $data;
            } catch (\Throwable $e) {
                Log::error("Erro ao obter boxscore ESPN para {$espnId}: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Sincroniza em lote todas as médias da temporada oficial atual de todos os atletas via ESPN.
     */
    public static function syncAllPlayerSeasonStatsFromEspn(): bool
    {
        try {
            $url = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?region=us&lang=en&contentorigin=espn&isOverview=true&limit=350";
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            $res = curl_exec($ch);
            curl_close($ch);

            if (!$res) return false;

            $data = json_decode($res, true);
            $athletes = $data['athletes'] ?? [];
            if (empty($athletes)) return false;

            $seasonId = 5; // 2026/2027
            $dbPlayers = DB::table('jogadores')->get();
            $teamsBySigla = DB::table('equipas')->get()->keyBy('sigla');

            // Mapeamento por nome limpo e por espn_id
            $playersByCleanName = [];
            $playersByEspnId = [];
            foreach ($dbPlayers as $p) {
                $clean = self::cleanPlayerName($p->nome_completo);
                $playersByCleanName[$clean] = $p;
                if (!empty($p->espn_id)) {
                    $playersByEspnId[$p->espn_id] = $p;
                }
            }

            foreach ($athletes as $item) {
                try {
                    $espnAth = $item['athlete'] ?? [];
                    $espnId = (string) ($espnAth['id'] ?? '');
                    $displayName = $espnAth['displayName'] ?? '';
                    if (empty($displayName)) continue;

                    $clean = self::cleanPlayerName($displayName);
                    $player = $playersByEspnId[$espnId] ?? $playersByCleanName[$clean] ?? null;

                    if (!$player) continue;

                    // Atualizar espn_id e foto_url se necessário
                    $headshot = $espnAth['headshot']['href'] ?? null;
                    $updateData = [];
                    if (empty($player->espn_id) && $espnId) {
                        $updateData['espn_id'] = $espnId;
                    }
                    if ($headshot && (empty($player->foto_url) || str_contains($player->foto_url, 'placeholder'))) {
                        $updateData['foto_url'] = $headshot;
                    }
                    if (!empty($updateData)) {
                        DB::table('jogadores')->where('id', $player->id)->update($updateData);
                    }

                    // Identificar equipa correta da ESPN
                    $teamShort = $espnAth['teamShortName'] ?? ($espnAth['teamName'] ?? '');
                    $cleanSigla = self::$abbrMap[$teamShort] ?? $teamShort;
                    $team = $teamsBySigla->get($cleanSigla);

                    if ($team) {
                        $existing = DB::table('contratos_jogadores')->where('jogador_id', $player->id)->first();
                        $takenNumbers = DB::table('contratos_jogadores')
                            ->where('equipa_id', $team->id)
                            ->when($existing, fn($q) => $q->where('id', '!=', $existing->id))
                            ->pluck('numero_camisola')
                            ->map(fn($v) => (string) $v)
                            ->toArray();

                        $jersey = $existing->numero_camisola ?? null;
                        if (!$jersey || in_array((string)$jersey, $takenNumbers)) {
                            for ($num = 0; $num <= 99; $num++) {
                                if (!in_array((string)$num, $takenNumbers)) {
                                    $jersey = (string)$num;
                                    break;
                                }
                            }
                        }

                        if ($existing) {
                            DB::table('contratos_jogadores')->where('id', $existing->id)->update([
                                'equipa_id' => $team->id,
                                'numero_camisola' => $jersey ?? '0',
                                'ativo' => 1,
                            ]);
                        } else {
                            DB::table('contratos_jogadores')->insert([
                                'jogador_id' => $player->id,
                                'equipa_id' => $team->id,
                                'numero_camisola' => $jersey ?? '0',
                                'salario_anual_usd' => 5000000,
                                'data_inicio' => '2026-10-20',
                                'data_fim' => '2027-06-30',
                                'ativo' => 1,
                            ]);
                        }
                    }

                    $teamId = $team ? $team->id : 1;

                    // Extrair estatísticas através do mapa de nomes oficiais
                    $statMap = [];
                    foreach ($item['categories'] ?? [] as $cat) {
                        $names = $cat['names'] ?? [];
                        $totals = $cat['totals'] ?? [];
                        if (count($names) === count($totals)) {
                            $statMap = array_merge($statMap, array_combine($names, $totals));
                        }
                    }

                    $gamesPlayed = (int) ($statMap['gamesPlayed'] ?? 0);
                    if ($gamesPlayed === 0) continue;

                    $avgMinutes = (float) ($statMap['avgMinutes'] ?? 0);
                    $avgPoints = (float) ($statMap['avgPoints'] ?? 0);
                    $avgRebounds = (float) ($statMap['avgRebounds'] ?? 0);
                    $avgAssists = (float) ($statMap['avgAssists'] ?? 0);
                    $avgSteals = (float) ($statMap['avgSteals'] ?? 0);
                    $avgBlocks = (float) ($statMap['avgBlocks'] ?? 0);
                    $fgPct = (float) ($statMap['fieldGoalPct'] ?? 0);
                    $fg3Pct = (float) ($statMap['threePointFieldGoalPct'] ?? 0);
                    $ftPct = (float) ($statMap['freeThrowPct'] ?? 0);

                    DB::table('estatisticas_jogador_epoca')->updateOrInsert(
                        [
                            'jogador_id' => $player->id,
                            'epoca_id' => $seasonId,
                        ],
                        [
                            'equipa_id' => $teamId,
                            'jogos_disputados' => $gamesPlayed,
                            'titular' => $gamesPlayed,
                            'minutos_jogo' => $avgMinutes,
                            'pontos_jogo' => $avgPoints,
                            'ressaltos_jogo' => $avgRebounds,
                            'assistencias_jogo' => $avgAssists,
                            'roubos_jogo' => $avgSteals,
                            'desarmes_jogo' => $avgBlocks,
                            'fg_pct' => $fgPct,
                            'fg3_pct' => $fg3Pct,
                            'ft_pct' => $ftPct,
                        ]
                    );
                } catch (\Throwable $exPlayer) {
                    Log::warning("Erro ao sincronizar jogador individual {$displayName}: " . $exPlayer->getMessage());
                }
            }

            Cache::put('espn_players_synced', now(), 3600);
            return true;
        } catch (\Throwable $e) {
            Log::error("Erro ao sincronizar médias dos jogadores da ESPN: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Sincroniza o histórico completo da carreira por época de um atleta diretamente da ESPN.
     */
    public static function syncPlayerCareerStats($player): bool
    {
        try {
            $espnId = $player->espn_id ?? null;
            if (empty($espnId)) {
                $searchUrl = "https://site.web.api.espn.com/apis/search/v2?query=" . urlencode($player->nome_completo) . "&limit=5";
                $ch = curl_init($searchUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                $res = curl_exec($ch);
                curl_close($ch);

                if ($res) {
                    $json = json_decode($res, true);
                    foreach ($json['results'] ?? [] as $group) {
                        if (($group['displayName'] ?? '') === 'Players') {
                            foreach ($group['contents'] ?? [] as $c) {
                                if (($c['defaultLeagueSlug'] ?? '') === 'nba' || ($c['sport'] ?? '') === 'basketball') {
                                    if (preg_match('/\/id\/(\d+)\//', $c['link']['web'] ?? '', $m)) {
                                        $espnId = $m[1];
                                        break 2;
                                    } elseif (preg_match('/~a:(\d+)/', $c['uid'] ?? '', $m)) {
                                        $espnId = $m[1];
                                        break 2;
                                    }
                                }
                            }
                        }
                    }
                }

                if ($espnId) {
                    DB::table('jogadores')->where('id', $player->id)->update(['espn_id' => $espnId]);
                } else {
                    return false;
                }
            }

            $statsUrl = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{$espnId}/stats";
            $ch = curl_init($statsUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            $res = curl_exec($ch);
            curl_close($ch);

            if (!$res) return false;

            $data = json_decode($res, true);
            $averagesCat = null;
            foreach ($data['categories'] ?? [] as $cat) {
                if (($cat['name'] ?? '') === 'averages') {
                    $averagesCat = $cat;
                    break;
                }
            }

            if (!$averagesCat) return false;

            $contract = DB::table('contratos_jogadores')->where('jogador_id', $player->id)->where('ativo', 1)->first();
            $teamId = $contract->equipa_id ?? 1;

            $epocas = DB::table('epocas')->get()->keyBy('nome');

            foreach ($averagesCat['statistics'] ?? [] as $row) {
                $espnSeason = $row['season']['displayName'] ?? '';
                if (!$espnSeason) continue;

                $parts = explode('-', $espnSeason);
                if (count($parts) === 2) {
                    $y1 = (int) $parts[0];
                    $y2 = (int) (substr($parts[0], 0, 2) . $parts[1]);
                    $seasonNome = "{$y1}/{$y2}";
                } else {
                    $seasonNome = $espnSeason;
                }

                $epoca = $epocas->get($seasonNome);
                if (!$epoca) {
                    $epocaId = DB::table('epocas')->insertGetId([
                        'nome' => $seasonNome,
                        'data_inicio' => "{$parts[0]}-10-20",
                        'data_fim' => ($y2 ?? $parts[0] + 1) . "-06-20",
                        'atual' => ($seasonNome === '2026/2027') ? 1 : 0,
                    ]);
                    $epoca = (object) ['id' => $epocaId, 'nome' => $seasonNome];
                    $epocas->put($seasonNome, $epoca);
                }

                $stats = $row['stats'] ?? [];
                $gp = (int) ($stats[0] ?? 0);
                $gs = (int) ($stats[1] ?? 0);
                $min = (float) ($stats[2] ?? 0);
                $fgPct = (float) ($stats[4] ?? 0);
                $fg3Pct = (float) ($stats[6] ?? 0);
                $ftPct = (float) ($stats[8] ?? 0);
                $reb = (float) ($stats[11] ?? 0);
                $ast = (float) ($stats[12] ?? 0);
                $blk = (float) ($stats[13] ?? 0);
                $stl = (float) ($stats[14] ?? 0);
                $pts = (float) ($stats[17] ?? 0);

                DB::table('estatisticas_jogador_epoca')->updateOrInsert(
                    [
                        'jogador_id' => $player->id,
                        'epoca_id' => $epoca->id,
                    ],
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
                        'fg_pct' => $fgPct,
                        'fg3_pct' => $fg3Pct,
                        'ft_pct' => $ftPct,
                    ]
                );
            }

            return true;
        } catch (\Throwable $e) {
            Log::error("Erro ao sincronizar histórico da carreira ESPN para {$player->nome_completo}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Limpa e normaliza o nome do atleta para emparelhamento seguro entre bases de dados.
     */
    public static function cleanPlayerName(string $name): string
    {
        $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name);
        return strtolower(preg_replace('/[^a-zA-Z]/', '', $str ?: $name));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Equipa;
use App\Models\Noticia;
use App\Services\EspnSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NbaHubController extends Controller
{
    public function index(Request $request)
    {
        try {
            DB::statement('SET SESSION sql_big_selects=1');
        } catch (\Throwable $e) {}

        // 0. Auto-sincronização transparente com a ESPN em background/cache throttle
        EspnSyncService::syncIfNeeded();

        // 1. Épocas disponíveis (ordenadas cronologicamente das mais recentes para as mais antigas)
        $seasons = DB::table('epocas')->orderBy('data_inicio', 'desc')->get();
        $defaultSeason = $seasons->where('atual', 1)->first() ?? $seasons->first();
        $selectedSeasonId = (int) $request->query('season_id', $defaultSeason ? $defaultSeason->id : 5);

        // 2. Jogos Recentes Oficiais e Resultados com Quarters (Otimizado sem Joins pesados para compatibilidade total)
        $allTeams = DB::table('equipas')->get()->keyBy('id');
        $allArenas = DB::table('arenas')->get()->keyBy('id');

        $gamesRaw = DB::table('jogos')
            ->where('epoca_id', $selectedSeasonId)
            ->orderByRaw("
                CASE 
                    WHEN estado = 'em_direto' THEN 1 
                    WHEN estado = 'intervalo' THEN 2 
                    WHEN DATE(data_hora) = CURDATE() THEN 3 
                    WHEN estado = 'concluido' THEN 4 
                    ELSE 5 
                END, 
                data_hora DESC
            ")
            ->get();

        $recentGames = $gamesRaw->map(function ($j) use ($allTeams, $allArenas) {
            $casa = $allTeams->get($j->equipa_casa_id);
            $fora = $allTeams->get($j->equipa_fora_id);
            $arena = $allArenas->get($j->arena_id);

            $j->casa_nome = $casa ? $casa->nome_completo : '';
            $j->casa_sigla = $casa ? $casa->sigla : '';
            $j->casa_logo = $casa ? $casa->logo_url : '';
            $j->casa_cor = $casa ? $casa->cor_primaria : '#1d428a';

            $j->fora_nome = $fora ? $fora->nome_completo : '';
            $j->fora_sigla = $fora ? $fora->sigla : '';
            $j->fora_logo = $fora ? $fora->logo_url : '';
            $j->fora_cor = $fora ? $fora->cor_primaria : '#c8102e';

            $j->arena_nome = $arena ? $arena->nome : '';
            $j->arena_cidade = $arena ? $arena->cidade : '';

            return $j;
        });

        $gameIds = $recentGames->pluck('id');
        $periods = DB::table('jogos_periodos')
            ->whereIn('jogo_id', $gameIds)
            ->orderBy('ordem', 'asc')
            ->get()
            ->groupBy('jogo_id');

        $recentGames->transform(function ($game) use ($periods) {
            $game->quarters = $periods->get($game->id, []);
            return $game;
        });

        // Jogo Destaque para o Hero Banner (prioriza marquee concluído ou em direto)
        $featured = $recentGames->firstWhere('destaque_hero', 1) 
            ?? $recentGames->where('estado', 'concluido')->first() 
            ?? $recentGames->first();

        $heroGame = null;
        if ($featured) {
            $heroGame = (object) [
                'jogo_id' => $featured->id,
                'data_hora' => $featured->data_hora,
                'estado' => $featured->estado,
                'periodo_atual' => $featured->periodo_atual,
                'tempo_restante' => $featured->tempo_restante,
                'canal_tv' => $featured->canal_tv,
                'equipa_casa_nome' => $featured->casa_nome,
                'equipa_casa_sigla' => $featured->casa_sigla,
                'equipa_casa_logo' => $featured->casa_logo,
                'equipa_casa_cor' => $featured->casa_cor,
                'pontos_casa' => $featured->pontos_casa,
                'equipa_fora_nome' => $featured->fora_nome,
                'equipa_fora_sigla' => $featured->fora_sigla,
                'equipa_fora_logo' => $featured->fora_logo,
                'equipa_fora_cor' => $featured->fora_cor,
                'pontos_fora' => $featured->pontos_fora,
                'arena_nome' => $featured->arena_nome,
                'arena_cidade' => $featured->arena_cidade,
            ];
        }

        // 3. Classificações Oficiais da Época Selecionada (Este e Oeste) com Fallback Direto
        $standingsEast = $this->getStandings('Este', $selectedSeasonId);
        $standingsWest = $this->getStandings('Oeste', $selectedSeasonId);

        // 4. As 30 Equipas com Arena e os Jogadores Reais pré-carregados para o Drawer
        $teams = Equipa::with(['jogadores', 'arena'])
            ->orderBy('nome_completo', 'asc')
            ->get();

        // 5. Notícias Oficiais
        $news = Noticia::with(['categoria', 'equipa'])
            ->where('estado', 'publicado')
            ->orderBy('publicado_em', 'desc')
            ->take(6)
            ->get();

        // 6. Top Marcador Oficial da Época Selecionada
        $realTopScorer = DB::table('estatisticas_jogador_epoca')
            ->join('jogadores', 'estatisticas_jogador_epoca.jogador_id', '=', 'jogadores.id')
            ->join('equipas', 'estatisticas_jogador_epoca.equipa_id', '=', 'equipas.id')
            ->where('estatisticas_jogador_epoca.epoca_id', $selectedSeasonId)
            ->where('estatisticas_jogador_epoca.jogos_disputados', '>=', 2)
            ->orderBy('estatisticas_jogador_epoca.pontos_jogo', 'desc')
            ->select(
                'jogadores.nome_completo as nome',
                'estatisticas_jogador_epoca.pontos_jogo as ppg',
                'equipas.nome_completo as equipa',
                'jogadores.foto_url as foto'
            )
            ->first();

        $topScorerInfo = $realTopScorer ? [
            'nome' => $realTopScorer->nome,
            'ppg' => (float) $realTopScorer->ppg,
            'equipa' => $realTopScorer->equipa,
            'foto' => $realTopScorer->foto,
        ] : [
            'nome' => 'Luka Dončić',
            'ppg' => 37.7,
            'equipa' => 'Dallas Mavericks',
            'foto' => '/images/players/1629029.png'
        ];

        // 7. KPIs da Liga
        $isCurrentSeason = ($selectedSeasonId == 5);
        $totalJogosConcluidos = DB::table('jogos')->where('epoca_id', $selectedSeasonId)->where('estado', 'concluido')->count();
        if (!$isCurrentSeason && $totalJogosConcluidos == 0) {
            $totalJogosConcluidos = 1230; // 82 jogos x 30 equipas / 2
        }

        $kpis = [
            'total_jogos' => $totalJogosConcluidos ?: 16,
            'lider_este' => $standingsEast->first()->nome_completo ?? 'Toronto Raptors',
            'lider_oeste' => $standingsWest->first()->nome_completo ?? 'Portland Trail Blazers',
            'top_marcador' => $topScorerInfo
        ];

        // 8. Líderes Estatísticos da Liga (League Leaders)
        $categories = [
            'pontos' => 'pontos_jogo',
            'assistencias' => 'assistencias_jogo',
            'ressaltos' => 'ressaltos_jogo',
            'roubos' => 'roubos_jogo',
            'desarmes' => 'desarmes_jogo',
            'fg3_pct' => 'fg3_pct',
        ];
        $leagueLeaders = [];
        foreach ($categories as $catKey => $col) {
            $catLeaders = DB::table('estatisticas_jogador_epoca')
                ->join('jogadores', 'estatisticas_jogador_epoca.jogador_id', '=', 'jogadores.id')
                ->join('equipas', 'estatisticas_jogador_epoca.equipa_id', '=', 'equipas.id')
                ->where('estatisticas_jogador_epoca.epoca_id', $selectedSeasonId)
                ->where('estatisticas_jogador_epoca.jogos_disputados', '>=', 2)
                ->select(
                    'jogadores.id as jogador_id',
                    'jogadores.nome_completo',
                    'jogadores.posicao_primaria as posicao',
                    'jogadores.foto_url',
                    'equipas.id as equipa_id',
                    'equipas.nome_completo as equipa_nome',
                    'equipas.sigla as equipa_sigla',
                    'equipas.logo_url as equipa_logo',
                    'equipas.cor_primaria as equipa_cor',
                    "estatisticas_jogador_epoca.{$col} as valor",
                    'estatisticas_jogador_epoca.jogos_disputados'
                )
                ->orderBy("estatisticas_jogador_epoca.{$col}", 'desc')
                ->take(5)
                ->get();

            if ($catLeaders->isEmpty()) {
                $catLeaders = DB::table('estatisticas_jogador_epoca')
                    ->join('jogadores', 'estatisticas_jogador_epoca.jogador_id', '=', 'jogadores.id')
                    ->join('equipas', 'estatisticas_jogador_epoca.equipa_id', '=', 'equipas.id')
                    ->where('estatisticas_jogador_epoca.epoca_id', 5)
                    ->where('estatisticas_jogador_epoca.jogos_disputados', '>=', 2)
                    ->select(
                        'jogadores.id as jogador_id',
                        'jogadores.nome_completo',
                        'jogadores.posicao_primaria as posicao',
                        'jogadores.foto_url',
                        'equipas.id as equipa_id',
                        'equipas.nome_completo as equipa_nome',
                        'equipas.sigla as equipa_sigla',
                        'equipas.logo_url as equipa_logo',
                        'equipas.cor_primaria as equipa_cor',
                        "estatisticas_jogador_epoca.{$col} as valor",
                        'estatisticas_jogador_epoca.jogos_disputados'
                    )
                    ->orderBy("estatisticas_jogador_epoca.{$col}", 'desc')
                    ->take(5)
                    ->get();
            }
            $leagueLeaders[$catKey] = $catLeaders;
        }

        // 9. Jogadores Completos para o Comparador Direto (Head-to-Head)
        $comparativePlayers = DB::table('jogadores')
            ->join('contratos_jogadores', function ($join) {
                $join->on('jogadores.id', '=', 'contratos_jogadores.jogador_id')
                     ->where('contratos_jogadores.ativo', '=', 1);
            })
            ->join('equipas', 'contratos_jogadores.equipa_id', '=', 'equipas.id')
            ->leftJoin('estatisticas_jogador_epoca', function ($join) use ($selectedSeasonId) {
                $join->on('jogadores.id', '=', 'estatisticas_jogador_epoca.jogador_id')
                     ->where('estatisticas_jogador_epoca.epoca_id', '=', $selectedSeasonId);
            })
            ->select(
                'jogadores.id',
                'jogadores.nome_completo',
                'jogadores.posicao_primaria as posicao',
                'jogadores.altura_metros',
                'jogadores.peso_kg',
                'jogadores.data_nascimento',
                'jogadores.foto_url',
                'contratos_jogadores.numero_camisola',
                'contratos_jogadores.salario_anual_usd',
                'equipas.id as equipa_id',
                'equipas.nome_completo as equipa_nome',
                'equipas.sigla as equipa_sigla',
                'equipas.logo_url as equipa_logo',
                'equipas.cor_primaria as equipa_cor',
                DB::raw('COALESCE(estatisticas_jogador_epoca.pontos_jogo, 0) as ppg'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.ressaltos_jogo, 0) as rpg'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.assistencias_jogo, 0) as apg'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.roubos_jogo, 0) as spg'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.desarmes_jogo, 0) as bpg'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.fg_pct, 0) as fg_pct'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.fg3_pct, 0) as fg3_pct'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.ft_pct, 0) as ft_pct'),
                DB::raw('COALESCE(estatisticas_jogador_epoca.minutos_jogo, 0) as mpg')
            )
            ->orderBy('equipas.nome_completo', 'asc')
            ->orderBy('jogadores.nome_completo', 'asc')
            ->get();

        return Inertia::render('Welcome', [
            'seasons' => $seasons,
            'selectedSeasonId' => $selectedSeasonId,
            'heroGame' => $heroGame,
            'recentGames' => $recentGames,
            'standingsEast' => $standingsEast,
            'standingsWest' => $standingsWest,
            'teams' => $teams,
            'news' => $news,
            'kpis' => $kpis,
            'leagueLeaders' => $leagueLeaders,
            'comparativePlayers' => $comparativePlayers,
            'lastSyncTime' => Cache::get('espn_last_sync_time', now()->format('d/m/Y H:i:s')),
        ]);
    }

    /**
     * Endpoint para sincronização manual / sob demanda da ESPN.
     */
    public function syncEspn(Request $request)
    {
        EspnSyncService::syncAll(true);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Jogos, boxscores e classificação oficial sincronizados com a ESPN!',
                'lastSyncTime' => Cache::get('espn_last_sync_time', now()->format('d/m/Y H:i:s')),
            ]);
        }

        return redirect()->back();
    }

    /**
     * Obtém classificação diretamente da tabela oficial (compatível com InfinityFree sem views).
     */
    private function getStandings(string $conference, int $seasonId)
    {
        $teams = DB::table('equipas')->where('conferencia', $conference)->get()->keyBy('id');
        $official = DB::table('classificacao_oficial')
            ->where('epoca_id', $seasonId)
            ->whereIn('equipa_id', $teams->keys())
            ->get();

        if ($official->isEmpty()) {
            $official = DB::table('classificacao_oficial')
                ->whereIn('equipa_id', $teams->keys())
                ->get();
        }

        $list = $official->map(function ($c) use ($teams) {
            $e = $teams->get($c->equipa_id);
            $jogos = (int)$c->vitorias + (int)$c->derrotas;
            $pct = $jogos > 0 ? round(($c->vitorias / $jogos) * 100, 1) : 0.0;
            $saldo = (int)$c->pontos_marcados - (int)$c->pontos_sofridos;
            $ppg = $jogos > 0 ? round($c->pontos_marcados / $jogos, 1) : 0.0;
            $opp = $jogos > 0 ? round($c->pontos_sofridos / $jogos, 1) : 0.0;

            return (object) [
                'epoca_id' => $c->epoca_id,
                'conferencia' => $e ? $e->conferencia : '',
                'divisao' => $e ? $e->divisao : '',
                'equipa_id' => $c->equipa_id,
                'nome_completo' => $e ? $e->nome_completo : '',
                'sigla' => $e ? $e->sigla : '',
                'logo_url' => $e ? $e->logo_url : '',
                'cor_primaria' => $e ? $e->cor_primaria : '#1d428a',
                'vitorias' => (int)$c->vitorias,
                'derrotas' => (int)$c->derrotas,
                'jogos' => $jogos,
                'pct_vitorias' => $pct,
                'casa' => "{$c->vitorias_casa}-{$c->derrotas_casa}",
                'fora' => "{$c->vitorias_fora}-{$c->derrotas_fora}",
                'pontos_marcados' => (int)$c->pontos_marcados,
                'pontos_sofridos' => (int)$c->pontos_sofridos,
                'saldo_pontos' => $saldo,
                'ppg' => $ppg,
                'opp_ppg' => $opp,
                'ultimos_10' => $c->ultimos_10 ?: '0-0',
                'sequencia_atual' => $c->sequencia_atual ?: '-',
            ];
        })->sortByDesc(function ($item) {
            return ($item->pct_vitorias * 10000) + $item->saldo_pontos;
        })->values();

        return $list->map(function ($item, $idx) {
            $item->posicao = $idx + 1;
            return $item;
        });
    }

    /**
     * Endpoint leve para auto-polling de resultados ao vivo e marcadores em tempo real.
     */
    public function liveScores(Request $request)
    {
        EspnSyncService::syncIfNeeded();

        $selectedSeasonId = (int) $request->query('season_id', 5);

        $allTeams = DB::table('equipas')->get()->keyBy('id');
        $allArenas = DB::table('arenas')->get()->keyBy('id');

        $gamesRaw = DB::table('jogos')
            ->where('epoca_id', $selectedSeasonId)
            ->orderByRaw("
                CASE 
                    WHEN estado = 'em_direto' THEN 1 
                    WHEN estado = 'intervalo' THEN 2 
                    WHEN DATE(data_hora) = CURDATE() THEN 3 
                    WHEN estado = 'concluido' THEN 4 
                    ELSE 5 
                END, 
                data_hora DESC
            ")
            ->take(50)
            ->get();

        $games = $gamesRaw->map(function ($j) use ($allTeams, $allArenas) {
            $casa = $allTeams->get($j->equipa_casa_id);
            $fora = $allTeams->get($j->equipa_fora_id);
            $arena = $allArenas->get($j->arena_id);

            $j->casa_nome = $casa ? $casa->nome_completo : '';
            $j->casa_sigla = $casa ? $casa->sigla : '';
            $j->casa_logo = $casa ? $casa->logo_url : '';
            $j->casa_cor = $casa ? $casa->cor_primaria : '#1d428a';

            $j->fora_nome = $fora ? $fora->nome_completo : '';
            $j->fora_sigla = $fora ? $fora->sigla : '';
            $j->fora_logo = $fora ? $fora->logo_url : '';
            $j->fora_cor = $fora ? $fora->cor_primaria : '#c8102e';

            $j->arena_nome = $arena ? $arena->nome : '';
            $j->arena_cidade = $arena ? $arena->cidade : '';

            return $j;
        });

        $gameIds = $games->pluck('id');
        $periods = DB::table('jogos_periodos')
            ->whereIn('jogo_id', $gameIds)
            ->orderBy('ordem', 'asc')
            ->get()
            ->groupBy('jogo_id');

        $games->transform(function ($game) use ($periods) {
            $game->quarters = $periods->get($game->id, []);
            return $game;
        });

        $liveCount = $games->filter(fn($g) => in_array($g->estado, ['em_direto', 'intervalo']))->count();

        return response()->json([
            'games' => $games,
            'live_count' => $liveCount,
            'last_sync' => Cache::get('espn_last_sync_time', now()->format('d/m/Y H:i:s')),
            'timestamp' => now()->timestamp,
        ]);
    }
}

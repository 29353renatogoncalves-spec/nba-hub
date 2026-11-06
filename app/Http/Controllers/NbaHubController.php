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
        // 0. Auto-sincronização transparente com a ESPN em background/cache throttle
        EspnSyncService::syncIfNeeded();

        // 1. Épocas disponíveis (ordenadas cronologicamente das mais recentes para as mais antigas)
        $seasons = DB::table('epocas')->orderBy('data_inicio', 'desc')->get();
        $defaultSeason = $seasons->where('atual', 1)->first() ?? $seasons->first();
        $selectedSeasonId = (int) $request->query('season_id', $defaultSeason ? $defaultSeason->id : 5);

        // 2. Jogos Recentes Oficiais e Resultados com Quarters
        $recentGames = DB::table('jogos')
            ->join('equipas as ec', 'jogos.equipa_casa_id', '=', 'ec.id')
            ->join('equipas as ef', 'jogos.equipa_fora_id', '=', 'ef.id')
            ->join('arenas as a', 'jogos.arena_id', '=', 'a.id')
            ->where('jogos.epoca_id', $selectedSeasonId)
            ->select(
                'jogos.id', 'jogos.data_hora', 'jogos.estado', 'jogos.periodo_atual', 'jogos.tempo_restante', 'jogos.canal_tv',
                'jogos.pontos_casa', 'jogos.pontos_fora', 'jogos.destaque_hero',
                'ec.nome_completo as casa_nome', 'ec.sigla as casa_sigla', 'ec.logo_url as casa_logo', 'ec.cor_primaria as casa_cor',
                'ef.nome_completo as fora_nome', 'ef.sigla as fora_sigla', 'ef.logo_url as fora_logo', 'ef.cor_primaria as fora_cor',
                'a.nome as arena_nome', 'a.cidade as arena_cidade'
            )
            ->orderByRaw("
                CASE 
                    WHEN jogos.estado = 'em_direto' THEN 1 
                    WHEN jogos.estado = 'intervalo' THEN 2 
                    WHEN DATE(jogos.data_hora) = CURDATE() THEN 3 
                    WHEN jogos.estado = 'concluido' THEN 4 
                    ELSE 5 
                END, 
                jogos.data_hora DESC
            ")
            ->get();

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

        // 3. Classificações Oficiais da Época Selecionada (Este e Oeste)
        $standingsEast = DB::table('vw_classificacao_nba')
            ->where('epoca_id', $selectedSeasonId)
            ->where('conferencia', 'Este')
            ->orderBy('posicao', 'asc')
            ->get();

        // Fallback caso a época não tenha equipas ainda
        if ($standingsEast->isEmpty()) {
            $standingsEast = DB::table('vw_classificacao_nba')
                ->where('conferencia', 'Este')
                ->orderBy('posicao', 'asc')
                ->get();
        }

        $standingsWest = DB::table('vw_classificacao_nba')
            ->where('epoca_id', $selectedSeasonId)
            ->where('conferencia', 'Oeste')
            ->orderBy('posicao', 'asc')
            ->get();

        if ($standingsWest->isEmpty()) {
            $standingsWest = DB::table('vw_classificacao_nba')
                ->where('conferencia', 'Oeste')
                ->orderBy('posicao', 'asc')
                ->get();
        }

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
     * Endpoint leve para auto-polling de resultados ao vivo e marcadores em tempo real.
     */
    public function liveScores(Request $request)
    {
        EspnSyncService::syncIfNeeded();

        $selectedSeasonId = (int) $request->query('season_id', 5);

        $games = DB::table('jogos')
            ->join('equipas as ec', 'jogos.equipa_casa_id', '=', 'ec.id')
            ->join('equipas as ef', 'jogos.equipa_fora_id', '=', 'ef.id')
            ->join('arenas as a', 'jogos.arena_id', '=', 'a.id')
            ->where('jogos.epoca_id', $selectedSeasonId)
            ->select(
                'jogos.id', 'jogos.data_hora', 'jogos.estado', 'jogos.periodo_atual', 'jogos.tempo_restante', 'jogos.canal_tv',
                'jogos.pontos_casa', 'jogos.pontos_fora', 'jogos.destaque_hero',
                'ec.nome_completo as casa_nome', 'ec.sigla as casa_sigla', 'ec.logo_url as casa_logo', 'ec.cor_primaria as casa_cor',
                'ef.nome_completo as fora_nome', 'ef.sigla as fora_sigla', 'ef.logo_url as fora_logo', 'ef.cor_primaria as fora_cor',
                'a.nome as arena_nome', 'a.cidade as arena_cidade'
            )
            ->orderByRaw("
                CASE 
                    WHEN jogos.estado = 'em_direto' THEN 1 
                    WHEN jogos.estado = 'intervalo' THEN 2 
                    WHEN DATE(jogos.data_hora) = CURDATE() THEN 3 
                    WHEN jogos.estado = 'concluido' THEN 4 
                    ELSE 5 
                END, 
                jogos.data_hora DESC
            ")
            ->take(50)
            ->get();

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

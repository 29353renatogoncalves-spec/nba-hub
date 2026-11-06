<?php

namespace App\Http\Controllers;

use App\Models\Equipa;
use App\Models\Noticia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function show(Request $request, $sigla)
    {
        $team = Equipa::with(['jogadores', 'arena'])
            ->where('sigla', strtoupper($sigla))
            ->firstOrFail();

        $seasons = DB::table('epocas')->orderBy('data_inicio', 'desc')->get();
        $defaultSeason = $seasons->where('atual', 1)->first() ?? $seasons->first();
        $selectedSeasonId = (int) $request->query('season_id', $defaultSeason?->id ?? 0);

        $standing = DB::table('vw_classificacao_nba')
            ->where('epoca_id', $selectedSeasonId)
            ->where('equipa_id', $team->id)
            ->first();

        if (!$standing) {
            $standing = DB::table('vw_classificacao_nba')
                ->where('equipa_id', $team->id)
                ->orderByDesc('epoca_id')
                ->first();
        }

        $games = DB::table('jogos')
            ->join('equipas as ec', 'jogos.equipa_casa_id', '=', 'ec.id')
            ->join('equipas as ef', 'jogos.equipa_fora_id', '=', 'ef.id')
            ->join('arenas as a', 'jogos.arena_id', '=', 'a.id')
            ->where('jogos.epoca_id', $selectedSeasonId)
            ->where(function ($query) use ($team) {
                $query->where('jogos.equipa_casa_id', $team->id)
                    ->orWhere('jogos.equipa_fora_id', $team->id);
            })
            ->select(
                'jogos.id',
                'jogos.data_hora',
                'jogos.estado',
                'jogos.pontos_casa',
                'jogos.pontos_fora',
                'jogos.canal_tv',
                'ec.nome_completo as casa_nome',
                'ec.sigla as casa_sigla',
                'ec.logo_url as casa_logo',
                'ef.nome_completo as fora_nome',
                'ef.sigla as fora_sigla',
                'ef.logo_url as fora_logo',
                'a.nome as arena_nome',
                'a.cidade as arena_cidade'
            )
            ->orderBy('jogos.data_hora', 'desc')
            ->get();

        $recentGames = $games->where('estado', 'concluido')->take(8)->values();
        $upcomingGames = $games->whereIn('estado', ['agendado', 'em_direto', 'intervalo'])
            ->sortBy('data_hora')
            ->take(6)
            ->values();

        $playerIds = $team->jogadores->pluck('id');
        $seasonStats = DB::table('estatisticas_jogador_epoca')
            ->where('epoca_id', $selectedSeasonId)
            ->whereIn('jogador_id', $playerIds)
            ->get()
            ->keyBy('jogador_id');

        $roster = $team->jogadores->map(function ($jogador) use ($seasonStats) {
            $stats = $seasonStats->get($jogador->id);
            $salario = (float) ($jogador->pivot->salario_anual_usd ?? 0);

            return [
                'id' => $jogador->id,
                'nome_completo' => $jogador->nome_completo,
                'posicao_primaria' => $jogador->posicao_primaria,
                'nacionalidade' => $jogador->nacionalidade,
                'altura_metros' => $jogador->altura_metros,
                'peso_kg' => $jogador->peso_kg,
                'foto_url' => $jogador->foto_url,
                'numero_camisola' => $jogador->pivot->numero_camisola ?? null,
                'salario_anual_usd' => $salario,
                'stats' => $stats ? [
                    'jogos_disputados' => $stats->jogos_disputados,
                    'ppg' => $stats->pontos_jogo,
                    'rpg' => $stats->ressaltos_jogo,
                    'apg' => $stats->assistencias_jogo,
                    'spg' => $stats->roubos_jogo,
                    'bpg' => $stats->desarmes_jogo,
                    'fg_pct' => $stats->fg_pct,
                    'mpg' => $stats->minutos_jogo,
                ] : null,
            ];
        })->values();

        $payroll = $roster->sum('salario_anual_usd');

        $news = Noticia::with('categoria')
            ->where('estado', 'publicado')
            ->where(function ($query) use ($team) {
                $query->where('equipa_id', $team->id)
                    ->orWhere('titulo', 'like', '%'.$team->nome.'%')
                    ->orWhere('titulo', 'like', '%'.$team->sigla.'%');
            })
            ->orderBy('publicado_em', 'desc')
            ->take(4)
            ->get();

        return Inertia::render('Team/Show', [
            'team' => $team,
            'roster' => $roster,
            'standing' => $standing,
            'recentGames' => $recentGames,
            'upcomingGames' => $upcomingGames,
            'payroll' => $payroll,
            'news' => $news,
            'seasons' => $seasons,
            'selectedSeasonId' => $selectedSeasonId,
        ]);
    }
}

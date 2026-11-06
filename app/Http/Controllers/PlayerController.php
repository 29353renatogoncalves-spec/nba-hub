<?php

namespace App\Http\Controllers;

use App\Models\Jogador;
use App\Models\Equipa;
use App\Services\EspnSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    /**
     * Exibe a página oficial de detalhes, biografia e estatísticas do jogador.
     */
    public function show($id): Response
    {
        $player = DB::table('jogadores')->where('id', $id)->first();

        if (!$player) {
            abort(404, 'Atleta não encontrado.');
        }

        // Auto-sincronizar histórico oficial com a ESPN se necessário
        if (!Cache::has("player_synced_espn_{$id}")) {
            EspnSyncService::syncPlayerCareerStats($player);
            Cache::put("player_synced_espn_{$id}", true, 3600); // 1 hora de cache
        }

        // 1. Obter a equipa atual e contrato
        $currentContract = DB::table('contratos_jogadores')
            ->join('equipas', 'contratos_jogadores.equipa_id', '=', 'equipas.id')
            ->where('contratos_jogadores.jogador_id', $id)
            ->where('contratos_jogadores.ativo', 1)
            ->select(
                'equipas.id as equipa_id',
                'equipas.nome_completo as equipa_nome',
                'equipas.sigla as equipa_sigla',
                'equipas.logo_url as equipa_logo',
                'equipas.cor_primaria as equipa_cor',
                'equipas.conferencia as equipa_conferencia',
                'equipas.cidade as equipa_cidade',
                'contratos_jogadores.numero_camisola',
                'contratos_jogadores.salario_anual_usd'
            )
            ->first();

        // 2. Histórico Oficial de Estatísticas por Temporada da ESPN
        $seasonStats = DB::table('estatisticas_jogador_epoca')
            ->join('epocas', 'estatisticas_jogador_epoca.epoca_id', '=', 'epocas.id')
            ->leftJoin('equipas', 'estatisticas_jogador_epoca.equipa_id', '=', 'equipas.id')
            ->where('estatisticas_jogador_epoca.jogador_id', $id)
            ->select(
                'epocas.nome as epoca_nome',
                'epocas.data_inicio',
                DB::raw('COALESCE(equipas.sigla, "NBA") as equipa_sigla'),
                DB::raw('COALESCE(equipas.logo_url, "") as equipa_logo'),
                'estatisticas_jogador_epoca.*'
            )
            ->orderBy('epocas.data_inicio', 'desc')
            ->get();

        // 3. Registo dos Últimos Jogos (Game Log)
        $gameLogs = DB::table('jogos_estatisticas_jogadores as jstat')
            ->join('jogos as j', 'jstat.jogo_id', '=', 'j.id')
            ->join('equipas as ec', 'j.equipa_casa_id', '=', 'ec.id')
            ->join('equipas as ef', 'j.equipa_fora_id', '=', 'ef.id')
            ->where('jstat.jogador_id', $id)
            ->select(
                'j.id as jogo_id',
                'j.data_hora',
                'j.pontos_casa',
                'j.pontos_fora',
                'j.estado',
                'ec.id as casa_id',
                'ec.sigla as casa_sigla',
                'ec.logo_url as casa_logo',
                'ef.id as fora_id',
                'ef.sigla as fora_sigla',
                'ef.logo_url as fora_logo',
                'jstat.*'
            )
            ->orderBy('j.data_hora', 'desc')
            ->take(15)
            ->get();

        // Adicionar indicação de adversário e vitória/derrota ao Game Log
        $gameLogs->transform(function ($log) use ($currentContract) {
            $isHome = ($currentContract && $log->equipa_id == $log->casa_id) || ($log->equipa_id == $log->casa_id);
            $myPoints = $isHome ? $log->pontos_casa : $log->pontos_fora;
            $oppPoints = $isHome ? $log->pontos_fora : $log->pontos_casa;

            $log->is_home = $isHome;
            $log->adversario_sigla = $isHome ? $log->fora_sigla : $log->casa_sigla;
            $log->adversario_logo = $isHome ? $log->fora_logo : $log->casa_logo;
            $log->resultado = $myPoints > $oppPoints ? 'V' : ($myPoints < $oppPoints ? 'D' : '-');
            $log->marcador_final = "{$myPoints} - {$oppPoints}";
            $log->data_formatada = date('d M, Y', strtotime($log->data_hora));

            return $log;
        });

        // 4. Médias Atuais (da época mais recente ou calculadas a partir dos jogos)
        $latestSeason = $seasonStats->first();
        if ($latestSeason) {
            $currentAverages = [
                'ppg' => (float) $latestSeason->pontos_jogo,
                'rpg' => (float) $latestSeason->ressaltos_jogo,
                'apg' => (float) $latestSeason->assistencias_jogo,
                'spg' => (float) $latestSeason->roubos_jogo,
                'bpg' => (float) $latestSeason->desarmes_jogo,
                'fg_pct' => (float) $latestSeason->fg_pct,
                'fg3_pct' => (float) $latestSeason->fg3_pct,
                'ft_pct' => (float) $latestSeason->ft_pct,
                'mpg' => (float) $latestSeason->minutos_jogo,
                'jogos' => (int) $latestSeason->jogos_disputados,
                'titular' => (int) $latestSeason->titular,
            ];
        } elseif ($gameLogs->count() > 0) {
            $count = $gameLogs->count();
            $currentAverages = [
                'ppg' => round($gameLogs->avg('pontos'), 1),
                'rpg' => round($gameLogs->avg('ressaltos_totais'), 1),
                'apg' => round($gameLogs->avg('assistencias'), 1),
                'spg' => round($gameLogs->avg('roubos_bola'), 1),
                'bpg' => round($gameLogs->avg('desarmes_lancamento'), 1),
                'fg_pct' => round(($gameLogs->sum('fg_marcados') / max(1, $gameLogs->sum('fg_tentados'))) * 100, 1),
                'fg3_pct' => round(($gameLogs->sum('fg3_marcados') / max(1, $gameLogs->sum('fg3_tentados'))) * 100, 1),
                'ft_pct' => round(($gameLogs->sum('ft_marcados') / max(1, $gameLogs->sum('ft_tentados'))) * 100, 1),
                'mpg' => round($gameLogs->avg('minutos'), 1),
                'jogos' => $count,
                'titular' => $gameLogs->where('titular', 1)->count(),
            ];
        } else {
            $currentAverages = [
                'ppg' => 0.0,
                'rpg' => 0.0,
                'apg' => 0.0,
                'spg' => 0.0,
                'bpg' => 0.0,
                'fg_pct' => 0.0,
                'fg3_pct' => 0.0,
                'ft_pct' => 0.0,
                'mpg' => 0.0,
                'jogos' => 0,
                'titular' => 0,
            ];
        }

        // 5. Cálculo de Idade
        $idade = null;
        if ($player->data_nascimento) {
            $idade = \Carbon\Carbon::parse($player->data_nascimento)->age;
        }

        // 6. Foto oficial de alta definição
        $highResPhoto = $player->foto_url;
        if (str_contains($player->foto_url, '/images/players/')) {
            $highResPhoto = "https://cdn.nba.com/headshots/nba/latest/1040x760/{$player->id}.png";
        }

        return Inertia::render('PlayerShow', [
            'player' => $player,
            'highResPhoto' => $highResPhoto,
            'idade' => $idade,
            'contract' => $currentContract,
            'currentAverages' => $currentAverages,
            'seasonStats' => $seasonStats,
            'gameLogs' => $gameLogs,
        ]);
    }
}

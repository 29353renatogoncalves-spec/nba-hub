<?php

namespace App\Http\Controllers;

use App\Models\Equipa;
use App\Models\Jogador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserFavoritesController extends Controller
{
    /**
     * Atualiza a equipa e os jogadores favoritos do utilizador.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'equipa_id' => 'nullable|integer|exists:equipas,id',
            'jogadores_ids' => 'nullable|array',
            'jogadores_ids.*' => 'integer|exists:jogadores,id',
        ]);

        $user = Auth::user();
        if ($user) {
            $user->equipa_favorita_id = $validated['equipa_id'] ?? null;
            $user->jogadores_favoritos = $validated['jogadores_ids'] ?? [];
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Favoritos atualizados com sucesso!',
            'data' => $this->getFavoritesData($validated['equipa_id'] ?? null, $validated['jogadores_ids'] ?? []),
        ]);
    }

    /**
     * Retorna os dados completos da equipa favorita (próximo jogo, último resultado) e dos jogadores favoritos.
     */
    public function getFavorites(Request $request)
    {
        $user = Auth::user();
        $teamId = $request->query('team_id') ?: ($user ? $user->equipa_favorita_id : null);
        $playerIds = $request->query('player_ids') ? explode(',', $request->query('player_ids')) : ($user && is_array($user->jogadores_favoritos) ? $user->jogadores_favoritos : []);

        return response()->json($this->getFavoritesData($teamId, $playerIds));
    }

    private function getFavoritesData($teamId, $playerIds = [])
    {
        $teamData = null;
        if ($teamId) {
            $team = DB::table('equipas')->where('id', $teamId)->first();
            if ($team) {
                // Classificação atual da equipa
                $standing = DB::table('vw_classificacao_nba')->where('equipa_id', $teamId)->first();

                // Próximo jogo da equipa
                $nextGame = DB::table('jogos')
                    ->join('equipas as ec', 'jogos.equipa_casa_id', '=', 'ec.id')
                    ->join('equipas as ef', 'jogos.equipa_fora_id', '=', 'ef.id')
                    ->join('arenas as a', 'jogos.arena_id', '=', 'a.id')
                    ->where(function ($q) use ($teamId) {
                        $q->where('jogos.equipa_casa_id', $teamId)
                          ->orWhere('jogos.equipa_fora_id', $teamId);
                    })
                    ->where('jogos.estado', 'agendado')
                    ->select(
                        'jogos.*',
                        'ec.nome_completo as casa_nome', 'ec.sigla as casa_sigla', 'ec.logo_url as casa_logo',
                        'ef.nome_completo as fora_nome', 'ef.sigla as fora_sigla', 'ef.logo_url as fora_logo',
                        'a.nome as arena_nome'
                    )
                    ->orderBy('jogos.data_hora', 'asc')
                    ->first();

                // Último jogo terminado da equipa
                $lastGame = DB::table('jogos')
                    ->join('equipas as ec', 'jogos.equipa_casa_id', '=', 'ec.id')
                    ->join('equipas as ef', 'jogos.equipa_fora_id', '=', 'ef.id')
                    ->where(function ($q) use ($teamId) {
                        $q->where('jogos.equipa_casa_id', $teamId)
                          ->orWhere('jogos.equipa_fora_id', $teamId);
                    })
                    ->where('jogos.estado', 'concluido')
                    ->select(
                        'jogos.*',
                        'ec.nome_completo as casa_nome', 'ec.sigla as casa_sigla', 'ec.logo_url as casa_logo',
                        'ef.nome_completo as fora_nome', 'ef.sigla as fora_sigla', 'ef.logo_url as fora_logo'
                    )
                    ->orderBy('jogos.data_hora', 'desc')
                    ->first();

                $teamData = [
                    'info' => $team,
                    'standing' => $standing,
                    'nextGame' => $nextGame,
                    'lastGame' => $lastGame,
                ];
            }
        }

        // Jogadores favoritos
        $playersData = [];
        if (!empty($playerIds)) {
            $playersData = DB::table('jogadores')
                ->join('contratos_jogadores', 'jogadores.id', '=', 'contratos_jogadores.jogador_id')
                ->join('equipas', 'contratos_jogadores.equipa_id', '=', 'equipas.id')
                ->leftJoin('estatisticas_jogador_epoca as est', function ($join) {
                    $join->on('jogadores.id', '=', 'est.jogador_id')
                         ->where('est.epoca_id', '=', 5); // 2026/2027
                })
                ->whereIn('jogadores.id', $playerIds)
                ->where('contratos_jogadores.ativo', 1)
                ->select(
                    'jogadores.id',
                    'jogadores.nome_completo',
                    'jogadores.posicao_primaria',
                    'jogadores.foto_url',
                    'equipas.sigla as equipa_sigla',
                    'equipas.logo_url as equipa_logo',
                    'equipas.cor_primaria as equipa_cor',
                    'contratos_jogadores.numero_camisola',
                    'est.pontos_jogo as ppg',
                    'est.ressaltos_jogo as rpg',
                    'est.assistencias_jogo as apg',
                    'est.fg_pct',
                    'est.fg3_pct'
                )
                ->get();
        }

        return [
            'team' => $teamData,
            'players' => $playersData,
        ];
    }
}

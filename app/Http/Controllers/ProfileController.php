<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Equipa;
use App\Models\Jogador;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Exibe a página oficial de perfil do utilizador.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // 1. Obter todas as equipas para o seletor de franquia favorita
        $teams = DB::table('equipas')
            ->select('id', 'nome_completo', 'sigla', 'logo_url', 'cor_primaria', 'conferencia', 'divisao')
            ->orderBy('nome_completo', 'asc')
            ->get();

        // 2. Detalhes da Equipa Favorita
        $favoriteTeam = null;
        if ($user->equipa_favorita_id) {
            $favoriteTeam = DB::table('equipas')->where('id', $user->equipa_favorita_id)->first();
        }

        // 3. Detalhes dos Jogadores Favoritos
        $favoritePlayers = [];
        $playerIds = is_array($user->jogadores_favoritos) ? $user->jogadores_favoritos : [];
        if (!empty($playerIds)) {
            $favoritePlayers = DB::table('jogadores')
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
                    'contratos_jogadores.numero_camisola',
                    'est.pontos_jogo as ppg',
                    'est.ressaltos_jogo as rpg',
                    'est.assistencias_jogo as apg'
                )
                ->get();
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'teams' => $teams,
            'favoriteTeam' => $favoriteTeam,
            'favoritePlayers' => $favoritePlayers,
            'isGoogleUser' => !empty($user->google_id),
        ]);
    }

    /**
     * Atualiza os dados básicos do perfil e preferências NBA.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->nome = $validated['name'] ?? $user->nome;
        $user->email = $validated['email'] ?? $user->email;

        if ($request->has('equipa_favorita_id')) {
            $user->equipa_favorita_id = $request->input('equipa_favorita_id') ?: null;
        }

        if ($request->has('avatar_url')) {
            $user->avatar_url = $request->input('avatar_url') ?: $user->avatar_url;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'Perfil atualizado com sucesso!');
    }

    /**
     * Atualiza a palavra-passe do utilizador.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->senha = Hash::make($validated['password']);
        $user->save();

        return Redirect::route('profile.edit')->with('status', 'Palavra-passe alterada com sucesso!');
    }

    /**
     * Elimina a conta do utilizador.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

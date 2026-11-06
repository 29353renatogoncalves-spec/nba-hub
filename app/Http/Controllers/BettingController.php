<?php

namespace App\Http\Controllers;

use App\Models\Aposta;
use App\Models\Jogo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BettingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $guestBalance = (int) $request->session()->get('guest_saldo_moedas', 1000);
        $balance = $user ? (int) $user->saldo_moedas : $guestBalance;

        // Buscar jogos para o mercado de apostas: Ao Vivo primeiro, Agendados (mais próximos primeiro) e Recentes Concluídos (05/11, 03/11, etc.)
        $games = Jogo::with(['equipaCasa', 'equipaFora'])
            ->where(function ($query) {
                $query->whereIn('estado', ['em_direto', 'intervalo', 'agendado'])
                    ->orWhere(function ($q) {
                        $q->where('estado', 'concluido')
                          ->where('data_hora', '>=', now()->subDays(7));
                    });
            })
            ->orderByRaw("
                CASE 
                    WHEN estado = 'em_direto' THEN 1
                    WHEN estado = 'intervalo' THEN 2
                    WHEN estado = 'agendado' THEN 3
                    ELSE 4
                END,
                CASE 
                    WHEN estado = 'agendado' THEN data_hora
                    ELSE NULL
                END ASC,
                data_hora DESC
            ")
            ->take(80)
            ->get()
            ->map(function ($g) {
                // Gerar odds dinâmicas e realistas baseadas na pontuação ou sigla
                $seed = (int) $g->id * 17;
                $homeWinFactor = (hexdec(substr(md5($g->equipaCasa->sigla), 0, 2)) % 40) - 20;
                
                $baseHomeOdd = 1.90 - ($homeWinFactor * 0.02);
                $homeOdd = max(1.30, min(3.40, round($baseHomeOdd, 2)));
                $awayOdd = max(1.30, min(3.40, round(3.80 / $homeOdd, 2)));

                $spread = ($homeOdd < $awayOdd) ? -5.5 : 5.5;
                $spreadOdd = 1.90;

                $totalPointsLine = 224.5;
                $overUnderOdd = 1.88;

                return [
                    'id' => $g->id,
                    'espn_id' => $g->espn_id,
                    'estado' => $g->estado, // agendado, em_direto, concluido
                    'data_hora' => $g->data_hora,
                    'periodo_atual' => $g->periodo_atual,
                    'tempo_restante' => $g->tempo_restante,
                    'pontos_casa' => $g->pontos_casa,
                    'pontos_fora' => $g->pontos_fora,
                    'equipa_casa' => [
                        'id' => $g->equipaCasa->id,
                        'nome' => $g->equipaCasa->nome,
                        'nome_completo' => $g->equipaCasa->nome_completo,
                        'sigla' => $g->equipaCasa->sigla,
                        'logo_url' => $g->equipaCasa->logo_url,
                        'cor_primaria' => $g->equipaCasa->cor_primaria,
                    ],
                    'equipa_fora' => [
                        'id' => $g->equipaFora->id,
                        'nome' => $g->equipaFora->nome,
                        'nome_completo' => $g->equipaFora->nome_completo,
                        'sigla' => $g->equipaFora->sigla,
                        'logo_url' => $g->equipaFora->logo_url,
                        'cor_primaria' => $g->equipaFora->cor_primaria,
                    ],
                    'odds' => [
                        'home_win' => $homeOdd,
                        'away_win' => $awayOdd,
                        'spread_line' => $spread,
                        'spread_home_odd' => $spreadOdd,
                        'spread_away_odd' => $spreadOdd,
                        'total_line' => $totalPointsLine,
                        'over_odd' => $overUnderOdd,
                        'under_odd' => $overUnderOdd,
                    ],
                ];
            });

        // Buscar histórico de apostas e resolver as que terminaram (para utilizadores e convidados)
        $this->resolvePendingBets($user, $request);

        if ($user) {
            $userBets = Aposta::where('user_id', $user->id)
                ->orderBy('criado_em', 'desc')
                ->take(30)
                ->get();
            $balance = (int) $user->fresh()->saldo_moedas;
        } else {
            $userBets = Aposta::whereNull('user_id')
                ->orderBy('criado_em', 'desc')
                ->take(30)
                ->get();

            // Saldo dinâmico do convidado incluindo ganhos de apostas
            $guestWins = Aposta::whereNull('user_id')->where('estado', 'ganha')->sum('ganho_potencial');
            $guestLosses = Aposta::whereNull('user_id')->sum('valor_apostado');
            $calculatedGuestBalance = max(100, 1000 - $guestLosses + $guestWins);
            $sessionBalance = (int) $request->session()->get('guest_saldo_moedas', 1000);
            $balance = max($sessionBalance, $calculatedGuestBalance);
            $request->session()->put('guest_saldo_moedas', $balance);
        }

        // Tabela de Classificação dos Melhores Apostadores
        $leaderboard = User::where('ativo', 1)
            ->orderBy('saldo_moedas', 'desc')
            ->take(8)
            ->get(['id', 'nome', 'email', 'avatar_url', 'saldo_moedas']);

        return Inertia::render('Betting', [
            'games' => $games,
            'balance' => $balance,
            'userBets' => $userBets,
            'leaderboard' => $leaderboard,
        ]);
    }

    /**
     * Submete uma aposta simples ou múltipla.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $guestBalance = (int) $request->session()->get('guest_saldo_moedas', 1000);
        $currentBalance = $user ? (int) $user->saldo_moedas : $guestBalance;

        $validated = $request->validate([
            'tipo' => 'required|in:simples,multipla',
            'valor_apostado' => 'required|integer|min:10',
            'odd_total' => 'required|numeric|min:1.01',
            'ganho_potencial' => 'required|integer|min:10',
            'selecoes' => 'required|array|min:1',
            'selecoes.*.game_id' => 'required|integer',
            'selecoes.*.match_title' => 'required|string',
            'selecoes.*.market_type' => 'required|string', // moneyline, spread, totals
            'selecoes.*.selection_label' => 'required|string',
            'selecoes.*.odd' => 'required|numeric',
        ]);

        $amount = (int) $validated['valor_apostado'];
        if ($currentBalance < $amount) {
            return response()->json([
                'success' => false,
                'message' => "Saldo insuficiente de NBA Coins. Tens {$currentBalance} moedas disponíveis.",
            ], 422);
        }

        if ($user) {
            $user->decrement('saldo_moedas', $amount);
            $newBalance = (int) $user->fresh()->saldo_moedas;
        } else {
            $newBalance = max(0, $guestBalance - $amount);
            $request->session()->put('guest_saldo_moedas', $newBalance);
        }

        // Criar aposta no banco de dados
        $bet = Aposta::create([
            'user_id' => $user ? $user->id : null,
            'tipo' => $validated['tipo'],
            'valor_apostado' => $amount,
            'odd_total' => $validated['odd_total'],
            'ganho_potencial' => (int) $validated['ganho_potencial'],
            'estado' => 'pendente',
            'selecoes' => $validated['selecoes'],
            'criado_em' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aposta submetida com sucesso! Boa sorte!',
            'new_balance' => $newBalance,
            'bet' => $bet,
        ]);
    }

    /**
     * Resgate do bónus diário de +250 NBA Coins.
     */
    public function claimDailyBonus(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->increment('saldo_moedas', 250);
            $user->update(['ultimo_bonus_recolhido' => now()]);
            $newBalance = (int) $user->fresh()->saldo_moedas;
        } else {
            $guestBalance = (int) $request->session()->get('guest_saldo_moedas', 1000) + 250;
            $request->session()->put('guest_saldo_moedas', $guestBalance);
            $newBalance = $guestBalance;
        }

        return response()->json([
            'success' => true,
            'message' => 'Parabéns! Recebeste +250 NBA Coins de bónus diário!',
            'new_balance' => $newBalance,
        ]);
    }

    /**
     * Recarga de emergência para quem ficou sem moedas (+500 NBA Coins).
     */
    public function resetBonus(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->update(['saldo_moedas' => 500]);
        } else {
            $request->session()->put('guest_saldo_moedas', 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Banca recarregada com sucesso! +500 NBA Coins para continuares no jogo!',
            'new_balance' => 500,
        ]);
    }

    /**
     * Endpoint para verificar e resolver apostas manualmente a pedido do utilizador.
     */
    public function resolveBetsManually(Request $request)
    {
        $user = Auth::user();
        $wonCoins = $this->resolvePendingBets($user, $request);

        if ($user) {
            $balance = (int) $user->fresh()->saldo_moedas;
            $userBets = Aposta::where('user_id', $user->id)->orderBy('criado_em', 'desc')->take(30)->get();
        } else {
            $guestWins = Aposta::whereNull('user_id')->where('estado', 'ganha')->sum('ganho_potencial');
            $guestLosses = Aposta::whereNull('user_id')->sum('valor_apostado');
            $calculatedGuestBalance = max(100, 1000 - $guestLosses + $guestWins);
            $sessionBalance = (int) $request->session()->get('guest_saldo_moedas', 1000);
            $balance = max($sessionBalance, $calculatedGuestBalance);
            $request->session()->put('guest_saldo_moedas', $balance);

            $userBets = Aposta::whereNull('user_id')->orderBy('criado_em', 'desc')->take(30)->get();
        }

        return response()->json([
            'success' => true,
            'message' => $wonCoins > 0 ? "🎉 Parabéns! As tuas apostas foram avaliadas e ganhaste +{$wonCoins} NBA Coins!" : "Todas as apostas foram verificadas com os resultados mais recentes.",
            'won_amount' => $wonCoins,
            'new_balance' => $balance,
            'bets' => $userBets,
        ]);
    }

    /**
     * Avalia e resolve apostas pendentes quando os jogos associados estão concluídos.
     */
    private function resolvePendingBets(?User $user, Request $request = null): int
    {
        $query = Aposta::where('estado', 'pendente');
        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->whereNull('user_id');
        }

        $pendingBets = $query->get();
        $totalWonCoins = 0;

        foreach ($pendingBets as $bet) {
            $allResolved = true;
            $allWon = true;

            $updatedSelections = [];
            $selections = is_array($bet->selecoes) ? $bet->selecoes : json_decode($bet->selecoes, true);

            foreach ($selections as $sel) {
                $game = Jogo::find($sel['game_id'] ?? null);

                // Fallback para encontrar o jogo por siglas caso o ID esteja desatualizado
                if (!$game && !empty($sel['match_title'])) {
                    $parts = preg_split('/\s+(vs|@)\s+/i', $sel['match_title']);
                    if (count($parts) === 2) {
                        $t1 = trim($parts[0]);
                        $t2 = trim($parts[1]);
                        $game = Jogo::where(function($q) use ($t1, $t2) {
                            $q->whereHas('equipaCasa', fn($sq) => $sq->where('sigla', $t1)->orWhere('nome_completo', 'like', "%{$t1}%"))
                              ->whereHas('equipaFora', fn($sq) => $sq->where('sigla', $t2)->orWhere('nome_completo', 'like', "%{$t2}%"));
                        })->orWhere(function($q) use ($t1, $t2) {
                            $q->whereHas('equipaCasa', fn($sq) => $sq->where('sigla', $t2)->orWhere('nome_completo', 'like', "%{$t2}%"))
                              ->whereHas('equipaFora', fn($sq) => $sq->where('sigla', $t1)->orWhere('nome_completo', 'like', "%{$t1}%"));
                        })->latest('data_hora')->first();
                    }
                }

                if (!$game || $game->estado !== 'concluido') {
                    $allResolved = false;
                    $updatedSelections[] = array_merge($sel, ['status' => 'em_aberto']);
                    continue;
                }

                $market = $sel['market_type'];
                $label = $sel['selection_label'];
                $won = false;

                $ptsCasa = (int) $game->pontos_casa;
                $ptsFora = (int) $game->pontos_fora;

                if ($market === 'moneyline') {
                    if (str_contains($label, $game->equipaCasa->sigla) && $ptsCasa > $ptsFora) $won = true;
                    if (str_contains($label, $game->equipaFora->sigla) && $ptsFora > $ptsCasa) $won = true;
                } elseif ($market === 'totals') {
                    $total = $ptsCasa + $ptsFora;
                    if (str_contains($label, 'Mais') && $total > 224.5) $won = true;
                    if (str_contains($label, 'Menos') && $total < 224.5) $won = true;
                } elseif ($market === 'spread') {
                    $diff = $ptsCasa - $ptsFora;
                    if (str_contains($label, $game->equipaCasa->sigla) && ($diff - 5.5) > 0) $won = true;
                    if (str_contains($label, $game->equipaFora->sigla) && ($diff - 5.5) < 0) $won = true;
                }

                if (!$won) $allWon = false;
                $updatedSelections[] = array_merge($sel, ['status' => $won ? 'ganha' : 'perdida']);
            }

            if ($allResolved) {
                if ($allWon) {
                    $bet->update([
                        'estado' => 'ganha',
                        'selecoes' => $updatedSelections,
                        'resolvido_em' => now(),
                    ]);
                    $totalWonCoins += (int) $bet->ganho_potencial;
                    if ($user) {
                        $user->increment('saldo_moedas', $bet->ganho_potencial);
                    }
                } else {
                    $bet->update([
                        'estado' => 'perdida',
                        'selecoes' => $updatedSelections,
                        'resolvido_em' => now(),
                    ]);
                }
            }
        }

        if (!$user && $request && $totalWonCoins > 0) {
            $cur = (int) $request->session()->get('guest_saldo_moedas', 1000);
            $request->session()->put('guest_saldo_moedas', $cur + $totalWonCoins);
        }

        return $totalWonCoins;
    }
}

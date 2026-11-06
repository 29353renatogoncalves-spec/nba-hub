import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { Coins, Flame, Trophy, CheckCircle2, XCircle, Clock, Trash2, ArrowRight, Sparkles, TrendingUp, DollarSign, Plus, RotateCcw, AlertCircle, Calendar, Search, Filter } from 'lucide-react';

export default function Betting({
    auth,
    games = [],
    balance = 1000,
    userBets = [],
    leaderboard = [],
}) {
    const [currentBalance, setCurrentBalance] = useState(() => {
        if (auth?.user) return balance;
        const local = typeof window !== 'undefined' && localStorage.getItem('nba_guest_balance') !== null
            ? Number(localStorage.getItem('nba_guest_balance'))
            : null;
        if (local !== null && balance > local) {
            localStorage.setItem('nba_guest_balance', String(balance));
            return balance;
        }
        return local !== null ? local : balance;
    });

    const [allBets, setAllBets] = useState(() => {
        const local = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('nba_local_bets') || '[]') : [];
        const map = new Map();
        local.forEach((lb) => map.set(String(lb.id), lb));
        userBets.forEach((ub) => map.set(String(ub.id), ub));
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));
        if (typeof window !== 'undefined') {
            localStorage.setItem('nba_local_bets', JSON.stringify(merged));
        }
        return merged;
    });

    useEffect(() => {
        if (userBets && userBets.length > 0) {
            setAllBets((prev) => {
                const map = new Map();
                prev.forEach((b) => map.set(String(b.id), b));
                userBets.forEach((ub) => map.set(String(ub.id), ub));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));
                if (typeof window !== 'undefined') {
                    localStorage.setItem('nba_local_bets', JSON.stringify(merged));
                }
                return merged;
            });
        }
    }, [userBets]);

    useEffect(() => {
        if (balance !== undefined && balance !== null) {
            setCurrentBalance((prev) => {
                if (balance > prev) {
                    if (!auth?.user && typeof window !== 'undefined') {
                        localStorage.setItem('nba_guest_balance', String(balance));
                    }
                    return balance;
                }
                return prev;
            });
        }
    }, [balance]);

    const [activeTab, setActiveTab] = useState('mercados'); // 'mercados' | 'apostas' | 'ranking'
    const [selectedDateFilter, setSelectedDateFilter] = useState('todos'); // 'todos' | 'agendados' | 'YYYY-MM-DD'
    const [searchQuery, setSearchQuery] = useState('');
    const [betSlipOpen, setBetSlipOpen] = useState(false);
    const [selectedOdds, setSelectedOdds] = useState([]); // [{ game_id, match_title, market_type, selection_label, odd }]
    const [betType, setBetType] = useState('multipla'); // 'simples' | 'multipla'
    const [stake, setStake] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Formatar data do jogo
    const formatGameDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month} • ${hours}:${mins}`;
    };

    // Agrupar datas disponíveis dos jogos
    const availableDates = useMemo(() => {
        const counts = {};
        games.forEach((g) => {
            const d = g.data_hora ? g.data_hora.substring(0, 10) : '';
            if (d) {
                counts[d] = (counts[d] || 0) + 1;
            }
        });
        return Object.entries(counts).sort((a, b) => b[0].localeCompare(a[0]));
    }, [games]);

    const scheduledCount = useMemo(() => {
        return games.filter((g) => g.estado === 'agendado').length;
    }, [games]);

    // Filtrar jogos conforme data selecionada e pesquisa de equipa
    const filteredGames = useMemo(() => {
        return games.filter((g) => {
            const d = g.data_hora ? g.data_hora.substring(0, 10) : '';

            if (selectedDateFilter === 'agendados') {
                if (g.estado !== 'agendado') return false;
            } else if (selectedDateFilter !== 'todos' && d !== selectedDateFilter) {
                return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const home = ((g.equipa_casa?.nome_completo || '') + ' ' + (g.equipa_casa?.sigla || '')).toLowerCase();
                const away = ((g.equipa_fora?.nome_completo || '') + ' ' + (g.equipa_fora?.sigla || '')).toLowerCase();
                if (!home.includes(q) && !away.includes(q)) {
                    return false;
                }
            }

            return true;
        });
    }, [games, selectedDateFilter, searchQuery]);

    // Salvar saldo de convidado localmente se deslogado
    const updateBalance = (newBal) => {
        setCurrentBalance(newBal);
        if (!auth?.user && typeof window !== 'undefined') {
            localStorage.setItem('nba_guest_balance', String(newBal));
        }
    };

    // Calcular Odd Total
    const totalOdd = selectedOdds.length > 0
        ? (betType === 'multipla'
            ? Math.round(selectedOdds.reduce((acc, curr) => acc * curr.odd, 1) * 100) / 100
            : selectedOdds[0]?.odd || 1)
        : 1;

    const potentialPayout = Math.round(stake * totalOdd);

    // Alternar seleção de odd
    const toggleOdd = (game, marketType, selectionLabel, odd) => {
        const matchTitle = `${game.equipa_casa.sigla} vs ${game.equipa_fora.sigla}`;
        const key = `${game.id}_${marketType}_${selectionLabel}`;

        const exists = selectedOdds.find((s) => s.key === key);

        if (exists) {
            setSelectedOdds(selectedOdds.filter((s) => s.key !== key));
        } else {
            const filtered = selectedOdds.filter((s) => !(s.game_id === game.id && s.market_type === marketType));
            setSelectedOdds([...filtered, {
                key,
                game_id: game.id,
                match_title: matchTitle,
                market_type: marketType,
                selection_label: selectionLabel,
                odd: Number(odd),
            }]);
            setBetSlipOpen(true);
        }
    };

    const isSelected = (gameId, marketType, selectionLabel) => {
        const key = `${gameId}_${marketType}_${selectionLabel}`;
        return selectedOdds.some((s) => s.key === key);
    };

    const removeOdd = (key) => {
        setSelectedOdds(selectedOdds.filter((s) => s.key !== key));
    };

    const clearBetSlip = () => {
        setSelectedOdds([]);
    };

    // Submeter aposta
    const handlePlaceBet = async () => {
        if (stake > currentBalance) {
            setNotification({ type: 'error', text: 'Saldo insuficiente de NBA Coins para esta aposta.' });
            return;
        }

        if (stake < 10) {
            setNotification({ type: 'error', text: 'A aposta mínima é de 10 NBA Coins.' });
            return;
        }

        if (selectedOdds.length === 0) return;

        setIsSubmitting(true);
        setNotification(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const betPayload = {
            tipo: selectedOdds.length > 1 ? betType : 'simples',
            valor_apostado: stake,
            odd_total: totalOdd,
            ganho_potencial: potentialPayout,
            selecoes: selectedOdds,
        };

        try {
            const resp = await fetch('/api/apostas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(betPayload),
            });

            const data = await resp.json();

            if (data.success) {
                const newBet = data.bet || {
                    id: Date.now(),
                    ...betPayload,
                    estado: 'pendente',
                    criado_em: new Date().toISOString(),
                };

                updateBalance(data.new_balance);
                setSelectedOdds([]);
                setAllBets((prev) => [newBet, ...prev]);

                try {
                    const saved = JSON.parse(localStorage.getItem('nba_local_bets') || '[]');
                    localStorage.setItem('nba_local_bets', JSON.stringify([newBet, ...saved]));
                } catch (e) {}

                setNotification({ type: 'success', text: '✅ Aposta registada e guardada com sucesso no teu histórico!' });
                setBetSlipOpen(false);
                setActiveTab('apostas');
            } else {
                setNotification({ type: 'error', text: data.message || 'Erro ao submeter aposta.' });
            }
        } catch (err) {
            // Fallback imediato: salva no estado e no localStorage
            const fallbackBet = {
                id: Date.now(),
                ...betPayload,
                estado: 'pendente',
                criado_em: new Date().toISOString(),
            };
            const nextBal = Math.max(0, currentBalance - stake);
            updateBalance(nextBal);
            setSelectedOdds([]);
            setAllBets((prev) => [fallbackBet, ...prev]);

            try {
                const saved = JSON.parse(localStorage.getItem('nba_local_bets') || '[]');
                localStorage.setItem('nba_local_bets', JSON.stringify([fallbackBet, ...saved]));
            } catch (e) {}

            setNotification({ type: 'success', text: '✅ Aposta registada e guardada com sucesso no teu histórico!' });
            setBetSlipOpen(false);
            setActiveTab('apostas');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resgatar Bónus Diário
    const handleClaimBonus = async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const resp = await fetch('/api/apostas/bonus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await resp.json();
            if (data.success) {
                updateBalance(data.new_balance);
                setNotification({ type: 'success', text: data.message });
            }
        } catch (err) {
            const nextBal = currentBalance + 250;
            updateBalance(nextBal);
            setNotification({ type: 'success', text: 'Parabéns! Recebeste +250 NBA Coins de bónus diário!' });
        }
    };

    // Recarregar Banca
    const handleResetBalance = async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const resp = await fetch('/api/apostas/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await resp.json();
            if (data.success) {
                updateBalance(data.new_balance);
                setNotification({ type: 'success', text: data.message });
            }
        } catch (err) {
            updateBalance(500);
            setNotification({ type: 'success', text: 'Banca recarregada com sucesso! +500 NBA Coins!' });
        }
    };

    // Verificar e resolver apostas pendentes
    const handleResolveBets = async () => {
        setIsSubmitting(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const resp = await fetch('/api/apostas/resolver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await resp.json();
            if (data.success) {
                if (data.new_balance !== undefined) {
                    updateBalance(data.new_balance);
                }
                if (data.bets && data.bets.length > 0) {
                    setAllBets(data.bets);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('nba_local_bets', JSON.stringify(data.bets));
                    }
                }
                setNotification({ type: 'success', text: data.message });
            }
        } catch (err) {
            setNotification({ type: 'error', text: 'Erro ao verificar os resultados das apostas.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
            <Head title="Casa de Apostas NBA - Apostas Virtuais com NBA Coins" />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header da Casa de Apostas & Saldo de Moedas */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
                    {/* Luzes decorativas douradas */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                                <Coins className="w-3.5 h-3.5 animate-bounce" />
                                <span>NBA Sportsbook Virtual • 100% Gratuito</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                Casa de Apostas da NBA
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                                Dá os teus palpites em jogos da NBA com odds reais, aposta em direto ou pré-jogo e multiplica as tuas moedas virtuais.
                            </p>
                        </div>

                        {/* Card da Carteira de Moedas do Utilizador */}
                        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex items-center space-x-5 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                <Coins className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                                    O Teu Saldo
                                </span>
                                <div className="text-2xl font-black font-mono text-amber-400 flex items-center space-x-1">
                                    <span>{currentBalance.toLocaleString()}</span>
                                    <span className="text-xs text-amber-300 font-sans font-bold">COINS</span>
                                </div>
                            </div>

                            <div className="border-l border-slate-800 pl-4 space-y-1.5">
                                <button
                                    onClick={handleClaimBonus}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider transition block w-full text-center"
                                >
                                    +250 Bónus Diário
                                </button>
                                {currentBalance === 0 && (
                                    <button
                                        onClick={handleResetBalance}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider transition block w-full text-center"
                                    >
                                        Recarregar +500
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notificações Flutuantes */}
                {notification && (
                    <div
                        className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                            notification.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                    >
                        <span>{notification.text}</span>
                        <button onClick={() => setNotification(null)} className="p-1">
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Abas de Navegação do Sportsbook */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                    <button
                        onClick={() => setActiveTab('mercados')}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition ${
                            activeTab === 'mercados'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Flame className="w-4 h-4" />
                        <span>Jogos &amp; Mercados ({filteredGames.length !== games.length ? `${filteredGames.length} de ${games.length}` : games.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('apostas')}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition ${
                            activeTab === 'apostas'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Minhas Apostas ({allBets.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition ${
                            activeTab === 'ranking'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        <span>Ranking dos Apostadores</span>
                    </button>
                </div>

                {/* ABA 1: MERCADOS DE JOGOS & ODDS */}
                {activeTab === 'mercados' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Lista dos Jogos e Mercados */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Barra de Filtros de Datas e Pesquisa de Equipas */}
                            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center space-x-2 text-xs font-black uppercase text-amber-400 tracking-wider">
                                        <Filter className="w-4 h-4" />
                                        <span>Filtrar Jogos Recentes e Próximos</span>
                                    </div>

                                    {/* Busca de equipas */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar equipa (ex: MIN, LAL, Celtics)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* Chips de Filtro por Data */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                                    <button
                                        onClick={() => setSelectedDateFilter('todos')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                            selectedDateFilter === 'todos'
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                    >
                                        Todos ({games.length})
                                    </button>

                                    {scheduledCount > 0 && (
                                        <button
                                            onClick={() => setSelectedDateFilter('agendados')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                                selectedDateFilter === 'agendados'
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                            }`}
                                        >
                                            Agendados ({scheduledCount})
                                        </button>
                                    )}

                                    {availableDates.map(([dateStr, count]) => {
                                        const d = new Date(dateStr + 'T12:00:00');
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const label = `${day}/${month}`;
                                        const isToday = dateStr === '2026-11-05';
                                        const isNov3 = dateStr === '2026-11-03';

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedDateFilter(dateStr)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center space-x-1.5 ${
                                                    selectedDateFilter === dateStr
                                                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                                }`}
                                            >
                                                <span>{label}</span>
                                                {isNov3 && <span className="text-[10px] opacity-75 font-bold">(03 Nov)</span>}
                                                {isToday && <span className="text-[10px] opacity-75 font-bold">(Hoje)</span>}
                                                <span className="text-[11px] opacity-80">({count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mensagem se nenhum jogo corresponder ao filtro */}
                            {filteredGames.length === 0 && (
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                                    <AlertCircle className="w-10 h-10 mx-auto text-amber-500/60 mb-3" />
                                    <p className="font-bold">Nenhum jogo encontrado para os filtros selecionados.</p>
                                    <button
                                        onClick={() => { setSelectedDateFilter('todos'); setSearchQuery(''); }}
                                        className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                                    >
                                        Limpar Filtros e Ver Todos
                                    </button>
                                </div>
                            )}

                            {filteredGames.map((g) => {
                                const isLive = g.estado === 'em_direto';
                                const isFinished = g.estado === 'concluido';

                                return (
                                    <div
                                        key={g.id}
                                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition"
                                    >
                                        {/* Cabeçalho do Card */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Data e Hora Formatada com Ícone de Calendário */}
                                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                    <span>{formatGameDate(g.data_hora)}</span>
                                                </span>

                                                {isLive && (
                                                    <span className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-400 font-black uppercase text-[10px] animate-pulse border border-red-500/30">
                                                        EM DIRETO • {g.periodo_atual}
                                                    </span>
                                                )}
                                                {isFinished && (
                                                    <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px] border border-slate-700/60">
                                                        CONCLUÍDO
                                                    </span>
                                                )}
                                                {!isLive && !isFinished && (
                                                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-400 font-bold uppercase text-[10px] border border-blue-500/30">
                                                        AGENDADO
                                                    </span>
                                                )}
                                            </div>

                                            <Link
                                                href={`/jogos/${g.id}`}
                                                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1"
                                            >
                                                <span>Box Score &amp; Replay</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>

                                        {/* Equipas & Placar */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 items-center">
                                            {/* Equipa da Casa */}
                                            <div className="flex items-center space-x-3">
                                                <img src={g.equipa_casa.logo_url} className="w-9 h-9 object-contain" />
                                                <div>
                                                    <h3 className="text-sm font-black text-white">{g.equipa_casa.nome_completo}</h3>
                                                    <span className="text-[10px] text-slate-400 font-bold">CASA ({g.equipa_casa.sigla})</span>
                                                </div>
                                                {(isLive || isFinished) && (
                                                    <span className="text-xl font-black font-mono text-white ml-auto">
                                                        {g.pontos_casa}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Equipa Visitante */}
                                            <div className="flex items-center space-x-3">
                                                <img src={g.equipa_fora.logo_url} className="w-9 h-9 object-contain" />
                                                <div>
                                                    <h3 className="text-sm font-black text-white">{g.equipa_fora.nome_completo}</h3>
                                                    <span className="text-[10px] text-slate-400 font-bold">FORA ({g.equipa_fora.sigla})</span>
                                                </div>
                                                {(isLive || isFinished) && (
                                                    <span className="text-xl font-black font-mono text-white ml-auto">
                                                        {g.pontos_fora}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botões de Odds / Mercados de Aposta */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
                                            {/* Moneyline Casa */}
                                            <button
                                                onClick={() => toggleOdd(g, 'moneyline', `${g.equipa_casa.sigla} Vence`, g.odds.home_win)}
                                                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                                                    isSelected(g.id, 'moneyline', `${g.equipa_casa.sigla} Vence`)
                                                        ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                                                        : 'bg-slate-950/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <span className="text-[11px] font-bold truncate">1 ({g.equipa_casa.sigla})</span>
                                                <span className="font-mono font-black text-xs ml-2 text-amber-300">{g.odds.home_win}</span>
                                            </button>

                                            {/* Moneyline Fora */}
                                            <button
                                                onClick={() => toggleOdd(g, 'moneyline', `${g.equipa_fora.sigla} Vence`, g.odds.away_win)}
                                                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                                                    isSelected(g.id, 'moneyline', `${g.equipa_fora.sigla} Vence`)
                                                        ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                                                        : 'bg-slate-950/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <span className="text-[11px] font-bold truncate">2 ({g.equipa_fora.sigla})</span>
                                                <span className="font-mono font-black text-xs ml-2 text-amber-300">{g.odds.away_win}</span>
                                            </button>

                                            {/* Over de Pontos */}
                                            <button
                                                onClick={() => toggleOdd(g, 'totals', `Mais de ${g.odds.total_line} pts`, g.odds.over_odd)}
                                                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                                                    isSelected(g.id, 'totals', `Mais de ${g.odds.total_line} pts`)
                                                        ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                                                        : 'bg-slate-950/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <span className="text-[11px] font-bold truncate">&gt; {g.odds.total_line}</span>
                                                <span className="font-mono font-black text-xs ml-2 text-emerald-400">{g.odds.over_odd}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Painel Lateral do Boletim de Apostas (Desktop Bet Slip) */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center space-x-2">
                                        <Coins className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-black uppercase text-white">Boletim de Apostas</h3>
                                    </div>
                                    {selectedOdds.length > 0 && (
                                        <button
                                            onClick={clearBetSlip}
                                            className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                                        >
                                            Limpar ({selectedOdds.length})
                                        </button>
                                    )}
                                </div>

                                {selectedOdds.length === 0 ? (
                                    <div className="py-12 text-center text-slate-500 text-xs">
                                        <Coins className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                                        <p className="font-bold text-slate-400">O teu boletim está vazio.</p>
                                        <p className="text-[11px] mt-1 text-slate-500">Clica em qualquer cotação dos jogos para adicionares a tua aposta.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 my-4">
                                        {/* Alternador de Tipo de Aposta */}
                                        {selectedOdds.length > 1 && (
                                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                                                <button
                                                    onClick={() => setBetType('multipla')}
                                                    className={`flex-1 py-1.5 rounded-lg transition ${
                                                        betType === 'multipla' ? 'bg-amber-600 text-white' : 'text-slate-400'
                                                    }`}
                                                >
                                                    Múltipla (Parlay)
                                                </button>
                                                <button
                                                    onClick={() => setBetType('simples')}
                                                    className={`flex-1 py-1.5 rounded-lg transition ${
                                                        betType === 'simples' ? 'bg-amber-600 text-white' : 'text-slate-400'
                                                    }`}
                                                >
                                                    Simples
                                                </button>
                                            </div>
                                        )}

                                        {/* Lista de Seleções */}
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {selectedOdds.map((sel) => (
                                                <div
                                                    key={sel.key}
                                                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[10px] text-slate-500 block truncate">{sel.match_title}</span>
                                                        <span className="font-black text-white truncate block">{sel.selection_label}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-2">
                                                        <span className="font-mono font-black text-amber-400 text-sm">@{sel.odd}</span>
                                                        <button
                                                            onClick={() => removeOdd(sel.key)}
                                                            className="text-slate-500 hover:text-red-400 p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Configuração do Valor da Aposta */}
                                        <div className="pt-2 border-t border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <label className="font-bold text-slate-300">Montante da Aposta:</label>
                                                <span className="text-slate-500 text-[10px]">Mín: 10 Coins</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="10"
                                                max={currentBalance}
                                                value={stake}
                                                onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-black text-amber-400 focus:outline-none focus:border-amber-500"
                                            />

                                            {/* Atalhos Rápidos de Aposta */}
                                            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                                                {[50, 100, 250, currentBalance].map((val, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setStake(val)}
                                                        className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                    >
                                                        {idx === 3 ? 'ALL-IN' : `+${val}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Resumo Financeiro */}
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1 text-xs">
                                            <div className="flex justify-between text-slate-300">
                                                <span>Cotação Total:</span>
                                                <strong className="font-mono text-amber-400">@{totalOdd}</strong>
                                            </div>
                                            <div className="flex justify-between text-white font-bold">
                                                <span>Ganhos Potenciais:</span>
                                                <strong className="font-mono text-emerald-400 text-sm">+{potentialPayout} Coins</strong>
                                            </div>
                                        </div>

                                        {/* Botão de Submeter Aposta */}
                                        <button
                                            onClick={handlePlaceBet}
                                            disabled={isSubmitting || stake > currentBalance || stake <= 0}
                                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/40 transition transform active:scale-98 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'A registar aposta...' : `Apostar ${stake} NBA Coins 🎯`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: MINHAS APOSTAS & HISTÓRICO */}
                {activeTab === 'apostas' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <span>Histórico de Apostas Registadas ({allBets.length})</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Acompanha o estado das tuas apostas e clica para atualizar os resultados dos jogos terminados.
                                </p>
                            </div>

                            <button
                                onClick={handleResolveBets}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-black flex items-center space-x-2 transition shadow-lg disabled:opacity-50"
                            >
                                <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                                <span>{isSubmitting ? 'A verificar...' : 'Verificar & Resolver Apostas 🔄'}</span>
                            </button>
                        </div>

                        {allBets.length === 0 ? (
                            <div className="py-16 text-center text-slate-500 text-sm">
                                <Coins className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-50" />
                                <p className="font-bold text-white">Ainda não tens apostas registadas.</p>
                                <p className="text-xs text-slate-400 mt-1">Explora a aba "Jogos &amp; Mercados" para fazeres a tua primeira aposta.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allBets.map((b) => {
                                    const selecoes = Array.isArray(b.selecoes)
                                        ? b.selecoes
                                        : (typeof b.selecoes === 'string' ? JSON.parse(b.selecoes || '[]') : []);

                                    const isWon = b.estado === 'ganha';
                                    const isLost = b.estado === 'perdida';

                                    return (
                                        <div
                                            key={b.id}
                                            className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                                                isWon
                                                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                                                    : isLost
                                                    ? 'bg-red-950/10 border-red-500/30'
                                                    : 'bg-slate-950 border-slate-800'
                                            }`}
                                        >
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                            isWon
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                : isLost
                                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        }`}
                                                    >
                                                        {isWon ? '✅ Ganha' : isLost ? '❌ Perdida' : '⏳ Em Aberto'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        #{b.id} • {b.criado_em ? new Date(b.criado_em).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Agora'}
                                                    </span>
                                                </div>

                                                {/* Seleções da Aposta */}
                                                <div className="space-y-1.5 pt-1">
                                                    {selecoes.map((s, idx) => (
                                                        <div key={idx} className="text-xs text-slate-300 flex flex-wrap items-center gap-1.5">
                                                            <span className="text-slate-500 font-bold">•</span>
                                                            <span className="font-bold text-white">{s.match_title || s.jogo_titulo || 'Jogo NBA'}:</span>
                                                            <span className="font-medium text-slate-200">{s.selection_label || s.escolha}</span>
                                                            <span className="font-mono font-bold text-amber-400">(@{s.odd})</span>
                                                            {s.status === 'ganha' && (
                                                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                                                                    ✓ Ganhou
                                                                </span>
                                                            )}
                                                            {s.status === 'perdida' && (
                                                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase">
                                                                    ✗ Perdeu
                                                                </span>
                                                            )}
                                                            {(!s.status || s.status === 'em_aberto') && (
                                                                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase">
                                                                    ⏳ A decorrer
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Valores Financeiros */}
                                            <div className="text-right flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                                                <span className="text-[10px] text-slate-500 uppercase font-black block">Apostado</span>
                                                <span className="text-xs font-mono font-bold text-slate-300">{b.valor_apostado} Coins</span>

                                                <span className="text-[10px] text-slate-500 uppercase font-black block mt-2">
                                                    {isWon ? 'Ganhos Creditados' : isLost ? 'Resultado' : 'Retorno Potencial'}
                                                </span>
                                                <span className={`text-base font-mono font-black ${isWon ? 'text-emerald-400' : isLost ? 'text-red-400' : 'text-amber-400'}`}>
                                                    {isWon ? `+${b.ganho_potencial} Coins` : isLost ? '0 Coins' : `+${b.ganho_potencial} Coins`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ABA 3: RANKING DOS APOSTADORES */}
                {activeTab === 'ranking' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-white flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <span>Classificação Geral de Apostadores</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Os fãs com as maiores bancas de NBA Coins no NBA League Manager.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black border-b border-slate-800">
                                        <th className="py-3 px-4"># Pos</th>
                                        <th className="py-3 px-4">Apostador</th>
                                        <th className="py-3 px-4 text-right">Saldo de Moedas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-mono">
                                    {leaderboard.map((user, idx) => (
                                        <tr key={user.id} className="hover:bg-slate-850/60 transition">
                                            <td className="py-3.5 px-4 font-black">
                                                {idx === 0 && <span className="text-amber-400 font-bold text-sm">🥇 1º</span>}
                                                {idx === 1 && <span className="text-slate-300 font-bold text-sm">🥈 2º</span>}
                                                {idx === 2 && <span className="text-amber-600 font-bold text-sm">🥉 3º</span>}
                                                {idx > 2 && <span className="text-slate-500">{idx + 1}º</span>}
                                            </td>
                                            <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center space-x-2.5">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=1D428A&color=ffffff`}
                                                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                                />
                                                <span>{user.nome}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-black text-amber-400 text-sm">
                                                {Number(user.saldo_moedas || 0).toLocaleString()} COINS
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

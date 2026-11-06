import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, MapPin, Tv, RotateCw, CheckCircle2, Radio, Activity, ExternalLink } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

export default function GamesTicker({ games = [], onSelectTeam, lastSyncTime }) {
    const [localGames, setLocalGames] = useState(games);
    const [expandedGameId, setExpandedGameId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('todos'); // 'todos', 'concluidos', 'hoje', 'proximos'
    const [isSyncing, setIsSyncing] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [liveCount, setLiveCount] = useState(0);
    const [effectiveLastSync, setEffectiveLastSync] = useState(lastSyncTime);
    const [syncSuccessMessage, setSyncSuccessMessage] = useState(null);

    // Manter sincronizado quando as props mudam
    useEffect(() => {
        setLocalGames(games);
    }, [games]);

    useEffect(() => {
        if (lastSyncTime) setEffectiveLastSync(lastSyncTime);
    }, [lastSyncTime]);

    // Live Polling ultra-rápido a cada 25 segundos para resultados em direto da ESPN
    useEffect(() => {
        const fetchLiveScores = async () => {
            try {
                setIsPolling(true);
                const response = await fetch('/api/live-scores', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.games && data.games.length > 0) {
                        setLocalGames(data.games);
                    }
                    if (data.last_sync) {
                        setEffectiveLastSync(data.last_sync);
                    }
                    if (typeof data.live_count === 'number') {
                        setLiveCount(data.live_count);
                    }
                }
            } catch (err) {
                console.error('Falha no polling de live scores:', err);
            } finally {
                setTimeout(() => setIsPolling(false), 800);
            }
        };

        const interval = setInterval(fetchLiveScores, 25000);
        return () => clearInterval(interval);
    }, []);

    const toggleExpand = (gameId) => {
        setExpandedGameId(expandedGameId === gameId ? null : gameId);
    };

    // Forçar sincronização imediata através da API
    const handleManualSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const response = await fetch('/sync-espn', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            const data = await response.json();
            
            router.reload({
                preserveScroll: true,
                only: ['recentGames', 'standingsEast', 'standingsWest', 'heroGame', 'kpis', 'lastSyncTime', 'leagueLeaders']
            });

            setSyncSuccessMessage('Dados e marcadores atualizados com a ESPN!');
            setTimeout(() => setSyncSuccessMessage(null), 3500);
        } catch (err) {
            console.error('Falha na sincronização:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    const currentGamesList = localGames && localGames.length > 0 ? localGames : games;
    if (!currentGamesList || currentGamesList.length === 0) return null;

    // Filtros de Jogos
    const finishedGames = currentGamesList.filter(g => g.estado === 'concluido');
    const liveGames = currentGamesList.filter(g => g.estado === 'em_direto' || g.estado === 'intervalo');
    
    // Jogos de hoje ou em direto
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAndLiveGames = currentGamesList.filter(g => {
        const gameDate = g.data_hora ? g.data_hora.slice(0, 10) : '';
        return g.estado === 'em_direto' || g.estado === 'intervalo' || gameDate === todayStr || g.estado === 'agendado';
    });
    
    const upcomingGames = currentGamesList.filter(g => g.estado === 'agendado');

    let displayedGames = currentGamesList;
    if (activeFilter === 'concluidos') {
        displayedGames = finishedGames;
    } else if (activeFilter === 'hoje') {
        displayedGames = todayAndLiveGames;
    } else if (activeFilter === 'proximos') {
        displayedGames = upcomingGames;
    }

    return (
        <section id="jogos" className="mb-12 scroll-mt-24">
            {/* Cabeçalho com Título, Status ESPN e Botão de Sincronização */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center">
                        <Calendar className="w-6 h-6 mr-2.5 text-blue-500" />
                        Jogos Recentes & Resultados Oficiais
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>Marcadores oficiais da NBA sincronizados com a ESPN API em tempo real.</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Badge de Auto-Sync ESPN com Live Polling ativo */}
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold text-emerald-400">ESPN Live Polling</span>
                        {isPolling && (
                            <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
                        )}
                        {effectiveLastSync && (
                            <span className="text-slate-500 border-l border-slate-800 pl-2">
                                {effectiveLastSync}
                            </span>
                        )}
                    </div>

                    {/* Botão de Sincronizar Agora */}
                    <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            isSyncing
                                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                        }`}
                        title="Verificar e puxar novos resultados da ESPN agora"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'A Sincronizar...' : 'Sincronizar ESPN'}</span>
                    </button>

                    {syncSuccessMessage && (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {syncSuccessMessage}
                        </span>
                    )}

                    <Link
                        href="/calendario"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-600 transition"
                    >
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>Calendário completo</span>
                    </Link>
                </div>
            </div>

            {/* Abas de Filtragem de Jogos */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
                <button
                    onClick={() => setActiveFilter('todos')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                        activeFilter === 'todos'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                    Todos ({currentGamesList.length})
                </button>
                <button
                    onClick={() => setActiveFilter('concluidos')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                        activeFilter === 'concluidos'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                    Resultados Recentes ({finishedGames.length})
                </button>
                <button
                    onClick={() => setActiveFilter('hoje')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                        activeFilter === 'hoje'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                    {(liveGames.length > 0 || liveCount > 0) && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <span>Hoje & Ao Vivo ({todayAndLiveGames.length})</span>
                </button>
                <button
                    onClick={() => setActiveFilter('proximos')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                        activeFilter === 'proximos'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                    Próximos Agendados ({upcomingGames.length})
                </button>
            </div>

            {/* Scoreboard Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedGames.map((game) => {
                    const isExpanded = expandedGameId === game.id;
                    const isFinished = game.estado === 'concluido';
                    const isLive = game.estado === 'em_direto';
                    const isHalftime = game.estado === 'intervalo';
                    const isScheduled = game.estado === 'agendado';

                    const casaVenceu = isFinished && (game.pontos_casa ?? 0) > (game.pontos_fora ?? 0);
                    const foraVenceu = isFinished && (game.pontos_fora ?? 0) > (game.pontos_casa ?? 0);

                    const dataFormatada = new Date(game.data_hora).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    return (
                        <div
                            key={game.id}
                            className={`bg-slate-900/90 border rounded-2xl p-4 shadow-lg transition-all duration-200 flex flex-col justify-between ${
                                isLive 
                                    ? 'border-red-500/50 shadow-red-950/20 ring-1 ring-red-500/30' 
                                    : 'border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            {/* Topo do Card de Jogo */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px]">
                                {isLive && (
                                    <span className="font-extrabold text-red-400 uppercase tracking-wider flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
                                        AO VIVO • {game.periodo_atual || 'Q1'} {game.tempo_restante || ''}
                                    </span>
                                )}
                                {isHalftime && (
                                    <span className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                                        INTERVALO (HALFTIME)
                                    </span>
                                )}
                                {isFinished && (
                                    <span className="font-extrabold text-slate-400 uppercase tracking-wider">
                                        FINAL • {dataFormatada}
                                    </span>
                                )}
                                {isScheduled && (
                                    <span className="font-extrabold text-blue-400 uppercase tracking-wider flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
                                        AGENDADO • {dataFormatada}
                                    </span>
                                )}

                                <span className="flex items-center text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-medium">
                                    <Tv className="w-3 h-3 mr-1 text-slate-500" />
                                    {game.canal_tv || 'NBA TV'}
                                </span>
                            </div>

                            {/* Placar das 2 Equipas (Ordem Oficial: Anfitrião / Casa no topo & Visitante / Fora embaixo) */}
                            <div className="py-4 space-y-3">
                                {/* Equipa Casa (Anfitrião do Pavilhão) */}
                                <div 
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => onSelectTeam && onSelectTeam(game.casa_sigla)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                            <img src={game.casa_logo} alt={game.casa_nome} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <span className={`text-sm font-black transition block group-hover:text-blue-400 ${
                                                isFinished
                                                    ? (casaVenceu ? 'text-white font-extrabold' : 'text-slate-400')
                                                    : 'text-white'
                                            }`}>
                                                {game.casa_nome}
                                            </span>
                                            <span className="text-[10px] text-blue-400 font-extrabold uppercase flex items-center space-x-1">
                                                <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono">CASA</span>
                                                <span className="text-slate-500">• {game.casa_sigla}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-2xl font-black font-mono tracking-tight ${
                                        isScheduled 
                                            ? 'text-slate-600 text-lg font-sans'
                                            : (casaVenceu ? 'text-white' : (isFinished ? 'text-slate-500' : 'text-blue-400'))
                                    }`}>
                                        {isScheduled ? 'vs' : (game.pontos_casa ?? '--')}
                                    </span>
                                </div>

                                {/* Divisória subtil */}
                                <div className="border-t border-slate-800/40" />

                                {/* Equipa Fora (Visitante) */}
                                <div 
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => onSelectTeam && onSelectTeam(game.fora_sigla)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                            <img src={game.fora_logo} alt={game.fora_nome} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <span className={`text-sm font-black transition block group-hover:text-blue-400 ${
                                                isFinished
                                                    ? (foraVenceu ? 'text-white font-extrabold' : 'text-slate-400')
                                                    : 'text-white'
                                            }`}>
                                                {game.fora_nome}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-extrabold uppercase flex items-center space-x-1">
                                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">FORA</span>
                                                <span className="text-slate-500">• {game.fora_sigla}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-2xl font-black font-mono tracking-tight ${
                                        isScheduled 
                                            ? 'text-slate-600 text-lg font-sans'
                                            : (foraVenceu ? 'text-white' : (isFinished ? 'text-slate-500' : 'text-blue-400'))
                                    }`}>
                                        {isScheduled ? 'vs' : (game.pontos_fora ?? '--')}
                                    </span>
                                </div>
                            </div>

                            {/* Informações da Arena e Ações (Quarters & Box Score) */}
                            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="flex items-center truncate max-w-[130px] sm:max-w-[170px]" title={game.arena_nome}>
                                    <MapPin className="w-3 h-3 mr-1 text-slate-500 flex-shrink-0" />
                                    {game.arena_nome}
                                </span>

                                <div className="flex items-center space-x-2">
                                    {game.quarters && game.quarters.length > 0 && (
                                        <button
                                            onClick={() => toggleExpand(game.id)}
                                            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center space-x-0.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 transition"
                                            title="Ver parciais por quarto"
                                        >
                                            <span>{isExpanded ? 'Ocultar' : 'Quarters'}</span>
                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    )}

                                    <Link
                                        href={`/jogos/${game.id}`}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white text-[11px] font-extrabold transition shadow-sm"
                                        title="Ver estatísticas completas e box score oficial do jogo"
                                    >
                                        <span>Box Score</span>
                                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-80" />
                                    </Link>
                                </div>
                            </div>

                            {/* Tabela de Parciais por Quarto (Expansível) */}
                            {isExpanded && game.quarters && game.quarters.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950/70 -mx-4 -mb-4 p-4 rounded-b-2xl">
                                    <table className="w-full text-xs text-center">
                                        <thead>
                                            <tr className="text-[10px] text-slate-500 uppercase font-black">
                                                <th className="text-left py-1">Equipa</th>
                                                {game.quarters.map((q) => (
                                                    <th key={q.id} className="py-1 px-1.5">{q.periodo}</th>
                                                ))}
                                                <th className="py-1 px-1.5 text-white font-extrabold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-mono">
                                            <tr>
                                                <td className="text-left font-bold text-blue-400 py-1 font-sans">{game.casa_sigla} (CASA)</td>
                                                {game.quarters.map((q) => (
                                                    <td key={q.id} className="py-1 px-1.5 text-slate-400">{q.pontos_casa}</td>
                                                ))}
                                                <td className="py-1 px-1.5 font-bold text-white">{game.pontos_casa}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left font-bold text-slate-300 py-1 font-sans">{game.fora_sigla} (FORA)</td>
                                                {game.quarters.map((q) => (
                                                    <td key={q.id} className="py-1 px-1.5 text-slate-400">{q.pontos_fora}</td>
                                                ))}
                                                <td className="py-1 px-1.5 font-bold text-white">{game.pontos_fora}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

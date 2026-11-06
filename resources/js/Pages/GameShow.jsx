import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import CourtShotChart from '@/Components/CourtShotChart';
import CourtReplaySimulator from '@/Components/CourtReplaySimulator';
import { ArrowLeft, Calendar, MapPin, Tv, Trophy, Users, Activity, BarChart2, ListOrdered, Clock, Flame, ShieldAlert, Target, Sparkles, Filter, Play } from 'lucide-react';

export default function GameShow({
    auth,
    game,
    homeStats = [],
    awayStats = [],
    homeDnp = [],
    awayDnp = [],
    homeTotals = {},
    awayTotals = {},
    homeLeaders = {},
    awayLeaders = {},
    plays = [],
    shots = [],
    replayPlays = [],
}) {
    const [viewMode, setViewMode] = useState('boxscore'); // 'boxscore' | 'shotchart' | 'replay' | 'playbyplay'
    const [activeTeamTab, setActiveTeamTab] = useState('casa');
    const [pbpQuarter, setPbpQuarter] = useState('todos'); // 'todos', 1, 2, 3, 4, 5...
    const [pbpCategory, setPbpCategory] = useState('todas'); // 'todas', 'cesto', 'triplo', 'falta', 'perda'

    const isConcluded = game.estado === 'concluido';
    const isLive = game.estado === 'em_direto';
    const isScheduled = game.estado === 'agendado';

    const casaVenceu = isConcluded && (game.pontos_casa ?? 0) > (game.pontos_fora ?? 0);
    const foraVenceu = isConcluded && (game.pontos_fora ?? 0) > (game.pontos_casa ?? 0);

    const dataFormatada = new Date(game.data_hora).toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const activeStats = activeTeamTab === 'casa' ? homeStats : awayStats;
    const activeTotals = activeTeamTab === 'casa' ? homeTotals : awayTotals;
    const activeTeam = activeTeamTab === 'casa' ? game.equipa_casa : game.equipa_fora;

    const starters = activeStats.filter(s => s.titular);
    const bench = activeStats.filter(s => !s.titular);

    // Filtragem de Play-by-Play
    const filteredPlays = plays.filter(p => {
        const matchesQuarter = pbpQuarter === 'todos' || Number(p.period) === Number(pbpQuarter);
        let matchesCategory = true;
        if (pbpCategory === 'cesto') matchesCategory = p.is_scoring;
        else if (pbpCategory === 'triplo') matchesCategory = p.category === 'triplo';
        else if (pbpCategory === 'falta') matchesCategory = p.category === 'falta';
        else if (pbpCategory === 'perda') matchesCategory = p.category === 'perda';

        return matchesQuarter && matchesCategory;
    });

    // Lista de quartos disponíveis no Play-by-Play
    const availablePeriods = Array.from(new Set(plays.map(p => p.period))).sort((a, b) => a - b);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title={`Box Score & Play-by-Play: ${game.equipa_fora?.nome_completo} vs ${game.equipa_casa?.nome_completo} - NBA`} />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botão de Regresso */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Hub da NBA</span>
                    </Link>
                </div>

                {/* Scoreboard Principal do Jogo */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 mb-8">
                    {/* Luzes dinâmicas de fundo com cores das equipas */}
                    <div 
                        className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ backgroundColor: game.equipa_casa?.cor_primaria || '#1D428A' }}
                    />
                    <div 
                        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ backgroundColor: game.equipa_fora?.cor_primaria || '#C8102E' }}
                    />

                    <div className="relative z-10">
                        {/* Topo do Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80 text-xs">
                            <div className="flex items-center space-x-3">
                                {isLive && (
                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-extrabold uppercase border border-red-500/30">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span>EM DIRETO • {game.periodo_atual || 'Q1'} {game.tempo_restante}</span>
                                    </span>
                                )}
                                {isConcluded && (
                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-extrabold uppercase border border-slate-700">
                                        <span>FINAL OFICIAL</span>
                                    </span>
                                )}
                                {isScheduled && (
                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-extrabold uppercase border border-blue-500/20">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>AGENDADO</span>
                                    </span>
                                )}

                                <span className="text-slate-400 flex items-center space-x-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{dataFormatada}</span>
                                </span>
                            </div>

                            <div className="flex items-center space-x-4 text-slate-400">
                                <span className="flex items-center space-x-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{game.arena?.nome || 'Arena NBA'}, {game.arena?.cidade}</span>
                                </span>
                                <span className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-semibold text-slate-300">
                                    <Tv className="w-3 h-3 text-slate-400 mr-1" />
                                    <span>{game.canal_tv || 'NBA League Pass'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Placar Central com Logos das 2 Equipas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-8">
                            {/* Equipa Visitante (Fora) */}
                            <div className="flex items-center justify-start md:justify-end space-x-5 order-1 md:order-1">
                                <div className="text-left md:text-right">
                                    <Link 
                                        href={`/equipas/${game.equipa_fora?.sigla}`}
                                        className="text-xl sm:text-2xl font-black text-white hover:text-blue-400 transition block leading-tight"
                                    >
                                        {game.equipa_fora?.nome_completo}
                                    </Link>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        FORA • {game.equipa_fora?.sigla}
                                    </span>
                                </div>
                                <div className="w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <img src={game.equipa_fora?.logo_url} alt={game.equipa_fora?.nome_completo} className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* Placar Central */}
                            <div className="flex flex-col items-center justify-center order-3 md:order-2">
                                <div className="flex items-center space-x-6 bg-slate-950/90 px-8 py-3.5 rounded-2xl border border-slate-800 shadow-xl">
                                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                                        foraVenceu ? 'text-white' : (isConcluded ? 'text-slate-400' : 'text-white')
                                    }`}>
                                        {game.pontos_fora ?? '--'}
                                    </span>
                                    <span className="text-slate-600 text-2xl font-light">:</span>
                                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                                        casaVenceu ? 'text-white' : (isConcluded ? 'text-slate-400' : 'text-white')
                                    }`}>
                                        {game.pontos_casa ?? '--'}
                                    </span>
                                </div>
                                <span className="mt-2 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase">
                                    {isConcluded ? 'Resultado Oficial Final' : (isLive ? 'Ao Vivo no Pavilhão' : 'Jogo por Iniciar')}
                                </span>
                            </div>

                            {/* Equipa Anfitriã (Casa) */}
                            <div className="flex items-center justify-start space-x-5 order-2 md:order-3">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <img src={game.equipa_casa?.logo_url} alt={game.equipa_casa?.nome_completo} className="w-full h-full object-contain" />
                                </div>
                                <div className="text-left">
                                    <Link 
                                        href={`/equipas/${game.equipa_casa?.sigla}`}
                                        className="text-xl sm:text-2xl font-black text-white hover:text-blue-400 transition block leading-tight"
                                    >
                                        {game.equipa_casa?.nome_completo}
                                    </Link>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                        CASA • {game.equipa_casa?.sigla}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabela de Parciais por Quarto (Q1-Q4) */}
                        {game.periodos && game.periodos.length > 0 && (
                            <div className="pt-4 border-t border-slate-800/80 max-w-xl mx-auto">
                                <table className="w-full text-xs text-center">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-black text-slate-500">
                                            <th className="text-left py-1">Equipa</th>
                                            {game.periodos.map((p) => (
                                                <th key={p.id} className="py-1 px-2">{p.periodo}</th>
                                            ))}
                                            <th className="py-1 px-2 text-white font-black">T</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-mono">
                                        <tr>
                                            <td className="text-left font-bold text-slate-300 py-1 font-sans">{game.equipa_fora?.sigla} (FORA)</td>
                                            {game.periodos.map((p) => (
                                                <td key={p.id} className="py-1 px-2 text-slate-400">{p.pontos_fora}</td>
                                            ))}
                                            <td className="py-1 px-2 font-bold text-white">{game.pontos_fora}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left font-bold text-blue-400 py-1 font-sans">{game.equipa_casa?.sigla} (CASA)</td>
                                            {game.periodos.map((p) => (
                                                <td key={p.id} className="py-1 px-2 text-slate-400">{p.pontos_casa}</td>
                                            ))}
                                            <td className="py-1 px-2 font-bold text-white">{game.pontos_casa}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comparação Estatística das Equipas (Team Comparison Gauges) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Líderes da Partida */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                                <Trophy className="w-4 h-4 text-amber-400" />
                                <span>Líderes Individuais do Jogo</span>
                            </h3>

                            <div className="space-y-4">
                                {/* Top Scorer */}
                                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                                        Melhor Marcador (Pontos)
                                    </span>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <img src={homeLeaders.pontos?.foto_url || '/images/players/placeholder.png'} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 object-cover" />
                                            <div>
                                                <Link 
                                                    href={homeLeaders.pontos ? `/jogadores/${homeLeaders.pontos.jogador_id || homeLeaders.pontos.id}` : '#'}
                                                    className="text-xs font-bold text-white hover:text-blue-400 transition block"
                                                >
                                                    {homeLeaders.pontos?.nome_completo || 'N/A'}
                                                </Link>
                                                <span className="text-[10px] text-blue-400 font-semibold">{game.equipa_casa?.sigla}</span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-black font-mono text-white">{homeLeaders.pontos?.pontos ?? 0} PTS</span>
                                    </div>
                                </div>

                                {/* Top Rebounder */}
                                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                                        Rei dos Ressaltos
                                    </span>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <img src={homeLeaders.ressaltos?.foto_url || '/images/players/placeholder.png'} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 object-cover" />
                                            <div>
                                                <Link 
                                                    href={homeLeaders.ressaltos ? `/jogadores/${homeLeaders.ressaltos.jogador_id || homeLeaders.ressaltos.id}` : '#'}
                                                    className="text-xs font-bold text-white hover:text-blue-400 transition block"
                                                >
                                                    {homeLeaders.ressaltos?.nome_completo || 'N/A'}
                                                </Link>
                                                <span className="text-[10px] text-blue-400 font-semibold">{game.equipa_casa?.sigla}</span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-black font-mono text-white">{homeLeaders.ressaltos?.ressaltos_totais ?? 0} REB</span>
                                    </div>
                                </div>

                                {/* Top Passer */}
                                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                                        Mestre das Assistências
                                    </span>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <img src={homeLeaders.assistencias?.foto_url || '/images/players/placeholder.png'} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 object-cover" />
                                            <div>
                                                <Link 
                                                    href={homeLeaders.assistencias ? `/jogadores/${homeLeaders.assistencias.jogador_id || homeLeaders.assistencias.id}` : '#'}
                                                    className="text-xs font-bold text-white hover:text-blue-400 transition block"
                                                >
                                                    {homeLeaders.assistencias?.nome_completo || 'N/A'}
                                                </Link>
                                                <span className="text-[10px] text-blue-400 font-semibold">{game.equipa_casa?.sigla}</span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-black font-mono text-white">{homeLeaders.assistencias?.assistencias ?? 0} AST</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparativo de Percentagens e Eficácia */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                                    <BarChart2 className="w-4 h-4 text-blue-400" />
                                    <span>Estatísticas Coletivas da Partida</span>
                                </h3>
                                <div className="flex items-center space-x-4 text-xs font-bold">
                                    <span className="text-blue-400">{game.equipa_casa?.sigla} (CASA)</span>
                                    <span className="text-slate-500">vs</span>
                                    <span className="text-slate-300">{game.equipa_fora?.sigla} (FORA)</span>
                                </div>
                            </div>

                            {/* Gauges e Barras Comparativas */}
                            <div className="space-y-4">
                                {/* FG% */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-white">{homeTotals.fg_pct}% ({homeTotals.fg_marcados}/{homeTotals.fg_tentados})</span>
                                        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Lançamentos de Campo (FG%)</span>
                                        <span className="text-white">{awayTotals.fg_pct}% ({awayTotals.fg_marcados}/{awayTotals.fg_tentados})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full bg-blue-500 rounded-l-full" 
                                            style={{ width: `${(homeTotals.fg_pct / (homeTotals.fg_pct + awayTotals.fg_pct || 1)) * 100}%` }} 
                                        />
                                        <div 
                                            className="h-full bg-slate-600 rounded-r-full" 
                                            style={{ width: `${(awayTotals.fg_pct / (homeTotals.fg_pct + awayTotals.fg_pct || 1)) * 100}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* 3P% */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-white">{homeTotals.fg3_pct}% ({homeTotals.fg3_marcados}/{homeTotals.fg3_tentados})</span>
                                        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Triplos (3P%)</span>
                                        <span className="text-white">{awayTotals.fg3_pct}% ({awayTotals.fg3_marcados}/{awayTotals.fg3_tentados})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full bg-blue-500 rounded-l-full" 
                                            style={{ width: `${(homeTotals.fg3_pct / (homeTotals.fg3_pct + awayTotals.fg3_pct || 1)) * 100}%` }} 
                                        />
                                        <div 
                                            className="h-full bg-slate-600 rounded-r-full" 
                                            style={{ width: `${(awayTotals.fg3_pct / (homeTotals.fg3_pct + awayTotals.fg3_pct || 1)) * 100}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* FT% */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-white">{homeTotals.ft_pct}% ({homeTotals.ft_marcados}/{homeTotals.ft_tentados})</span>
                                        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Lances Livres (FT%)</span>
                                        <span className="text-white">{awayTotals.ft_pct}% ({awayTotals.ft_marcados}/{awayTotals.ft_tentados})</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                                        <div 
                                            className="h-full bg-blue-500 rounded-l-full" 
                                            style={{ width: `${(homeTotals.ft_pct / (homeTotals.ft_pct + awayTotals.ft_pct || 1)) * 100}%` }} 
                                        />
                                        <div 
                                            className="h-full bg-slate-600 rounded-r-full" 
                                            style={{ width: `${(awayTotals.ft_pct / (homeTotals.ft_pct + awayTotals.ft_pct || 1)) * 100}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Rebounds & Assists Stats Grid */}
                                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
                                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block">Ressaltos</span>
                                        <span className="text-sm font-black font-mono text-white">{homeTotals.ressaltos_totais} - {awayTotals.ressaltos_totais}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block">Assistências</span>
                                        <span className="text-sm font-black font-mono text-white">{homeTotals.assistencias} - {awayTotals.assistencias}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block">Roubos</span>
                                        <span className="text-sm font-black font-mono text-white">{homeTotals.roubos_bola} - {awayTotals.roubos_bola}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                                        <span className="text-[10px] text-slate-500 uppercase font-black block">Desarmes</span>
                                        <span className="text-sm font-black font-mono text-white">{homeTotals.desarmes_lancamento} - {awayTotals.desarmes_lancamento}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seletor Principal de Vistas: Box Score, Shot Chart, Replay 2D e Play-by-Play */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setViewMode('boxscore')}
                            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition ${
                                viewMode === 'boxscore'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Box Score Oficial</span>
                        </button>

                        <button
                            onClick={() => setViewMode('shotchart')}
                            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition ${
                                viewMode === 'shotchart'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <Target className="w-4 h-4 text-emerald-400" />
                            <span>Shot Chart &amp; Heatmap</span>
                            {shots.length > 0 && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800">
                                    {shots.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setViewMode('replay')}
                            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition ${
                                viewMode === 'replay'
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                            <span>Simulador &amp; Replay 2D</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-black text-amber-300 border border-amber-500/30">
                                🏀 2D Live
                            </span>
                        </button>

                        <button
                            onClick={() => setViewMode('playbyplay')}
                            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition ${
                                viewMode === 'playbyplay'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <ListOrdered className="w-4 h-4 text-emerald-400" />
                            <span>Lance a Lance</span>
                            {plays.length > 0 && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800">
                                    {plays.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Dados Oficiais NBA Hub</span>
                    </div>
                </div>

                {/* VISÃO 1: BOX SCORE OFICIAL */}
                {viewMode === 'boxscore' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-12">
                        {/* Seletor da Equipa no Box Score */}
                        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/60">
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                    <span>Estatísticas Individuais por Equipa</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Clica no nome de qualquer atleta para abrir o seu perfil oficial e estatísticas completas.
                                </p>
                            </div>

                            {/* Abas Casa / Fora */}
                            <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                                <button
                                    onClick={() => setActiveTeamTab('casa')}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
                                        activeTeamTab === 'casa'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <img src={game.equipa_casa?.logo_url} className="w-4 h-4 object-contain" />
                                    <span>{game.equipa_casa?.nome_completo} (CASA)</span>
                                </button>
                                <button
                                    onClick={() => setActiveTeamTab('fora')}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
                                        activeTeamTab === 'fora'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <img src={game.equipa_fora?.logo_url} className="w-4 h-4 object-contain" />
                                    <span>{game.equipa_fora?.nome_completo} (FORA)</span>
                                </button>
                            </div>
                        </div>

                        {/* Tabela do Box Score */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                                        <th className="py-3 px-4 font-sans">Jogador</th>
                                        <th className="py-3 px-2 text-center">POS</th>
                                        <th className="py-3 px-2 text-center">MIN</th>
                                        <th className="py-3 px-2 text-center text-white font-extrabold">PTS</th>
                                        <th className="py-3 px-2 text-center">FGM-A</th>
                                        <th className="py-3 px-2 text-center">FG%</th>
                                        <th className="py-3 px-2 text-center">3PM-A</th>
                                        <th className="py-3 px-2 text-center">3P%</th>
                                        <th className="py-3 px-2 text-center">FTM-A</th>
                                        <th className="py-3 px-2 text-center">FT%</th>
                                        <th className="py-3 px-2 text-center">OREB</th>
                                        <th className="py-3 px-2 text-center">DREB</th>
                                        <th className="py-3 px-2 text-center text-white font-bold">REB</th>
                                        <th className="py-3 px-2 text-center text-white font-bold">AST</th>
                                        <th className="py-3 px-2 text-center">STL</th>
                                        <th className="py-3 px-2 text-center">BLK</th>
                                        <th className="py-3 px-2 text-center">TO</th>
                                        <th className="py-3 px-2 text-center">PF</th>
                                        <th className="py-3 px-3 text-center">+/-</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-mono">
                                    {/* Secção Titulares */}
                                    <tr className="bg-slate-950/40 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                                        <td colSpan="19" className="py-2 px-4 font-sans">
                                            Cinco Inicial (Titulares)
                                        </td>
                                    </tr>
                                    {starters.map((s) => {
                                        const fgPct = s.fg_tentados > 0 ? Math.round((s.fg_marcados / s.fg_tentados) * 100) : 0;
                                        const fg3Pct = s.fg3_tentados > 0 ? Math.round((s.fg3_marcados / s.fg3_tentados) * 100) : 0;
                                        const ftPct = s.ft_tentados > 0 ? Math.round((s.ft_marcados / s.ft_tentados) * 100) : 0;

                                        return (
                                            <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-2.5 px-4 font-sans font-bold text-white">
                                                    <Link 
                                                        href={`/jogadores/${s.jogador_id || s.id}`}
                                                        className="flex items-center space-x-2.5 group/p hover:text-blue-400 transition"
                                                    >
                                                        <img src={s.foto_url || '/images/players/placeholder.png'} className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 object-cover flex-shrink-0" />
                                                        <div className="truncate">
                                                            <span className="block truncate group-hover/p:text-blue-400">{s.nome_completo}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono">#{s.numero_camisola}</span>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-sans text-slate-400 font-bold">{s.posicao}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.minutos}:{s.segundos < 10 ? '0' + s.segundos : s.segundos}</td>
                                                <td className="py-2.5 px-2 text-center font-black text-white text-sm bg-blue-500/10 rounded">{s.pontos}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-300">{s.fg_marcados}-{s.fg_tentados}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{fgPct}%</td>
                                                <td className="py-2.5 px-2 text-center text-slate-300">{s.fg3_marcados}-{s.fg3_tentados}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{fg3Pct}%</td>
                                                <td className="py-2.5 px-2 text-center text-slate-300">{s.ft_marcados}-{s.ft_tentados}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{ftPct}%</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.ressaltos_ofensivos}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.ressaltos_defensivos}</td>
                                                <td className="py-2.5 px-2 text-center font-bold text-white">{s.ressaltos_totais}</td>
                                                <td className="py-2.5 px-2 text-center font-bold text-white">{s.assistencias}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.roubos_bola}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.desarmes_lancamento}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.perdas_bola}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{s.faltas_pessoais}</td>
                                                <td className={`py-2.5 px-3 text-center font-bold ${s.mais_menos > 0 ? 'text-emerald-400' : (s.mais_menos < 0 ? 'text-red-400' : 'text-slate-400')}`}>
                                                    {s.mais_menos > 0 ? `+${s.mais_menos}` : s.mais_menos}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Secção Suplentes */}
                                    {bench.length > 0 && (
                                        <>
                                            <tr className="bg-slate-950/40 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                                                <td colSpan="19" className="py-2 px-4 font-sans">
                                                    Banco de Suplentes
                                                </td>
                                            </tr>
                                            {bench.map((s) => {
                                                const fgPct = s.fg_tentados > 0 ? Math.round((s.fg_marcados / s.fg_tentados) * 100) : 0;
                                                const fg3Pct = s.fg3_tentados > 0 ? Math.round((s.fg3_marcados / s.fg3_tentados) * 100) : 0;
                                                const ftPct = s.ft_tentados > 0 ? Math.round((s.ft_marcados / s.ft_tentados) * 100) : 0;

                                                return (
                                                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                                        <td className="py-2.5 px-4 font-sans font-bold text-slate-300">
                                                            <Link 
                                                                href={`/jogadores/${s.jogador_id || s.id}`}
                                                                className="flex items-center space-x-2.5 group/p hover:text-blue-400 transition"
                                                            >
                                                                <img src={s.foto_url || '/images/players/placeholder.png'} className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 object-cover flex-shrink-0" />
                                                                <div className="truncate">
                                                                    <span className="block truncate group-hover/p:text-blue-400">{s.nome_completo}</span>
                                                                    <span className="text-[10px] text-slate-500 font-mono">#{s.numero_camisola}</span>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="py-2.5 px-2 text-center font-sans text-slate-400 font-bold">{s.posicao}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.minutos}:{s.segundos < 10 ? '0' + s.segundos : s.segundos}</td>
                                                        <td className="py-2.5 px-2 text-center font-black text-white text-sm bg-blue-500/10 rounded">{s.pontos}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-300">{s.fg_marcados}-{s.fg_tentados}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{fgPct}%</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-300">{s.fg3_marcados}-{s.fg3_tentados}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{fg3Pct}%</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-300">{s.ft_marcados}-{s.ft_tentados}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{ftPct}%</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.ressaltos_ofensivos}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.ressaltos_defensivos}</td>
                                                        <td className="py-2.5 px-2 text-center font-bold text-white">{s.ressaltos_totais}</td>
                                                        <td className="py-2.5 px-2 text-center font-bold text-white">{s.assistencias}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.roubos_bola}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.desarmes_lancamento}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.perdas_bola}</td>
                                                        <td className="py-2.5 px-2 text-center text-slate-400">{s.faltas_pessoais}</td>
                                                        <td className={`py-2.5 px-3 text-center font-bold ${s.mais_menos > 0 ? 'text-emerald-400' : (s.mais_menos < 0 ? 'text-red-400' : 'text-slate-400')}`}>
                                                            {s.mais_menos > 0 ? `+${s.mais_menos}` : s.mais_menos}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}
                                </tbody>
                                {/* Totais da Equipa */}
                                <tfoot>
                                    <tr className="bg-slate-950 font-mono font-black text-white border-t-2 border-slate-700">
                                        <td className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-blue-400">
                                            Total da Equipa
                                        </td>
                                        <td className="py-3 px-2 text-center">-</td>
                                        <td className="py-3 px-2 text-center text-slate-400">240</td>
                                        <td className="py-3 px-2 text-center text-base text-blue-400 bg-blue-500/20 rounded font-black">{activeTotals.pontos}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.fg_marcados}-{activeTotals.fg_tentados}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.fg_pct}%</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.fg3_marcados}-{activeTotals.fg3_tentados}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.fg3_pct}%</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.ft_marcados}-{activeTotals.ft_tentados}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.ft_pct}%</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.ressaltos_ofensivos}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.ressaltos_defensivos}</td>
                                        <td className="py-3 px-2 text-center text-base">{activeTotals.ressaltos_totais}</td>
                                        <td className="py-3 px-2 text-center text-base">{activeTotals.assistencias}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.roubos_bola}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.desarmes_lancamento}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.perdas_bola}</td>
                                        <td className="py-3 px-2 text-center">{activeTotals.faltas_pessoais}</td>
                                        <td className="py-3 px-3 text-center">-</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* VISÃO 2: SHOT CHART & MAPA DE CALOR */}
                {viewMode === 'shotchart' && (
                    <div className="mb-12">
                        <CourtShotChart
                            shots={shots}
                            homeTeam={game.equipa_casa}
                            awayTeam={game.equipa_fora}
                        />
                    </div>
                )}

                {/* VISÃO 3: SIMULADOR & REPLAY 2D NA QUADRA */}
                {viewMode === 'replay' && (
                    <div className="mb-12">
                        <CourtReplaySimulator
                            replayPlays={replayPlays}
                            homeTeam={game.equipa_casa}
                            awayTeam={game.equipa_fora}
                            homeStats={homeStats}
                            awayStats={awayStats}
                        />
                    </div>
                )}

                {/* VISÃO 4: LANCE A LANCE (PLAY-BY-PLAY) */}
                {viewMode === 'playbyplay' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-12">
                        {/* Filtros de Quarto e Categoria */}
                        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Filtro por Quarto */}
                            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                <span className="text-slate-500 font-bold uppercase text-[10px] mr-1 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Quarto:
                                </span>
                                <button
                                    onClick={() => setPbpQuarter('todos')}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpQuarter === 'todos'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    Todos ({plays.length})
                                </button>
                                {availablePeriods.map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setPbpQuarter(period)}
                                        className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                            Number(pbpQuarter) === Number(period)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                        }`}
                                    >
                                        {period <= 4 ? `Q${period}` : `OT${period - 4}`}
                                    </button>
                                ))}
                            </div>

                            {/* Filtro por Categoria */}
                            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                <span className="text-slate-500 font-bold uppercase text-[10px] mr-1 flex items-center">
                                    <Filter className="w-3 h-3 mr-1" />
                                    Tipo:
                                </span>
                                <button
                                    onClick={() => setPbpCategory('todas')}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpCategory === 'todas'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setPbpCategory('cesto')}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpCategory === 'cesto'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    🏀 Cestos & Pontos
                                </button>
                                <button
                                    onClick={() => setPbpCategory('triplo')}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpCategory === 'triplo'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    🎯 Triplos (3PT)
                                </button>
                                <button
                                    onClick={() => setPbpCategory('falta')}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpCategory === 'falta'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    ⚠️ Faltas
                                </button>
                                <button
                                    onClick={() => setPbpCategory('perda')}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                                        pbpCategory === 'perda'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    🛑 Turnovers
                                </button>
                            </div>
                        </div>

                        {/* Linha do Tempo de Jogadas */}
                        {filteredPlays && filteredPlays.length > 0 ? (
                            <div className="divide-y divide-slate-800/60 max-h-[700px] overflow-y-auto">
                                {filteredPlays.map((play) => {
                                    return (
                                        <div
                                            key={play.id}
                                            className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-850/60 ${
                                                play.is_scoring ? 'bg-emerald-500/5' : ''
                                            }`}
                                        >
                                            {/* Lado Esquerdo: Tempo e Indicador */}
                                            <div className="flex items-start space-x-3 flex-shrink-0">
                                                <div className="text-center font-mono">
                                                    <span className="block text-[10px] font-black uppercase text-slate-500">
                                                        {play.period_display || `Q${play.period}`}
                                                    </span>
                                                    <span className="block text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-0.5">
                                                        {play.clock}
                                                    </span>
                                                </div>

                                                {/* Badge da Ação */}
                                                <div>
                                                    {play.is_scoring && (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                            play.score_value === 3
                                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        }`}>
                                                            +{play.score_value} {play.score_value === 3 ? 'TRIPLO' : 'PTS'}
                                                        </span>
                                                    )}
                                                    {play.category === 'falta' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                            FALTA
                                                        </span>
                                                    )}
                                                    {play.category === 'perda' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                                            TURNOVER
                                                        </span>
                                                    )}
                                                    {play.category === 'ressalto' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                            RESSALTO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Centro: Descrição da Jogada */}
                                            <div className="flex-1 text-xs text-slate-200">
                                                <span className={`font-medium ${play.is_scoring ? 'text-white font-semibold' : 'text-slate-300'}`}>
                                                    {play.text}
                                                </span>
                                            </div>

                                            {/* Lado Direito: Placar no Momento da Jogada */}
                                            <div className="flex-shrink-0 text-right font-mono font-bold">
                                                <div className="text-xs text-white bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                                                    <span className={play.is_home === false ? 'text-blue-400 font-black' : 'text-slate-300'}>
                                                        {game.equipa_fora?.sigla} {play.away_score}
                                                    </span>
                                                    <span className="text-slate-600 mx-1.5">-</span>
                                                    <span className={play.is_home === true ? 'text-blue-400 font-black' : 'text-slate-300'}>
                                                        {play.home_score} {game.equipa_casa?.sigla}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400 text-sm">
                                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                                <p className="font-semibold text-white">Nenhum lance a lance encontrado para os filtros selecionados.</p>
                                <p className="text-xs text-slate-500 mt-1">O Play-by-Play oficial é transmitido e atualizado em direto durante e após as partidas da ESPN.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

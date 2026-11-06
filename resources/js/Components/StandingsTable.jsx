import React, { useState } from 'react';
import { Trophy, ChevronRight, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function StandingsTable({ 
    eastStandings = [], 
    westStandings = [], 
    seasons = [], 
    selectedSeasonId = 1,
    onSelectTeam 
}) {
    const [activeConference, setActiveConference] = useState('Este');

    const currentStandings = activeConference === 'Este' ? eastStandings : westStandings;

    const handleSeasonChange = (e) => {
        const newSeasonId = e.target.value;
        router.get('/', { season_id: newSeasonId }, { preserveScroll: true, preserveState: true });
    };

    return (
        <section id="classificacao" className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center">
                        <Trophy className="w-7 h-7 mr-3 text-amber-400" />
                        Classificação Oficial da NBA
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Tabela oficial com registos reais de vitórias/derrotas, forma e saldo de pontos.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                    {/* Seletor de Temporada Oficial */}
                    {seasons && seasons.length > 0 && (
                        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <select
                                value={selectedSeasonId}
                                onChange={handleSeasonChange}
                                className="bg-transparent text-xs font-black text-white border-0 focus:ring-0 cursor-pointer pr-8 py-0.5"
                            >
                                {seasons.map((s) => (
                                    <option key={s.id} value={s.id} className="bg-slate-900 text-white font-medium">
                                        Época {s.nome} {s.atual ? '• (Atual)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Seletor de Conferência */}
                    <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
                        <button
                            onClick={() => setActiveConference('Este')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeConference === 'Este'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Conferência Este
                        </button>
                        <button
                            onClick={() => setActiveConference('Oeste')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeConference === 'Oeste'
                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Conferência Oeste
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-[11px] uppercase font-black tracking-wider text-slate-400 bg-slate-900/90 border-b border-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3.5 text-center w-12">#</th>
                            <th scope="col" className="px-4 py-3.5">Franquia</th>
                            <th scope="col" className="px-3 py-3.5 text-center">V</th>
                            <th scope="col" className="px-3 py-3.5 text-center">D</th>
                            <th scope="col" className="px-3 py-3.5 text-center">% Vitórias</th>
                            <th scope="col" className="px-3 py-3.5 text-center hidden md:table-cell">Casa</th>
                            <th scope="col" className="px-3 py-3.5 text-center hidden md:table-cell">Fora</th>
                            <th scope="col" className="px-3 py-3.5 text-center">Saldo</th>
                            <th scope="col" className="px-4 py-3.5 text-center">Streak</th>
                            <th scope="col" className="px-3 py-3.5 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {currentStandings.map((team, index) => {
                            const isPlayoffs = index < 6;
                            const isPlayIn = index >= 6 && index < 10;
                            const streakWin = team.sequencia_atual?.includes('V');

                            return (
                                <tr
                                    key={team.equipa_id}
                                    onClick={() => onSelectTeam && onSelectTeam(team.sigla)}
                                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                                >
                                    {/* Posição com indicador visual */}
                                    <td className="px-4 py-3 text-center font-bold">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black ${
                                            isPlayoffs ? 'bg-blue-500/20 text-blue-400' : (isPlayIn ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500')
                                        }`}>
                                            {team.posicao}
                                        </span>
                                    </td>

                                    {/* Nome da Equipa e Logo */}
                                    <td className="px-4 py-3 font-semibold text-white">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                                                <img src={team.logo_url} alt={team.nome_completo} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <span className="font-bold block group-hover:text-blue-400 transition">
                                                    {team.nome_completo}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    {team.divisao} • {team.sigla}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-3 py-3 text-center font-black text-white">{team.vitorias}</td>
                                    <td className="px-3 py-3 text-center font-semibold text-slate-400">{team.derrotas}</td>
                                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-200">
                                        {team.pct_vitorias != null && team.pct_vitorias !== '' ? `${Number(team.pct_vitorias).toFixed(1)}%` : '0.0%'}
                                    </td>
                                    <td className="px-3 py-3 text-center font-mono text-xs text-slate-400 hidden md:table-cell">{team.casa}</td>
                                    <td className="px-3 py-3 text-center font-mono text-xs text-slate-400 hidden md:table-cell">{team.fora}</td>
                                    <td className={`px-3 py-3 text-center font-mono text-xs font-bold ${
                                        team.saldo_pontos >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {team.saldo_pontos > 0 ? `+${team.saldo_pontos}` : team.saldo_pontos}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                                            streakWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {team.sequencia_atual}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all inline-block" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legenda */}
            <div className="flex items-center space-x-6 mt-3 text-xs text-slate-400">
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40 mr-1.5" /> 1-6 Vaga Direta Playoffs</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 mr-1.5" /> 7-10 Torneio Play-In</span>
            </div>
        </section>
    );
}

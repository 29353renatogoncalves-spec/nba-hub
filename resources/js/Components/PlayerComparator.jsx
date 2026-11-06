import React, { useState } from 'react';
import { GitCompare, Search, Trophy, Check, Zap, DollarSign, UserCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PlayerComparator({ players = [] }) {
    if (!players || players.length === 0) return null;

    // Jogadores padrão iniciais para comparação imediata (ex: Luka vs Shai)
    const defaultP1 = players.find(p => p.nome_completo.includes('Luka')) || players[0];
    const defaultP2 = players.find(p => p.nome_completo.includes('Shai') || p.nome_completo.includes('Edwards')) || players[1] || players[0];

    const [p1Id, setP1Id] = useState(defaultP1?.id);
    const [p2Id, setP2Id] = useState(defaultP2?.id);
    const [searchP1, setSearchP1] = useState('');
    const [searchP2, setSearchP2] = useState('');

    const player1 = players.find(p => p.id === Number(p1Id)) || defaultP1;
    const player2 = players.find(p => p.id === Number(p2Id)) || defaultP2;

    const filteredP1 = players.filter(p => p.nome_completo.toLowerCase().includes(searchP1.toLowerCase()) || p.equipa_sigla.toLowerCase().includes(searchP1.toLowerCase()));
    const filteredP2 = players.filter(p => p.nome_completo.toLowerCase().includes(searchP2.toLowerCase()) || p.equipa_sigla.toLowerCase().includes(searchP2.toLowerCase()));

    // Lista de métricas a comparar
    const metrics = [
        { label: 'Pontos / Jogo (PPG)', key: 'ppg', isPct: false },
        { label: 'Ressaltos / Jogo (RPG)', key: 'rpg', isPct: false },
        { label: 'Assistências / Jogo (APG)', key: 'apg', isPct: false },
        { label: 'Roubos / Jogo (SPG)', key: 'spg', isPct: false },
        { label: 'Desarmes / Jogo (BPG)', key: 'bpg', isPct: false },
        { label: 'Lançamentos de Campo (FG%)', key: 'fg_pct', isPct: true },
        { label: 'Triplos (3P%)', key: 'fg3_pct', isPct: true },
        { label: 'Lances Livres (FT%)', key: 'ft_pct', isPct: true },
        { label: 'Minutos / Jogo (MPG)', key: 'mpg', isPct: false },
    ];

    // Contagem de vitórias em cada categoria
    let p1Wins = 0;
    let p2Wins = 0;
    metrics.forEach(m => {
        const val1 = parseFloat(player1[m.key] || 0);
        const val2 = parseFloat(player2[m.key] || 0);
        if (val1 > val2) p1Wins++;
        else if (val2 > val1) p2Wins++;
    });

    return (
        <section id="comparador" className="mb-12 scroll-mt-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center">
                        <GitCompare className="w-6 h-6 mr-2.5 text-blue-500" />
                        Comparador Direto de Jogadores (*Head-to-Head*)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Compara qualquer atleta da NBA em atributos físicos, estatísticas avançadas e contrato.
                    </p>
                </div>

                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Confronto: {p1Wins > p2Wins ? `${player1.nome_completo} lidera` : (p2Wins > p1Wins ? `${player2.nome_completo} lidera` : 'Empate técnico')}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Seletores dos 2 Atletas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-800">
                    {/* Atleta 1 */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="mb-4">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1.5">
                                Selecionar Jogador 1:
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Procurar jogador 1 por nome ou equipa..."
                                    value={searchP1}
                                    onChange={(e) => setSearchP1(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {searchP1 && (
                                <div className="mt-2 max-h-40 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/60 scrollbar-thin z-20 relative">
                                    {filteredP1.slice(0, 8).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setP1Id(p.id); setSearchP1(''); }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between"
                                        >
                                            <span className="font-bold text-white truncate">{p.nome_completo}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{p.equipa_sigla} • #{p.numero_camisola}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Card Perfil Jogador 1 */}
                        <div className="flex items-center space-x-4 pt-2">
                            <Link href={`/jogadores/${player1.id}`} className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-end justify-center shadow-lg group hover:border-blue-500 transition">
                                <img src={player1.foto_url || '/images/players/placeholder.png'} alt={player1.nome_completo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </Link>
                            <div>
                                <Link href={`/jogadores/${player1.id}`} className="text-lg font-black text-white hover:text-blue-400 transition block truncate">
                                    {player1.nome_completo}
                                </Link>
                                <span className="text-xs text-blue-400 font-bold flex items-center space-x-1.5 mt-0.5">
                                    <img src={player1.equipa_logo} className="w-4 h-4 object-contain" />
                                    <span>{player1.equipa_nome}</span>
                                    <span className="text-slate-500">• #{player1.numero_camisola} • {player1.posicao}</span>
                                </span>
                                <div className="text-[11px] text-slate-400 mt-2 space-x-3">
                                    <span>Altura: <strong className="text-white">{player1.altura_metros}m</strong></span>
                                    <span>Peso: <strong className="text-white">{Math.round(player1.peso_kg)}kg</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Atleta 2 */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="mb-4">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1.5">
                                Selecionar Jogador 2:
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Procurar jogador 2 por nome ou equipa..."
                                    value={searchP2}
                                    onChange={(e) => setSearchP2(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {searchP2 && (
                                <div className="mt-2 max-h-40 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/60 scrollbar-thin z-20 relative">
                                    {filteredP2.slice(0, 8).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setP2Id(p.id); setSearchP2(''); }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between"
                                        >
                                            <span className="font-bold text-white truncate">{p.nome_completo}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{p.equipa_sigla} • #{p.numero_camisola}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Card Perfil Jogador 2 */}
                        <div className="flex items-center space-x-4 pt-2">
                            <Link href={`/jogadores/${player2.id}`} className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-end justify-center shadow-lg group hover:border-blue-500 transition">
                                <img src={player2.foto_url || '/images/players/placeholder.png'} alt={player2.nome_completo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </Link>
                            <div>
                                <Link href={`/jogadores/${player2.id}`} className="text-lg font-black text-white hover:text-blue-400 transition block truncate">
                                    {player2.nome_completo}
                                </Link>
                                <span className="text-xs text-blue-400 font-bold flex items-center space-x-1.5 mt-0.5">
                                    <img src={player2.equipa_logo} className="w-4 h-4 object-contain" />
                                    <span>{player2.equipa_nome}</span>
                                    <span className="text-slate-500">• #{player2.numero_camisola} • {player2.posicao}</span>
                                </span>
                                <div className="text-[11px] text-slate-400 mt-2 space-x-3">
                                    <span>Altura: <strong className="text-white">{player2.altura_metros}m</strong></span>
                                    <span>Peso: <strong className="text-white">{Math.round(player2.peso_kg)}kg</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela Visual de Comparação com Barras de Desempenho */}
                <div className="mt-8 space-y-5">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400 px-2">
                        <span className="text-blue-400">{player1.nome_completo} ({p1Wins} vitórias)</span>
                        <span>Métrica Comparativa</span>
                        <span className="text-blue-400">{player2.nome_completo} ({p2Wins} vitórias)</span>
                    </div>

                    {metrics.map((m) => {
                        const val1 = parseFloat(player1[m.key] || 0);
                        const val2 = parseFloat(player2[m.key] || 0);
                        const isP1Higher = val1 > val2;
                        const isP2Higher = val2 > val1;
                        const sum = (val1 + val2) || 1;
                        const p1Percent = (val1 / sum) * 100;
                        const p2Percent = (val2 / sum) * 100;

                        return (
                            <div key={m.key} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                                <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                                    <div className="flex items-center space-x-2">
                                        {isP1Higher && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                                        <span className={`text-base font-black ${isP1Higher ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {val1}{m.isPct ? '%' : ''}
                                        </span>
                                    </div>
                                    <span className="font-sans text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                                        {m.label}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-base font-black ${isP2Higher ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {val2}{m.isPct ? '%' : ''}
                                        </span>
                                        {isP2Higher && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                                    </div>
                                </div>

                                {/* Barra de Proporção Lado a Lado */}
                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                                    <div 
                                        className={`h-full transition-all duration-300 ${isP1Higher ? 'bg-blue-500' : 'bg-slate-700'}`}
                                        style={{ width: `${p1Percent}%` }}
                                    />
                                    <div 
                                        className={`h-full transition-all duration-300 ${isP2Higher ? 'bg-blue-500' : 'bg-slate-700'}`}
                                        style={{ width: `${p2Percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

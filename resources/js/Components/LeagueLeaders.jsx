import React, { useState } from 'react';
import { Trophy, Flame, Award, ChevronRight, Target } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function LeagueLeaders({ leaders = {}, onSelectTeam }) {
    const [activeTab, setActiveTab] = useState('pontos');

    const categories = [
        { key: 'pontos', label: 'Pontos (PPG)', statLabel: 'PPG', icon: Flame, color: 'text-amber-400' },
        { key: 'assistencias', label: 'Assistências (APG)', statLabel: 'APG', icon: Award, color: 'text-blue-400' },
        { key: 'ressaltos', label: 'Ressaltos (RPG)', statLabel: 'RPG', icon: Trophy, color: 'text-emerald-400' },
        { key: 'roubos', label: 'Roubos (SPG)', statLabel: 'SPG', icon: Target, color: 'text-purple-400' },
        { key: 'desarmes', label: 'Desarmes (BPG)', statLabel: 'BPG', icon: Award, color: 'text-rose-400' },
        { key: 'fg3_pct', label: 'Triplos % (3P%)', statLabel: '3P%', icon: Flame, color: 'text-cyan-400' },
    ];

    const currentLeaders = leaders[activeTab] || [];
    const topPlayer = currentLeaders[0] || null;
    const runnersUp = currentLeaders.slice(1);
    const activeCatInfo = categories.find(c => c.key === activeTab);

    if (!currentLeaders || currentLeaders.length === 0) return null;

    return (
        <section id="lideres" className="mb-12 scroll-mt-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center">
                        <Trophy className="w-6 h-6 mr-2.5 text-amber-400" />
                        Líderes Estatísticos da Liga
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Os melhores atletas da NBA nas principais métricas individuais da temporada.
                    </p>
                </div>
            </div>

            {/* Abas das Categorias */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeTab === cat.key;
                    return (
                        <button
                            key={cat.key}
                            onClick={() => setActiveTab(cat.key)}
                            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Painel do Top 1 e Seguintes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Atleta Número 1 em Destaque (Card Hero) */}
                {topPlayer && (
                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        {/* Glow de fundo */}
                        <div 
                            className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none"
                            style={{ backgroundColor: topPlayer.equipa_cor || '#1D428A' }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase tracking-wider border border-amber-500/20">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>Líder da NBA • 1.º Lugar</span>
                                </span>
                                <div 
                                    className="flex items-center space-x-1.5 cursor-pointer group"
                                    onClick={() => onSelectTeam && onSelectTeam(topPlayer.equipa_sigla)}
                                >
                                    <img src={topPlayer.equipa_logo} alt={topPlayer.equipa_nome} className="w-5 h-5 object-contain" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition">{topPlayer.equipa_sigla}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-5 py-6">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-xl flex-shrink-0 flex items-end justify-center">
                                    <img 
                                        src={topPlayer.foto_url || '/images/players/placeholder.png'} 
                                        alt={topPlayer.nome_completo}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <Link 
                                        href={`/jogadores/${topPlayer.jogador_id}`}
                                        className="text-xl sm:text-2xl font-black text-white hover:text-blue-400 transition block leading-tight"
                                    >
                                        {topPlayer.nome_completo}
                                    </Link>
                                    <span className="text-xs font-semibold text-slate-400 block mt-1">
                                        {topPlayer.equipa_nome} • {topPlayer.posicao}
                                    </span>
                                    <div className="mt-3 flex items-baseline space-x-2">
                                        <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                                            {topPlayer.valor}{activeTab === 'fg3_pct' ? '%' : ''}
                                        </span>
                                        <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                                            {activeCatInfo?.statLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>Jogos Disputados: <strong className="text-white font-mono">{topPlayer.jogos_disputados || 1}</strong></span>
                            <Link
                                href={`/jogadores/${topPlayer.jogador_id}`}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                            >
                                <span>Ver Perfil Completo</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Lista do 2.º ao 5.º Lugar */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            <span>Top 5 Perseguidores</span>
                            <span>Média Oficial</span>
                        </div>

                        <div className="space-y-2.5">
                            {runnersUp.map((player, idx) => {
                                const rank = idx + 2;
                                return (
                                    <div
                                        key={player.jogador_id}
                                        className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition-all group"
                                    >
                                        <div className="flex items-center space-x-3.5">
                                            <span className="w-6 text-center font-mono font-black text-slate-500 text-sm group-hover:text-blue-400 transition">
                                                #{rank}
                                            </span>
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-end justify-center flex-shrink-0">
                                                <img 
                                                    src={player.foto_url || '/images/players/placeholder.png'} 
                                                    alt={player.nome_completo}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <Link 
                                                    href={`/jogadores/${player.jogador_id}`}
                                                    className="text-sm font-bold text-white group-hover:text-blue-400 transition block truncate max-w-[180px] sm:max-w-xs"
                                                >
                                                    {player.nome_completo}
                                                </Link>
                                                <span className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                                                    <img src={player.equipa_logo} alt={player.equipa_sigla} className="w-3.5 h-3.5 object-contain inline" />
                                                    <span>{player.equipa_sigla}</span>
                                                    <span className="text-slate-600">•</span>
                                                    <span>{player.posicao}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right flex items-baseline space-x-1.5 font-mono">
                                            <span className="text-lg font-black text-white">
                                                {player.valor}{activeTab === 'fg3_pct' ? '%' : ''}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {activeCatInfo?.statLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center">
                        Métricas calculadas em tempo real com base nas atuações da época.
                    </div>
                </div>
            </div>
        </section>
    );
}

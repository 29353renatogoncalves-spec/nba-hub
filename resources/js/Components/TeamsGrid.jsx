import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Search, Shield, Users } from 'lucide-react';

export default function TeamsGrid({ teams = [], onSelectTeam }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterConf, setFilterConf] = useState('todas');

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              team.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              team.cidade.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesConf = filterConf === 'todas' || team.conferencia === filterConf;
        return matchesSearch && matchesConf;
    });

    return (
        <section id="equipas" className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center">
                        <Shield className="w-7 h-7 mr-3 text-blue-500" />
                        As 30 Franquias da NBA
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Abre o plantel rápido no painel lateral ou entra na ficha completa da franquia.
                    </p>
                </div>

                {/* Filtros e Pesquisa */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar franquia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
                        />
                    </div>

                    <select
                        value={filterConf}
                        onChange={(e) => setFilterConf(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="todas">Todas as Conferências</option>
                        <option value="Este">Conferência Este</option>
                        <option value="Oeste">Conferência Oeste</option>
                    </select>
                </div>
            </div>

            {/* Grelha de Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredTeams.map((team) => (
                    <div
                        key={team.id}
                        onClick={() => onSelectTeam && onSelectTeam(team.sigla)}
                        className="group relative bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 overflow-hidden flex flex-col justify-between"
                    >
                        {/* Indicador de cor da equipa */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: team.cor_primaria || '#1D428A' }}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-3 pt-1">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                    {team.sigla}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">
                                    {team.conferencia}
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto my-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <img src={team.logo_url} alt={team.nome_completo} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                            </div>

                            <h3 className="text-center font-black text-sm text-white group-hover:text-blue-400 transition mt-2 truncate">
                                {team.nome_completo}
                            </h3>
                            <p className="text-center text-[11px] text-slate-500 truncate">
                                {team.arena?.nome || team.cidade}
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center text-slate-400">
                                <Users className="w-3 h-3 mr-1 text-slate-500" />
                                {team.jogadores?.length || 8} Atletas
                            </span>
                            <Link
                                href={`/equipas/${team.sigla}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-400 font-bold group-hover:underline text-[10px] uppercase"
                            >
                                Ficha completa →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

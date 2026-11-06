import React from 'react';
import { motion } from 'framer-motion';
import { Tv, MapPin, Radio, Calendar, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function HeroBanner({ game, onSelectTeam }) {
    if (!game) return null;

    const isLive = game.estado === 'em_direto';

    return (
        <section id="hero-live" className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 mb-12">
            {/* Background com luzes dinâmicas */}
            <div 
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: game.equipa_casa_cor || '#1D428A' }}
            />
            <div 
                className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: game.equipa_fora_cor || '#C8102E' }}
            />

            <div className="relative z-10">
                {/* Cabeçalho do Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                        {isLive ? (
                            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider border border-red-500/30">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                <span>Ao Vivo • {game.periodo_atual || 'Q4'} {game.tempo_restante}</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Jogo em Destaque</span>
                            </span>
                        )}
                        <span className="text-slate-400 text-xs flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{game.arena_nome} • {game.arena_cidade}</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Tv className="w-4 h-4 text-slate-400" />
                        <span>{game.canal_tv || 'NBA League Pass'}</span>
                    </div>
                </div>

                {/* Scoreboard Principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 py-8">
                    {/* Equipa Casa */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onSelectTeam && onSelectTeam(game.equipa_casa_sigla)}
                        className="flex items-center justify-start md:justify-end space-x-6 cursor-pointer group"
                    >
                        <div className="text-left md:text-right">
                            <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-400 transition">
                                {game.equipa_casa_nome}
                            </h3>
                            <span className="text-sm font-bold text-slate-400 tracking-wider">
                                CASA • {game.equipa_casa_sigla}
                            </span>
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-slate-700 transition">
                            <img src={game.equipa_casa_logo} alt={game.equipa_casa_nome} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                        </div>
                    </motion.div>

                    {/* Placar Central */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-6 bg-slate-950/90 px-8 py-4 rounded-2xl border border-slate-800 shadow-xl">
                            <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                                {game.pontos_casa ?? '--'}
                            </span>
                            <span className="text-slate-600 text-3xl font-light">:</span>
                            <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                                {game.pontos_fora ?? '--'}
                            </span>
                        </div>
                        <span className="mt-3 text-xs uppercase font-extrabold tracking-widest text-slate-400">
                            {game.estado === 'concluido' ? 'Final da Partida' : (isLive ? 'Em Andamento' : 'Agendado')}
                        </span>
                        {game.id && (
                            <Link
                                href={`/jogos/${game.id}`}
                                className="mt-3 inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-500 text-blue-200 hover:text-white text-xs font-bold transition shadow-md shadow-blue-950/40"
                            >
                                <span>Ver Box Score & Estatísticas</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>

                    {/* Equipa Fora */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onSelectTeam && onSelectTeam(game.equipa_fora_sigla)}
                        className="flex items-center justify-start space-x-6 cursor-pointer group"
                    >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-slate-700 transition">
                            <img src={game.equipa_fora_logo} alt={game.equipa_fora_nome} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition">
                                {game.equipa_fora_nome}
                            </h3>
                            <span className="text-sm font-bold text-slate-400 tracking-wider">
                                FORA • {game.equipa_fora_sigla}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Award, DollarSign, Shield, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function TeamDrawer({ team, isOpen, onClose }) {
    // Fechar com tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!team) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop escuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Painel Lateral Deslizante */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white"
                    >
                        {/* Faixa com cor primária da equipa */}
                        <div className="h-2 w-full" style={{ backgroundColor: team.cor_primaria || '#1D428A' }} />

                        {/* Topo do Drawer */}
                        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                                    <img src={team.logo_url} alt={team.nome_completo} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {team.conferencia} • {team.divisao}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">
                                            Fundado em {team.ano_fundacao}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white">{team.nome_completo}</h2>
                                    <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-slate-500" /> {team.arena?.nome || team.cidade}</span>
                                        <span>•</span>
                                        <span>Treinador: <strong className="text-slate-300">{team.treinador_principal}</strong></span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/equipas/${team.sigla}`}
                                    className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                                >
                                    Ficha completa
                                </Link>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                title="Fechar (ESC)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            </div>
                        </div>

                        {/* Conteúdo com os 8 Atletas Oficiais */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2">
                                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                                    Plantel Oficial ({team.jogadores?.length || 0} Atletas)
                                </h3>
                                <span className="text-xs text-slate-500 font-semibold">Temporada 2026/2027 (Plantel Oficial)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {team.jogadores && team.jogadores.map((jogador) => {
                                    const numero = jogador.pivot?.numero_camisola ?? jogador.numero_camisola;
                                    const salario = Number(jogador.pivot?.salario_anual_usd || 0);
                                    const salarioFormatado = salario > 0 ? `$${(salario / 1000000).toFixed(1)}M/ano` : 'Rookie';

                                    return (
                                        <Link
                                            key={jogador.id}
                                            href={`/jogadores/${jogador.id}`}
                                            className="group p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition flex items-center space-x-3.5 shadow-sm hover:shadow-md cursor-pointer relative"
                                            title="Ver Perfil Completo e Estatísticas"
                                        >
                                            {/* Foto oficial do jogador */}
                                            <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <img
                                                    src={jogador.foto_url}
                                                    alt={jogador.nome_completo}
                                                    className="w-full h-full object-cover object-top"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e293b"/><circle cx="50" cy="40" r="22" fill="%23475569"/><path d="M20 90 C20 65 80 65 80 90 Z" fill="%23475569"/><text x="50" y="46" font-family="sans-serif" font-weight="900" font-size="16" fill="%2394a3b8" text-anchor="middle">${encodeURIComponent(jogador.posicao_primaria || 'NBA')}</text></svg>`;
                                                    }}
                                                />
                                                <span className="absolute bottom-0 right-0 bg-slate-950/90 text-white font-black text-[10px] px-1 rounded-tl">
                                                    #{numero}
                                                </span>
                                            </div>

                                            {/* Dados e Estatísticas */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="text-xs font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                                                        {jogador.posicao_primaria}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition">
                                                        {jogador.nome_completo}
                                                    </h4>
                                                </div>

                                                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                                                    <span>{jogador.altura_metros}m</span>
                                                    <span>•</span>
                                                    <span>{jogador.peso_kg}kg</span>
                                                    <span>•</span>
                                                    <span className="text-slate-500">{jogador.nacionalidade}</span>
                                                </div>

                                                <div className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-3 h-3 mr-0.5" />
                                                        <span>{salarioFormatado}</span>
                                                    </div>
                                                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                        Perfil <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Informações da Arena */}
                            {team.arena && (
                                <div className="mt-8 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                                        <Award className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                                        Instalações Oficiais
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-slate-500 block">Pavilhão Principal</span>
                                            <span className="font-semibold text-white">{team.arena.nome}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Capacidade Oficial</span>
                                            <span className="font-semibold text-white">{Number(team.arena.capacidade).toLocaleString()} espectadores</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

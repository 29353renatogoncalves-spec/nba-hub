import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import NbaLeafletMap from '@/Components/NbaLeafletMap';
import { MapPin, Search, Compass, Users, Calendar, Trophy, ArrowRight, X, ExternalLink, Shield, Building2 } from 'lucide-react';

export default function Arenas({ auth, arenas = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConference, setSelectedConference] = useState('todas'); // 'todas' | 'Este' | 'Oeste'
    const [selectedDivision, setSelectedDivision] = useState('todas');
    const [selectedArena, setSelectedArena] = useState(null);
    const [hoveredArena, setHoveredArena] = useState(null);

    // Filtragem das 30 arenas
    const filteredArenas = useMemo(() => {
        return arenas.filter((arena) => {
            const matchesConf = selectedConference === 'todas' || arena.equipa?.conferencia === selectedConference;
            const matchesDiv = selectedDivision === 'todas' || arena.equipa?.divisao === selectedDivision;
            
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                arena.nome.toLowerCase().includes(q) ||
                arena.cidade.toLowerCase().includes(q) ||
                arena.estado.toLowerCase().includes(q) ||
                (arena.equipa?.nome_completo && arena.equipa.nome_completo.toLowerCase().includes(q)) ||
                (arena.equipa?.sigla && arena.equipa.sigla.toLowerCase().includes(q));

            return matchesConf && matchesDiv && matchesSearch;
        });
    }, [arenas, selectedConference, selectedDivision, searchQuery]);

    // Arenas para o mapa (se houver filtro, destaca as filtradas)
    const activeArena = selectedArena || hoveredArena;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Mapa Interativo das Arenas da NBA - Estádios Oficiais" />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header da Página */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
                        <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                        <span>Geografia da NBA • 30 Franquias Oficiais</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Mapa Interativo das Arenas da NBA
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2">
                        Explora a localização exata, capacidade, fotografias e estádios lendários de todas as 30 equipas nos Estados Unidos e Canadá.
                    </p>
                </div>

                {/* Barra de Filtros e Pesquisa */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 mb-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                        {/* Campo de Pesquisa */}
                        <div className="md:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar por arena, cidade ou equipa..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                            />
                        </div>

                        {/* Filtro por Conferência */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedConference}
                                onChange={(e) => {
                                    setSelectedConference(e.target.value);
                                    setSelectedDivision('todas');
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                            >
                                <option value="todas">Todas as Conferências</option>
                                <option value="Este">Conferência Este (15 Arenas)</option>
                                <option value="Oeste">Conferência Oeste (15 Arenas)</option>
                            </select>
                        </div>

                        {/* Filtro por Divisão */}
                        <div className="md:col-span-4">
                            <select
                                value={selectedDivision}
                                onChange={(e) => setSelectedDivision(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                            >
                                <option value="todas">Todas as Divisões</option>
                                <option value="Atlantic">Divisão Atlântico</option>
                                <option value="Central">Divisão Central</option>
                                <option value="Southeast">Divisão Sudeste</option>
                                <option value="Northwest">Divisão Noroeste</option>
                                <option value="Pacific">Divisão Pacífico</option>
                                <option value="Southwest">Divisão Sudoeste</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MAPA GEOGRÁFICO INTERATIVO REAL (LEAFLET / GOOGLE MAPS) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 mb-12 shadow-2xl">
                    {/* Header do Mapa com Controles */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2 mb-4">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            <div>
                                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
                                    Mapa Interativo Oficial • GPS Real das 30 Arenas
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Navegação estilo Google Maps com zoom em tempo real, ruas, fotos aéreas e satélite.
                                </p>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                            Arenas no mapa: <strong className="text-emerald-400">{filteredArenas.length}</strong> / 30
                        </span>
                    </div>

                    {/* Componente Leaflet Real com Camadas Street / Satellite / Dark */}
                    <NbaLeafletMap
                        arenas={filteredArenas}
                        selectedArena={selectedArena}
                        onSelectArena={(arena) => setSelectedArena(arena)}
                    />
                </div>

                {/* GALERIA COMPLETA DAS 30 ARENAS */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                                <Building2 className="w-6 h-6 text-emerald-400" />
                                <span>Lista das Arenas da NBA ({filteredArenas.length})</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Clica em qualquer estádio para ver os detalhes completos, localização e equipa.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArenas.map((arena) => (
                            <div
                                key={arena.id}
                                id={`arena-card-${arena.id}`}
                                onClick={() => {
                                    setSelectedArena(arena);
                                    window.scrollTo({ top: 180, behavior: 'smooth' });
                                }}
                                className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-between ${
                                    selectedArena?.id === arena.id
                                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                        : 'border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div>
                                    {/* Imagem da Arena com Overlay */}
                                    <div className="relative h-44 overflow-hidden bg-slate-950">
                                        <img
                                            src={arena.photo_url}
                                            alt={arena.nome}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                                        {/* Badge da Capacidade */}
                                        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase text-white flex items-center space-x-1">
                                            <Users className="w-3 h-3 text-emerald-400" />
                                            <span>{arena.capacidade.toLocaleString()} lugares</span>
                                        </div>

                                        {/* Logo da Equipa */}
                                        <div className="absolute bottom-3 left-4 flex items-center space-x-3">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-950/90 border border-slate-800 p-1 flex items-center justify-center shadow-lg">
                                                <img src={arena.equipa?.logo_url} className="w-9 h-9 object-contain" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-blue-400 font-black uppercase block">
                                                    {arena.equipa?.nome_completo}
                                                </span>
                                                <h3 className="text-sm font-black text-white leading-tight">
                                                    {arena.nome}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalhes da Arena */}
                                    <div className="p-4 space-y-2 text-xs">
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="flex items-center space-x-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Localização:</span>
                                            </span>
                                            <strong className="text-white">{arena.cidade}, {arena.estado}</strong>
                                        </div>

                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="flex items-center space-x-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Inaugurado em:</span>
                                            </span>
                                            <strong className="text-white">{arena.ano_inauguracao}</strong>
                                        </div>

                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="flex items-center space-x-1">
                                                <Shield className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Conferência:</span>
                                            </span>
                                            <strong className="text-white">{arena.equipa?.conferencia} ({arena.equipa?.divisao})</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Rodapé do Card com Ações */}
                                <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                                    <span className="text-blue-400 group-hover:text-blue-300 flex items-center space-x-1">
                                        <span>Focar no Mapa</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                            arena.nome + ' ' + arena.cidade + ' ' + (arena.equipa?.nome_completo || '')
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px] hover:underline"
                                    >
                                        <span>Google Maps</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

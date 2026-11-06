import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Trophy,
    Flame,
    CalendarDays,
    BarChart3,
    Shield,
    User,
    LogIn,
    Calendar,
    GitCompare,
    Heart,
    LogOut,
    MapPin,
    Coins,
    ChevronDown,
    Menu,
    X,
} from 'lucide-react';

export default function Navbar({ auth }) {
    const { url = '' } = usePage() || {};
    const [moreOpen, setMoreOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fechar menus ao mudar de rota
    useEffect(() => {
        setMoreOpen(false);
        setMobileOpen(false);
    }, [url]);

    const isPathActive = (path) => url.startsWith(path);

    return (
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
            {/* Linha de acento oficial NBA */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-white to-red-600 w-full" />

            <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-2">
                {/* Logo & Marca */}
                <Link href="/" className="flex items-center space-x-2.5 group shrink-0 mr-2 xl:mr-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-600 to-red-600 flex items-center justify-center font-black text-lg italic tracking-tighter shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                        NBA
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm sm:text-base tracking-wide uppercase text-white leading-tight">
                            League Manager
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
                            Pro Hub & Live
                        </span>
                    </div>
                </Link>

                {/* Navegação Desktop Desafogada */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold">
                    <Link
                        href="/#minha-nba"
                        className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center space-x-1.5 transition-colors"
                    >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                        <span>Minha NBA</span>
                    </Link>

                    <Link
                        href="/#jogos"
                        className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center space-x-1.5 transition-colors"
                    >
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Jogos</span>
                    </Link>

                    <Link
                        href="/#classificacao"
                        className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center space-x-1.5 transition-colors"
                    >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Classificação</span>
                    </Link>

                    <Link
                        href="/#lideres"
                        className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center space-x-1.5 transition-colors"
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Líderes</span>
                    </Link>

                    <Link
                        href="/#playoffs"
                        className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center space-x-1.5 transition-colors"
                    >
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                        <span>Playoffs</span>
                    </Link>

                    {/* Destaque Especial: Apostas */}
                    <Link
                        href="/apostas"
                        className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all font-bold ${
                            isPathActive('/apostas')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent'
                        }`}
                    >
                        <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>Apostas</span>
                    </Link>

                    {/* Dropdown "Mais" para manter a barra limpa e sem amontoar */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setMoreOpen(!moreOpen)}
                            className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors ${
                                moreOpen || isPathActive('/arenas') || isPathActive('/calendario')
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                            }`}
                        >
                            <span>Mais</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    moreOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'
                                }`}
                            />
                        </button>

                        {moreOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-slate-800 shadow-2xl py-2 z-50">
                                <Link
                                    href="/arenas"
                                    className={`flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                                        isPathActive('/arenas')
                                            ? 'text-emerald-400 bg-slate-800/80'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                    }`}
                                >
                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                    <span>Arenas & Mapa</span>
                                </Link>

                                <Link
                                    href="/calendario"
                                    className={`flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                                        isPathActive('/calendario')
                                            ? 'text-sky-400 bg-slate-800/80'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                    }`}
                                >
                                    <CalendarDays className="w-4 h-4 text-sky-400" />
                                    <span>Calendário Completo</span>
                                </Link>

                                <Link
                                    href="/#comparador"
                                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                                >
                                    <GitCompare className="w-4 h-4 text-purple-400" />
                                    <span>Comparador</span>
                                </Link>

                                <Link
                                    href="/#equipas"
                                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                                >
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    <span>Franquias (Equipas)</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Auth Area & Mobile Toggle */}
                <div className="flex items-center space-x-2 shrink-0">
                    {auth?.user ? (
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold border border-slate-800 transition group"
                                title="Meu Perfil"
                            >
                                {auth.user.avatar_url ? (
                                    <img
                                        src={auth.user.avatar_url}
                                        alt={auth.user.name}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-700"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <User className="w-4 h-4 text-blue-400" />
                                )}
                                <span className="max-w-[100px] truncate group-hover:text-blue-400 transition">
                                    {auth.user.name}
                                </span>
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                                title="Terminar sessão"
                            >
                                <LogOut className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <Link
                                href={route('login')}
                                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Entrar</span>
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-black shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5 whitespace-nowrap"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    )}

                    {/* Botão Hambúrguer Mobile */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
                        aria-label="Abrir menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Menu Mobile / Tablet Retrátil */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/98 px-4 pt-3 pb-5 space-y-1 animate-in slide-in-from-top-4 duration-200">
                    <Link
                        href="/#minha-nba"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                        <span>Minha NBA</span>
                    </Link>
                    <Link
                        href="/#jogos"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>Jogos</span>
                    </Link>
                    <Link
                        href="/#classificacao"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Classificação</span>
                    </Link>
                    <Link
                        href="/#lideres"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        <span>Líderes</span>
                    </Link>
                    <Link
                        href="/#playoffs"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                        <Flame className="w-4 h-4 text-red-500" />
                        <span>Playoffs</span>
                    </Link>
                    <Link
                        href="/apostas"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    >
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>Apostas NBA Coins</span>
                    </Link>
                    <div className="pt-2 border-t border-slate-900 my-1 grid grid-cols-2 gap-1">
                        <Link
                            href="/arenas"
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                        >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Arenas</span>
                        </Link>
                        <Link
                            href="/calendario"
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                        >
                            <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                            <span>Calendário</span>
                        </Link>
                        <Link
                            href="/#comparador"
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                        >
                            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                            <span>Comparador</span>
                        </Link>
                        <Link
                            href="/#equipas"
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                        >
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            <span>Franquias</span>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

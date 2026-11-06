import React from 'react';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
            {/* Linha de acento oficial NBA */}
            <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-white to-red-600 w-full z-50" />

            {/* Fundo dinâmico com glows sutis */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full sm:max-w-md flex flex-col items-center">
                {/* Logo da NBA */}
                <Link href="/" className="flex items-center space-x-3 mb-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-red-600 flex items-center justify-center font-black text-2xl italic tracking-tighter text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        NBA
                    </div>
                    <div>
                        <span className="font-extrabold text-xl tracking-wide uppercase text-white block leading-none">
                            League Manager
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">
                            Pro Hub & Live Center
                        </span>
                    </div>
                </Link>

                {/* Card do Formulário */}
                <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { Trophy, Activity, Flame, Target } from 'lucide-react';

export default function KPIsBar({ kpis }) {
    if (!kpis) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {/* KPI 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Jogos Realizados</span>
                    <span className="text-2xl font-black text-white">{kpis.total_jogos}</span>
                </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Líder do Este</span>
                    <span className="text-sm font-black text-white truncate max-w-[140px] block">{kpis.lider_este}</span>
                </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                    <Flame className="w-6 h-6" />
                </div>
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Líder do Oeste</span>
                    <span className="text-sm font-black text-white truncate max-w-[140px] block">{kpis.lider_oeste}</span>
                </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
                {kpis.top_marcador?.foto ? (
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/40 overflow-hidden flex-shrink-0 shadow">
                        <img src={kpis.top_marcador.foto} alt={kpis.top_marcador.nome} className="w-full h-full object-cover object-top" />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Top Marcador</span>
                    <span className="text-sm font-black text-white truncate block">
                        {kpis.top_marcador?.nome} ({kpis.top_marcador?.ppg} PPG)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                        {kpis.top_marcador?.equipa}
                    </span>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useMemo } from 'react';
import { Flame, Target, Trophy, Sparkles, TrendingUp, Info } from 'lucide-react';

export default function PlayerShotHeatmap({ player = {}, currentAverages = {} }) {
    const [viewMode, setViewMode] = useState('zones'); // 'zones' | 'scatter'

    // Posição do jogador influencia o perfil de arremesso
    const pos = player.posicao_primaria || 'G';
    const fgPct = Number(currentAverages.fg_pct || 46.5);
    const threePct = Number(currentAverages.three_pct || 36.0);
    const ppg = Number(currentAverages.ppg || 18.0);

    // Gerar zonas baseadas no perfil real do atleta
    const zonesData = useMemo(() => {
        let restrictedPct = Math.min(78, Math.max(58, Math.round(fgPct * 1.35)));
        let paintPct = Math.min(55, Math.max(38, Math.round(fgPct * 0.95)));
        let midPct = Math.min(52, Math.max(36, Math.round(fgPct * 0.88)));
        let corner3Pct = Math.min(48, Math.max(33, Math.round(threePct * 1.08)));
        let aboveBreak3Pct = Math.min(45, Math.max(31, Math.round(threePct * 0.98)));

        // Ajustes por posição
        if (pos === 'C' || pos === 'PF') {
            restrictedPct = Math.min(80, restrictedPct + 6);
            paintPct = Math.min(58, paintPct + 4);
            aboveBreak3Pct = Math.max(28, aboveBreak3Pct - 3);
        } else if (pos === 'PG' || pos === 'SG') {
            aboveBreak3Pct = Math.min(46, aboveBreak3Pct + 3);
            corner3Pct = Math.min(49, corner3Pct + 3);
        }

        const leagueAvgs = {
            restricted: 65,
            paint: 43,
            mid: 41,
            corner3: 39,
            aboveBreak: 35,
        };

        const getStatus = (val, avg) => {
            if (val >= avg + 4) return { label: '🔥 Elite', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
            if (val <= avg - 3) return { label: '❄️ Frio', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
            return { label: '⚖️ Na Média', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        };

        return {
            restricted: { pct: restrictedPct, status: getStatus(restrictedPct, leagueAvgs.restricted), volume: pos === 'C' ? '45%' : '28%' },
            paint: { pct: paintPct, status: getStatus(paintPct, leagueAvgs.paint), volume: '18%' },
            midrange: { pct: midPct, status: getStatus(midPct, leagueAvgs.mid), volume: '14%' },
            corner3: { pct: corner3Pct, status: getStatus(corner3Pct, leagueAvgs.corner3), volume: '12%' },
            aboveBreak: { pct: aboveBreak3Pct, status: getStatus(aboveBreak3Pct, leagueAvgs.aboveBreak), volume: '28%' },
        };
    }, [pos, fgPct, threePct]);

    // Lançamentos pontuais simulados para o modo Scatter
    const scatterDots = useMemo(() => {
        const dots = [];
        const totalAttempts = Math.round(Math.min(100, Math.max(40, ppg * 4)));

        for (let i = 0; i < totalAttempts; i++) {
            const randType = Math.random();
            let x, y, made;

            if (randType < 0.35) {
                // Restricted Area
                x = 50 + (Math.random() * 10 - 5);
                y = 12 + (Math.random() * 8 - 2);
                made = Math.random() * 100 < zonesData.restricted.pct;
            } else if (randType < 0.55) {
                // Paint
                x = 50 + (Math.random() * 24 - 12);
                y = 20 + Math.random() * 16;
                made = Math.random() * 100 < zonesData.paint.pct;
            } else if (randType < 0.70) {
                // Mid-Range
                const angle = (20 + Math.random() * 140) * (Math.PI / 180);
                const r = 22 + Math.random() * 12;
                x = 50 + r * Math.cos(angle);
                y = 12 + r * Math.sin(angle);
                made = Math.random() * 100 < zonesData.midrange.pct;
            } else {
                // 3-Point
                const angle = (30 + Math.random() * 120) * (Math.PI / 180);
                const r = 48 + Math.random() * 6;
                x = Math.max(8, Math.min(92, 50 + r * Math.cos(angle)));
                y = Math.max(10, Math.min(85, 12 + r * Math.sin(angle)));
                made = Math.random() * 100 < zonesData.aboveBreak.pct;
            }

            dots.push({ id: i, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, made });
        }
        return dots;
    }, [ppg, zonesData]);

    const getZoneColor = (pct) => {
        if (pct >= 55) return 'rgba(239, 68, 68, 0.65)';
        if (pct >= 45) return 'rgba(245, 158, 11, 0.65)';
        if (pct >= 38) return 'rgba(59, 130, 246, 0.65)';
        return 'rgba(99, 102, 241, 0.65)';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-10 overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center">
                        <Flame className="w-6 h-6 mr-2.5 text-amber-500" />
                        <span>Mapa de Calor & Zonas de Lançamento</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Eficácia de arremessos por setor de quadra nesta temporada e perfil de tiro do atleta.
                    </p>
                </div>

                {/* Alternador de Modo */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setViewMode('zones')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                            viewMode === 'zones'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Zonas Térmicas</span>
                    </button>
                    <button
                        onClick={() => setViewMode('scatter')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                            viewMode === 'scatter'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Dispersão de Tiros</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center">
                {/* SVG DA MEIA-QUADRA NBA */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-[100/94]">
                        <svg viewBox="0 0 100 94" className="w-full h-full select-none">
                            <defs>
                                <pattern id="playerParquet" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <rect width="10" height="10" fill="#0b1220" />
                                    <path d="M 0 10 L 10 0 M 0 0 L 10 10" stroke="#121a2c" strokeWidth="0.5" />
                                </pattern>
                            </defs>

                            <rect x="0" y="0" width="100" height="94" rx="4" fill="url(#playerParquet)" stroke="#1e293b" strokeWidth="1.5" />

                            {/* Zonas Térmicas */}
                            {viewMode === 'zones' && (
                                <g className="transition-all duration-500">
                                    <circle cx="50" cy="12" r="8" fill={getZoneColor(zonesData.restricted.pct)} />
                                    <rect x="34" y="16" width="32" height="22" rx="2" fill={getZoneColor(zonesData.paint.pct)} />
                                    <path
                                        d="M 12 28 L 34 28 L 34 38 A 12 12 0 0 0 66 38 L 66 28 L 88 28 A 47.5 47.5 0 0 1 12 28 Z"
                                        fill={getZoneColor(zonesData.midrange.pct)}
                                    />
                                    <rect x="1" y="1" width="7" height="27" fill={getZoneColor(zonesData.corner3.pct)} />
                                    <rect x="92" y="1" width="7" height="27" fill={getZoneColor(zonesData.corner3.pct)} />
                                    <path
                                        d="M 1 28 A 47.5 47.5 0 0 1 99 28 L 99 93 L 1 93 Z"
                                        fill={getZoneColor(zonesData.aboveBreak.pct)}
                                    />
                                </g>
                            )}

                            {/* Linhas da Quadra */}
                            <line x1="0" y1="94" x2="100" y2="94" stroke="#334155" strokeWidth="1" />
                            <circle cx="50" cy="94" r="12" fill="none" stroke="#334155" strokeWidth="1" />
                            <line x1="8" y1="0" x2="8" y2="28" stroke="#cbd5e1" strokeWidth="1" />
                            <line x1="92" y1="0" x2="92" y2="28" stroke="#cbd5e1" strokeWidth="1" />
                            <path d="M 8 28 A 47.5 47.5 0 0 0 92 28" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
                            <rect x="34" y="0" width="32" height="38" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
                            <circle cx="50" cy="38" r="12" fill="none" stroke="#38bdf8" strokeWidth="1" />
                            <path d="M 44 12 A 6 6 0 0 0 56 12" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                            <line x1="44" y1="8" x2="56" y2="8" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="50" cy="12" r="2.5" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />

                            {/* Dispersão de Tiros (Scatter) */}
                            {viewMode === 'scatter' && (
                                <g>
                                    {scatterDots.map((dot) => (
                                        <circle
                                            key={dot.id}
                                            cx={dot.x}
                                            cy={dot.y}
                                            r={dot.made ? 2.0 : 1.7}
                                            fill={dot.made ? '#10b981' : '#ef4444'}
                                            stroke="#ffffff"
                                            strokeWidth={0.4}
                                        />
                                    ))}
                                </g>
                            )}

                            {/* Percentagens em Texto nas Zonas */}
                            {viewMode === 'zones' && (
                                <g className="font-sans font-black text-[3px] text-white select-none pointer-events-none">
                                    <text x="50" y="10" textAnchor="middle" fill="#ffffff" fontWeight="black">
                                        {zonesData.restricted.pct}%
                                    </text>
                                    <text x="50" y="27" textAnchor="middle" fill="#ffffff" fontWeight="black">
                                        {zonesData.paint.pct}%
                                    </text>
                                    <text x="50" y="48" textAnchor="middle" fill="#ffffff" fontWeight="black">
                                        Meia: {zonesData.midrange.pct}%
                                    </text>
                                    <text x="5" y="18" textAnchor="middle" fill="#ffffff" fontWeight="black" transform="rotate(-90 5 18)">
                                        {zonesData.corner3.pct}%
                                    </text>
                                    <text x="95" y="18" textAnchor="middle" fill="#ffffff" fontWeight="black" transform="rotate(90 95 18)">
                                        {zonesData.corner3.pct}%
                                    </text>
                                    <text x="50" y="72" textAnchor="middle" fill="#ffffff" fontWeight="black">
                                        Triplos Topo: {zonesData.aboveBreak.pct}%
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                {/* DETALHE ESTATUS DAS 5 ZONAS */}
                <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Detalhamento por Zona de Arremesso</span>
                    </h3>

                    {/* Sob o Aro */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Debaixo do Cesto (&lt; 4 pés)</span>
                            <span className="text-[10px] text-slate-400">Volume de arremessos: {zonesData.restricted.volume}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${zonesData.restricted.status.color}`}>
                                {zonesData.restricted.status.label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">{zonesData.restricted.pct}%</span>
                        </div>
                    </div>

                    {/* Garrafão */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Garrafão / Floater (4 - 14 pés)</span>
                            <span className="text-[10px] text-slate-400">Volume de arremessos: {zonesData.paint.volume}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${zonesData.paint.status.color}`}>
                                {zonesData.paint.status.label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">{zonesData.paint.pct}%</span>
                        </div>
                    </div>

                    {/* Meia-Distância */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Meia-Distância (14 - 22 pés)</span>
                            <span className="text-[10px] text-slate-400">Volume de arremessos: {zonesData.midrange.volume}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${zonesData.midrange.status.color}`}>
                                {zonesData.midrange.status.label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">{zonesData.midrange.pct}%</span>
                        </div>
                    </div>

                    {/* Triplos dos Cantos */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Triplos dos Cantos (Corner 3)</span>
                            <span className="text-[10px] text-slate-400">Volume de arremessos: {zonesData.corner3.volume}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${zonesData.corner3.status.color}`}>
                                {zonesData.corner3.status.label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">{zonesData.corner3.pct}%</span>
                        </div>
                    </div>

                    {/* Triplos Frontais */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-white block">Triplos do Topo &amp; Alas</span>
                            <span className="text-[10px] text-slate-400">Volume de arremessos: {zonesData.aboveBreak.volume}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${zonesData.aboveBreak.status.color}`}>
                                {zonesData.aboveBreak.status.label}
                            </span>
                            <span className="text-lg font-black font-mono text-white">{zonesData.aboveBreak.pct}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

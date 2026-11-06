import React, { useState, useMemo } from 'react';
import { Target, Flame, Filter, Eye, CheckCircle2, XCircle, ChevronDown, Layers, Trophy } from 'lucide-react';

export default function CourtShotChart({ shots = [], homeTeam = {}, awayTeam = {} }) {
    const [viewMode, setViewMode] = useState('scatter'); // 'scatter' | 'heatmap'
    const [selectedTeam, setSelectedTeam] = useState('todas'); // 'todas' | 'casa' | 'fora'
    const [selectedPeriod, setSelectedPeriod] = useState('todos'); // 'todos' | 1 | 2 | 3 | 4
    const [selectedPlayer, setSelectedPlayer] = useState('todos'); // 'todos' | player_name
    const [selectedResult, setSelectedResult] = useState('todos'); // 'todos' | 'made' | 'missed'
    const [hoveredShot, setHoveredShot] = useState(null);

    // Lista única de jogadores presentes nos lançamentos
    const playersList = useMemo(() => {
        const map = new Map();
        shots.forEach(s => {
            if (!map.has(s.player_name)) {
                map.set(s.player_name, {
                    name: s.player_name,
                    team: s.team_sigla,
                    isHome: s.is_home,
                    photo: s.player_photo,
                    jersey: s.numero_camisola,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [shots]);

    // Filtragem dos lançamentos
    const filteredShots = useMemo(() => {
        return shots.filter(s => {
            if (selectedTeam === 'casa' && !s.is_home) return false;
            if (selectedTeam === 'fora' && s.is_home) return false;
            if (selectedPeriod !== 'todos' && Number(s.period) !== Number(selectedPeriod)) return false;
            if (selectedPlayer !== 'todos' && s.player_name !== selectedPlayer) return false;
            if (selectedResult === 'made' && !s.made) return false;
            if (selectedResult === 'missed' && s.made) return false;
            return true;
        });
    }, [shots, selectedTeam, selectedPeriod, selectedPlayer, selectedResult]);

    // Estatísticas calculadas com base no filtro
    const stats = useMemo(() => {
        const total = filteredShots.length;
        const made = filteredShots.filter(s => s.made).length;
        const fgPct = total > 0 ? Math.round((made / total) * 100) : 0;

        const threes = filteredShots.filter(s => s.type === '3-Pointer');
        const threesMade = threes.filter(s => s.made).length;
        const threePct = threes.length > 0 ? Math.round((threesMade / threes.length) * 100) : 0;

        const paint = filteredShots.filter(s => s.zone === 'restricted' || s.zone === 'paint');
        const paintMade = paint.filter(s => s.made).length;
        const paintPct = paint.length > 0 ? Math.round((paintMade / paint.length) * 100) : 0;

        const mid = filteredShots.filter(s => s.zone === 'midrange');
        const midMade = mid.filter(s => s.made).length;
        const midPct = mid.length > 0 ? Math.round((midMade / mid.length) * 100) : 0;

        return {
            total,
            made,
            fgPct,
            threesTotal: threes.length,
            threesMade,
            threePct,
            paintTotal: paint.length,
            paintMade,
            paintPct,
            midTotal: mid.length,
            midMade,
            midPct,
        };
    }, [filteredShots]);

    // Zonas para o Modo Heatmap
    const zoneStats = useMemo(() => {
        const zones = {
            restricted: { name: 'Sob o Aro (< 4 pés)', total: 0, made: 0 },
            paint: { name: 'Garrafão (Floater/Poste)', total: 0, made: 0 },
            midrange: { name: 'Meia-Distância', total: 0, made: 0 },
            corner3: { name: 'Triplos dos Cantos', total: 0, made: 0 },
            above_break3: { name: 'Triplos Frontais & Topo', total: 0, made: 0 },
        };

        filteredShots.forEach(s => {
            if (s.zone === 'restricted') {
                zones.restricted.total++;
                if (s.made) zones.restricted.made++;
            } else if (s.zone === 'paint') {
                zones.paint.total++;
                if (s.made) zones.paint.made++;
            } else if (s.zone === 'midrange') {
                zones.midrange.total++;
                if (s.made) zones.midrange.made++;
            } else if (s.zone === 'corner3_left' || s.zone === 'corner3_right') {
                zones.corner3.total++;
                if (s.made) zones.corner3.made++;
            } else {
                zones.above_break3.total++;
                if (s.made) zones.above_break3.made++;
            }
        });

        const calc = (z) => ({
            ...z,
            pct: z.total > 0 ? Math.round((z.made / z.total) * 100) : 0,
        });

        return {
            restricted: calc(zones.restricted),
            paint: calc(zones.paint),
            midrange: calc(zones.midrange),
            corner3: calc(zones.corner3),
            above_break3: calc(zones.above_break3),
        };
    }, [filteredShots]);

    // Cores de calor térmico com base na percentagem e volume
    const getHeatColor = (pct, total) => {
        if (total === 0) return 'rgba(30, 41, 59, 0.4)';
        if (pct >= 55) return 'rgba(239, 68, 68, 0.65)'; // Quente (vermelho vivo)
        if (pct >= 45) return 'rgba(245, 158, 11, 0.65)'; // Médio-Alto (âmbar)
        if (pct >= 35) return 'rgba(59, 130, 246, 0.65)'; // Moderado (azul)
        return 'rgba(99, 102, 241, 0.65)'; // Frio (índigo/roxo)
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* Header com Modos e Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center space-x-2">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <span>Shot Chart & Mapa de Calor Interativo</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Posição exata de cada remate, eficácia por zonas e análise de arremessos da partida.
                    </p>
                </div>

                {/* Alternador de Modo: Pontos (Scatter) vs Mapa de Calor (Heatmap) */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setViewMode('scatter')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                            viewMode === 'scatter'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Pontos (Scatter)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                            viewMode === 'heatmap'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Mapa de Calor (Zonas)</span>
                    </button>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                {/* Equipa */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Equipa
                    </label>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="todas">Ambas as Equipas</option>
                        <option value="casa">{homeTeam?.sigla || 'Casa'} (CASA)</option>
                        <option value="fora">{awayTeam?.sigla || 'Fora'} (FORA)</option>
                    </select>
                </div>

                {/* Quarto */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Quarto
                    </label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="todos">Todos os Quartos</option>
                        <option value="1">1º Quarto (Q1)</option>
                        <option value="2">2º Quarto (Q2)</option>
                        <option value="3">3º Quarto (Q3)</option>
                        <option value="4">4º Quarto (Q4)</option>
                    </select>
                </div>

                {/* Jogador Específico */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Jogador
                    </label>
                    <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="todos">Todos os Jogadores ({playersList.length})</option>
                        {playersList.map((p) => (
                            <option key={p.name} value={p.name}>
                                [{p.team}] #{p.jersey} {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Resultado */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Resultado
                    </label>
                    <select
                        value={selectedResult}
                        onChange={(e) => setSelectedResult(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="todos">Todos ({stats.total})</option>
                        <option value="made">Apenas Cestos 🟢 ({stats.made})</option>
                        <option value="missed">Apenas Falhados 🔴 ({stats.total - stats.made})</option>
                    </select>
                </div>
            </div>

            {/* Painel de Eficácia e Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Eficácia Geral (FG%)</span>
                    <span className="text-2xl font-black font-mono text-white">{stats.fgPct}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{stats.made}/{stats.total} marcados</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Triplos (3P%)</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">{stats.threePct}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{stats.threesMade}/{stats.threesTotal} triplos</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">No Garrafão (Paint)</span>
                    <span className="text-2xl font-black font-mono text-blue-400">{stats.paintPct}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{stats.paintMade}/{stats.paintTotal} cestos</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Meia-Distância (Mid)</span>
                    <span className="text-2xl font-black font-mono text-amber-400">{stats.midPct}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{stats.midMade}/{stats.midTotal} cestos</span>
                </div>
            </div>

            {/* A QUADRA DE BASQUETEBOL SVG */}
            <div className="relative w-full max-w-2xl mx-auto bg-slate-950 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
                {/* Legenda Flutuante */}
                <div className="w-full flex items-center justify-between mb-3 text-[11px] font-bold text-slate-400 px-2">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-sm" />
                            <span className="text-slate-300">Cesto Convertido</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-300 shadow-sm" />
                            <span className="text-slate-300">Remate Falhado</span>
                        </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                        Total Mostrado: {filteredShots.length}
                    </span>
                </div>

                {/* SVG da Meia-Quadra NBA (viewBox="0 0 100 94") */}
                <div className="relative w-full aspect-[100/94]">
                    <svg
                        viewBox="0 0 100 94"
                        className="w-full h-full select-none"
                        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                    >
                        <defs>
                            {/* Textura sutil de madeira parquete */}
                            <pattern id="parquet" width="10" height="10" patternUnits="userSpaceOnUse">
                                <rect width="10" height="10" fill="#0c1220" />
                                <path d="M 0 10 L 10 0 M 0 0 L 10 10" stroke="#131b2e" strokeWidth="0.5" />
                            </pattern>
                        </defs>

                        {/* Piso da Quadra */}
                        <rect x="0" y="0" width="100" height="94" rx="4" fill="url(#parquet)" stroke="#1e293b" strokeWidth="1.5" />

                        {/* ZONAS DO MAPA DE CALOR (Quando ativado) */}
                        {viewMode === 'heatmap' && (
                            <g className="transition-all duration-500">
                                {/* Zona 1: Sob o Aro (Restricted Area) */}
                                <circle
                                    cx="50"
                                    cy="12"
                                    r="8"
                                    fill={getHeatColor(zoneStats.restricted.pct, zoneStats.restricted.total)}
                                    className="cursor-pointer"
                                />

                                {/* Zona 2: Garrafão (Paint) */}
                                <rect
                                    x="34"
                                    y="16"
                                    width="32"
                                    height="22"
                                    rx="2"
                                    fill={getHeatColor(zoneStats.paint.pct, zoneStats.paint.total)}
                                    className="cursor-pointer"
                                />

                                {/* Zona 3: Meia Distância Esquerda & Direita */}
                                <path
                                    d="M 12 28 L 34 28 L 34 38 A 12 12 0 0 0 66 38 L 66 28 L 88 28 A 47.5 47.5 0 0 1 12 28 Z"
                                    fill={getHeatColor(zoneStats.midrange.pct, zoneStats.midrange.total)}
                                    className="cursor-pointer"
                                />

                                {/* Zona 4: Cantos de 3 Pontos (Esquerda e Direita) */}
                                <rect
                                    x="1"
                                    y="1"
                                    width="7"
                                    height="27"
                                    fill={getHeatColor(zoneStats.corner3.pct, zoneStats.corner3.total)}
                                    className="cursor-pointer"
                                />
                                <rect
                                    x="92"
                                    y="1"
                                    width="7"
                                    height="27"
                                    fill={getHeatColor(zoneStats.corner3.pct, zoneStats.corner3.total)}
                                    className="cursor-pointer"
                                />

                                {/* Zona 5: Triplo do Topo e Alas (Above the Break 3) */}
                                <path
                                    d="M 1 28 A 47.5 47.5 0 0 1 99 28 L 99 93 L 1 93 Z"
                                    fill={getHeatColor(zoneStats.above_break3.pct, zoneStats.above_break3.total)}
                                    className="cursor-pointer"
                                />
                            </g>
                        )}

                        {/* LINHAS OFICIAIS DA QUADRA NBA */}
                        {/* Linha de Meio-Campo */}
                        <line x1="0" y1="94" x2="100" y2="94" stroke="#334155" strokeWidth="1" />
                        <circle cx="50" cy="94" r="12" fill="none" stroke="#334155" strokeWidth="1" />

                        {/* Linhas de 3 Pontos */}
                        {/* Linhas retas dos cantos */}
                        <line x1="8" y1="0" x2="8" y2="28" stroke="#cbd5e1" strokeWidth="1" />
                        <line x1="92" y1="0" x2="92" y2="28" stroke="#cbd5e1" strokeWidth="1" />
                        {/* Arco de 3 pontos */}
                        <path
                            d="M 8 28 A 47.5 47.5 0 0 0 92 28"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="1.2"
                        />

                        {/* Garrafão (Key) */}
                        <rect x="34" y="0" width="32" height="38" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
                        <line x1="38" y1="0" x2="38" y2="38" stroke="#334155" strokeWidth="0.8" strokeDasharray="1,1" />
                        <line x1="62" y1="0" x2="62" y2="38" stroke="#334155" strokeWidth="0.8" strokeDasharray="1,1" />

                        {/* Círculo do Lance Livre */}
                        <circle cx="50" cy="38" r="12" fill="none" stroke="#38bdf8" strokeWidth="1" />
                        <path d="M 38 38 A 12 12 0 0 0 62 38" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />

                        {/* Arco da Área Restrita (Restricted Area) */}
                        <path d="M 44 12 A 6 6 0 0 0 56 12" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                        {/* Tabela de Basquetebol */}
                        <line x1="44" y1="8" x2="56" y2="8" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="50" y1="8" x2="50" y2="10.5" stroke="#f97316" strokeWidth="1.2" />

                        {/* Aro / Cesto */}
                        <circle cx="50" cy="12" r="2.5" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />

                        {/* PONTOS DE LANÇAMENTO (Modo Scatter) */}
                        {viewMode === 'scatter' && (
                            <g>
                                {filteredShots.map((shot) => {
                                    const isHovered = hoveredShot?.id === shot.id;
                                    return (
                                        <g
                                            key={shot.id}
                                            className="cursor-pointer transition-transform duration-150"
                                            onMouseEnter={() => setHoveredShot(shot)}
                                            onMouseLeave={() => setHoveredShot(null)}
                                        >
                                            {/* Ponto de Cesto (Verde) */}
                                            {shot.made ? (
                                                <circle
                                                    cx={shot.x}
                                                    cy={shot.y}
                                                    r={isHovered ? 2.8 : 1.7}
                                                    fill="#10b981"
                                                    stroke="#ffffff"
                                                    strokeWidth={isHovered ? 0.8 : 0.4}
                                                    className="transition-all"
                                                />
                                            ) : (
                                                /* Ponto de Erro (Vermelho com X sutil) */
                                                <g transform={`translate(${shot.x}, ${shot.y})`}>
                                                    <circle
                                                        cx="0"
                                                        cy="0"
                                                        r={isHovered ? 2.6 : 1.6}
                                                        fill="#ef4444"
                                                        stroke="#ffffff"
                                                        strokeWidth={isHovered ? 0.8 : 0.4}
                                                    />
                                                </g>
                                            )}
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {/* Etiquetas das Zonas no Modo Heatmap */}
                        {viewMode === 'heatmap' && (
                            <g className="font-sans font-black text-[2.8px] text-white select-none pointer-events-none">
                                <text x="50" y="24" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                                    {zoneStats.paint.pct}% ({zoneStats.paint.made}/{zoneStats.paint.total})
                                </text>
                                <text x="50" y="10" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                                    {zoneStats.restricted.pct}% ({zoneStats.restricted.made}/{zoneStats.restricted.total})
                                </text>
                                <text x="50" y="48" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                                    Meia-Dist.: {zoneStats.midrange.pct}% ({zoneStats.midrange.made}/{zoneStats.midrange.total})
                                </text>
                                <text x="5" y="18" textAnchor="middle" fill="#ffffff" fontWeight="bold" transform="rotate(-90 5 18)">
                                    {zoneStats.corner3.pct}%
                                </text>
                                <text x="95" y="18" textAnchor="middle" fill="#ffffff" fontWeight="bold" transform="rotate(90 95 18)">
                                    {zoneStats.corner3.pct}%
                                </text>
                                <text x="50" y="74" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                                    Triplos Topo: {zoneStats.above_break3.pct}% ({zoneStats.above_break3.made}/{zoneStats.above_break3.total})
                                </text>
                            </g>
                        )}
                    </svg>

                    {/* Tooltip Interativo ao Passar o Rato num Lançamento */}
                    {hoveredShot && (
                        <div
                            className="absolute pointer-events-none z-30 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs w-60 transform -translate-x-1/2 -translate-y-full transition-all"
                            style={{
                                left: `${hoveredShot.x}%`,
                                top: `${Math.max(12, hoveredShot.y - 4)}%`,
                            }}
                        >
                            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                                <img
                                    src={hoveredShot.player_photo || '/images/players/placeholder.png'}
                                    className="w-9 h-9 rounded-full object-cover bg-slate-950 border border-slate-700"
                                    onError={(e) => { e.target.src = '/images/players/placeholder.png'; }}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="font-black text-white truncate text-xs">
                                        {hoveredShot.player_name}
                                    </div>
                                    <div className="text-[10px] text-blue-400 font-bold flex items-center space-x-1">
                                        <span>{hoveredShot.team_sigla}</span>
                                        <span>•</span>
                                        <span>Q{hoveredShot.period} {hoveredShot.clock}</span>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        hoveredShot.made
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                                >
                                    {hoveredShot.made ? `+${hoveredShot.score_value}` : 'Errou'}
                                </span>
                            </div>

                            <div className="pt-2 text-[11px] text-slate-300 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tipo:</span>
                                    <span className="font-bold text-white">{hoveredShot.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Distância:</span>
                                    <span className="font-mono font-bold text-emerald-400">{hoveredShot.distance_ft} pés ({Math.round(hoveredShot.distance_ft * 0.3048 * 10) / 10}m)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dica de Navegação */}
                <div className="text-[11px] text-slate-500 mt-4 text-center">
                    💡 Passa o cursor por cima dos pontos na quadra para ver o autor, distância e detalhe do lançamento.
                </div>
            </div>
        </div>
    );
}

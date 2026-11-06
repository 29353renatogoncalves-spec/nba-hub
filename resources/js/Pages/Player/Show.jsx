import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, Award, Calendar, DollarSign, MapPin, 
    Shield, Trophy, Users, Zap, ExternalLink, Activity
} from 'lucide-react';
import Navbar from '@/Components/Navbar';

export default function PlayerShow({ auth, jogador, stats = [], career = {}, teammates = [], awards = [] }) {
    // Cálculo da idade
    const birthDate = jogador.data_nascimento ? new Date(jogador.data_nascimento) : null;
    const age = birthDate ? Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : null;

    // Conversão de altura (m para pés/pol) e peso (kg para lbs)
    const heightInches = jogador.altura_metros ? Math.round(jogador.altura_metros * 39.3701) : 0;
    const heightFeet = Math.floor(heightInches / 12);
    const heightRemainingInches = heightInches % 12;
    const weightLbs = jogador.peso_kg ? Math.round(jogador.peso_kg * 2.20462) : 0;

    const salarioFormatado = jogador.salario_anual_usd 
        ? `$${(Number(jogador.salario_anual_usd) / 1000000).toFixed(1)}M/ano` 
        : 'Escala de Novato';

    const teamColor = jogador.equipa_cor || '#1D428A';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title={`${jogador.nome_completo} (#${jogador.numero_camisola || '00'}) - NBA Hub Oficial`} />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* 1. Barra de Navegação / Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition shadow"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Hub Principal</span>
                    </Link>

                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                        <span>NBA</span>
                        <span>/</span>
                        <span>{jogador.equipa_conferencia || 'Liga'}</span>
                        <span>/</span>
                        <span className="text-slate-300 font-bold">{jogador.equipa_nome}</span>
                        <span>/</span>
                        <span className="text-blue-400 font-bold">{jogador.nome_completo}</span>
                    </div>
                </div>

                {/* 2. Cartão de Perfil Hero do Jogador */}
                <section className="relative overflow-hidden rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-6 sm:p-10">
                    {/* Luzes de ambientação com a cor da equipa */}
                    <div
                        className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-25 pointer-events-none"
                        style={{ backgroundColor: teamColor }}
                    />
                    <div
                        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
                        style={{ backgroundColor: teamColor }}
                    />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        {/* Fotografia Oficial de Alta Resolução */}
                        <div className="relative flex-shrink-0">
                            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-slate-950 border-2 border-slate-800 p-2 overflow-hidden shadow-2xl group relative">
                                <img
                                    src={jogador.foto_url}
                                    alt={jogador.nome_completo}
                                    className="w-full h-full object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e293b"/><circle cx="50" cy="40" r="22" fill="%23475569"/><path d="M20 90 C20 65 80 65 80 90 Z" fill="%23475569"/><text x="50" y="46" font-family="sans-serif" font-weight="900" font-size="16" fill="%2394a3b8" text-anchor="middle">${encodeURIComponent(jogador.posicao_primaria || 'NBA')}</text></svg>`;
                                    }}
                                />
                                <span className="absolute bottom-3 right-3 bg-slate-950/95 text-white font-black text-xs px-2.5 py-1 rounded-lg border border-slate-800 shadow">
                                    #{jogador.numero_camisola ?? '00'}
                                </span>
                            </div>

                            {/* Badge da Franquia */}
                            {jogador.equipa_logo && (
                                <div className="absolute -bottom-4 -left-4 w-14 h-14 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-xl">
                                    <img src={jogador.equipa_logo} alt={jogador.equipa_nome} className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>

                        {/* Dados Principais do Atleta */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black text-xs tracking-wider uppercase">
                                    {jogador.posicao_primaria} • {getPositionName(jogador.posicao_primaria)}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center">
                                    <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {jogador.equipa_nome} ({jogador.equipa_sigla})
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs flex items-center">
                                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                    {salarioFormatado}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                                    {jogador.nome_completo}
                                </h1>
                                <p className="text-sm text-slate-400 mt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                    <span>{jogador.equipa_divisao} Division</span>
                                    <span>•</span>
                                    <span>Conferência {jogador.equipa_conferencia}</span>
                                    <span>•</span>
                                    <span className="flex items-center text-slate-300">
                                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                        {jogador.arena_nome} ({jogador.arena_cidade})
                                    </span>
                                </p>
                            </div>

                            {/* Grelha de Atributos Físicos e Biografia */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Altura</span>
                                    <span className="text-sm font-black text-white block mt-0.5">
                                        {jogador.altura_metros}m
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">{heightFeet}'{heightRemainingInches}"</span>
                                </div>

                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Peso</span>
                                    <span className="text-sm font-black text-white block mt-0.5">
                                        {jogador.peso_kg} kg
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">{weightLbs} lbs</span>
                                </div>

                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Idade / Nasc.</span>
                                    <span className="text-sm font-black text-white block mt-0.5">
                                        {age ? `${age} anos` : '--'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">{jogador.data_nascimento}</span>
                                </div>

                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Draft NBA</span>
                                    <span className="text-sm font-black text-white block mt-0.5">
                                        {jogador.draft_ano ? `Ano ${jogador.draft_ano}` : 'Undrafted'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {jogador.draft_escolha ? `Ronda ${jogador.draft_ronda} • #${jogador.draft_escolha}` : jogador.nacionalidade}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Destaques da Carreira (KPIs Médios) */}
                <section>
                    <h2 className="text-xl font-black text-white mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        Médias de Carreira na NBA
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pontos (PPG)</span>
                            <span className="text-3xl font-black text-white mt-1 block">{career.ppg || '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Pontuação Média</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Ressaltos (RPG)</span>
                            <span className="text-3xl font-black text-white mt-1 block">{career.rpg || '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Tábua Def./Of.</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Assistências (APG)</span>
                            <span className="text-3xl font-black text-white mt-1 block">{career.apg || '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Passes Decisivos</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Lançamento (FG%)</span>
                            <span className="text-3xl font-black text-emerald-400 mt-1 block">{career.fg_pct ? `${career.fg_pct}%` : '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Eficácia Geral</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Triplos (3P%)</span>
                            <span className="text-3xl font-black text-blue-400 mt-1 block">{career.fg3_pct ? `${career.fg3_pct}%` : '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Perímetro</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Lances Livres (FT%)</span>
                            <span className="text-3xl font-black text-amber-400 mt-1 block">{career.ft_pct ? `${career.ft_pct}%` : '--'}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">Linha de Lance Livre</span>
                        </div>
                    </div>
                </section>

                {/* 4. Tabela de Estatísticas Históricas por Época */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center">
                                <Trophy className="w-5 h-5 mr-2 text-amber-400" />
                                Histórico Estatístico por Temporada
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Registo oficial de jogos, minutos e médias registadas na NBA.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-[11px] uppercase font-black tracking-wider text-slate-400 bg-slate-900 border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3">Época</th>
                                    <th className="px-4 py-3">Equipa</th>
                                    <th className="px-3 py-3 text-center">GP</th>
                                    <th className="px-3 py-3 text-center">GS</th>
                                    <th className="px-3 py-3 text-center">MIN</th>
                                    <th className="px-3 py-3 text-center font-bold text-white">PTS</th>
                                    <th className="px-3 py-3 text-center">REB</th>
                                    <th className="px-3 py-3 text-center">AST</th>
                                    <th className="px-3 py-3 text-center">STL</th>
                                    <th className="px-3 py-3 text-center">BLK</th>
                                    <th className="px-3 py-3 text-center">FG%</th>
                                    <th className="px-3 py-3 text-center">3P%</th>
                                    <th className="px-3 py-3 text-center">FT%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                                {stats && stats.length > 0 ? (
                                    stats.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-800/30 transition">
                                            <td className="px-4 py-3 font-sans font-bold text-white">
                                                {row.epoca_nome}
                                            </td>
                                            <td className="px-4 py-3 font-sans font-bold text-blue-400">
                                                {row.equipa_sigla}
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-300">{row.jogos_disputados}</td>
                                            <td className="px-3 py-3 text-center text-slate-400">{row.titular}</td>
                                            <td className="px-3 py-3 text-center text-slate-400">{row.minutos_jogo}</td>
                                            <td className="px-3 py-3 text-center font-bold text-white bg-slate-900/40">
                                                {row.pontos_jogo}
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-300">{row.ressaltos_jogo}</td>
                                            <td className="px-3 py-3 text-center text-slate-300">{row.assistencias_jogo}</td>
                                            <td className="px-3 py-3 text-center text-slate-400">{row.roubos_jogo}</td>
                                            <td className="px-3 py-3 text-center text-slate-400">{row.desarmes_jogo}</td>
                                            <td className="px-3 py-3 text-center font-bold text-emerald-400">{row.fg_pct}%</td>
                                            <td className="px-3 py-3 text-center font-bold text-blue-400">{row.fg3_pct}%</td>
                                            <td className="px-3 py-3 text-center font-bold text-amber-400">{row.ft_pct}%</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="px-4 py-8 text-center text-slate-500 font-sans">
                                            Sem estatísticas oficiais registadas para este atleta.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 5. Palmarés e Distinções */}
                <section>
                    <h2 className="text-xl font-black text-white mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-amber-400" />
                        Palmarés & Conquistas de Carreira
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {awards.map((award, index) => {
                            const badgeColor = award.tipo === 'ouro'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : (award.tipo === 'vermelho' 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400');

                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-2xl border ${badgeColor} backdrop-blur-sm shadow flex items-start space-x-3.5`}
                                >
                                    <div className="p-2 rounded-xl bg-slate-950/80 flex items-center justify-center flex-shrink-0">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-white">{award.titulo}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">{award.anos}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 6. Colegas de Equipa no Plantel Oficial */}
                {teammates && teammates.length > 0 && (
                    <section className="pt-4 border-t border-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-white flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-400" />
                                Outros Atletas de {jogador.equipa_nome}
                            </h2>
                            <Link href="/" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center">
                                Ver Plantel Completo <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                            {teammates.map((mate) => (
                                <Link
                                    key={mate.id}
                                    href={`/jogadores/${mate.id}`}
                                    className="group p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition flex flex-col items-center text-center shadow"
                                >
                                    <div className="relative w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                                        <img
                                            src={mate.foto_url}
                                            alt={mate.nome_completo}
                                            className="w-full h-full object-cover object-top"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e293b"/><circle cx="50" cy="40" r="22" fill="%23475569"/><path d="M20 90 C20 65 80 65 80 90 Z" fill="%23475569"/></svg>`;
                                            }}
                                        />
                                        <span className="absolute bottom-0 right-0 bg-slate-950/90 text-white font-black text-[9px] px-1 rounded-tl">
                                            #{mate.numero_camisola}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition truncate w-full">
                                        {mate.nome_completo}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                                        {mate.posicao_primaria}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

function getPositionName(pos) {
    switch (pos) {
        case 'PG': return 'Point Guard (Base)';
        case 'SG': return 'Shooting Guard (Extremo-Base)';
        case 'SF': return 'Small Forward (Extremo)';
        case 'PF': return 'Power Forward (Extremo-Poste)';
        case 'C': return 'Center (Poste)';
        default: return 'Atleta NBA';
    }
}

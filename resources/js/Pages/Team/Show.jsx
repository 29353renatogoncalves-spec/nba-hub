import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, MapPin, Users, DollarSign, Trophy, Calendar,
    Award, Newspaper
} from 'lucide-react';
import Navbar from '@/Components/Navbar';

const positionLabel = {
    PG: 'Base',
    SG: 'Extremo-Base',
    SF: 'Extremo',
    PF: 'Extremo-Poste',
    C: 'Poste',
};

function formatSalary(value) {
    const amount = Number(value || 0);
    if (amount <= 0) return 'Rookie / Escala';
    return `$${(amount / 1000000).toFixed(1)}M`;
}

function gameResult(game, teamSigla) {
    if (game.estado !== 'concluido') return null;
    const isHome = game.casa_sigla === teamSigla;
    const ours = isHome ? game.pontos_casa : game.pontos_fora;
    const theirs = isHome ? game.pontos_fora : game.pontos_casa;
    return {
        win: Number(ours) > Number(theirs),
        ours,
        theirs,
    };
}

export default function TeamShow({
    auth,
    team,
    roster = [],
    standing,
    recentGames = [],
    upcomingGames = [],
    payroll = 0,
    news = [],
    seasons = [],
    selectedSeasonId,
}) {
    const teamColor = team.cor_primaria || '#1D428A';

    const handleSeasonChange = (e) => {
        router.get(`/equipas/${team.sigla}`, { season_id: e.target.value }, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title={`${team.nome_completo} - NBA Hub`} />
            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Hub</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {seasons.length > 0 && (
                            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <select
                                    value={selectedSeasonId}
                                    onChange={handleSeasonChange}
                                    className="bg-transparent text-xs font-black text-white border-0 focus:ring-0 cursor-pointer pr-8 py-0.5"
                                >
                                    {seasons.map((s) => (
                                        <option key={s.id} value={s.id} className="bg-slate-900">
                                            Época {s.nome} {s.atual ? '• Atual' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <Link
                            href={`/calendario?team=${team.sigla}&season_id=${selectedSeasonId}`}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Calendário da franquia</span>
                        </Link>
                    </div>
                </div>

                <section className="relative overflow-hidden rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-6 sm:p-10">
                    <div
                        className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 pointer-events-none"
                        style={{ backgroundColor: teamColor }}
                    />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center shadow-2xl">
                            <img src={team.logo_url} alt={team.nome_completo} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black text-xs uppercase tracking-wider">
                                    {team.conferencia} • {team.divisao}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs">
                                    Fundado em {team.ano_fundacao}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{team.sigla}</p>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{team.nome_completo}</h1>
                                <p className="text-sm text-slate-400 mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                    <span className="flex items-center">
                                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                        {team.arena?.nome} • {team.arena?.cidade}
                                    </span>
                                    <span>•</span>
                                    <span>Treinador: <strong className="text-slate-200">{team.treinador_principal}</strong></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Kpi label="Posição" value={standing?.posicao ? `#${standing.posicao}` : '—'} hint={standing?.conferencia} />
                    <Kpi label="Vitórias" value={standing?.vitorias ?? '—'} hint={`${standing?.derrotas ?? 0} derrotas`} />
                    <Kpi label="% Vitórias" value={standing?.pct_vitorias != null ? `${Number(standing.pct_vitorias).toFixed(1)}%` : '—'} />
                    <Kpi label="Forma" value={standing?.ultimos_10 || '—'} hint={standing?.sequencia_atual} />
                    <Kpi label="Payroll" value={formatSalary(payroll)} hint={`${roster.length} atletas`} />
                    <Kpi label="Arena" value={team.arena?.capacidade ? Number(team.arena.capacidade).toLocaleString('pt-PT') : '—'} hint="capacidade" />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-white flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-400" />
                            Plantel oficial
                        </h2>
                        <span className="text-xs text-slate-500 font-semibold">{roster.length} contratos ativos</span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-[11px] uppercase font-black tracking-wider text-slate-400 bg-slate-900 border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Jogador</th>
                                    <th className="px-3 py-3 text-center">Pos</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">PPG</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">RPG</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">APG</th>
                                    <th className="px-3 py-3 text-right">Salário</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {roster.map((jogador) => (
                                    <tr key={jogador.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3 font-black text-white">{jogador.numero_camisola ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Link href={`/jogadores/${jogador.id}`} className="flex items-center gap-3 group">
                                                <img
                                                    src={jogador.foto_url}
                                                    alt={jogador.nome_completo}
                                                    className="w-10 h-10 rounded-xl object-cover object-top bg-slate-900 border border-slate-800"
                                                />
                                                <div>
                                                    <span className="font-bold text-white group-hover:text-blue-400 block">{jogador.nome_completo}</span>
                                                    <span className="text-[11px] text-slate-500">{jogador.nacionalidade} • {jogador.altura_metros}m</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                                                {jogador.posicao_primaria}
                                            </span>
                                            <span className="hidden sm:block text-[10px] text-slate-500 mt-1">
                                                {positionLabel[jogador.posicao_primaria] || ''}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center font-mono hidden md:table-cell">{jogador.stats?.ppg ?? '—'}</td>
                                        <td className="px-3 py-3 text-center font-mono hidden md:table-cell">{jogador.stats?.rpg ?? '—'}</td>
                                        <td className="px-3 py-3 text-center font-mono hidden md:table-cell">{jogador.stats?.apg ?? '—'}</td>
                                        <td className="px-3 py-3 text-right font-semibold text-emerald-400">
                                            <span className="inline-flex items-center justify-end">
                                                <DollarSign className="w-3 h-3 mr-0.5" />
                                                {formatSalary(jogador.salario_anual_usd)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-black text-white mb-4 flex items-center">
                            <Trophy className="w-5 h-5 mr-2 text-amber-400" />
                            Resultados recentes
                        </h2>
                        <div className="space-y-2">
                            {recentGames.length === 0 && (
                                <p className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                    Ainda não há jogos concluídos nesta época para esta franquia.
                                </p>
                            )}
                            {recentGames.map((game) => {
                                const result = gameResult(game, team.sigla);
                                return (
                                    <Link
                                        key={game.id}
                                        href={`/jogos/${game.id}`}
                                        className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-3 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={game.casa_logo} alt="" className="w-7 h-7 object-contain" />
                                            <span className="text-xs font-bold truncate">{game.casa_sigla} {game.pontos_casa} – {game.pontos_fora} {game.fora_sigla}</span>
                                            <img src={game.fora_logo} alt="" className="w-7 h-7 object-contain" />
                                        </div>
                                        {result && (
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded ${result.win ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {result.win ? 'V' : 'D'}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-white mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-sky-400" />
                            Próximos jogos
                        </h2>
                        <div className="space-y-2">
                            {upcomingGames.length === 0 && (
                                <p className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                    Sem jogos agendados nesta época.
                                </p>
                            )}
                            {upcomingGames.map((game) => (
                                <Link
                                    key={game.id}
                                    href={`/jogos/${game.id}`}
                                    className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-3 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={game.casa_logo} alt="" className="w-7 h-7 object-contain" />
                                        <span className="text-xs font-bold truncate">{game.casa_sigla} vs {game.fora_sigla}</span>
                                        <img src={game.fora_logo} alt="" className="w-7 h-7 object-contain" />
                                    </div>
                                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                        {new Date(game.data_hora).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {team.arena && (
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-black text-white mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-amber-400" />
                            Arena
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-[11px] uppercase font-bold text-slate-500 block">Pavilhão</span>
                                <span className="font-bold text-white">{team.arena.nome}</span>
                            </div>
                            <div>
                                <span className="text-[11px] uppercase font-bold text-slate-500 block">Cidade</span>
                                <span className="font-bold text-white">{team.arena.cidade}{team.arena.estado ? `, ${team.arena.estado}` : ''}</span>
                            </div>
                            <div>
                                <span className="text-[11px] uppercase font-bold text-slate-500 block">Capacidade</span>
                                <span className="font-bold text-white">{Number(team.arena.capacidade).toLocaleString('pt-PT')}</span>
                            </div>
                            <div>
                                <span className="text-[11px] uppercase font-bold text-slate-500 block">Inauguração</span>
                                <span className="font-bold text-white">{team.arena.ano_inauguracao || '—'}</span>
                            </div>
                        </div>
                    </section>
                )}

                {news.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black text-white mb-4 flex items-center">
                            <Newspaper className="w-5 h-5 mr-2 text-emerald-400" />
                            Notícias da franquia
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {news.map((item) => (
                                <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-400 mb-1">
                                        {item.categoria?.nome || 'NBA'}
                                    </p>
                                    <h3 className="font-bold text-white">{item.titulo}</h3>
                                    {item.subtitulo && <p className="text-xs text-slate-400 mt-1">{item.subtitulo}</p>}
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

function Kpi({ label, value, hint }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{label}</span>
            <span className="text-2xl font-black text-white mt-1 block">{value}</span>
            {hint ? <span className="text-[10px] text-slate-500 font-semibold">{hint}</span> : null}
        </div>
    );
}

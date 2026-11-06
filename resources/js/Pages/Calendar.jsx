import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, Radio, Trophy } from 'lucide-react';
import Navbar from '@/Components/Navbar';

function formatDayKey(dateTime) {
    return dateTime ? String(dateTime).slice(0, 10) : 'sem-data';
}

function formatDayLabel(dateKey) {
    if (dateKey === 'sem-data') return 'Data por confirmar';
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function statusBadge(game) {
    if (game.estado === 'em_direto' || game.estado === 'intervalo') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase">
                <Radio className="w-3 h-3" />
                Em direto
            </span>
        );
    }
    if (game.estado === 'concluido') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black uppercase">
                <Trophy className="w-3 h-3 text-amber-400" />
                Final
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-black uppercase">
            Agendado
        </span>
    );
}

export default function Calendar({
    auth,
    games = [],
    teams = [],
    seasons = [],
    selectedSeasonId,
    selectedTeam = '',
    selectedStatus = 'todos',
}) {
    const grouped = games.reduce((acc, game) => {
        const key = formatDayKey(game.data_hora);
        if (!acc[key]) acc[key] = [];
        acc[key].push(game);
        return acc;
    }, {});

    const dayKeys = Object.keys(grouped).sort();

    const applyFilters = (patch) => {
        router.get('/calendario', {
            season_id: selectedSeasonId,
            team: selectedTeam || undefined,
            status: selectedStatus,
            ...patch,
        }, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Calendário da Época - NBA Hub" />
            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white mb-3"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar ao Hub</span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center">
                            <CalendarDays className="w-7 h-7 mr-3 text-sky-400" />
                            Calendário da época
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {games.length} jogos • filtra por franquia, estado e temporada.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-3">
                    <select
                        value={selectedSeasonId}
                        onChange={(e) => applyFilters({ season_id: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    >
                        {seasons.map((s) => (
                            <option key={s.id} value={s.id}>
                                Época {s.nome} {s.atual ? '(Atual)' : ''}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedTeam}
                        onChange={(e) => applyFilters({ team: e.target.value || undefined })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white min-w-[180px]"
                    >
                        <option value="">Todas as franquias</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.sigla}>
                                {team.nome_completo}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    >
                        <option value="todos">Todos os estados</option>
                        <option value="agendado">Agendados</option>
                        <option value="em_direto">Em direto</option>
                        <option value="concluido">Concluídos</option>
                    </select>
                </div>

                {dayKeys.length === 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                        Não há jogos para estes filtros.
                    </div>
                )}

                <div className="space-y-8">
                    {dayKeys.map((day) => (
                        <section key={day}>
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 capitalize">
                                {formatDayLabel(day)}
                            </h2>
                            <div className="space-y-2">
                                {grouped[day].map((game) => {
                                    const time = game.data_hora
                                        ? new Date(game.data_hora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                                        : '--:--';

                                    return (
                                        <Link
                                            key={game.id}
                                            href={`/jogos/${game.id}`}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-3.5 transition"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-14 text-center shrink-0">
                                                    <span className="block text-xs font-mono text-slate-400">{time}</span>
                                                    {statusBadge(game)}
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img src={game.fora_logo} alt={game.fora_nome} className="w-8 h-8 object-contain" />
                                                    <span className="font-black text-sm text-white">{game.fora_sigla}</span>
                                                    {game.estado === 'concluido' || game.estado === 'em_direto' || game.estado === 'intervalo' ? (
                                                        <span className="font-mono font-black text-white">
                                                            {game.pontos_fora ?? 0} – {game.pontos_casa ?? 0}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 text-xs font-bold">@</span>
                                                    )}
                                                    <span className="font-black text-sm text-white">{game.casa_sigla}</span>
                                                    <img src={game.casa_logo} alt={game.casa_nome} className="w-8 h-8 object-contain" />
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1 sm:justify-end">
                                                <MapPin className="w-3 h-3" />
                                                <span>{game.arena_nome} • {game.arena_cidade}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}

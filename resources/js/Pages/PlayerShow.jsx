import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import PlayerShotHeatmap from '@/Components/PlayerShotHeatmap';
import { ArrowLeft, Trophy, Calendar, Star, Shield, Flame, Activity, TrendingUp, Award, ExternalLink, Heart } from 'lucide-react';

export default function PlayerShow({
    auth,
    player,
    highResPhoto,
    idade,
    contract,
    currentAverages = {},
    seasonStats = [],
    gameLogs = [],
}) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // Verificar se o jogador está nos favoritos do utilizador
    React.useEffect(() => {
        if (auth?.user?.jogadores_favoritos && Array.isArray(auth.user.jogadores_favoritos)) {
            setIsFavorite(auth.user.jogadores_favoritos.includes(Number(player.id)));
        } else {
            // Fallback localStorage
            const stored = JSON.parse(localStorage.getItem('nba_fav_players') || '[]');
            setIsFavorite(stored.includes(Number(player.id)));
        }
    }, [auth, player.id]);

    const toggleFavorite = async () => {
        if (favoriteLoading) return;
        setFavoriteLoading(true);
        const nextState = !isFavorite;
        setIsFavorite(nextState);

        // Guardar localmente
        const stored = JSON.parse(localStorage.getItem('nba_fav_players') || '[]');
        let updated = [];
        if (nextState) {
            updated = Array.from(new Set([...stored, Number(player.id)]));
        } else {
            updated = stored.filter(id => id !== Number(player.id));
        }
        localStorage.setItem('nba_fav_players', JSON.stringify(updated));

        // Se logado, sincronizar com backend
        if (auth?.user) {
            try {
                await fetch('/api/user/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        equipa_id: auth.user.equipa_favorita_id,
                        jogadores_ids: updated,
                    })
                });
            } catch (err) {
                console.error('Falha ao sincronizar favoritos:', err);
            }
        }
        setFavoriteLoading(false);
    };

    // Posição por extenso
    const posicoesMap = {
        'PG': 'Base (Point Guard)',
        'SG': 'Base / Extremo (Shooting Guard)',
        'SF': 'Extremo (Small Forward)',
        'PF': 'Extremo / Poste (Power Forward)',
        'C': 'Poste (Center)'
    };
    const posicaoExtenso = posicoesMap[player.posicao_primaria] || player.posicao_primaria;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title={`${player.nome_completo} - Perfil & Estatísticas Oficiais NBA`} />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botão de Regresso */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Hub da NBA</span>
                    </Link>

                    {/* Botão de Favoritar Jogador */}
                    <button
                        onClick={toggleFavorite}
                        disabled={favoriteLoading}
                        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                            isFavorite
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : 'text-red-400'}`} />
                        <span>{isFavorite ? 'Meu Jogador Favorito' : 'Favoritar Jogador'}</span>
                    </button>
                </div>

                {/* Hero Card do Jogador */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 mb-8">
                    {/* Glow de fundo com a cor da equipa */}
                    <div 
                        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
                        style={{ backgroundColor: contract?.equipa_cor || '#1D428A' }}
                    />
                    <div 
                        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                        style={{ backgroundColor: contract?.equipa_cor || '#1D428A' }}
                    />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        {/* Foto Oficial do Atleta em Alta Resolução */}
                        <div className="md:col-span-4 flex justify-center">
                            <div className="relative group">
                                <div 
                                    className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden p-2 bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-700/60 shadow-2xl flex items-end justify-center"
                                >
                                    <img
                                        src={highResPhoto}
                                        alt={player.nome_completo}
                                        className="w-full h-full object-contain object-bottom drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = player.foto_url || '/images/players/placeholder.png';
                                        }}
                                    />
                                </div>
                                {contract?.numero_camisola && (
                                    <span className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-blue-600 border-2 border-slate-900 font-mono font-black text-xl text-white flex items-center justify-center shadow-lg">
                                        #{contract.numero_camisola}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Dados Pessoais & Bio */}
                        <div className="md:col-span-8 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs">
                                    {posicaoExtenso}
                                </span>
                                {contract && (
                                    <Link
                                        href={`/equipas/${contract.equipa_sigla}`}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition"
                                    >
                                        <img src={contract.equipa_logo} className="w-4 h-4 object-contain" />
                                        <span>{contract.equipa_nome} ({contract.equipa_sigla})</span>
                                        <ExternalLink className="w-3 h-3 text-slate-500 ml-1" />
                                    </Link>
                                )}
                                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                                    Ativo NBA
                                </span>
                            </div>

                            <div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                                    {player.nome_completo}
                                </h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    Ficha biográfica e registo oficial de carreira na NBA.
                                </p>
                            </div>

                            {/* Grelha de Atributos Físicos e Biográficos */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Altura</span>
                                    <span className="text-sm font-black text-white font-mono">
                                        {player.altura_metros ? `${player.altura_metros} m` : 'N/D'}
                                    </span>
                                </div>
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Peso</span>
                                    <span className="text-sm font-black text-white font-mono">
                                        {player.peso_kg ? `${Math.round(player.peso_kg)} kg` : 'N/D'}
                                    </span>
                                </div>
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Idade</span>
                                    <span className="text-sm font-black text-white font-mono">
                                        {idade ? `${idade} anos` : 'N/D'}
                                    </span>
                                </div>
                                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Nacionalidade</span>
                                    <span className="text-sm font-black text-white">
                                        {player.nacionalidade || 'EUA'}
                                    </span>
                                </div>
                            </div>

                            {/* Informação de Draft & Salário */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <span>
                                    <strong className="text-slate-300">Draft:</strong>{' '}
                                    {player.draft_ano ? `${player.draft_ano} (R${player.draft_ronda} / #${player.draft_escolha})` : 'Não draftado'}
                                </span>
                                {contract?.salario_anual_usd && (
                                    <span>
                                        <strong className="text-slate-300">Salário Anual:</strong>{' '}
                                        ${Number(contract.salario_anual_usd).toLocaleString()} USD
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Médias Principais da Temporada (Cards Grandes de Estatísticas) */}
                <div className="mb-10">
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center mb-4">
                        <Flame className="w-6 h-6 mr-2.5 text-amber-500" />
                        Médias da Temporada Atual
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-amber-400 block mb-1">Pontos</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.ppg ?? '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">PPG</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-emerald-400 block mb-1">Ressaltos</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.rpg ?? '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">RPG</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-blue-400 block mb-1">Assistências</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.apg ?? '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">APG</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-purple-400 block mb-1">Roubos</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.spg ?? '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">SPG</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-rose-400 block mb-1">Desarmes</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.bpg ?? '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">BPG</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center hover:border-slate-700 transition">
                            <span className="text-[11px] font-extrabold uppercase text-cyan-400 block mb-1">Lançamento (FG%)</span>
                            <span className="text-3xl font-black font-mono text-white">{currentAverages.fg_pct ? `${currentAverages.fg_pct}%` : '--'}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">FG%</span>
                        </div>
                    </div>

                    {/* Eficiência Secundária */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Triplos (3P%):</span>
                            <span className="font-mono font-black text-cyan-400">{currentAverages.fg3_pct ?? '--'}%</span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Lances Livres (FT%):</span>
                            <span className="font-mono font-black text-amber-400">{currentAverages.ft_pct ?? '--'}%</span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Minutos / Jogo:</span>
                            <span className="font-mono font-black text-white">{currentAverages.mpg ?? '--'} MIN</span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Jogos Disputados:</span>
                            <span className="font-mono font-black text-white">{currentAverages.jogos ?? 0} ({currentAverages.titular ?? 0} Titular)</span>
                        </div>
                    </div>
                </div>

                {/* Mapa de Calor & Zonas de Lançamento do Atleta */}
                <PlayerShotHeatmap player={player} currentAverages={currentAverages} />

                {/* Game Log: Registo dos Últimos Jogos */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-10">
                    <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center space-x-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                <span>Game Log: Desempenho nos Últimos Jogos</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Registo oficial de pontos, ressaltos, assistências e percentagens jogo a jogo.
                            </p>
                        </div>
                    </div>

                    {gameLogs && gameLogs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                                        <th className="py-3 px-4">Data</th>
                                        <th className="py-3 px-4">Adversário</th>
                                        <th className="py-3 px-3 text-center">Res</th>
                                        <th className="py-3 px-2 text-center">MIN</th>
                                        <th className="py-3 px-2 text-center text-white font-extrabold">PTS</th>
                                        <th className="py-3 px-2 text-center">REB</th>
                                        <th className="py-3 px-2 text-center">AST</th>
                                        <th className="py-3 px-2 text-center">STL</th>
                                        <th className="py-3 px-2 text-center">BLK</th>
                                        <th className="py-3 px-2 text-center">FGM-A</th>
                                        <th className="py-3 px-2 text-center">3PM-A</th>
                                        <th className="py-3 px-2 text-center">FTM-A</th>
                                        <th className="py-3 px-2 text-center">+/-</th>
                                        <th className="py-3 px-4 text-center">Box</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-mono">
                                    {gameLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-850/60 transition">
                                            <td className="py-3 px-4 text-slate-400 font-sans text-xs whitespace-nowrap">
                                                {log.data_formatada}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                                                        {log.is_home ? 'vs' : '@'}
                                                    </span>
                                                    <img src={log.adversario_logo} className="w-5 h-5 object-contain" />
                                                    <span className="font-bold text-white font-sans">{log.adversario_sigla}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                    log.resultado === 'V'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {log.resultado} {log.marcador_final}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center text-slate-300">{log.minutos}</td>
                                            <td className="py-3 px-2 text-center font-extrabold text-white text-sm bg-blue-500/10">
                                                {log.pontos}
                                            </td>
                                            <td className="py-3 px-2 text-center text-slate-300">{log.ressaltos_totais}</td>
                                            <td className="py-3 px-2 text-center text-slate-300">{log.assistencias}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{log.roubos_bola}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{log.desarmes_lancamento}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{log.fg_marcados}-{log.fg_tentados}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{log.fg3_marcados}-{log.fg3_tentados}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{log.ft_marcados}-{log.ft_tentados}</td>
                                            <td className={`py-3 px-2 text-center font-bold ${
                                                log.mais_menos > 0 ? 'text-emerald-400' : (log.mais_menos < 0 ? 'text-red-400' : 'text-slate-400')
                                            }`}>
                                                {log.mais_menos > 0 ? `+${log.mais_menos}` : log.mais_menos}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Link
                                                    href={`/jogos/${log.jogo_id}`}
                                                    className="inline-flex items-center px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-[11px] font-sans font-bold text-slate-300 hover:text-white transition"
                                                >
                                                    Box Score
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Nenhum registo de jogo recente encontrado para esta temporada.
                        </div>
                    )}
                </div>

                {/* Histórico das Temporadas na Carreira */}
                {seasonStats && seasonStats.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-12">
                        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
                            <h3 className="text-lg font-black text-white flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <span>Histórico por Temporada da Carreira</span>
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                                        <th className="py-3 px-4">Temporada</th>
                                        <th className="py-3 px-4">Equipa</th>
                                        <th className="py-3 px-2 text-center">J</th>
                                        <th className="py-3 px-2 text-center">TIT</th>
                                        <th className="py-3 px-2 text-center">MIN</th>
                                        <th className="py-3 px-2 text-center text-white font-extrabold">PPG</th>
                                        <th className="py-3 px-2 text-center">RPG</th>
                                        <th className="py-3 px-2 text-center">APG</th>
                                        <th className="py-3 px-2 text-center">SPG</th>
                                        <th className="py-3 px-2 text-center">BPG</th>
                                        <th className="py-3 px-2 text-center">FG%</th>
                                        <th className="py-3 px-2 text-center">3P%</th>
                                        <th className="py-3 px-2 text-center">FT%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-mono">
                                    {seasonStats.map((st) => (
                                        <tr key={st.id} className="hover:bg-slate-850/60 transition">
                                            <td className="py-3 px-4 font-bold text-white font-sans">{st.epoca_nome}</td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <img src={st.equipa_logo} className="w-4 h-4 object-contain" />
                                                    <span className="font-bold text-slate-300 font-sans">{st.equipa_sigla}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center text-slate-300">{st.jogos_disputados}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.titular}</td>
                                            <td className="py-3 px-2 text-center text-slate-300">{st.minutos_jogo}</td>
                                            <td className="py-3 px-2 text-center font-extrabold text-white text-sm bg-blue-500/10">
                                                {st.pontos_jogo}
                                            </td>
                                            <td className="py-3 px-2 text-center text-slate-300">{st.ressaltos_jogo}</td>
                                            <td className="py-3 px-2 text-center text-slate-300">{st.assistencias_jogo}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.roubos_jogo}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.desarmes_jogo}</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.fg_pct}%</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.fg3_pct}%</td>
                                            <td className="py-3 px-2 text-center text-slate-400">{st.ft_pct}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

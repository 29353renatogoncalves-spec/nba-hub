import React, { useState, useEffect } from 'react';
import { Heart, Star, Calendar, ChevronRight, Settings, Plus, X, Search, Trophy, Shield, Activity, MapPin } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function MyNbaWidget({ auth, teams = [] }) {
    const [favTeamId, setFavTeamId] = useState(null);
    const [favPlayerIds, setFavPlayerIds] = useState([]);
    const [favoritesData, setFavoritesData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamSearch, setTeamSearch] = useState('');
    const [playerSearch, setPlayerSearch] = useState('');
    const [allPlayers, setAllPlayers] = useState([]);

    // 1. Inicializar IDs a partir do utilizador autenticado ou do localStorage
    useEffect(() => {
        let initialTeam = null;
        let initialPlayers = [];

        if (auth?.user?.equipa_favorita_id) {
            initialTeam = auth.user.equipa_favorita_id;
        } else {
            const storedTeam = localStorage.getItem('nba_fav_team');
            if (storedTeam) initialTeam = Number(storedTeam);
        }

        if (auth?.user?.jogadores_favoritos && Array.isArray(auth.user.jogadores_favoritos)) {
            initialPlayers = auth.user.jogadores_favoritos;
        } else {
            const storedPlayers = localStorage.getItem('nba_fav_players');
            if (storedPlayers) initialPlayers = JSON.parse(storedPlayers);
        }

        // Se ainda não tiver favorito definido, sugerir uma equipa icónica como Lakers por padrão (id 23)
        setFavTeamId(initialTeam);
        setFavPlayerIds(initialPlayers);
    }, [auth]);

    // 2. Carregar dados completos dos favoritos da API
    useEffect(() => {
        if (!favTeamId && (!favPlayerIds || favPlayerIds.length === 0)) {
            setFavoritesData(null);
            return;
        }

        const fetchFavData = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (favTeamId) params.append('team_id', favTeamId);
                if (favPlayerIds && favPlayerIds.length > 0) params.append('player_ids', favPlayerIds.join(','));

                const res = await fetch(`/api/user/favorites-data?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setFavoritesData(data);
                }
            } catch (err) {
                console.error('Falha ao obter dados de favoritos:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavData();
    }, [favTeamId, favPlayerIds]);

    // 3. Extrair lista plana de jogadores de todas as equipas para pesquisa no modal
    useEffect(() => {
        if (teams && teams.length > 0) {
            const flatPlayers = [];
            teams.forEach(t => {
                if (t.jogadores && Array.isArray(t.jogadores)) {
                    t.jogadores.forEach(j => {
                        flatPlayers.push({
                            ...j,
                            equipa_sigla: t.sigla,
                            equipa_nome: t.nome_completo,
                            equipa_logo: t.logo_url,
                        });
                    });
                }
            });
            setAllPlayers(flatPlayers);
        }
    }, [teams]);

    // 4. Salvar seleção de favoritos
    const handleSaveFavorites = async (newTeamId, newPlayerIds) => {
        setFavTeamId(newTeamId);
        setFavPlayerIds(newPlayerIds);

        // Guardar no localStorage
        if (newTeamId) localStorage.setItem('nba_fav_team', newTeamId.toString());
        else localStorage.removeItem('nba_fav_team');

        localStorage.setItem('nba_fav_players', JSON.stringify(newPlayerIds));

        // Se o utilizador estiver autenticado, guardar na base de dados
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
                        equipa_id: newTeamId,
                        jogadores_ids: newPlayerIds,
                    })
                });
            } catch (err) {
                console.error('Falha ao guardar na conta:', err);
            }
        }

        setIsModalOpen(false);
    };

    const team = favoritesData?.team;
    const players = favoritesData?.players || [];

    // Se não tiver nenhum favorito selecionado, mostra o banner de boas-vindas para configurar
    if (!favTeamId && favPlayerIds.length === 0) {
        return (
            <section id="minha-nba" className="mb-12 scroll-mt-24">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-red-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                            <Heart className="w-7 h-7 text-red-500 fill-current animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                                Espaço Personalizado
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white">
                                Minha NBA: Escolhe a tua Franquia e Jogadores Favoritos
                            </h2>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                                Recebe o acompanhamento do próximo jogo da tua equipa, alertas de resultados e o desempenho individual dos teus atletas de eleição num só lugar.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-900/40 flex items-center space-x-2 whitespace-nowrap flex-shrink-0"
                    >
                        <Star className="w-4 h-4 fill-current text-amber-300" />
                        <span>Configurar Meus Favoritos</span>
                    </button>
                </div>

                {/* Modal de Configuração */}
                {isModalOpen && (
                    <FavoritesModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        currentTeamId={favTeamId}
                        currentPlayerIds={favPlayerIds}
                        teams={teams}
                        allPlayers={allPlayers}
                        onSave={handleSaveFavorites}
                    />
                )}
            </section>
        );
    }

    return (
        <section id="minha-nba" className="mb-12 scroll-mt-24">
            {/* Header da Secção */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                        Minha NBA & Favoritos
                    </h2>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gerir Favoritos</span>
                </button>
            </div>

            {/* Grelha de Favoritos: Equipa em Destaque + Jogadores */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Card da Equipa Favorita */}
                {team?.info && (
                    <div 
                        className="lg:col-span-7 rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden flex flex-col justify-between"
                        style={{
                            backgroundColor: '#090d16',
                            borderColor: team.info.cor_primaria ? `${team.info.cor_primaria}40` : '#334155',
                        }}
                    >
                        {/* Glow de fundo */}
                        <div 
                            className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ backgroundColor: team.info.cor_primaria || '#1D428A' }}
                        />

                        <div className="relative z-10">
                            {/* Topo do Card da Equipa */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                                <div className="flex items-center space-x-3">
                                    <div className="w-14 h-14 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                        <img src={team.info.logo_url} alt={team.info.nome_completo} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                                            Equipa do Coração
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                            {team.info.nome_completo}
                                        </h3>
                                        {team.standing && (
                                            <span className="text-xs text-slate-400 font-mono">
                                                {team.standing.posicao}º no {team.standing.conferencia} ({team.standing.vitorias}V - {team.standing.derrotas}D)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={`/equipas/${team.info.sigla}`}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition flex items-center space-x-1"
                                >
                                    <span>Plantel</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Próximo Jogo e Último Resultado */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                                {/* Próximo Jogo */}
                                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                                    <span className="text-[10px] font-black uppercase text-sky-400 block mb-2 flex items-center space-x-1">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Próxima Partida
                                    </span>
                                    {team.nextGame ? (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <img src={team.nextGame.casa_logo} className="w-6 h-6 object-contain" />
                                                    <span className="text-xs font-bold text-white">{team.nextGame.casa_sigla}</span>
                                                    <span className="text-slate-500 font-bold">vs</span>
                                                    <img src={team.nextGame.fora_logo} className="w-6 h-6 object-contain" />
                                                    <span className="text-xs font-bold text-white">{team.nextGame.fora_sigla}</span>
                                                </div>
                                                <span className="text-[11px] font-mono text-slate-400">
                                                    {new Date(team.nextGame.data_hora).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 block mt-2 truncate flex items-center">
                                                <MapPin className="w-3 h-3 mr-1 text-slate-600" />
                                                {team.nextGame.arena_nome}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500">Nenhum jogo agendado nos próximos dias.</span>
                                    )}
                                </div>

                                {/* Último Jogo */}
                                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                                    <span className="text-[10px] font-black uppercase text-amber-400 block mb-2 flex items-center space-x-1">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Último Resultado
                                    </span>
                                    {team.lastGame ? (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs font-bold text-white">{team.lastGame.casa_sigla}</span>
                                                    <span className="text-sm font-black font-mono text-white">{team.lastGame.pontos_casa}</span>
                                                    <span className="text-slate-600">-</span>
                                                    <span className="text-sm font-black font-mono text-white">{team.lastGame.pontos_fora}</span>
                                                    <span className="text-xs font-bold text-white">{team.lastGame.fora_sigla}</span>
                                                </div>
                                                <Link
                                                    href={`/jogos/${team.lastGame.id}`}
                                                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
                                                >
                                                    Box Score
                                                </Link>
                                            </div>
                                            <span className="text-[10px] text-slate-500 block mt-2 font-mono">
                                                {new Date(team.lastGame.data_hora).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500">Sem resultados recentes.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Jogadores Favoritos */}
                <div className={`${team?.info ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col justify-between`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                                    <span>Atletas Favoritos ({players.length})</span>
                                </h3>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Adicionar</span>
                                </button>
                            </div>

                            {players.length > 0 ? (
                                <div className="space-y-2.5">
                                    {players.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={`/jogadores/${p.id}`}
                                            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={p.foto_url || `/images/players/${p.id}.png`}
                                                        alt={p.nome_completo}
                                                        className="w-full h-full object-cover object-top"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/players/placeholder.png';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition block">
                                                        {p.nome_completo}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                                                        <span>{p.equipa_sigla}</span>
                                                        <span>•</span>
                                                        <span>#{p.numero_camisola}</span>
                                                        <span>•</span>
                                                        <span>{p.posicao_primaria}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right font-mono">
                                                <span className="text-sm font-black text-white block">
                                                    {p.ppg ?? '--'} <span className="text-[10px] font-sans text-slate-500 font-normal">PPG</span>
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {p.rpg ?? '--'} RPG • {p.apg ?? '--'} APG
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-slate-500 text-xs">
                                    <Star className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-amber-400" />
                                    <span>Ainda não adicionaste nenhum jogador aos favoritos.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Configuração de Favoritos */}
            {isModalOpen && (
                <FavoritesModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    currentTeamId={favTeamId}
                    currentPlayerIds={favPlayerIds}
                    teams={teams}
                    allPlayers={allPlayers}
                    onSave={handleSaveFavorites}
                />
            )}
        </section>
    );
}

// Modal Interativo para Escolha de Equipa e Atletas Favoritos
function FavoritesModal({ isOpen, onClose, currentTeamId, currentPlayerIds = [], teams = [], allPlayers = [], onSave }) {
    const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState(currentPlayerIds);
    const [teamSearch, setTeamSearch] = useState('');
    const [playerSearch, setPlayerSearch] = useState('');
    const [activeTab, setActiveTab] = useState('equipa'); // 'equipa' | 'jogadores'

    const filteredTeams = teams.filter(t => 
        t.nome_completo.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.sigla.toLowerCase().includes(teamSearch.toLowerCase())
    );

    const filteredPlayers = allPlayers.filter(p =>
        p.nome_completo.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.equipa_sigla.toLowerCase().includes(playerSearch.toLowerCase())
    );

    const togglePlayer = (pId) => {
        if (selectedPlayerIds.includes(pId)) {
            setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== pId));
        } else {
            if (selectedPlayerIds.length >= 8) {
                alert('Podes escolher até 8 jogadores favoritos.');
                return;
            }
            setSelectedPlayerIds([...selectedPlayerIds, pId]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header do Modal */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                    <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        <h3 className="text-lg font-black text-white">Configurar Minha NBA</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Abas Equipa vs Jogadores */}
                <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-2 text-xs">
                    <button
                        onClick={() => setActiveTab('equipa')}
                        className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                            activeTab === 'equipa'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Equipa Favorita</span>
                        {selectedTeamId && <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('jogadores')}
                        className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                            activeTab === 'jogadores'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        <span>Jogadores Favoritos ({selectedPlayerIds.length}/8)</span>
                    </button>
                </div>

                {/* Conteúdo da Aba */}
                <div className="p-5 overflow-y-auto flex-1">
                    {activeTab === 'equipa' && (
                        <div>
                            {/* Barra de Pesquisa */}
                            <div className="relative mb-4">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por nome ou sigla (ex: Lakers, BOS, Warriors)..."
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Grelha das Equipas */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredTeams.map((t) => {
                                    const isSelected = selectedTeamId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTeamId(t.id)}
                                            className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition ${
                                                isSelected
                                                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white'
                                                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                                            }`}
                                        >
                                            <div className="w-10 h-10 p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                                <img src={t.logo_url} alt={t.nome_completo} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="truncate">
                                                <span className="block text-xs font-black truncate">{t.nome_completo}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">{t.sigla}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'jogadores' && (
                        <div>
                            {/* Barra de Pesquisa */}
                            <div className="relative mb-4">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar atleta por nome ou sigla da equipa (ex: Luka, Curry, LeBron)..."
                                    value={playerSearch}
                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Lista de Atletas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto">
                                {filteredPlayers.map((p) => {
                                    const isSelected = selectedPlayerIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => togglePlayer(p.id)}
                                            className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition ${
                                                isSelected
                                                    ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                                                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2.5 truncate">
                                                <img
                                                    src={p.foto_url || `/images/players/${p.id}.png`}
                                                    className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/images/players/placeholder.png';
                                                    }}
                                                />
                                                <div className="truncate">
                                                    <span className="block text-xs font-bold text-white truncate">{p.nome_completo}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {p.equipa_sigla} • #{p.numero_camisola}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                                                isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                                            }`}>
                                                {isSelected && <Star className="w-3 h-3 fill-current" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rodapé do Modal com Botão Salvar */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        {selectedTeamId ? '1 Franquia selecionada' : 'Nenhuma franquia'} • {selectedPlayerIds.length} Jogadores
                    </span>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onSave(selectedTeamId, selectedPlayerIds)}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-900/40"
                        >
                            Guardar Favoritos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

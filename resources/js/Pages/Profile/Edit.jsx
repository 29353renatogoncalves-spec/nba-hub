import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { User, Shield, Heart, Lock, Trash2, CheckCircle2, AlertCircle, Star, Save, ArrowLeft, Camera, ExternalLink } from 'lucide-react';

export default function Edit({
    auth,
    status,
    teams = [],
    favoriteTeam,
    favoritePlayers = [],
    isGoogleUser,
}) {
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('geral'); // 'geral', 'favoritos', 'seguranca', 'perigo'

    // Form 1: Informações Básicas
    const formProfile = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        equipa_favorita_id: user.equipa_favorita_id || '',
    });

    // Form 2: Palavra-passe
    const formPassword = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Form 3: Eliminar Conta
    const formDelete = useForm({
        password: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        formProfile.patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        formPassword.put(route('profile.password'), {
            preserveScroll: true,
            onSuccess: () => formPassword.reset(),
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        if (confirm('Tem a certeza que deseja eliminar permanentemente a sua conta? Esta ação não pode ser desfeita.')) {
            formDelete.delete(route('profile.destroy'));
        }
    };

    // Previews para o avatar
    const selectedTeamInfo = teams.find(t => Number(t.id) === Number(formProfile.data.equipa_favorita_id)) || favoriteTeam;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Meu Perfil - NBA Hub" />

            <Navbar auth={auth} />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botão de Retorno */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Hub da NBA</span>
                    </Link>
                </div>

                {/* Banner de Cabeçalho do Perfil */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 mb-8">
                    {/* Glow de fundo */}
                    <div 
                        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ backgroundColor: selectedTeamInfo?.cor_primaria || '#1D428A' }}
                    />
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-xl flex items-center justify-center flex-shrink-0">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-500" />
                                    )}
                                </div>
                                {isGoogleUser && (
                                    <span 
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white p-1 border-2 border-slate-900 shadow flex items-center justify-center"
                                        title="Conta conectada com o Google"
                                    >
                                        <svg className="w-full h-full" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                        </svg>
                                    </span>
                                )}
                            </div>

                            {/* Informações de Perfil */}
                            <div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
                                        Fã NBA
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                                <span className="text-[11px] text-slate-500 block mt-1">
                                    Membro desde {new Date(user.criado_em || user.created_at || Date.now()).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        {/* Emblema da Equipa Favorita no Topo */}
                        {selectedTeamInfo && (
                            <Link
                                href={`/equipas/${selectedTeamInfo.sigla}`}
                                className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 transition group"
                                title="Ver página da franquia"
                            >
                                <div className="w-10 h-10 p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                    <img src={selectedTeamInfo.logo_url} alt={selectedTeamInfo.nome_completo} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-blue-400 block">Minha Franquia</span>
                                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition block">
                                        {selectedTeamInfo.nome_completo}
                                    </span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 ml-1" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mensagens de Sucesso */}
                {status && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Navegação por Abas do Perfil */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`px-4 py-2.5 rounded-2xl font-black transition flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === 'geral'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Dados Pessoais</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('favoritos')}
                        className={`px-4 py-2.5 rounded-2xl font-black transition flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === 'favoritos'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                        <span>Preferências NBA</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('seguranca')}
                        className={`px-4 py-2.5 rounded-2xl font-black transition flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === 'seguranca'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        <span>Segurança & Senha</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('perigo')}
                        className={`px-4 py-2.5 rounded-2xl font-black transition flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === 'perigo'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Conta</span>
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    {/* ABA 1: DADOS PESSOAIS */}
                    {activeTab === 'geral' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-white">Informações da Conta</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Atualiza os teus dados de utilizador e a imagem de perfil do NBA Hub.
                                </p>
                            </div>

                            <form onSubmit={submitProfile} className="space-y-5 max-w-xl">
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formProfile.data.name}
                                        onChange={(e) => formProfile.setData('name', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                    {formProfile.errors.name && (
                                        <span className="text-xs text-red-400 mt-1 block">{formProfile.errors.name}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formProfile.data.email}
                                        onChange={(e) => formProfile.setData('email', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                    {formProfile.errors.email && (
                                        <span className="text-xs text-red-400 mt-1 block">{formProfile.errors.email}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1">URL do Avatar / Foto</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="url"
                                            value={formProfile.data.avatar_url}
                                            placeholder="https://exemplo.com/minha-foto.png"
                                            onChange={(e) => formProfile.setData('avatar_url', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <Camera className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                        Podes colar o link direto de uma foto de perfil ou do logotipo da tua equipa favorita.
                                    </span>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={formProfile.processing}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-lg shadow-blue-900/40 flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>{formProfile.processing ? 'A Guardar...' : 'Guardar Alterações'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA 2: PREFERÊNCIAS NBA (EQUIPA E ATLETAS FAVORITOS) */}
                    {activeTab === 'favoritos' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-white flex items-center space-x-2">
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    <span>Preferências & Favoritos da NBA</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Define a tua franquia predileta para receberes acompanhamento personalizado no topo da página inicial.
                                </p>
                            </div>

                            <form onSubmit={submitProfile} className="space-y-6 max-w-2xl">
                                {/* Seletor de Franquia Favorita */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-2">
                                        Franquia Favorita da NBA:
                                    </label>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
                                        {teams.map((t) => {
                                            const isSelected = Number(formProfile.data.equipa_favorita_id) === Number(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => formProfile.setData('equipa_favorita_id', t.id)}
                                                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                                                        isSelected
                                                            ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/40 text-white'
                                                            : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    <img src={t.logo_url} className="w-6 h-6 object-contain flex-shrink-0" />
                                                    <span className="text-xs font-bold truncate">{t.nome_completo}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Atletas Favoritos Atuais */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-2">
                                        Atletas Favoritos Associados:
                                    </label>
                                    {favoritePlayers.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {favoritePlayers.map((p) => (
                                                <Link
                                                    key={p.id}
                                                    href={`/jogadores/${p.id}`}
                                                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={p.foto_url || `/images/players/${p.id}.png`}
                                                            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/images/players/placeholder.png';
                                                            }}
                                                        />
                                                        <div>
                                                            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition block">
                                                                {p.nome_completo}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">
                                                                {p.equipa_sigla} • #{p.numero_camisola}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                                            Podes favoritar atletas clicando no botão "Favoritar Jogador" na página de qualquer atleta ou através do widget "Minha NBA".
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={formProfile.processing}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-lg shadow-blue-900/40 flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Guardar Preferências</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA 3: SEGURANÇA & PALAVRA-PASSE */}
                    {activeTab === 'seguranca' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-white">Segurança & Palavra-passe</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Garante que a tua conta está protegida com uma senha forte e segura.
                                </p>
                            </div>

                            {isGoogleUser ? (
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start space-x-3 max-w-xl">
                                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block text-white mb-0.5">Autenticação Gerida pela Google</span>
                                        <span>A tua conta está associada com a Google. A palavra-passe e a autenticação em dois passos são geridas diretamente pela segurança da tua conta Google.</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submitPassword} className="space-y-4 max-w-xl">
                                    <div>
                                        <label className="text-xs font-bold text-slate-300 block mb-1">Palavra-passe Atual</label>
                                        <input
                                            type="password"
                                            value={formPassword.data.current_password}
                                            onChange={(e) => formPassword.setData('current_password', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        {formPassword.errors.current_password && (
                                            <span className="text-xs text-red-400 mt-1 block">{formPassword.errors.current_password}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-300 block mb-1">Nova Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={formPassword.data.password}
                                            onChange={(e) => formPassword.setData('password', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        {formPassword.errors.password && (
                                            <span className="text-xs text-red-400 mt-1 block">{formPassword.errors.password}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-300 block mb-1">Confirmar Nova Palavra-passe</label>
                                        <input
                                            type="password"
                                            value={formPassword.data.password_confirmation}
                                            onChange={(e) => formPassword.setData('password_confirmation', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        {formPassword.errors.password_confirmation && (
                                            <span className="text-xs text-red-400 mt-1 block">{formPassword.errors.password_confirmation}</span>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={formPassword.processing}
                                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-lg shadow-blue-900/40 disabled:opacity-50"
                                        >
                                            {formPassword.processing ? 'A Atualizar...' : 'Atualizar Palavra-passe'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ABA 4: ZONA DE PERIGO */}
                    {activeTab === 'perigo' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-red-400 flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <span>Zona de Risco: Eliminar Conta</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Uma vez eliminada a tua conta, todas as tuas preferências, favoritos e dados serão removidos permanentemente.
                                </p>
                            </div>

                            <form onSubmit={submitDelete} className="space-y-4 max-w-xl">
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1">
                                        Confirma com a tua palavra-passe para prosseguir:
                                    </label>
                                    <input
                                        type="password"
                                        value={formDelete.data.password}
                                        onChange={(e) => formDelete.setData('password', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                    {formDelete.errors.password && (
                                        <span className="text-xs text-red-400 mt-1 block">{formDelete.errors.password}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={formDelete.processing}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition shadow-lg shadow-red-900/40 disabled:opacity-50"
                                >
                                    {formDelete.processing ? 'A Eliminar...' : 'Eliminar Conta Definitivamente'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

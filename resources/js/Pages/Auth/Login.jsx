import React, { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, errors: pageErrors }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sessão - NBA Hub" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-black text-white">Bem-vindo ao NBA Hub</h1>
                <p className="text-xs text-slate-400 mt-1">
                    Acede à tua conta para gerir equipas e atletas favoritos.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    {status}
                </div>
            )}

            {(errors.email || pageErrors?.email) && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                    {errors.email || pageErrors?.email}
                </div>
            )}

            {/* Botão Oficial 100% Google via Laravel Socialite */}
            <a
                href={route('auth.google')}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm shadow-lg transition transform hover:-translate-y-0.5 border border-slate-300 mb-6 cursor-pointer"
            >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continuar com o Google</span>
            </a>

            {/* Separador */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-black tracking-wider whitespace-nowrap">
                    ou entrar com email e senha
                </span>
                <div className="border-t border-slate-800 w-full" />
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoComplete="username"
                        placeholder="teu.email@exemplo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">Palavra-passe</label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                            >
                                Esqueceu-se da senha?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        <span className="ms-2 text-xs text-slate-400">Lembrar-me</span>
                    </label>

                    <Link
                        href={route('register')}
                        className="text-xs font-bold text-slate-400 hover:text-white transition"
                    >
                        Criar conta
                    </Link>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-900/40 disabled:opacity-50"
                    >
                        {processing ? 'A entrar...' : 'Entrar no Hub'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

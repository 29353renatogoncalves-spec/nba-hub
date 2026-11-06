<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redireciona o utilizador 100% para a página oficial de autenticação da Google via Laravel Socialite (Composer).
     * O Google é quem pede e valida o email, a palavra-passe e a autenticação em 2 passos (2FA).
     */
    public function redirectToGoogle(Request $request)
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $hasValidKeys = !empty($clientId) && !empty($clientSecret) && $clientId !== 'your-google-client-id';

        if (!$hasValidKeys) {
            return redirect()->route('login')->withErrors([
                'email' => 'Para autenticação 100% oficial com a Google via Socialite, configura as chaves GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ficheiro .env. Obtém-nas gratuitamente em console.cloud.google.com com o redirect URI: ' . config('services.google.redirect')
            ]);
        }

        $redirectUri = config('services.google.redirect', 'http://127.0.0.1:8000/auth/google/callback');

        return Socialite::driver('google')
            ->stateless()
            ->redirectUrl($redirectUri)
            ->redirect();
    }

    /**
     * Callback oficial retornado pela Google após autorização do utilizador via OAuth2.
     * Recebe os dados autenticados diretamente dos servidores oficiais da Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $redirectUri = config('services.google.redirect', 'http://127.0.0.1:8000/auth/google/callback');

            $googleUser = Socialite::driver('google')
                ->stateless()
                ->redirectUrl($redirectUri)
                ->user();

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Atualizar dados do perfil Google
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar() ?: $user->avatar_url,
                    'ultimo_login' => now(),
                    'ativo' => 1,
                ]);
            } else {
                // Criar novo utilizador via Google
                $user = User::create([
                    'nome' => $googleUser->getName() ?: 'Utilizador Google',
                    'name' => $googleUser->getName() ?: 'Utilizador Google',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                    'senha' => Hash::make(Str::random(32)),
                    'password' => Hash::make(Str::random(32)),
                    'ativo' => 1,
                    'papel_id' => 2,
                    'email_verified_at' => now(),
                    'ultimo_login' => now(),
                ]);
            }

            Auth::login($user, true);
            $request->session()->regenerate();

            return redirect()->intended('/')->with('status', "Bem-vindo, {$user->name}! Sessão autenticada 100% com a Google.");
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Falha na autenticação oficial com a Google: ' . $e->getMessage(),
            ]);
        }
    }
}

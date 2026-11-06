<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NbaHubController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ArenaController;
use App\Http\Controllers\BettingController;
use App\Http\Controllers\UserFavoritesController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [NbaHubController::class, 'index'])->name('home');
Route::match(['get', 'post'], '/sync-espn', [NbaHubController::class, 'syncEspn'])->name('nba.sync');
Route::get('/api/live-scores', [NbaHubController::class, 'liveScores'])->name('nba.live_scores');
Route::get('/calendario', [GameController::class, 'calendar'])->name('calendar');
Route::get('/jogos/{id}', [GameController::class, 'show'])->name('game.show');
Route::get('/equipas/{sigla}', [TeamController::class, 'show'])->name('team.show');
Route::get('/jogadores/{id}', [PlayerController::class, 'show'])->name('player.show');

// Mapa Interativo das Arenas da NBA
Route::get('/arenas', [ArenaController::class, 'index'])->name('arenas.index');

// Apostas Virtuais (NBA Sportsbook & Bet Slip)
Route::get('/apostas', [BettingController::class, 'index'])->name('betting.index');
Route::post('/api/apostas', [BettingController::class, 'store'])->name('betting.store');
Route::post('/api/apostas/bonus', [BettingController::class, 'claimDailyBonus'])->name('betting.bonus');
Route::post('/api/apostas/reset', [BettingController::class, 'resetBonus'])->name('betting.reset');
Route::post('/api/apostas/resolver', [BettingController::class, 'resolveBetsManually'])->name('betting.resolve');

// Google Authentication (100% Oficial via Laravel Socialite)
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Minha NBA / Favoritos
Route::match(['get', 'post'], '/api/user/favorites', [UserFavoritesController::class, 'update'])->name('user.favorites.update');
Route::get('/api/user/favorites-data', [UserFavoritesController::class, 'getFavorites'])->name('user.favorites.get');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/perfil', [ProfileController::class, 'edit'])->name('profile.show');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

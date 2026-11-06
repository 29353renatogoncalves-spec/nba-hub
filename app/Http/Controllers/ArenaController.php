<?php

namespace App\Http\Controllers;

use App\Models\Arena;
use App\Models\Jogo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArenaController extends Controller
{
    /**
     * Mapeamento de coordenadas (X, Y percentuais no mapa da América do Norte 1000x600),
     * coordenadas GPS reais e fotos de alta resolução de cada arena da NBA.
     */
    protected static array $arenaMetadata = [
        // Conferência Este - Divisão Atlântico
        'BOS' => ['x' => 88.5, 'y' => 28.5, 'lat' => 42.3663, 'lng' => -71.0622, 'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'],
        'NYK' => ['x' => 85.0, 'y' => 33.5, 'lat' => 40.7505, 'lng' => -73.9934, 'photo' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'],
        'BKN' => ['x' => 85.8, 'y' => 34.2, 'lat' => 40.6826, 'lng' => -73.9754, 'photo' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'],
        'PHI' => ['x' => 83.0, 'y' => 36.5, 'lat' => 39.9012, 'lng' => -75.1720, 'photo' => 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80'],
        'TOR' => ['x' => 78.5, 'y' => 25.0, 'lat' => 43.6435, 'lng' => -79.3791, 'photo' => 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'],

        // Conferência Este - Divisão Central
        'CHI' => ['x' => 64.5, 'y' => 32.0, 'lat' => 41.8807, 'lng' => -87.6742, 'photo' => 'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80'],
        'CLE' => ['x' => 75.0, 'y' => 33.0, 'lat' => 41.4965, 'lng' => -81.6882, 'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'],
        'DET' => ['x' => 73.0, 'y' => 29.5, 'lat' => 42.3411, 'lng' => -83.0553, 'photo' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'],
        'IND' => ['x' => 67.5, 'y' => 37.5, 'lat' => 39.7640, 'lng' => -86.1555, 'photo' => 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80'],
        'MIL' => ['x' => 63.5, 'y' => 27.5, 'lat' => 43.0451, 'lng' => -87.9174, 'photo' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'],

        // Conferência Este - Divisão Sudeste
        'ATL' => ['x' => 72.0, 'y' => 59.5, 'lat' => 33.7573, 'lng' => -84.3963, 'photo' => 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'],
        'CHA' => ['x' => 78.5, 'y' => 53.5, 'lat' => 35.2251, 'lng' => -80.8392, 'photo' => 'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80'],
        'MIA' => ['x' => 82.5, 'y' => 86.5, 'lat' => 25.7814, 'lng' => -80.1870, 'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'],
        'ORL' => ['x' => 79.0, 'y' => 76.5, 'lat' => 28.5392, 'lng' => -81.3839, 'photo' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'],
        'WAS' => ['x' => 81.5, 'y' => 40.0, 'lat' => 38.8982, 'lng' => -77.0209, 'photo' => 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80'],

        // Conferência Oeste - Divisão Noroeste
        'DEN' => ['x' => 38.0, 'y' => 39.5, 'lat' => 39.7487, 'lng' => -105.0076, 'photo' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'],
        'MIN' => ['x' => 55.0, 'y' => 22.5, 'lat' => 44.9795, 'lng' => -93.2761, 'photo' => 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'],
        'OKC' => ['x' => 49.5, 'y' => 55.0, 'lat' => 35.4634, 'lng' => -97.5151, 'photo' => 'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80'],
        'POR' => ['x' => 11.0, 'y' => 17.5, 'lat' => 45.5316, 'lng' => -122.6668, 'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'],
        'UTA' => ['x' => 27.0, 'y' => 35.5, 'lat' => 40.7683, 'lng' => -111.9011, 'photo' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'],

        // Conferência Oeste - Divisão Pacífico
        'GSW' => ['x' => 8.0, 'y' => 43.5, 'lat' => 37.7680, 'lng' => -122.3877, 'photo' => 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80'],
        'LAC' => ['x' => 12.0, 'y' => 56.5, 'lat' => 33.9583, 'lng' => -118.3428, 'photo' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'],
        'LAL' => ['x' => 13.5, 'y' => 55.5, 'lat' => 34.0430, 'lng' => -118.2673, 'photo' => 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'],
        'PHX' => ['x' => 23.5, 'y' => 60.5, 'lat' => 33.4457, 'lng' => -112.0712, 'photo' => 'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80'],
        'SAC' => ['x' => 9.0, 'y' => 40.5, 'lat' => 38.5802, 'lng' => -121.4997, 'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'],

        // Conferência Oeste - Divisão Sudoeste
        'DAL' => ['x' => 50.5, 'y' => 64.0, 'lat' => 32.7905, 'lng' => -96.8103, 'photo' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'],
        'HOU' => ['x' => 53.0, 'y' => 75.5, 'lat' => 29.7508, 'lng' => -95.3621, 'photo' => 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80'],
        'MEM' => ['x' => 63.0, 'y' => 54.5, 'lat' => 35.1381, 'lng' => -90.0506, 'photo' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'],
        'NOP' => ['x' => 63.5, 'y' => 74.5, 'lat' => 29.9490, 'lng' => -90.0821, 'photo' => 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'],
        'SAS' => ['x' => 47.5, 'y' => 76.5, 'lat' => 29.4270, 'lng' => -98.4375, 'photo' => 'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80'],
    ];

    public function index()
    {
        $arenas = Arena::with('equipas')->get()->map(function ($arena) {
            $team = $arena->equipas->first();
            $sigla = $team ? $team->sigla : 'NBA';
            $meta = self::$arenaMetadata[$sigla] ?? [
                'x' => 50.0,
                'y' => 50.0,
                'lat' => 39.8283,
                'lng' => -98.5795,
                'photo' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'
            ];

            // Próximos jogos ou jogos recentes nesta arena
            $recentGames = Jogo::where('arena_id', $arena->id)
                ->with(['equipaCasa', 'equipaFora'])
                ->orderBy('data_hora', 'desc')
                ->take(3)
                ->get();

            return [
                'id' => $arena->id,
                'nome' => $arena->nome,
                'cidade' => $arena->cidade,
                'estado' => $arena->estado,
                'capacidade' => (int) $arena->capacidade,
                'ano_inauguracao' => $arena->ano_inauguracao,
                'equipa' => $team ? [
                    'id' => $team->id,
                    'nome' => $team->nome,
                    'nome_completo' => $team->nome_completo,
                    'sigla' => $team->sigla,
                    'conferencia' => $team->conferencia,
                    'divisao' => $team->divisao,
                    'logo_url' => $team->logo_url,
                    'cor_primaria' => $team->cor_primaria,
                    'cor_secundaria' => $team->cor_secundaria,
                ] : null,
                'map_x' => $meta['x'],
                'map_y' => $meta['y'],
                'lat' => $meta['lat'],
                'lng' => $meta['lng'],
                'photo_url' => $meta['photo'],
                'games' => $recentGames,
            ];
        });

        return Inertia::render('Arenas', [
            'arenas' => $arenas,
        ]);
    }
}

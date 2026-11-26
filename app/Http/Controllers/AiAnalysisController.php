<?php

namespace App\Http\Controllers;

use App\Models\Jogo;
use App\Services\GeminiAiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AiAnalysisController extends Controller
{
    protected GeminiAiService $aiService;

    public function __construct(GeminiAiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Previsão de quem vai ganhar a partida (jogos agendados ou a decorrer).
     */
    public function predict(int $id, Request $request): JsonResponse
    {
        $game = Jogo::with(['equipaCasa.arena', 'equipaFora', 'arena'])->findOrFail($id);
        $forceRefresh = $request->boolean('refresh', false);

        $result = $this->aiService->predictGameWinner($game, $forceRefresh);

        return response()->json([
            'success' => true,
            'game_id' => $game->id,
            'data' => $result
        ]);
    }

    /**
     * Resumo pós-jogo da partida (somente para jogos concluídos).
     */
    public function recap(int $id, Request $request): JsonResponse
    {
        $game = Jogo::with(['equipaCasa', 'equipaFora', 'periodos', 'arena'])->findOrFail($id);
        $forceRefresh = $request->boolean('refresh', false);

        $result = $this->aiService->generateGameRecap($game, $forceRefresh);

        if (isset($result['error']) && empty($result['success'])) {
            return response()->json([
                'success' => false,
                'message' => $result['error']
            ], 400);
        }

        return response()->json([
            'success' => true,
            'game_id' => $game->id,
            'data' => $result
        ]);
    }
}

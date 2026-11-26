<?php

namespace App\Services;

use App\Models\Jogo;
use App\Models\Jogador;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeminiAiService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY', '');
        $this->model = config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-2.5-flash');
    }

    /**
     * Prever o vencedor de uma partida agendada ou a decorrer.
     */
    public function predictGameWinner(Jogo $game, bool $forceRefresh = false): array
    {
        $cacheKey = "gemini_prediction_game_{$game->id}";

        if (!$forceRefresh && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $game->loadMissing(['equipaCasa.arena', 'equipaFora', 'arena']);

        $homeTeam = $game->equipaCasa;
        $awayTeam = $game->equipaFora;
        $arena = $game->arena ?: ($homeTeam ? $homeTeam->arena : null);

        // Classificação e métricas das equipas com fallback robusto
        $homeStanding = null;
        $awayStanding = null;
        try {
            $homeStanding = DB::table('vw_classificacao_nba')->where('equipa_id', $game->equipa_casa_id)->first();
            $awayStanding = DB::table('vw_classificacao_nba')->where('equipa_id', $game->equipa_fora_id)->first();
        } catch (\Throwable $e) {}

        if (!$homeStanding) {
            $homeStanding = DB::table('classificacao_oficial')->where('equipa_id', $game->equipa_casa_id)->orderByDesc('id')->first();
        }
        if (!$awayStanding) {
            $awayStanding = DB::table('classificacao_oficial')->where('equipa_id', $game->equipa_fora_id)->orderByDesc('id')->first();
        }

        // Líderes de época das equipas
        $homeLeaders = DB::table('estatisticas_jogador_epoca')
            ->join('jogadores', 'estatisticas_jogador_epoca.jogador_id', '=', 'jogadores.id')
            ->where('estatisticas_jogador_epoca.equipa_id', $game->equipa_casa_id)
            ->orderByDesc('pontos_jogo')
            ->take(4)
            ->get(['jogadores.nome_completo', 'jogadores.posicao_primaria', 'pontos_jogo', 'ressaltos_jogo', 'assistencias_jogo']);

        $awayLeaders = DB::table('estatisticas_jogador_epoca')
            ->join('jogadores', 'estatisticas_jogador_epoca.jogador_id', '=', 'jogadores.id')
            ->where('estatisticas_jogador_epoca.equipa_id', $game->equipa_fora_id)
            ->orderByDesc('pontos_jogo')
            ->take(4)
            ->get(['jogadores.nome_completo', 'jogadores.posicao_primaria', 'pontos_jogo', 'ressaltos_jogo', 'assistencias_jogo']);

        $prompt = $this->buildPredictionPrompt($game, $homeTeam, $awayTeam, $arena, $homeStanding, $awayStanding, $homeLeaders, $awayLeaders);

        $response = $this->callGemini($prompt);

        if (!$response['success']) {
            Log::warning("Gemini Prediction falhou para jogo {$game->id}: " . ($response['error'] ?? ''));
            return $this->fallbackPrediction($game, $homeStanding, $awayStanding);
        }

        $parsed = $this->extractJsonFromText($response['text']);

        if (!$parsed || !isset($parsed['probabilidade_casa'])) {
            return $this->fallbackPrediction($game, $homeStanding, $awayStanding);
        }

        $parsed['source'] = 'gemini';
        $parsed['generated_at'] = now()->toIso8601String();

        // Cache por 4 horas
        Cache::put($cacheKey, $parsed, now()->addHours(4));

        return $parsed;
    }

    /**
     * Gerar resumo pós-jogo (APENAS para jogos concluídos/passados).
     */
    public function generateGameRecap(Jogo $game, bool $forceRefresh = false): array
    {
        // Validação estrita: somente jogos que já ocorreram
        $isConcluded = in_array($game->estado, ['concluido', 'finalizado']) || 
            (($game->pontos_casa !== null && $game->pontos_fora !== null) && ($game->pontos_casa > 0 || $game->pontos_fora > 0));

        if (!$isConcluded) {
            return [
                'success' => false,
                'error' => 'O resumo com IA só está disponível para partidas que já foram concluídas.',
            ];
        }

        $cacheKey = "gemini_recap_game_{$game->id}";

        if (!$forceRefresh && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $game->loadMissing(['equipaCasa', 'equipaFora', 'periodos', 'arena']);

        // Obter melhores marcadores e desempenhos da partida específica
        $gameTopPerformers = DB::table('jogos_estatisticas_jogadores')
            ->join('jogadores', 'jogos_estatisticas_jogadores.jogador_id', '=', 'jogadores.id')
            ->where('jogo_id', $game->id)
            ->orderByDesc('pontos')
            ->take(6)
            ->get([
                'jogadores.nome_completo',
                'jogos_estatisticas_jogadores.equipa_id',
                'jogos_estatisticas_jogadores.pontos',
                'jogos_estatisticas_jogadores.ressaltos_totais',
                'jogos_estatisticas_jogadores.assistencias',
                'jogos_estatisticas_jogadores.roubos_bola',
                'jogos_estatisticas_jogadores.desarmes_lancamento'
            ]);

        $prompt = $this->buildRecapPrompt($game, $gameTopPerformers);

        $response = $this->callGemini($prompt);

        if (!$response['success']) {
            Log::warning("Gemini Recap falhou para jogo {$game->id}: " . ($response['error'] ?? ''));
            return $this->fallbackRecap($game, $gameTopPerformers);
        }

        $parsed = $this->extractJsonFromText($response['text']);

        if (!$parsed || !isset($parsed['manchete'])) {
            return $this->fallbackRecap($game, $gameTopPerformers);
        }

        $parsed['success'] = true;
        $parsed['source'] = 'gemini';
        $parsed['generated_at'] = now()->toIso8601String();

        // Armazena permanentemente em cache
        Cache::forever($cacheKey, $parsed);

        return $parsed;
    }

    /**
     * Comunicação HTTP com a API Gemini da Google.
     */
    protected function callGemini(string $promptText): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'error' => 'API Key do Gemini não está configurada no servidor (.env).'
            ];
        }

        $url = "{$this->baseUrl}/{$this->model}:generateContent?key=" . urlencode($this->apiKey);

        try {
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $promptText]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.35,
                    'topK' => 32,
                    'topP' => 0.95,
                    'maxOutputTokens' => 4096,
                    'responseMimeType' => 'application/json',
                ]
            ];

            $res = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(25)->post($url, $payload);

            if ($res->failed()) {
                return [
                    'success' => false,
                    'error' => 'Erro HTTP ' . $res->status() . ': ' . $res->body()
                ];
            }

            $body = $res->json();
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$text) {
                return [
                    'success' => false,
                    'error' => 'Resposta do Gemini vazia ou em formato inesperado.'
                ];
            }

            return [
                'success' => true,
                'text' => $text
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Constrói o prompt para previsão de vencedor de jogo.
     */
    protected function buildPredictionPrompt(Jogo $game, $homeTeam, $awayTeam, $arena, $homeStanding, $awayStanding, $homeLeaders, $awayLeaders): string
    {
        $homeName = $homeTeam ? $homeTeam->nome_completo : "Equipa Casa";
        $homeSigla = $homeTeam ? $homeTeam->sigla : "CASA";
        $awayName = $awayTeam ? $awayTeam->nome_completo : "Equipa Fora";
        $awaySigla = $awayTeam ? $awayTeam->sigla : "FORA";
        $arenaName = $arena ? "{$arena->nome} em {$arena->cidade}" : "Recinto Principal";

        $homeRecord = $homeStanding ? "{$homeStanding->vitorias}V - {$homeStanding->derrotas}D ({$homeStanding->ppg} PPG, Últimos 10: {$homeStanding->ultimos_10}, Sequência: {$homeStanding->sequencia_atual})" : "Registo atual da época";
        $awayRecord = $awayStanding ? "{$awayStanding->vitorias}V - {$awayStanding->derrotas}D ({$awayStanding->ppg} PPG, Últimos 10: {$awayStanding->ultimos_10}, Sequência: {$awayStanding->sequencia_atual})" : "Registo atual da época";

        $homeRoster = $homeLeaders->isNotEmpty() 
            ? $homeLeaders->map(fn($p) => "{$p->nome_completo} ({$p->posicao_primaria}): " . round($p->pontos_jogo, 1) . " PPG, " . round($p->ressaltos_jogo, 1) . " RPG, " . round($p->assistencias_jogo, 1) . " APG")->implode(" | ")
            : "Principais figuras do plantel";

        $awayRoster = $awayLeaders->isNotEmpty()
            ? $awayLeaders->map(fn($p) => "{$p->nome_completo} ({$p->posicao_primaria}): " . round($p->pontos_jogo, 1) . " PPG, " . round($p->ressaltos_jogo, 1) . " RPG, " . round($p->assistencias_jogo, 1) . " APG")->implode(" | ")
            : "Principais figuras do plantel";

        return <<<PROMPT
És um analista sénior de estatística e basquetebol da NBA (estilo ESPN Stats & Info / The Ringer / Kevin O'Connor).
O teu objetivo é analisar detalhadamente o próximo confronto da NBA e prever com precisão quem vai ganhar a partida.

DADOS REAIS DO JOGO:
- Equipa Casa: {$homeName} ({$homeSigla})
  * Registo: {$homeRecord}
  * Destaques: {$homeRoster}
- Equipa Visitante: {$awayName} ({$awaySigla})
  * Registo: {$awayRecord}
  * Destaques: {$awayRoster}
- Pavilhão/Arena: {$arenaName}
- Data/Hora: {$game->data_hora}

INSTRUÇÕES OBRIGATÓRIAS:
Responde EXCLUSIVAMENTE em formato JSON válido (sem texto fora do JSON).
Todas as análises devem ser escritas em português europeu/neutro com tom profissional, técnico e analítico.
A soma de probabilidade_casa e probabilidade_fora tem de dar 100.

ESTRUTURA DO JSON:
{
  "probabilidade_casa": 60,
  "probabilidade_fora": 40,
  "vencedor_previsto_sigla": "{$homeSigla}",
  "vencedor_previsto_nome": "{$homeName}",
  "placar_previsto": "{$homeSigla} 116 - 109 {$awaySigla}",
  "confianca": "Alta",
  "resumo_rapido": "Uma frase de impacto sintetizando a razão determinante para este prognóstico.",
  "analise_tatica": "Texto aprofundado de 2 a 3 parágrafos analisando os pontos fortes das duas equipas, o matchup exterior/interior, ritmo de jogo, profundidade de rotação e o impacto do recinto.",
  "fatores_chave": [
    "Primeiro fator estatístico ou tático decisivo",
    "Segundo fator decisivo (ex: ressaltos e posses extra)",
    "Terceiro fator decisivo (ex: eficácia da linha de três pontos e lances livres)"
  ],
  "duelo_chave": {
    "jogador_casa": "Nome da principal referência da casa",
    "jogador_fora": "Nome da principal referência visitante",
    "analise": "Análise concisa do confronto direto entre estas duas estrelas."
  }
}
PROMPT;
    }

    /**
     * Constrói o prompt para o resumo jornalístico de jogo já concluído.
     */
    protected function buildRecapPrompt(Jogo $game, $gameTopPerformers): string
    {
        $homeName = $game->equipaCasa ? $game->equipaCasa->nome_completo : "Equipa Casa";
        $homeSigla = $game->equipaCasa ? $game->equipaCasa->sigla : "CASA";
        $awayName = $game->equipaFora ? $game->equipaFora->nome_completo : "Equipa Fora";
        $awaySigla = $game->equipaFora ? $game->equipaFora->sigla : "FORA";

        $ptsCasa = $game->pontos_casa ?? 0;
        $ptsFora = $game->pontos_fora ?? 0;
        $vencedor = $ptsCasa > $ptsFora ? $homeName : $awayName;
        $vencedorSigla = $ptsCasa > $ptsFora ? $homeSigla : $awaySigla;
        $margem = abs($ptsCasa - $ptsFora);

        // Períodos se existirem
        $periodosTexto = "";
        if ($game->periodos && $game->periodos->count() > 0) {
            $periodosTexto = "Pontuação por Períodos: " . $game->periodos->map(fn($p) => "Q{$p->numero_periodo}: {$p->pontos_casa}-{$p->pontos_fora}")->implode(", ");
        }

        // Top Performers no jogo
        $performersTexto = "";
        if ($gameTopPerformers->isNotEmpty()) {
            $performersTexto = "Melhores em Campo: " . $gameTopPerformers->map(function ($p) use ($game, $homeSigla, $awaySigla) {
                $team = $p->equipa_id == $game->equipa_casa_id ? $homeSigla : $awaySigla;
                return "{$p->nome_completo} ({$team}): {$p->pontos} PTS, {$p->ressaltos_totais} REB, {$p->assistencias} AST";
            })->implode(" | ");
        }

        return <<<PROMPT
És um jornalista desportivo de elite da NBA (estilo ESPN, The Athletic e NBA.com).
A partida da NBA acaba de terminar. O teu objetivo é redigir a CRÓNICA OFICIAL DE JOGO (Game Recap & Post-Game Story) em português europeu.

DADOS OFICIAIS DO JOGO CONCLUÍDO:
- Equipa Casa: {$homeName} ({$homeSigla}) - Pontos Finais: {$ptsCasa}
- Equipa Visitante: {$awayName} ({$awaySigla}) - Pontos Finais: {$ptsFora}
- Vencedor Final: {$vencedor} ({$vencedorSigla}) por uma margem de pontos de {$margem}
- {$periodosTexto}
- {$performersTexto}
- Arena: {$game->arena?->nome} em {$game->arena?->cidade}

INSTRUÇÕES OBRIGATÓRIAS:
Responde EXCLUSIVAMENTE em formato JSON válido (sem texto fora do JSON).
Tom apaixonado por basquetebol, dinâmico, rigoroso e digno de manchete principal da NBA.

ESTRUTURA DO JSON:
{
  "manchete": "Título impactante da notícia de encerramento do jogo",
  "mvp": {
    "nome": "Nome do Jogador Mais Valioso da Partida",
    "equipa": "{$vencedorSigla}",
    "linha_estatistica": "Ex: 34 PTS, 9 REB, 6 AST",
    "impacto": "Explicação concisa do momento em que o jogador assumiu o controlo e garantiu o triunfo."
  },
  "cronica": "Texto envolvente de 3 parágrafos narrando: (1) O início e dinâmica de jogo, (2) O ponto de viragem (turning point) ou recuperação no 3º/4º período, e (3) Como o jogo foi selado nos instantes finais com lances decisivos.",
  "momentos_chave": [
    "Primeiro momento marcante da partida",
    "Segundo momento decisivo",
    "Terceiro momento ou jogada clutch"
  ],
  "estatistica_decisiva": "Uma estatística marcante que explica a vitória (ex: Domínio nos ressaltos ou percentagem de tiro exterior no último quarto)."
}
PROMPT;
    }

    /**
     * Fallback estatístico para previsão.
     */
    protected function fallbackPrediction(Jogo $game, $homeStanding = null, $awayStanding = null): array
    {
        $homeSigla = $game->equipaCasa?->sigla ?: 'CASA';
        $awaySigla = $game->equipaFora?->sigla ?: 'FORA';
        $homeName = $game->equipaCasa?->nome_completo ?: 'Equipa da Casa';
        $awayName = $game->equipaFora?->nome_completo ?: 'Equipa Visitante';

        $homeProb = 55;
        if ($homeStanding && $awayStanding) {
            $hPct = $homeStanding->pct_vitorias ?? 0.5;
            $aPct = $awayStanding->pct_vitorias ?? 0.5;
            $diff = ($hPct - $aPct) * 40;
            $homeProb = (int) max(30, min(80, 53 + $diff));
        }
        $awayProb = 100 - $homeProb;
        $winnerSigla = $homeProb >= 50 ? $homeSigla : $awaySigla;
        $winnerName = $homeProb >= 50 ? $homeName : $awayName;

        return [
            'probabilidade_casa' => $homeProb,
            'probabilidade_fora' => $awayProb,
            'vencedor_previsto_sigla' => $winnerSigla,
            'vencedor_previsto_nome' => $winnerName,
            'placar_previsto' => "{$homeSigla} 114 - 108 {$awaySigla}",
            'confianca' => abs($homeProb - 50) > 15 ? 'Alta' : 'Equilibrada',
            'resumo_rapido' => "O fator casa e a consistência nas posses decisivas posicionam {$winnerName} como favoritos.",
            'analise_tatica' => "Com base nos registos da presente época e na eficiência de lançamento, o confronto desenha-se equilibrado. A equipa anfitriã beneficia do apoio nas bancadas e do ritmo imposto nas transições rápidas, ao passo que a formação visitante procura capitalizar em posses calculadas e circulação de bola no perímetro.",
            'fatores_chave' => [
                'Fator casa e controlo do ritmo de jogo nas transições',
                'Eficácia nos lançamentos de três pontos e proteção do garrafão',
                'Disciplina nos ressaltos defensivos para limitar segundos lances'
            ],
            'duelo_chave' => [
                'jogador_casa' => 'Líder Ofensivo da Casa',
                'jogador_fora' => 'Estrela Visitante',
                'analise' => 'O rendimento nos minutos finais dos dois principais marcadores será o barómetro do encontro.'
            ],
            'source' => 'fallback',
            'generated_at' => now()->toIso8601String()
        ];
    }

    /**
     * Fallback para resumo de jogo concluído.
     */
    protected function fallbackRecap(Jogo $game, $gameTopPerformers = null): array
    {
        $ptsCasa = $game->pontos_casa ?? 0;
        $ptsFora = $game->pontos_fora ?? 0;
        $homeName = $game->equipaCasa?->nome_completo ?: 'Equipa da Casa';
        $awayName = $game->equipaFora?->nome_completo ?: 'Equipa Visitante';
        $vencedor = $ptsCasa > $ptsFora ? $homeName : $awayName;
        $vencedorSigla = $ptsCasa > $ptsFora ? ($game->equipaCasa?->sigla ?: 'CASA') : ($game->equipaFora?->sigla ?: 'FORA');

        $topScorer = $gameTopPerformers && $gameTopPerformers->isNotEmpty() ? $gameTopPerformers->first() : null;

        return [
            'success' => true,
            'manchete' => "{$vencedor} garantem triunfo expressivo num duelo eletrizante ({$ptsCasa} - {$ptsFora})",
            'mvp' => [
                'nome' => $topScorer ? $topScorer->nome_completo : 'Destaque Coletivo',
                'equipa' => $vencedorSigla,
                'linha_estatistica' => $topScorer ? "{$topScorer->pontos} PTS, {$topScorer->ressaltos_totais} REB, {$topScorer->assistencias} AST" : "Vitória por " . abs($ptsCasa - $ptsFora) . " pontos",
                'impacto' => "Frieza no quarto período e consistência na linha de lance livre selaram o triunfo."
            ],
            'cronica' => "Num encontro de grande intensidade física e tática, {$vencedor} levaram a melhor sobre o seu opositor com um parcial decisivo nos derradeiros minutos.\n\nO equilíbrio pautou a primeira metade, mas os ajustes defensivos implementados no regresso do intervalo permitiram cavar a vantagem decisiva que garantiu o resultado final de {$ptsCasa} a {$ptsFora}.",
            'momentos_chave' => [
                'Ritmo frenético e parada e resposta nos lançamentos inaugurais',
                'Ajuste defensivo decisivo no terceiro período a limitar posses fáceis',
                'Sequência clutch de pontos nos instantes finais a fechar a partida'
            ],
            'estatistica_decisiva' => "Aproveitamento superior nos momentos sob pressão garantiu os pontos fundamentais.",
            'source' => 'fallback',
            'generated_at' => now()->toIso8601String()
        ];
    }

    /**
     * Extrai JSON limpo mesmo se envolvido em blocos ```json ... ``` do Markdown.
     */
    protected function extractJsonFromText(string $rawText): ?array
    {
        $cleaned = trim($rawText);

        // Remove blocos de markdown ```json ... ```
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $cleaned, $matches)) {
            $cleaned = trim($matches[1]);
        }

        $decoded = json_decode($cleaned, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return null;
    }
}

<?php

namespace App\Console\Commands;

use App\Services\EspnSyncService;
use Illuminate\Console\Command;

class SyncEspnGames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nba:sync-espn {--force : Forçar sincronização imediata}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza automaticamente jogos recentes, parciais e classificações da NBA a partir da ESPN API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando sincronização de jogos da NBA com a ESPN...');
        $force = (bool) $this->option('force');

        $result = EspnSyncService::syncRecentGames($force);

        if ($result) {
            $this->info('Jogos, parciais e classificação atualizados com sucesso diretamente da ESPN!');
        } else {
            $this->error('A sincronização falhou ou nenhum jogo foi retornado.');
        }

        return $result ? 0 : 1;
    }
}

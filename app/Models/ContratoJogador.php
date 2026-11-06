<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContratoJogador extends Model
{
    use HasFactory;

    protected $table = 'contratos_jogadores';
    public $timestamps = false;
    protected $guarded = [];

    public function jogador()
    {
        return $this->belongsTo(Jogador::class, 'jogador_id');
    }

    public function equipa()
    {
        return $this->belongsTo(Equipa::class, 'equipa_id');
    }
}

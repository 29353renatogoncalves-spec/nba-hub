<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jogador extends Model
{
    use HasFactory;

    protected $table = 'jogadores';
    public $timestamps = false;
    public $incrementing = false; // Usa NBA Person ID

    protected $guarded = [];

    public function contratos()
    {
        return $this->hasMany(ContratoJogador::class, 'jogador_id');
    }

    public function equipas()
    {
        return $this->belongsToMany(Equipa::class, 'contratos_jogadores', 'jogador_id', 'equipa_id')
                    ->withPivot('numero_camisola', 'salario_anual_usd', 'ativo');
    }

    public function equipaAtual()
    {
        return $this->belongsToMany(Equipa::class, 'contratos_jogadores', 'jogador_id', 'equipa_id')
                    ->wherePivot('ativo', true)
                    ->withPivot('numero_camisola', 'salario_anual_usd');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipa extends Model
{
    use HasFactory;

    protected $table = 'equipas';
    public $timestamps = false;

    protected $guarded = [];

    public function arena()
    {
        return $this->belongsTo(Arena::class, 'arena_id');
    }

    public function contratos()
    {
        return $this->hasMany(ContratoJogador::class, 'equipa_id');
    }

    public function jogadores()
    {
        return $this->belongsToMany(Jogador::class, 'contratos_jogadores', 'equipa_id', 'jogador_id')
                    ->wherePivot('ativo', true)
                    ->withPivot('numero_camisola', 'salario_anual_usd', 'data_inicio', 'data_fim')
                    ->orderByPivot('numero_camisola', 'asc');
    }

    public function noticias()
    {
        return $this->hasMany(Noticia::class, 'equipa_id');
    }
}

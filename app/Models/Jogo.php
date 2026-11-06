<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jogo extends Model
{
    use HasFactory;

    protected $table = 'jogos';
    public $timestamps = false;
    protected $guarded = [];

    public function equipaCasa()
    {
        return $this->belongsTo(Equipa::class, 'equipa_casa_id');
    }

    public function equipaFora()
    {
        return $this->belongsTo(Equipa::class, 'equipa_fora_id');
    }

    public function arena()
    {
        return $this->belongsTo(Arena::class, 'arena_id');
    }

    public function periodos()
    {
        return $this->hasMany(JogoPeriodo::class, 'jogo_id')->orderBy('ordem');
    }
}

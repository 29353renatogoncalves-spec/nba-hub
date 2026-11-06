<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JogoPeriodo extends Model
{
    use HasFactory;

    protected $table = 'jogos_periodos';
    public $timestamps = false;
    protected $guarded = [];

    public function jogo()
    {
        return $this->belongsTo(Jogo::class, 'jogo_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aposta extends Model
{
    use HasFactory;

    protected $table = 'apostas';
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'tipo',
        'valor_apostado',
        'odd_total',
        'ganho_potencial',
        'estado',
        'selecoes',
        'criado_em',
        'resolvido_em',
    ];

    protected $casts = [
        'selecoes' => 'array',
        'odd_total' => 'float',
        'valor_apostado' => 'integer',
        'ganho_potencial' => 'integer',
        'criado_em' => 'datetime',
        'resolvido_em' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilizadores';
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nome',
        'name',
        'email',
        'senha',
        'password',
        'google_id',
        'avatar_url',
        'ativo',
        'papel_id',
        'equipa_favorita_id',
        'jogadores_favoritos',
        'ultimo_login',
        'remember_token',
        'email_verified_at',
        'saldo_moedas',
        'ultimo_bonus_recolhido',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'senha',
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'jogadores_favoritos' => 'array',
        'ativo' => 'boolean',
    ];

    /**
     * Mutator & Accessor for Name
     */
    public function getNameAttribute()
    {
        return $this->attributes['nome'] ?? '';
    }

    public function setNameAttribute($value)
    {
        $this->attributes['nome'] = $value;
    }

    /**
     * Mutator & Accessor for Password
     */
    public function getAuthPassword()
    {
        return $this->attributes['senha'] ?? '';
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['senha'] = $value;
    }

    /**
     * Relação com a Equipa Favorita
     */
    public function equipaFavorita()
    {
        return $this->belongsTo(Equipa::class, 'equipa_favorita_id');
    }
}

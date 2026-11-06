<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Noticia extends Model
{
    use HasFactory;

    protected $table = 'noticias';
    const CREATED_AT = 'publicado_em';
    const UPDATED_AT = null;

    protected $guarded = [];

    public function categoria()
    {
        return $this->belongsTo(CategoriaNoticia::class, 'categoria_id');
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    public function equipa()
    {
        return $this->belongsTo(Equipa::class, 'equipa_id');
    }
}

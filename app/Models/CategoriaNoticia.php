<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaNoticia extends Model
{
    use HasFactory;

    protected $table = 'categorias_noticias';
    public $timestamps = false;
    protected $guarded = [];

    public function noticias()
    {
        return $this->hasMany(Noticia::class, 'categoria_id');
    }
}

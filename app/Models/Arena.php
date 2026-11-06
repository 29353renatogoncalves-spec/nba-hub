<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Arena extends Model
{
    use HasFactory;

    protected $table = 'arenas';
    public $timestamps = false;
    protected $guarded = [];

    public function equipas()
    {
        return $this->hasMany(Equipa::class, 'arena_id');
    }
}

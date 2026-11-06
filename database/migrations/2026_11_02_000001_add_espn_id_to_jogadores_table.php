<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('jogadores', 'espn_id')) {
            Schema::table('jogadores', function (Blueprint $table) {
                $table->string('espn_id', 30)->nullable()->after('id')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('jogadores', 'espn_id')) {
            Schema::table('jogadores', function (Blueprint $table) {
                $table->dropColumn('espn_id');
            });
        }
    }
};

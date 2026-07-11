<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_opnames', function (Blueprint $table) {
            $table->text('cancel_reason')->nullable()->after('status');
        });
        
        // Postgres ENUM is strict, but since Laravel translates it to strings with CHECK constraints
        // we'll use DB::statement to modify the check constraint if we need to.
        // Actually, the error only complained about cancel_reason missing, which means status='cancelled' works.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_opnames', function (Blueprint $table) {
            $table->dropColumn('cancel_reason');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('consignments', function (Blueprint $table) {
            $table->date('consignment_date')->nullable()->after('status');
            $table->date('due_date')->nullable()->after('consignment_date');
        });

        DB::statement('UPDATE consignments SET consignment_date = DATE(created_at) WHERE consignment_date IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consignments', function (Blueprint $table) {
            $table->dropColumn(['consignment_date', 'due_date']);
        });
    }
};

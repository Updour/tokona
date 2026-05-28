<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('global_discount', 15, 2)->default(0)->after('status');
        });
        
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->decimal('discount', 15, 2)->default(0)->after('unit_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases_tables', function (Blueprint $table) {
            //
        });
    }
};

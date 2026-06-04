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
        Schema::table('transactions', function (Blueprint $table) {
            // total HPP dari semua item dalam 1 transaksi
            $table->decimal('total_cogs', 12)->default(0)->after('total');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            // HPP satuan (base_cost) untuk item ini saat dibeli
            $table->decimal('base_cost', 12)->default(0)->after('qty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('total_cogs');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn('base_cost');
        });
    }
};

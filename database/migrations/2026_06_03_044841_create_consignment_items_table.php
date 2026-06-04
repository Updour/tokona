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
        Schema::create('consignment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('consignment_id');
            $table->uuid('product_id');
            $table->integer('qty_received')->default(0);
            $table->integer('qty_unsold')->default(0);
            $table->integer('qty_sold')->default(0);
            $table->decimal('base_cost', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_items');
    }
};

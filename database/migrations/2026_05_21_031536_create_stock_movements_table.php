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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('branch_id');
            $table->uuid('product_id');
            $table->enum('type', ['IN', 'OUT', 'ADJUST', 'RETURN']);
            $table->integer('qty');
            $table->decimal('unit_cost', 12)->nullable();
            $table->decimal('unit_price', 12)->nullable();
            $table->string('source_type')->nullable();
            $table->uuid('source_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};

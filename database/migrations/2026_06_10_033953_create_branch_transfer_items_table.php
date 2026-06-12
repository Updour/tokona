<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_transfer_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('branch_transfer_id');
            $table->uuid('product_id');
            $table->integer('shipped_qty')->default(0);
            $table->integer('received_qty')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('branch_transfer_id')->references('id')->on('branch_transfers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_transfer_items');
    }
};

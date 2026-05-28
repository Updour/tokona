<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id');
            $table->uuid('product_id');

            // image
            $table->string('url');
            $table->string('path')->nullable(); // kalau pakai storage lokal

            // control
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            // indexes
            $table->index('tenant_id');
            $table->index('product_id');

            // penting: 1 primary per product (logic di app, bukan DB strict)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
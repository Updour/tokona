<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('branch_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            
            $table->string('action')->index(); // e.g. login, delete, checkout
            $table->string('description');
            
            $table->string('subject_type')->nullable(); // e.g. App\Models\Product
            $table->string('subject_id')->nullable();
            
            $table->json('properties')->nullable(); // Store small JSON payload
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

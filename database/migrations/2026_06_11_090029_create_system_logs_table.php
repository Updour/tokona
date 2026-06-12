<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            
            $table->string('level')->default('error'); // error, warning, info
            $table->text('message');
            $table->string('exception_class')->nullable();
            
            $table->string('file')->nullable();
            $table->integer('line')->nullable();
            $table->json('trace')->nullable();
            
            $table->string('url')->nullable();
            $table->string('ip_address', 45)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};

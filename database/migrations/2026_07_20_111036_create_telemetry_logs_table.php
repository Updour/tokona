<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->nullable(); // install, check
            $table->string('ip')->nullable();
            $table->string('os')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('server_ip')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_logs');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_health_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // e.g. install, check, degraded, restored
            $table->string('performed_by')->nullable(); // admin id who restored it
            $table->string('hardware_fingerprint')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_health_logs');
    }
};

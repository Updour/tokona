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
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('target_audience')->comment('all, tier_member, tier_wholesale, points_above_x');
            $table->integer('min_points')->default(0);
            $table->text('message_template');
            $table->string('status')->default('draft')->comment('draft, active, completed');
            $table->integer('sent_count')->default(0);
            $table->integer('total_target')->default(0);
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_campaigns');
    }
};

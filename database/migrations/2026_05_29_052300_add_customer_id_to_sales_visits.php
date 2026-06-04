<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_visits', function (Blueprint $table) {
            $table->uuid('customer_id')->nullable()->index();
            $table->string('status')->default('visited'); // visited, ordered, rejected
        });
    }

    public function down(): void
    {
        Schema::table('sales_visits', function (Blueprint $table) {
            $table->dropColumn(['customer_id', 'status']);
        });
    }
};

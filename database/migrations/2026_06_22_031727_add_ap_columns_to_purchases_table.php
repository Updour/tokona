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
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('amount_paid', 12)->default(0)->after('total_cost');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid')->after('amount_paid');
            $table->date('due_date')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['amount_paid', 'payment_status', 'due_date']);
        });
    }
};

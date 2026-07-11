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
        Schema::create('payroll_cash_advances', function (Blueprint $table) {
            $table->id();
            $table->uuid('payroll_id');
            $table->uuid('cash_advance_id');
            $table->decimal('amount_deducted', 15, 2);
            $table->timestamps();

            $table->foreign('payroll_id')->references('id')->on('payrolls')->onDelete('cascade');
            $table->foreign('cash_advance_id')->references('id')->on('cash_advances')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_cash_advances');
    }
};

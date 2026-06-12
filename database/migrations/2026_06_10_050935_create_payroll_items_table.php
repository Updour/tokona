<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('payroll_id')->constrained('payrolls')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['allowance', 'deduction']);
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_items');
    }
};

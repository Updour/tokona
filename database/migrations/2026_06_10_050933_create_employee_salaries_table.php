<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_salaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->string('payment_type')->default('monthly'); // monthly, weekly
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_salaries');
    }
};

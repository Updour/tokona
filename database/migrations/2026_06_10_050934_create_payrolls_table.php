<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->uuid('branch_id')->nullable()->index();
            $table->uuid('user_id')->constrained('users')->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('total_allowance', 15, 2)->default(0);
            $table->decimal('total_deduction', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, paid
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};

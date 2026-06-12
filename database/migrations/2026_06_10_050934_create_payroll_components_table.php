<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_components', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->enum('type', ['allowance', 'deduction']); // tunjangan, potongan
            $table->decimal('amount', 15, 2)->default(0); // nominal default jika ada
            $table->boolean('is_taxable')->default(false); // apakah kena pajak pph21
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_components');
    }
};

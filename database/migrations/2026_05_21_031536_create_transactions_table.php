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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('branch_id');
            $table->string('invoice_number');
            $table->uuid('customer_id')->nullable();
            $table->decimal('subtotal', 12);
            $table->decimal('discount', 12)->default(0);
            $table->decimal('tax', 12)->default(0);
            $table->decimal('total', 12);
            $table->decimal('paid_amount', 12)->default(0);
            $table->decimal('change_amount', 12)->default(0);
            $table->enum('payment_method', ['cash', 'transfer', 'debt', 'split']);
            $table->enum('status', ['draft', 'paid', 'partial', 'cancel'])->default('draft');
            $table->uuid('created_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

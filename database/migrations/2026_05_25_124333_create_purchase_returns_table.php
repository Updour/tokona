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
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches');
            $table->foreignUuid('supplier_id')->constrained('suppliers');
            $table->foreignUuid('purchase_id')->nullable()->constrained('purchases')->nullOnDelete();
            $table->string('return_number');
            $table->date('return_date');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('status')->default('completed'); // 'draft', 'completed'
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Supaya return_number unik per tenant
            $table->unique(['tenant_id', 'return_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_returns');
    }
};

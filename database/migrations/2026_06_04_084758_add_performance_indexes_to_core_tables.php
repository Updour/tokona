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
        // 1. Transactions Table
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['tenant_id', 'branch_id', 'created_at'], 'idx_trans_tenant_branch_date');
            $table->index('status');
            $table->index('customer_id');
        });

        // 2. Transaction Items
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index('transaction_id');
            $table->index('product_id');
        });

        // 3. Products
        Schema::table('products', function (Blueprint $table) {
            $table->index(['tenant_id', 'branch_id', 'is_active'], 'idx_prod_tenant_branch_active');
            $table->index('category_id');
            $table->index('barcode');
        });

        // 4. Cash Books & Expenses
        Schema::table('cash_books', function (Blueprint $table) {
            $table->index(['tenant_id', 'branch_id', 'created_at'], 'idx_cb_tenant_branch_date');
        });
        Schema::table('expenses', function (Blueprint $table) {
            $table->index(['tenant_id', 'branch_id', 'created_at'], 'idx_exp_tenant_branch_date');
        });

        // 5. Sales Visits
        Schema::table('sales_visits', function (Blueprint $table) {
            $table->index(['tenant_id', 'branch_id', 'created_at'], 'idx_sv_tenant_branch_date');
            $table->index('sales_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_trans_tenant_branch_date');
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_id']);
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_prod_tenant_branch_active');
            $table->dropIndex(['category_id']);
            $table->dropIndex(['barcode']);
        });

        Schema::table('cash_books', function (Blueprint $table) {
            $table->dropIndex('idx_cb_tenant_branch_date');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex('idx_exp_tenant_branch_date');
        });

        Schema::table('sales_visits', function (Blueprint $table) {
            $table->dropIndex('idx_sv_tenant_branch_date');
            $table->dropIndex(['sales_id']);
        });
    }
};

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
        // Make tenant_id nullable on payrolls
        Schema::table('payrolls', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->change();
        });

        // Add HRIS fields to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip', 50)->nullable()->after('name');
            $table->string('position', 100)->nullable()->after('nip');
            $table->date('join_date')->nullable()->after('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nip', 'position', 'join_date']);
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable(false)->change();
        });
    }
};

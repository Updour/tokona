<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;");
            DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status::text IN ('draft', 'paid', 'partial', 'cancel', 'returned'));");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;");
            DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status::text IN ('draft', 'paid', 'partial', 'cancel'));");
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('source_branch_id');
            $table->uuid('destination_branch_id');
            $table->string('reference_number')->index();
            $table->enum('status', ['DRAFT', 'APPROVED', 'SHIPPED', 'PARTIAL', 'RECEIVED'])->default('DRAFT');
            $table->uuid('created_by')->nullable();
            $table->uuid('received_by')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_transfers');
    }
};

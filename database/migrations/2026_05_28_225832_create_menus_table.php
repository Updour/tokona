<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->uuid('id');
            $table->uuid('parent_id')->nullable();
            $table->string('title');
            $table->string('href')->default('#');
            $table->string('icon')->nullable();
            $table->string('permission_key')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->primary('id');
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('menus')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};

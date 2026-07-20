<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelemetryLog;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function store(Request $request)
    {
        $payload = $request->all();
        
        TelemetryLog::create([
            'type' => $request->input('type'),
            'ip' => $request->input('ip') ?? $request->ip(),
            'os' => $request->input('os'),
            'mac_address' => $request->input('mac_address'),
            'server_ip' => $request->input('server_ip'),
            'user_agent' => $request->input('user_agent') ?? $request->userAgent(),
            'payload' => $payload
        ]);

        return response()->json(['status' => 'received']);
    }
}

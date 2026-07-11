<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tenants\StoreTenantRequest;
use App\Http\Requests\Tenants\UpdateTenantRequest;
use App\Models\Branch;
use App\Models\Tenants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantsController extends Controller
{
    /**
     * LIST TENANT
     */
    public function index(Request $request)
    {
        $query = Tenants::with('location');

        if (auth()->user()->isSuperAdmin()) {
            $query->withoutGlobalScopes();
        } else {
            $query->where('id', auth()->user()->tenant_id);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('slug', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort, $direction);
        }

        $tenants = $query->paginate(10)->withQueryString();

        return Inertia::render('tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * CREATE TENANT
     */
    public function store(StoreTenantRequest $request)
    {
        $validated = $request->validated();

        $validated['status'] ??= 'active';
        $validated['plan'] ??= 'free';

        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $logoUrl = Storage::url($path);
        }

        $tenant = Tenants::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => $validated['status'],
            'plan' => $validated['plan'],
            'expires_at' => $validated['expires_at'] ?? null,
            'logo_url' => $logoUrl,
        ]);

        $tenant->location()->create([
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'address_text' => $validated['address_text'] ?? $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'province' => $validated['province'] ?? null,
            'maps_link' => $validated['maps_link'] ?? null,
        ]);

        // Auto-create default branch (HQ) for this tenant
        $words = preg_split('/\s+/', trim($tenant->name));
        $initials = '';
        if (count($words) > 1) {
            foreach ($words as $w) {
                $initials .= strtoupper(substr($w, 0, 1));
            }
            $initials = substr(preg_replace('/[^A-Z0-9]/', '', $initials), 0, 3);
        } else {
            $noVowels = str_ireplace(['a', 'e', 'i', 'o', 'u'], '', $tenant->name);
            if (empty(trim($noVowels))) {
                $noVowels = $tenant->name;
            }
            $initials = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $noVowels), 0, 3));
        }

        if (empty($initials)) {
            $initials = '001';
        }

        Branch::create([
            'tenant_id' => $tenant->id,
            'name' => 'Cabang Pusat (HQ) - ' . $tenant->name,
            'code' => 'HQ-' . $initials,
            'is_main' => true,
        ]);

        return redirect()->route('tenants.index')
            ->with('success', 'Tenant ' . $tenant->name . ' created successfully.');
    }

    /**
     * UPDATE TENANT
     */
    public function update(UpdateTenantRequest $request, $id)
    {
        $tenant = Tenants::withoutGlobalScopes()->findOrFail($id);

        $validated = $request->validated();

        $logoUrl = $tenant->logo_url;
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo_url) {
                $oldPath = str_replace(Storage::url(''), '', $tenant->logo_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $logoUrl = Storage::url($path);
        }

        $tenant->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => $validated['status'] ?? $tenant->status,
            'plan' => $validated['plan'] ?? $tenant->plan,
            'expires_at' => $validated['expires_at'] ?? $tenant->expires_at,
            'logo_url' => $logoUrl,
        ]);

        $tenant->location()->updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'address_text' => $validated['address_text'] ?? $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'maps_link' => $validated['maps_link'] ?? null,
            ]
        );

        return back()->with('success', 'Tenant updated successfully.');
    }

    /**
     * DELETE TENANT
     */
    public function destroy($id)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403);
        }

        $tenant = Tenants::withoutGlobalScopes()->findOrFail($id);
        $tenant->delete();

        return back()->with('success', 'Tenant "' . $tenant->name . '" deleted successfully.');
    }
}

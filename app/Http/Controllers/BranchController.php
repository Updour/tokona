<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Tenants;
use App\Services\BranchService;
use App\Http\Requests\Branches\StoreBranchRequest;
use App\Http\Requests\Branches\UpdateBranchRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class BranchController extends Controller
{
    protected BranchService $branchService;

    public function __construct(BranchService $branchService)
    {
        $this->branchService = $branchService;
    }

    /**
     * LIST BRANCH (Daftar Cabang)
     */
    public function index(Request $request): Response
    {
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        // Global Tenant Scope secara otomatis menyaring cabang untuk non-superadmin!
        $branches = Branch::filter($request->all())
            ->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        $tenants = auth()->user()->isSuperAdmin() ? Tenants::select('id', 'name')->get() : [];

        return Inertia::render('branches/Index', [
            'branches' => $branches,
            'filters' => $request->only('search'),
            'tenants' => $tenants,
        ]);
    }

    /**
     * CREATE BRANCH (Tambah Cabang Baru)
     */
    public function store(StoreBranchRequest $request): RedirectResponse
    {
        $this->branchService->storeBranch($request->validated());

        return back()->with('success', 'Branch created successfully.');
    }

    /**
     * UPDATE BRANCH (Edit Data Cabang)
     */
    public function update(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        // Global Tenant Scope secara otomatis melindung cabang ini dari suntingan silang-tenant!
        $this->branchService->updateBranch($branch, $request->validated());

        return back()->with('success', 'Branch updated successfully.');
    }

    /**
     * DELETE BRANCH (Hapus Cabang)
     */
    public function destroy(Branch $branch): RedirectResponse
    {
        // Global Tenant Scope secara otomatis melindungi cabang ini dari penghapusan silang-tenant!

        // Aturan Bisnis: Mencegah penghapusan jika cabang ini merupakan Cabang Utama (HO)
        if ($branch->is_main) {
            return back()->with('error', 'Cannot delete the main branch. Please set another branch as main first.');
        }

        $branch->delete();

        return back()->with('success', 'Branch deleted successfully.');
    }
}

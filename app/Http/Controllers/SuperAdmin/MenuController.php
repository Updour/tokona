<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Http\Requests\SuperAdmin\MenuRequest;
use App\Services\SuperAdmin\MenuService;
use Inertia\Inertia;

class MenuController extends Controller
{
    protected MenuService $menuService;

    public function __construct(MenuService $menuService)
    {
        $this->menuService = $menuService;
    }

    public function index()
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);

        return Inertia::render('superadmin/Menus/Index', [
            'menus' => $this->menuService->getMenus(),
            'permissions' => $this->menuService->getPermissions()
        ]);
    }

    public function store(MenuRequest $request)
    {
        $this->menuService->createMenu($request->validated());
        return redirect()->back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(MenuRequest $request, Menu $menu)
    {
        $this->menuService->updateMenu($menu, $request->validated());
        return redirect()->back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu)
    {
        if (!auth()->user()->isSuperAdmin()) abort(403);
        
        $this->menuService->deleteMenu($menu);
        return redirect()->back()->with('success', 'Menu berhasil dihapus.');
    }
}

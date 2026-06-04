<?php

namespace App\Services\SuperAdmin;

use App\Models\Menu;
use Illuminate\Support\Facades\DB;

class MenuService
{
    /**
     * Get all menus with their children, ordered properly.
     */
    public function getMenus()
    {
        return Menu::with('children')
            ->whereNull('parent_id')
            ->orderBy('order', 'asc')
            ->get();
    }

    /**
     * Get all permissions grouped by module.
     */
    public function getPermissions()
    {
        return DB::table('permissions')
            ->select('key', 'name', 'module')
            ->orderBy('module')
            ->get()
            ->groupBy('module');
    }

    /**
     * Create a new menu.
     */
    public function createMenu(array $data): Menu
    {
        return Menu::create($data);
    }

    /**
     * Update an existing menu.
     */
    public function updateMenu(Menu $menu, array $data): bool
    {
        return $menu->update($data);
    }

    /**
     * Delete a menu and its children.
     */
    public function deleteMenu(Menu $menu): void
    {
        // Delete children first
        $menu->children()->delete();
        $menu->delete();
    }
}

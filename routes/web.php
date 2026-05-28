<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TenantsController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Products\ProductImageController;
use App\Http\Controllers\Products\ProductCategoryController;
use App\Http\Controllers\Products\ProductTypeController;
use App\Http\Controllers\Products\ProductRestockController;
use App\Http\Controllers\Products\PosController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseReturnController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FinanceController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard/index')->name('dashboard');
    Route::inertia('subscription-expired', 'SubscriptionExpired')->name('subscription.expired');

    // ── POS Kasir ──────────────────────────────────────────────────────────
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
    Route::post('pos/return', [PosController::class, 'return'])->name('pos.return');
    Route::post('pos/settings', [PosController::class, 'saveSettings'])->name('pos.save-settings');

    // ── Users ──────────────────────────────────────────────────────────────
    Route::resource('users', UserController::class);

    // ── Produk ─────────────────────────────────────────────────────────────
    Route::get('products/pricing', [ProductController::class, 'pricing'])->name('products.pricing');
    Route::post('products/bulk-markup', [ProductController::class, 'bulkMarkup'])->name('products.bulk-markup');
    Route::resource('products', ProductController::class)
        ->except(['create', 'edit', 'show']);

    // Gambar produk
    Route::prefix('products/{product}/images')->name('product-images.')->group(function () {
        Route::post('/', [ProductImageController::class, 'store'])->name('store');
        Route::patch('/{image}/set-primary', [ProductImageController::class, 'setPrimary'])->name('set-primary');
        Route::patch('/reorder', [ProductImageController::class, 'reorder'])->name('reorder');
        Route::delete('/{image}', [ProductImageController::class, 'destroy'])->name('destroy');
    });

    // Restock / tambah stok manual
    Route::post('products/{product}/restock', [ProductRestockController::class, 'store'])
        ->name('products.restock');

    // ── Master data produk ─────────────────────────────────────────────────
    Route::resource('product-categories', ProductCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('product-types', ProductTypeController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // ── Toko ───────────────────────────────────────────────────────────────
    Route::resource('tenants', TenantsController::class);
    Route::resource('branches', BranchController::class);

    // ── Inventory / Stok ───────────────────────────────────────────────────
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');

    // ── Pembelian / Purchases ──────────────────────────────────────────────
    Route::put('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus'])->name('purchases.status');
    Route::resource('purchases', PurchaseController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('purchase-returns', PurchaseReturnController::class)->except(['edit', 'update', 'destroy', 'show']);

    // ── CRM & Marketing ──────────────────────────────────────────────────
    Route::get('membership', [App\Http\Controllers\CustomerController::class, 'membership'])->name('customers.membership');
    Route::get('vouchers', [App\Http\Controllers\PromoController::class, 'vouchers'])->name('promos.vouchers');
    Route::resource('customers', App\Http\Controllers\CustomerController::class);
    Route::resource('promos', App\Http\Controllers\PromoController::class);

    // ── Keuangan ───────────────────────────────────────────────────────────
    Route::get('incomes', [FinanceController::class, 'incomes'])->name('finance.incomes');
    Route::post('incomes', [FinanceController::class, 'storeIncome'])->name('finance.incomes.store');
    Route::get('cash-books', [FinanceController::class, 'cashBooks'])->name('finance.cash-books');
    Route::get('profit-loss', [FinanceController::class, 'profitLoss'])->name('finance.profit-loss');
    Route::get('debts-receivables', [FinanceController::class, 'debtsReceivables'])->name('finance.debts-receivables');
    Route::get('accounting/reports', [FinanceController::class, 'accountingReports'])->name('finance.accounting-reports');
    Route::get('business/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('business.reports');
    Route::delete('cash-books/{cashBook}', [FinanceController::class, 'destroyCashBook'])->name('finance.cash-books.destroy');
    Route::resource('expenses', ExpenseController::class);
});

require __DIR__ . '/settings.php';

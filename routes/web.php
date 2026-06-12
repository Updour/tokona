<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CanvasSalesController;
use App\Http\Controllers\OpnameController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TenantsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\MarketingController;

use App\Http\Controllers\Products\PosController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Products\ProductCategoryController;
use App\Http\Controllers\Products\ProductImageController;
use App\Http\Controllers\Products\ProductRestockController;
use App\Http\Controllers\Products\ProductTypeController;

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\BranchTransferController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseReturnController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ConsignmentController;

use App\Http\Controllers\PromoController;

use App\Http\Controllers\FinanceController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;

use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdmin\MenuController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\SalesController;

Route::redirect('/', '/login');

Route::middleware(['auth', 'verified'])->group(function () {
    // ── Sales Lapangan ───────────────────────────────────────────────────────
    Route::controller(SalesController::class)->prefix('sales')->name('sales.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/visits', 'visits')->name('visits');
        Route::get('/map', 'map')->name('map');
        Route::post('/store', 'store')->name('store');
        Route::put('/update/{id}', 'update')->name('update');
        Route::delete('/destroy/{id}', 'destroy')->name('destroy');
        Route::post('/load-stock', 'loadStock')->name('load-stock');
        Route::post('/unload-stock', 'unloadStock')->name('unload-stock');
        Route::post('/record-order', 'recordOrder')->name('record-order');
    });
    // ── Ekspor Laporan & Data ────────────────────────────────────────────────
    Route::controller(ExportController::class)->prefix('export')->name('export.')->group(function () {
        Route::get('/transactions', 'transactions')->name('transactions');
        Route::get('/sales-report', 'salesReport')->name('sales-report');
        Route::get('/product-report', 'productReport')->name('product-report');
        Route::get('/stock-report', 'stockReport')->name('stock-report');
        Route::get('/sales-field-report', 'salesFieldReport')->name('sales-field-report');
        Route::get('/invoice/{transaction}', 'invoice')->name('invoice');
        Route::get('/inventory', 'inventory')->name('inventory');
    });
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/sales', [DashboardController::class, 'sales'])->name('dashboard.sales');
    Route::inertia('subscription-expired', 'SubscriptionExpired')->name('subscription.expired');
    // ── Canvas Mobile Sales ────────────────────────────────────────────────
    Route::controller(CanvasSalesController::class)->prefix('canvas')->name('canvas.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/pos', 'pos')->name('pos');
        Route::post('/check-in', 'checkIn')->name('checkin');
        Route::post('/checkout', 'checkout')->name('checkout');
    });

    // ── POS Kasir ──────────────────────────────────────────────────────────
    Route::prefix('pos')->name('pos.')->controller(PosController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/checkout', 'checkout')->name('checkout');
        Route::post('/return', 'return')->name('return');
        Route::post('/{id}/pay-debt', 'payDebt')->name('pay-debt');
        Route::post('/settings', 'saveSettings')->name('save-settings');
    });

    // ── Shift Kasir ────────────────────────────────────────────────────────
    Route::controller(ShiftController::class)->prefix('shifts')->name('shifts.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/open', 'open')->name('open');
        Route::put('/{shift}/close', 'close')->name('close');
        Route::get('/{shift}', 'show')->name('show');
    });

    // ── Users & Roles ───────────────────────────────────────────────────────
    Route::resource('users', UserController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('roles', RoleController::class)->except(['create', 'edit', 'show']);

    // ── Produk ─────────────────────────────────────────────────────────────
    Route::controller(ProductController::class)->prefix('products')->name('products.')->group(function () {
        Route::get('pricing', 'pricing')->name('pricing');
        Route::post('bulk-markup', 'bulkMarkup')->name('bulk-markup');
        Route::post('import', 'import')->name('import');
        Route::post('{id}/restore', 'restore')->name('restore');
    });
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);

    Route::prefix('products/{product}/images')->name('product-images.')->controller(ProductImageController::class)->group(function () {
        Route::post('/', 'store')->name('store');
        Route::patch('/{image}/set-primary', 'setPrimary')->name('set-primary');
        Route::patch('/reorder', 'reorder')->name('reorder');
        Route::delete('/{image}', 'destroy')->name('destroy');
    });

    Route::post('products/{product}/restock', [ProductRestockController::class, 'store'])->name('products.restock');

    // ── Master Data Produk ─────────────────────────────────────────────────
    Route::controller(ProductCategoryController::class)->prefix('product-categories')->name('product-categories.')->group(function () {
        Route::get('/', 'index')->name('index')->middleware('permission:categories.index');
        Route::post('/', 'store')->name('store')->middleware('permission:products.create');
        Route::put('/{product_category}', 'update')->name('update')->middleware('permission:products.update');
        Route::delete('/{product_category}', 'destroy')->name('destroy')->middleware('permission:products.delete');
    });

    Route::controller(ProductTypeController::class)->prefix('product-types')->name('product-types.')->group(function () {
        Route::get('/', 'index')->name('index')->middleware('permission:types.index');
        Route::post('/', 'store')->name('store')->middleware('permission:products.create');
        Route::put('/{product_type}', 'update')->name('update')->middleware('permission:products.update');
        Route::delete('/{product_type}', 'destroy')->name('destroy')->middleware('permission:products.delete');
    });

    // ── Toko ───────────────────────────────────────────────────────────────
    Route::resource('tenants', TenantsController::class);
    Route::resource('branches', BranchController::class);

    // ── Inventory / Stok ───────────────────────────────────────────────────
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/low-stock', [InventoryController::class, 'lowStock'])->name('inventory.low-stock');

    // ── Transfer Antar Cabang ──────────────────────────────────────────────
    Route::controller(BranchTransferController::class)->prefix('inventory/transfers')->name('transfers.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{transfer}/ship', 'ship')->name('ship');
        Route::put('/{transfer}/receive', 'receive')->name('receive');
    });

    // ── Stock Opname ───────────────────────────────────────────────────────
    Route::controller(OpnameController::class)->prefix('inventory/opname')->name('opname.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
    });

    // ── Pembelian / Purchases ──────────────────────────────────────────────
    Route::put('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus'])->name('purchases.status');
    Route::resource('purchases', PurchaseController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('purchase-returns', PurchaseReturnController::class)->except(['edit', 'update', 'destroy', 'show']);

    // ── Barang Titipan (Konsinyasi) ─────────────────────────────────────────
    Route::controller(ConsignmentController::class)->prefix('consignments')->name('consignments.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{id}', 'update')->name('update');
        Route::post('/{id}/settle', 'settle')->name('settle');
        Route::get('/{id}/pdf', 'exportPdf')->name('pdf');
    });

    // ── Absensi Pegawai (Attendances) ──────────────────────────────────────
    Route::controller(\App\Http\Controllers\AttendanceController::class)->prefix('attendances')->name('attendances.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/export', 'export')->name('export');
        Route::post('/clock-in', 'clockIn')->name('clockIn');
        Route::post('/clock-out', 'clockOut')->name('clockOut');
    });

    // ── Penggajian (Payroll) ────────────────────────────────────────────────
    Route::controller(\App\Http\Controllers\PayrollController::class)->prefix('hris/payrolls')->name('payrolls.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/generate', 'generate')->name('generate');
        Route::post('/bulk-generate', 'bulkGenerate')->name('bulk-generate');
        Route::put('/{payroll}/paid', 'markAsPaid')->name('paid');
        Route::get('/{payroll}/print', 'print')->name('print');
    });

    Route::resource('hris/payroll-components', \App\Http\Controllers\PayrollComponentController::class)
        ->except(['create', 'edit', 'show']);

    // ── Gaji Karyawan (Salaries) ────────────────────────────────────────────
    Route::controller(\App\Http\Controllers\EmployeeSalaryController::class)->prefix('hris/salaries')->name('salaries.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::put('/{user}', 'update')->name('update');
    });


    // ── CRM & Marketing ──────────────────────────────────────────────────
    Route::get('membership', [CustomerController::class, 'membership'])->name('customers.membership');
    Route::post('customers/{id}/restore', [CustomerController::class, 'restore'])->name('customers.restore');
    Route::resource('customers', CustomerController::class);

    Route::controller(MarketingController::class)->prefix('business')->group(function () {
        Route::get('marketing', 'index')->name('marketing.index');
        Route::get('marketing/create', 'create')->name('marketing.create');
        Route::post('marketing', 'store')->name('marketing.store');
        Route::get('marketing/{campaign}', 'show')->name('marketing.show');
        Route::post('marketing/{campaign}/progress', 'updateProgress')->name('marketing.progress');
    });

    Route::get('vouchers', [PromoController::class, 'vouchers'])->name('promos.vouchers');
    Route::resource('promos', PromoController::class);

    // ── Keuangan & Laporan ─────────────────────────────────────────────────
    Route::controller(FinanceController::class)->group(function () {
        Route::get('incomes', 'incomes')->name('finance.incomes');
        Route::post('incomes', 'storeIncome')->name('finance.incomes.store');
        Route::get('cash-books', 'cashBooks')->name('finance.cash-books');
        Route::get('profit-loss', 'profitLoss')->name('finance.profit-loss');
        Route::get('debts-receivables', 'debtsReceivables')->name('finance.debts-receivables');
        Route::get('accounting/reports', 'accountingReports')->name('finance.accounting-reports');
        Route::delete('cash-books/{cashBook}', 'destroyCashBook')->name('finance.cash-books.destroy');
    });

    Route::controller(\App\Http\Controllers\AccountingController::class)->prefix('finance/accounting')->name('finance.accounting.')->group(function () {
        Route::get('journals', 'journals')->name('journals');
        Route::post('journals', 'storeJournal')->name('journals.store');
        Route::delete('journals/{journal}', 'destroyJournal')->name('journals.destroy');
    });

    Route::get('business/reports', [ReportController::class, 'index'])->name('business.reports');
    Route::resource('expenses', ExpenseController::class);

    // ── Audit & System Logs ────────────────────────────────────────────────
    Route::controller(\App\Http\Controllers\AuditLogController::class)->prefix('audit')->name('audit.')->group(function () {
        Route::get('activity-logs', 'activityLogs')->name('activity-logs');
        Route::get('system-logs', 'systemLogs')->name('system-logs');
        Route::get('stock-anomalies', 'stockAudit')->name('stock-anomalies');
        Route::post('stock-anomalies/negative-stock/{product}/resolve', 'resolveNegativeStock')->name('resolve-negative-stock');
        Route::post('stock-anomalies/transfer-mismatch/{transfer}/resolve', 'resolveTransferMismatch')->name('resolve-transfer-mismatch');
    });

    // ── Super Admin Dedicated Hrefs ──────────────────────────────────────────
    Route::prefix('superadmin')->name('superadmin.')->group(function () {
        Route::controller(SuperAdminController::class)->group(function () {
            Route::get('plans', 'plans')->name('plans');
            Route::get('billing', 'billing')->name('billing');
            Route::get('monitoring', 'monitoring')->name('monitoring');
        });
        Route::resource('menus', MenuController::class)->except(['create', 'edit', 'show']);
    });
});

require __DIR__ . '/settings.php';

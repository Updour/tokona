<?php

namespace App\Traits;

use App\Services\ActivityLogger;
use Illuminate\Support\Str;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('Menambah', 'created');
        });

        static::updated(function ($model) {
            $model->logActivity('Mengubah', 'updated');
        });

        static::deleted(function ($model) {
            $model->logActivity('Menghapus', 'deleted');
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->logActivity('Memulihkan', 'restored');
            });
        }
    }

    protected function logActivity($actionName, $eventName)
    {
        if (app()->runningInConsole() && !app()->runningUnitTests()) {
            return;
        }

        // Jangan log jika tidak ada user yang login (misal via cron atau seeder internal)
        if (!auth()->check()) {
            return;
        }

        $modelName = class_basename(static::class);
        
        // Translasi nama model agar lebih ramah dibaca
        $modelTranslations = [
            'Products' => 'Produk',
            'ProductCategory' => 'Kategori Produk',
            'ProductType' => 'Tipe Produk',
            'Customer' => 'Pelanggan',
            'Supplier' => 'Supplier',
            'User' => 'Karyawan',
            'Transaction' => 'Transaksi',
            'StockMovement' => 'Pergerakan Stok',
            'Branch' => 'Cabang',
            'BranchTransfer' => 'Transfer Cabang',
            'Account' => 'Akun Keuangan',
            'CashBook' => 'Buku Kas',
            'Expense' => 'Pengeluaran',
            'Promo' => 'Promo',
            'StockOpname' => 'Stock Opname',
            'Purchase' => 'Pembelian'
        ];
        
        $readableModelName = $modelTranslations[$modelName] ?? $modelName;

        // Cari identifier data (nama, judul, no referensi, kode, dll)
        $itemName = $this->name ?? $this->title ?? $this->reference_number ?? $this->invoice_number ?? $this->order_number ?? $this->code ?? $this->sku ?? "ID: {$this->id}";
        
        $action = "{$actionName} {$readableModelName}";
        $description = "{$actionName} {$readableModelName}: {$itemName}";

        $properties = [];
        if ($eventName === 'updated') {
            $changes = $this->getDirty();
            $original = $this->getOriginal();
            
            $hidden = array_merge($this->getHidden(), ['password', 'remember_token', 'token', 'updated_at', 'deleted_at']);
            foreach ($hidden as $hide) {
                unset($changes[$hide]);
            }
            
            if (empty($changes)) return; // Tidak ada perubahan yang berarti

            $properties['changes'] = $changes;
            
            // Simpan data lama untuk field yang berubah
            $oldData = [];
            foreach ($changes as $key => $value) {
                if (array_key_exists($key, $original)) {
                    $oldData[$key] = $original[$key];
                }
            }
            $properties['old'] = $oldData;

            // Kustomisasi nama aksi jika status berubah
            if (isset($changes['status'])) {
                if ($changes['status'] === 'completed' || $changes['status'] === 'approved') {
                    $actionName = 'Menyetujui';
                } elseif ($changes['status'] === 'cancelled' || $changes['status'] === 'rejected') {
                    $actionName = 'Membatalkan';
                }
            }
            
            $action = "{$actionName} {$readableModelName}";
            $description = "{$actionName} {$readableModelName}: {$itemName}";
            
        } elseif ($eventName === 'created') {
            $attributes = $this->getAttributes();
            $hidden = array_merge($this->getHidden(), ['password', 'remember_token', 'token', 'created_at', 'updated_at']);
            foreach ($hidden as $hide) {
                unset($attributes[$hide]);
            }
            $properties['attributes'] = $attributes;
        }

        ActivityLogger::log($action, $description, $this, $properties);
    }
}

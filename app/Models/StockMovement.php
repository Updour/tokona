<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'stock_movements';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'product_id',
        'type',       // IN | OUT | ADJUST | RETURN
        'qty',
        'unit_cost',
        'unit_price',
        'source_type',
        'source_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'qty'        => 'integer',
            'unit_cost'  => 'decimal:2',
            'unit_price' => 'decimal:2',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenants::class, 'tenant_id');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Hitung stok saat ini untuk satu produk di satu cabang.
     * IN & RETURN = tambah stok, OUT & ADJUST negatif = kurangi stok.
     */
    public static function currentStock(string $productId, string $branchId): int
    {
        return (int) self::where('product_id', $productId)
            ->where('branch_id', $branchId)
            ->selectRaw("
                SUM(CASE
                    WHEN type IN ('IN', 'RETURN') THEN qty
                    WHEN type = 'OUT' THEN -qty
                    WHEN type = 'ADJUST' THEN qty
                    ELSE 0
                END) as stock
            ")
            ->value('stock');
    }

    // ─── Global Scope ─────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function ($query) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $query->where('stock_movements.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}

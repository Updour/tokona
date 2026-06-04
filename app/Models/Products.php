<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Products extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'products';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'category_id',
        'type_id',
        'supplier_id',
        'name',
        'sku',
        'barcode',
        'description',
        'base_cost',
        'sell_price',
        'min_sell_price',
        'track_stock',
        'allow_negative_stock',
        'min_stock',
        'source',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_cost'            => 'decimal:2',
            'sell_price'           => 'decimal:2',
            'min_sell_price'       => 'decimal:2',
            'track_stock'          => 'boolean',
            'allow_negative_stock' => 'boolean',
            'is_active'            => 'boolean',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenants::class, 'tenant_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(ProductType::class, 'type_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'product_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')
            ->orderBy('sort_order');
    }

    // =========================================================================
    // Local Scopes — reusable query building blocks
    // =========================================================================

    /**
     * Sertakan stok real-time dari stock_movements via LEFT JOIN subquery.
     * Menambahkan kolom virtual `current_stock` ke setiap baris.
     *
     * Formula: IN + RETURN = tambah, OUT = kurangi, ADJUST = delta langsung.
     */
    public function scopeWithCurrentStock(Builder $query): Builder
    {
        $stockSubquery = DB::table('stock_movements')
            ->selectRaw("
                product_id,
                SUM(CASE
                    WHEN type IN ('IN', 'RETURN') THEN qty
                    WHEN type = 'OUT'             THEN -qty
                    WHEN type = 'ADJUST'          THEN qty
                    ELSE 0
                END) as current_stock
            ")
            ->groupBy('product_id');

        return $query
            ->select('products.*')
            ->leftJoinSub($stockSubquery, 'sm', function ($join) {
                $join->on('products.id', '=', 'sm.product_id');
            })
            ->addSelect(DB::raw('COALESCE(sm.current_stock, 0) as current_stock'));
    }

    /**
     * Eager-load relasi standar untuk tampilan daftar produk.
     */
    public function scopeWithListRelations(Builder $query): Builder
    {
        return $query->with([
            'category:id,name',
            'type:id,name',
            'branch:id,name,code',
            'images' => fn ($q) => $q
                ->where('is_primary', true)
                ->select('id', 'product_id', 'url', 'is_primary'),
        ]);
    }

    /** Filter hanya produk aktif. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('products.is_active', true);
    }

    /** Filter produk dengan stok menipis — stok saat ini <= min_stock per produk. */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query
            ->whereRaw('COALESCE(sm.current_stock, 0) <= products.min_stock')
            ->where('products.track_stock', true);
    }

    /** Cari berdasarkan nama, SKU, atau barcode. */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(fn ($q) => $q
            ->where('products.name', 'like', "%{$term}%")
            ->orWhere('products.sku', 'like', "%{$term}%")
            ->orWhere('products.barcode', 'like', "%{$term}%")
        );
    }

    /** Filter berdasarkan rentang tanggal dibuat. */
    public function scopeCreatedBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        return $query
            ->when($from, fn ($q) => $q->whereDate('products.created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('products.created_at', '<=', $to));
    }

    /** Filter berdasarkan rentang harga jual. */
    public function scopePriceBetween(Builder $query, ?string $min, ?string $max): Builder
    {
        return $query
            ->when($min, fn ($q) => $q->where('products.sell_price', '>=', $min))
            ->when($max, fn ($q) => $q->where('products.sell_price', '<=', $max));
    }

    /**
     * Ambil produk milik tenant user yang sedang login.
     * Super admin bisa akses semua (tanpa filter tenant).
     */
    public function scopeForCurrentUser(Builder $query): Builder
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return $query->withoutGlobalScope('tenant');
        }

        return $query->withoutGlobalScope('tenant')
            ->where('tenant_id', $user->tenant_id);
    }

    /**
     * Catat pergerakan stok untuk produk ini.
     * Dipakai oleh service — tidak ada query di controller.
     */
    public function recordStockMovement(string $type, int $qty, array $extra = []): void
    {
        $this->stockMovements()->create(array_merge([
            'tenant_id'   => $this->tenant_id,
            'branch_id'   => $this->branch_id,
            'type'        => $type,
            'qty'         => $qty,
            'unit_cost'   => $this->base_cost,
            'source_type' => 'manual',
        ], $extra));
    }

    /**
     * Memperbarui Harga Modal (base_cost) menggunakan metode Weighted Average Cost (WAC).
     * Harus dipanggil pada instance model yang dimuat dengan `withCurrentStock()`.
     */
    public function updateBaseCostWAC(float $newUnitCost, int $addedQty): void
    {
        if ($addedQty <= 0) {
            return;
        }

        // Ambil stok saat ini. Jika produk tidak di-load dengan withCurrentStock(), anggap stok 0.
        // Abaikan stok negatif (anggap 0) untuk perhitungan WAC agar harga tidak hancur.
        $currentStock = max(0, (int) ($this->current_stock ?? 0));
        
        $totalQty = $currentStock + $addedQty;
        
        if ($totalQty > 0) {
            $newBaseCost = (($currentStock * (float) $this->base_cost) + ($addedQty * $newUnitCost)) / $totalQty;
            $this->update(['base_cost' => $newBaseCost]);
        }
    }

    // =========================================================================
    // Global Scopes & Model Hooks
    // =========================================================================

    protected static function booted(): void
    {
        // Auto-filter per tenant (kecuali super admin)
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $query->where('products.tenant_id', auth()->user()->tenant_id);
            }
        });

        // Auto-inject tenant_id saat create
        static::creating(function (self $model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseItem extends Model
{
    use HasUuids;

    protected $table = 'purchase_items';

    // Tabel detail tidak butuh timestamps di migration saat ini
    public $timestamps = false;

    protected $fillable = [
        'purchase_id',
        'product_id',
        'qty',
        'unit_cost',
        'discount',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'qty'       => 'integer',
            'unit_cost' => 'decimal:2',
            'subtotal'  => 'decimal:2',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}

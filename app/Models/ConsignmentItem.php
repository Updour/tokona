<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsignmentItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'consignment_items';

    protected $fillable = [
        'consignment_id', 'product_id',
        'qty_received', 'qty_unsold', 'qty_sold',
        'base_cost', 'subtotal'
    ];

    protected $casts = [
        'qty_received' => 'integer',
        'qty_unsold' => 'integer',
        'qty_sold' => 'integer',
        'base_cost' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function consignment(): BelongsTo
    {
        return $this->belongsTo(Consignment::class, 'consignment_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}

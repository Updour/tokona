<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesLoadedStock extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'sales_loaded_stocks';

    protected $fillable = [
        'sales_person_id', 'product_id', 'allocated_qty', 'sold_qty', 'current_stock',
    ];

    public function salesPerson(): BelongsTo
    {
        return $this->belongsTo(SalesPerson::class, 'sales_person_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}

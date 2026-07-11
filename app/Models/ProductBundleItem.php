<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBundleItem extends Model
{
    use LogsActivity;

    use HasFactory, HasUuids;

    protected $fillable = [
        'bundle_id',
        'product_id',
        'quantity',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'bundle_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}

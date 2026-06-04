<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'sales_orders';

    protected $fillable = [
        'sales_visit_id', 'total_amount', 'payment_status', 'payment_method',
    ];

    protected $casts = [
        'total_amount' => 'float',
    ];

    public function salesVisit(): BelongsTo
    {
        return $this->belongsTo(SalesVisit::class, 'sales_visit_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class, 'sales_order_id');
    }
}

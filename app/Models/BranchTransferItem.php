<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchTransferItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'branch_transfer_items';

    protected $fillable = [
        'branch_transfer_id',
        'product_id',
        'shipped_qty',
        'received_qty',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'shipped_qty' => 'integer',
            'received_qty' => 'integer',
        ];
    }

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(BranchTransfer::class, 'branch_transfer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }
}

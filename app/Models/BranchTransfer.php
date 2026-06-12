<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BranchTransfer extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'branch_transfers';

    protected $fillable = [
        'tenant_id',
        'source_branch_id',
        'destination_branch_id',
        'reference_number',
        'status', // DRAFT, APPROVED, SHIPPED, PARTIAL, RECEIVED
        'created_by',
        'received_by',
        'sent_at',
        'received_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function sourceBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'source_branch_id');
    }

    public function destinationBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'destination_branch_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BranchTransferItem::class, 'branch_transfer_id');
    }

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $query->where('branch_transfers.tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
            if (empty($model->reference_number)) {
                $model->reference_number = 'TRF-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }
}

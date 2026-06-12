<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Journal extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'reference_number',
        'date',
        'description',
        'source_type',
        'source_id',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });

        static::creating(function ($model) {
            if (empty($model->reference_number)) {
                $model->reference_number = 'JNL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'journal_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}

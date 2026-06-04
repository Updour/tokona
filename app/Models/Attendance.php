<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class Attendance extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'user_id',
        'date',
        'check_in_time',
        'check_out_time',
        'status',
        'notes',
        'lat_in',
        'lng_in',
        'lat_out',
        'lng_out',
        'photo_in',
        'photo_out',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'lat_in' => 'float',
        'lng_in' => 'float',
        'lat_out' => 'float',
        'lng_out' => 'float',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && !auth()->user()->isSuperAdmin()) {
                $builder->where('tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->whereHas('user', function ($uq) use ($search) {
                $uq->where('name', 'like', "%{$search}%");
            });
        })->when($filters['branch_id'] ?? null, function ($q, $branchId) {
            if ($branchId !== 'ALL') {
                $q->where('branch_id', $branchId);
            }
        })->when($filters['status'] ?? null, function ($q, $status) {
            if ($status !== 'ALL') {
                $q->where('status', $status);
            }
        })->when($filters['start_date'] ?? null, function ($q, $startDate) {
            $q->whereDate('date', '>=', $startDate);
        })->when($filters['end_date'] ?? null, function ($q, $endDate) {
            $q->whereDate('date', '<=', $endDate);
        });
    }
}

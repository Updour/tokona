<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'product_images';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'url',
        'path',
        'is_primary',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_primary'  => 'boolean',
            'sort_order'  => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class, 'product_id');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Hapus file fisik dari storage saat record dihapus.
     */
    protected static function booted(): void
    {
        static::deleting(function (ProductImage $image) {
            if ($image->path && Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }
        });
    }
}

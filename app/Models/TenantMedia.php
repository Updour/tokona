<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'id',
    'tenant_id',
    'type',
    'file_url',
    'description',
    'uploaded_by',
])]
class TenantMedia extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getFullFileUrlAttribute(): string
    {
        // 1. Jika file_url kosong atau null, berikan gambar cadangan agar tidak error 404
        if (empty($this->file_url)) {
            return 'https://picsum.photos';
        }

        // 2. Jika isinya sudah berupa URL utuh (seperti placeholder atau picsum), langsung kembalikan teksnya
        if (filter_var($this->file_url, FILTER_VALIDATE_URL)) {
            // Jaga-jaga jika domain via.placeholder lama ikut terbawa, konversi otomatis ke picsum
            if (str_contains($this->file_url, '://placeholder.com')) {
                return 'https://picsum.photos';
            }
            return $this->file_url;
        }

        // 3. Jika berupa path lokal, gabungkan dengan URL domain utama Anda secara absolut
        return asset('storage/' . $this->file_url);
    }

    // 🔗 ke tenant
    public function tenant()
    {
        return $this->belongsTo(Tenants::class);
    }

    // 🔗 ke user (yang upload)
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
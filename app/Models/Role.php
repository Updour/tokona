<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory, HasUuids;

    /**
     * Menentukan bahwa ID menggunakan tipe data string (UUID).
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Menentukan bahwa ID tidak auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Atribut yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
    ];
}

<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TransactionPayment extends Model
{
    use LogsActivity;

    use HasFactory, HasUuids;

    protected $fillable = [
        'transaction_id',
        'customer_id',
        'amount',
        'payment_date',
        'payment_method',
        'notes',
        'created_by',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

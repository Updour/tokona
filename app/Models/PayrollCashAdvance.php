<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollCashAdvance extends Model
{
    use LogsActivity;

    protected $fillable = [
        'payroll_id',
        'cash_advance_id',
        'amount_deducted',
    ];

    protected $casts = [
        'amount_deducted' => 'decimal:2',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class, 'payroll_id');
    }

    public function cashAdvance(): BelongsTo
    {
        return $this->belongsTo(CashAdvance::class, 'cash_advance_id');
    }
}

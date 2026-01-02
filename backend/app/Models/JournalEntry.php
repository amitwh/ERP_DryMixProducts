<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_voucher_id',
        'account_id',
        'entry_type',
        'amount',
        'description',
        'related_customer_id',
        'related_supplier_id',
        'cost_center_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function journalVoucher()
    {
        return $this->belongsTo(JournalVoucher::class);
    }

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    public function relatedCustomer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function relatedSupplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function scopeDebit($query)
    {
        return $query->where('entry_type', 'debit');
    }

    public function scopeCredit($query)
    {
        return $query->where('entry_type', 'credit');
    }
}

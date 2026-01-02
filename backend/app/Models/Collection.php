<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'collection_number',
        'collection_date',
        'amount_due',
        'amount_collected',
        'amount_waived',
        'balance_remaining',
        'collection_status',
        'payment_method',
        'reference_number',
        'bank_name',
        'cheque_number',
        'cheque_date',
        'collection_notes',
        'dispute_reason',
        'collected_by',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'cheque_date' => 'date',
        'amount_due' => 'decimal:2',
        'amount_collected' => 'decimal:2',
        'amount_waived' => 'decimal:2',
        'balance_remaining' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopePending($query)
    {
        return $query->where('collection_status', 'pending');
    }

    public function scopePartial($query)
    {
        return $query->where('collection_status', 'partial');
    }

    public function scopeCollected($query)
    {
        return $query->where('collection_status', 'collected');
    }

    public function scopeDisputed($query)
    {
        return $query->where('collection_status', 'disputed');
    }

    public function scopeWrittenOff($query)
    {
        return $query->where('collection_status', 'written_off');
    }

    public function scopeOverdue($query)
    {
        return $query->where('collection_date', '<', today())
            ->whereIn('collection_status', ['pending', 'partial']);
    }

    // Accessors
    public function getIsFullyCollectedAttribute()
    {
        return $this->collection_status === 'collected' && $this->balance_remaining == 0;
    }

    public function getCollectionPercentageAttribute()
    {
        if ($this->amount_due > 0) {
            return ($this->amount_collected / $this->amount_due) * 100;
        }
        return 0;
    }

    // Methods
    public function recordPayment($amount, $method, $reference = null)
    {
        $this->amount_collected += $amount;
        $this->balance_remaining = $this->amount_due - $this->amount_collected;
        $this->payment_method = $method;

        if ($reference) {
            $this->reference_number = $reference;
        }

        if ($this->balance_remaining <= 0) {
            $this->collection_status = 'collected';
            $this->balance_remaining = 0;
        } elseif ($this->amount_collected > 0) {
            $this->collection_status = 'partial';
        }

        $this->save();

        // Update credit control balance
        $creditControl = $this->customer->creditControl;
        if ($creditControl) {
            $creditControl->current_balance -= $amount;
            $creditControl->updateAvailableCredit();
        }

        // Create credit transaction
        $this->creditTransactions()->create([
            'organization_id' => $this->organization_id,
            'customer_id' => $this->customer_id,
            'collection_id' => $this->id,
            'transaction_type' => 'payment',
            'amount' => $amount,
            'balance_before' => $creditControl->current_balance + $amount,
            'balance_after' => $creditControl->current_balance,
            'reference' => $reference,
            'description' => "Collection payment via {$method}",
            'transaction_date' => now(),
        ]);
    }

    public function waiveAmount($amount, $reason)
    {
        $this->amount_waived += $amount;
        $this->balance_remaining -= $amount;

        if ($this->balance_remaining <= 0) {
            $this->collection_status = 'written_off';
            $this->balance_remaining = 0;
        }

        $this->collection_notes .= "\nWaived {$amount}: {$reason}";
        $this->save();

        // Update credit control balance
        $creditControl = $this->customer->creditControl;
        if ($creditControl) {
            $creditControl->current_balance -= $amount;
            $creditControl->updateAvailableCredit();
        }
    }

    public function markAsDisputed($reason)
    {
        $this->collection_status = 'disputed';
        $this->dispute_reason = $reason;
        $this->save();
    }
}

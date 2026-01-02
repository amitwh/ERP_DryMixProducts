<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalVoucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'fiscal_year_id',
        'voucher_number',
        'voucher_date',
        'voucher_type',
        'reference',
        'narration',
        'total_debit',
        'total_credit',
        'status',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'voucher_date' => 'date',
        'total_debit' => 'decimal:2',
        'total_credit' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePosted($query)
    {
        return $query->where('status', 'posted');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('voucher_type', $type);
    }

    // Methods
    public function post()
    {
        DB::transaction(function () {
            // Update account balances
            foreach ($this->journalEntries as $entry) {
                $account = $entry->account;
                $newBalance = $account->current_balance;

                if ($entry->entry_type === 'debit') {
                    if (in_array($account->account_type, ['asset', 'expense'])) {
                        $newBalance += $entry->amount;
                    } else {
                        $newBalance -= $entry->amount;
                    }
                } else {
                    if (in_array($account->account_type, ['asset', 'expense'])) {
                        $newBalance -= $entry->amount;
                    } else {
                        $newBalance += $entry->amount;
                    }
                }

                $account->update(['current_balance' => $newBalance]);

                // Create ledger entry
                Ledger::create([
                    'organization_id' => $this->organization_id,
                    'account_id' => $account->id,
                    'entry_date' => $this->voucher_date,
                    'journal_entry_id' => $entry->id,
                    'reference' => $this->voucher_number,
                    'entry_type' => $entry->entry_type,
                    'debit_amount' => $entry->entry_type === 'debit' ? $entry->amount : 0,
                    'credit_amount' => $entry->entry_type === 'credit' ? $entry->amount : 0,
                    'balance' => $newBalance,
                    'narration' => $this->narration,
                ]);
            }

            $this->update(['status' => 'posted', 'approved_by' => auth()->id()]);
        });
    }

    public function cancel()
    {
        DB::transaction(function () {
            // Reverse all ledger entries
            foreach ($this->journalEntries as $entry) {
                $account = $entry->account;
                $newBalance = $account->current_balance;

                if ($entry->entry_type === 'debit') {
                    if (in_array($account->account_type, ['asset', 'expense'])) {
                        $newBalance -= $entry->amount;
                    } else {
                        $newBalance += $entry->amount;
                    }
                } else {
                    if (in_array($account->account_type, ['asset', 'expense'])) {
                        $newBalance += $entry->amount;
                    } else {
                        $newBalance -= $entry->amount;
                    }
                }

                $account->update(['current_balance' => $newBalance]);

                // Delete ledger entries
                Ledger::where('journal_entry_id', $entry->id)->delete();
            }

            $this->update(['status' => 'cancelled']);
        });
    }
}

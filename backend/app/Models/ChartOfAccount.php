<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChartOfAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'chart_of_accounts';

    protected $fillable = [
        'organization_id',
        'account_code',
        'account_name',
        'account_type',
        'sub_type',
        'parent_account_id',
        'opening_balance',
        'current_balance',
        'status',
        'is_cash_account',
        'description',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_cash_account' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function parentAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_account_id');
    }

    public function childAccounts()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_account_id');
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'account_id');
    }

    public function ledgers()
    {
        return $this->hasMany(Ledger::class, 'account_id');
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('account_type', $type);
    }

    public function scopeCashAccounts($query)
    {
        return $query->where('is_cash_account', true);
    }

    public function scopeRootAccounts($query)
    {
        return $query->whereNull('parent_account_id');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        if ($this->parentAccount) {
            return $this->parentAccount->full_name . ' > ' . $this->account_name;
        }
        return $this->account_name;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CreditControl extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'credit_limit',
        'current_balance',
        'available_credit',
        'credit_days',
        'payment_terms',
        'custom_payment_terms',
        'credit_status',
        'credit_score',
        'risk_level',
        'credit_review_date',
        'credit_notes',
        'credit_hold',
        'credit_hold_date',
        'credit_hold_reason',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'available_credit' => 'decimal:2',
        'credit_review_date' => 'date',
        'credit_hold_date' => 'date',
        'credit_hold' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['credit_limit', 'credit_status', 'credit_score', 'credit_hold', 'risk_level'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paymentReminders()
    {
        return $this->hasMany(PaymentReminder::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }

    public function creditReviews()
    {
        return $this->hasMany(CreditReview::class);
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeGood($query)
    {
        return $query->where('credit_status', 'good');
    }

    public function scopeOnWatch($query)
    {
        return $query->where('credit_status', 'watch');
    }

    public function scopeOnHold($query)
    {
        return $query->where('credit_status', 'hold');
    }

    public function scopeBlocked($query)
    {
        return $query->where('credit_status', 'blocked');
    }

    public function scopeWithCreditHold($query)
    {
        return $query->where('credit_hold', true);
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('risk_level', ['high', 'critical']);
    }

    public function scopeOverdueReview($query)
    {
        return $query->where('credit_review_date', '<', today());
    }

    // Accessors
    public function getCreditUtilizationAttribute()
    {
        if ($this->credit_limit > 0) {
            return ($this->current_balance / $this->credit_limit) * 100;
        }
        return 0;
    }

    public function getIsOverLimitAttribute()
    {
        return $this->current_balance > $this->credit_limit;
    }

    public function getDaysOverdueAttribute()
    {
        if ($this->current_balance > 0) {
            // Calculate based on average payment terms
            return max(0, $this->credit_days);
        }
        return 0;
    }

    // Methods
    public function updateAvailableCredit()
    {
        $this->available_credit = max(0, $this->credit_limit - $this->current_balance);
        $this->save();
    }

    public function updateCreditScore()
    {
        // Calculate credit score based on payment history, utilization, etc.
        $utilizationScore = max(0, 100 - $this->credit_utilization);
        $paymentScore = $this->calculatePaymentScore();
        $riskScore = $this->calculateRiskScore();

        $this->credit_score = round(($utilizationScore + $paymentScore + $riskScore) / 3);
        $this->updateRiskLevel();
        $this->save();
    }

    private function calculatePaymentScore()
    {
        // Calculate based on on-time payments vs total payments
        $totalPayments = $this->creditTransactions()
            ->where('transaction_type', 'payment')
            ->count();

        if ($totalPayments === 0) return 100;

        $onTimePayments = $this->creditTransactions()
            ->where('transaction_type', 'payment')
            ->where('created_at', '>=', now()->subDays(90))
            ->count();

        return ($onTimePayments / $totalPayments) * 100;
    }

    private function calculateRiskScore()
    {
        // Calculate based on overdue payments, disputes, etc.
        $riskScore = 100;

        // Deduct for overdue payments
        $overdueCollections = $this->collections()
            ->where('collection_status', 'pending')
            ->where('collection_date', '<', today()->subDays(30))
            ->count();

        $riskScore -= $overdueCollections * 10;

        // Deduct for disputes
        $disputedCollections = $this->collections()
            ->where('collection_status', 'disputed')
            ->count();

        $riskScore -= $disputedCollections * 15;

        return max(0, min(100, $riskScore));
    }

    private function updateRiskLevel()
    {
        if ($this->credit_score >= 80) {
            $this->risk_level = 'low';
        } elseif ($this->credit_score >= 60) {
            $this->risk_level = 'medium';
        } elseif ($this->credit_score >= 40) {
            $this->risk_level = 'high';
        } else {
            $this->risk_level = 'critical';
        }
    }

    public function placeOnHold($reason = null)
    {
        $this->credit_hold = true;
        $this->credit_hold_date = today();
        $this->credit_hold_reason = $reason;
        $this->credit_status = 'hold';
        $this->save();
    }

    public function releaseHold()
    {
        $this->credit_hold = false;
        $this->credit_hold_reason = null;
        $this->updateCreditStatus();
        $this->save();
    }

    public function updateCreditStatus()
    {
        $utilization = $this->credit_utilization;
        $daysOverdue = $this->days_overdue;

        if ($this->credit_hold) {
            $this->credit_status = 'hold';
        } elseif ($this->credit_score < 50 || $utilization > 90 || $daysOverdue > 60) {
            $this->credit_status = 'blocked';
        } elseif ($this->credit_score < 70 || $utilization > 75 || $daysOverdue > 30) {
            $this->credit_status = 'watch';
        } else {
            $this->credit_status = 'good';
        }
    }
}

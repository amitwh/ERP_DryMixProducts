<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'credit_control_id',
        'review_date',
        'old_credit_limit',
        'new_credit_limit',
        'old_credit_score',
        'new_credit_score',
        'old_risk_level',
        'new_risk_level',
        'old_status',
        'new_status',
        'review_notes',
        'justification',
        'approved',
        'reviewed_by',
        'approved_by',
    ];

    protected $casts = [
        'review_date' => 'date',
        'old_credit_limit' => 'decimal:2',
        'new_credit_limit' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    public function creditControl()
    {
        return $this->belongsTo(CreditControl::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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

    public function scopeApproved($query)
    {
        return $query->where('approved', true);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approved', false);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('review_date', $date);
    }

    // Accessors
    public function getCreditLimitChangeAttribute()
    {
        return $this->new_credit_limit - $this->old_credit_limit;
    }

    public function getCreditScoreChangeAttribute()
    {
        return $this->new_credit_score - $this->old_credit_score;
    }

    public function getIsIncreaseAttribute()
    {
        return $this->new_credit_limit > $this->old_credit_limit;
    }

    public function getIsDecreaseAttribute()
    {
        return $this->new_credit_limit < $this->old_credit_limit;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentReminder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'invoice_id',
        'reminder_type',
        'days_before_due',
        'status',
        'scheduled_at',
        'sent_at',
        'method',
        'message',
        'recipient_email',
        'recipient_phone',
        'response',
        'response_at',
        'attempt_count',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'response_at' => 'datetime',
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

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeOverdue($query)
    {
        return $query->where('scheduled_at', '<', now())
            ->where('status', 'pending');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('reminder_type', $type);
    }

    // Methods
    public function markAsSent()
    {
        $this->status = 'sent';
        $this->sent_at = now();
        $this->attempt_count++;
        $this->save();
    }

    public function recordResponse($response)
    {
        $this->response = $response;
        $this->response_at = now();
        $this->status = 'acknowledged';
        $this->save();
    }

    public function markAsIgnored()
    {
        $this->status = 'ignored';
        $this->save();
    }
}

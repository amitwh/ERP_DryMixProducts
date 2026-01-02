<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'template_code',
        'template_name',
        'channel',
        'subject',
        'body',
        'variables',
        'template_type',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function communicationLogs()
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function parseVariables($data = [])
    {
        $body = $this->body;
        $subject = $this->subject;

        foreach ($this->variables ?? [] as $variable) {
            $value = $data[$variable] ?? '';
            $body = str_replace('{' . $variable . '}', $value, $body);
            $subject = str_replace('{' . $variable . '}', $value, $subject);
        }

        return [
            'body' => $body,
            'subject' => $subject,
        ];
    }
}

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'template_id',
        'channel',
        'message_type',
        'recipient_id',
        'recipient_type',
        'recipient_email',
        'recipient_phone',
        'recipient_whatsapp',
        'subject',
        'body',
        'attachments',
        'status',
        'sent_at',
        'delivered_at',
        'message_id',
        'error_message',
        'retry_count',
        'response_data',
        'reference_id',
        'reference_type',
        'created_by',
    ];

    protected $casts = [
        'attachments' => 'array',
        'response_data' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function template()
    {
        return $this->belongsTo(CommunicationTemplate::class);
    }

    public function whatsappMessage()
    {
        return $this->hasOne(WhatsAppMessage::class);
    }

    public function emailLog()
    {
        return $this->hasOne(EmailLog::class);
    }

    public function smsLog()
    {
        return $this->hasOne(SmsLog::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function markAsSent($messageId = null)
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'message_id' => $messageId,
        ]);
    }

    public function markAsDelivered()
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function markAsFailed($error)
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'retry_count' => $this->retry_count + 1,
        ]);
    }
}

class WhatsAppMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'communication_log_id',
        'wa_message_id',
        'phone_number',
        'message_content',
        'status',
        'sent_at',
        'delivered_at',
        'read_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function communicationLog()
    {
        return $this->belongsTo(CommunicationLog::class);
    }

    public function scopeByPhone($query, $phone)
    {
        return $query->where('phone_number', $phone);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}

class EmailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'communication_log_id',
        'message_id',
        'to_email',
        'from_email',
        'cc_emails',
        'bcc_emails',
        'subject',
        'body',
        'html_body',
        'attachments',
        'status',
        'sent_at',
        'opened_at',
        'clicked_at',
        'open_count',
        'click_count',
        'error_message',
        'bounce_reason',
    ];

    protected $casts = [
        'attachments' => 'array',
        'cc_emails' => 'array',
        'bcc_emails' => 'array',
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function communicationLog()
    {
        return $this->belongsTo(CommunicationLog::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByToEmail($query, $email)
    {
        return $query->where('to_email', $email);
    }

    public function trackOpen()
    {
        $this->update([
            'open_count' => $this->open_count + 1,
            'opened_at' => $this->opened_at ?? now(),
        ]);
    }

    public function trackClick()
    {
        $this->update([
            'click_count' => $this->click_count + 1,
            'clicked_at' => $this->clicked_at ?? now(),
        ]);
    }
}

class SmsLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'communication_log_id',
        'sms_id',
        'phone_number',
        'message',
        'status',
        'segments',
        'sent_at',
        'delivered_at',
        'error_message',
        'cost',
        'provider',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cost' => 'decimal:4',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function communicationLog()
    {
        return $this->belongsTo(CommunicationLog::class);
    }

    public function scopeByPhone($query, $phone)
    {
        return $query->where('phone_number', $phone);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'customer_id',
        'employee_id',
        'entity_type',
        'preferences',
        'enable_notifications',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    protected $casts = [
        'preferences' => 'array',
        'enable_notifications' => 'boolean',
        'quiet_hours_start' => 'datetime',
        'quiet_hours_end' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function getPreferredChannels($messageType)
    {
        return $this->preferences[$messageType] ?? ['in_app'];
    }

    public function isQuietHours()
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $now = now();
        $start = $this->quiet_hours_start->setDateFrom($now);
        $end = $this->quiet_hours_end->setDateFrom($now);

        return $now->between($start, $end);
    }
}

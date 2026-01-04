<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'version_id',
        'approver_id',
        'status',
        'comments',
        'reviewed_at',
        'sort_order',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function version()
    {
        return $this->belongsTo(DocumentVersion::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function scopeByDocument($query, $documentId)
    {
        return $query->where('document_id', $documentId);
    }

    public function scopeByApprover($query, $approverId)
    {
        return $query->where('approver_id', $approverId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByOrder($query)
    {
        return $query->orderBy('sort_order');
    }

    public function approve($comments = null)
    {
        $this->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'comments' => $comments ?? $this->comments,
        ]);
    }

    public function reject($reason)
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'comments' => $reason,
        ]);
    }
}

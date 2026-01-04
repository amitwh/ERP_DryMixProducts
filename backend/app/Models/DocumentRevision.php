<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'quality_document_id',
        'revision_number',
        'revision_type',
        'changes_description',
        'revised_by',
        'revision_date',
        'approved_by',
        'approval_date',
        'attachments',
    ];

    protected $casts = [
        'revision_date' => 'date',
        'approval_date' => 'date',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function qualityDocument()
    {
        return $this->belongsTo(QualityDocument::class);
    }

    public function revisedBy()
    {
        return $this->belongsTo(User::class, 'revised_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

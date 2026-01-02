<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FiscalYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'start_date',
        'end_date',
        'status',
        'is_locked',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_locked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function journalVouchers()
    {
        return $this->hasMany(JournalVoucher::class);
    }

    public function payrollPeriods()
    {
        return $this->hasMany(PayrollPeriod::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeCurrent($query)
    {
        return $query->where('status', 'current');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['current', 'upcoming']);
    }

    public function close()
    {
        $this->update(['status' => 'closed', 'is_locked' => true]);
    }
}

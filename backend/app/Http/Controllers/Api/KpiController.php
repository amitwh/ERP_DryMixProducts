<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kpi;
use App\Models\KpiValue;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    public function index(Request $request)
    {
        $query = Kpi::query();

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        if ($request->has('category')) {
            $query->where('kpi_category', $request->category);
        }

        return response()->json($query->with('organization')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'org_id' => 'required|exists:organizations,id',
            'kpi_code' => 'required|unique:kpis,kpi_code,NULL,id,org_id,' . $request->org_id,
            'kpi_name' => 'required|string|max:200',
            'kpi_category' => 'required|in:quality,production,efficiency,cost,safety,sales,inventory,customer_satisfaction',
            'description' => 'nullable|string',
            'calculation_formula' => 'nullable|string',
            'uom' => 'nullable|string|max:20',
            'target_value' => 'nullable|numeric',
            'tolerance_percentage' => 'nullable|numeric',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,annually',
            'data_source' => 'nullable|string|max:100',
        ]);

        $kpi = Kpi::create($validated);

        return response()->json($kpi, 201);
    }

    public function show($id)
    {
        $kpi = Kpi::with(['organization', 'values'])->findOrFail($id);
        return response()->json($kpi);
    }

    public function update(Request $request, $id)
    {
        $kpi = Kpi::findOrFail($id);

        $validated = $request->validate([
            'kpi_name' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'target_value' => 'sometimes|nullable|numeric',
            'tolerance_percentage' => 'sometimes|nullable|numeric',
            'frequency' => 'sometimes|in:daily,weekly,monthly,quarterly,annually',
            'is_active' => 'sometimes|boolean',
        ]);

        $kpi->update($validated);

        return response()->json($kpi);
    }

    public function destroy($id)
    {
        $kpi = Kpi::findOrFail($id);
        $kpi->delete();
        return response()->json(null, 204);
    }

    public function values(Request $request, $id)
    {
        $kpi = Kpi::findOrFail($id);
        
        $query = KpiValue::where('kpi_id', $id);

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->has('date_from')) {
            $query->where('record_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('record_date', '<=', $request->date_to);
        }

        $values = $query->orderBy('record_date', 'desc')->paginate(50);

        return response()->json($values);
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'kpi_id' => 'required|exists:kpis,id',
            'org_id' => 'required|exists:organizations,id',
            'unit_id' => 'nullable|exists:manufacturing_units,id',
            'record_date' => 'required|date',
            'actual_value' => 'required|numeric',
        ]);

        $kpi = Kpi::findOrFail($validated['kpi_id']);

        $actualValue = (float)$validated['actual_value'];
        $targetValue = $kpi->target_value ? (float)$kpi->target_value : null;
        
        $variance = $targetValue ? $actualValue - $targetValue : null;
        $variancePercentage = $targetValue ? (($variance / $targetValue) * 100) : null;
        $achievementPercentage = $targetValue ? ($actualValue / $targetValue) * 100 : null;
        
        if ($achievementPercentage !== null) {
            $tolerance = $kpi->tolerance_percentage ?? 5;
            if ($achievementPercentage < (100 - $tolerance)) {
                $status = 'below_target';
            } elseif ($achievementPercentage > (100 + $tolerance)) {
                $status = 'above_target';
            } else {
                $status = 'on_target';
            }
        } else {
            $status = 'on_target';
        }

        $kpiValue = KpiValue::create([
            'kpi_id' => $validated['kpi_id'],
            'org_id' => $validated['org_id'],
            'unit_id' => $validated['unit_id'],
            'record_date' => $validated['record_date'],
            'actual_value' => $actualValue,
            'target_value' => $targetValue,
            'variance' => $variance,
            'variance_percentage' => $variancePercentage,
            'achievement_percentage' => $achievementPercentage,
            'status' => $status,
            'calculated_at' => now(),
        ]);

        return response()->json($kpiValue, 201);
    }
}

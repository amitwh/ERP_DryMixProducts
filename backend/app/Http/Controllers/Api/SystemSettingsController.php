<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemSetting::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        $settings = $query->orderBy('category')
                         ->orderBy('setting_key')
                         ->paginate(50);

        return response()->json($settings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'org_id' => 'nullable|exists:organizations,id',
            'unit_id' => 'nullable|exists:manufacturing_units,id',
            'setting_key' => 'required|string|max:100',
            'setting_value' => 'nullable',
            'setting_type' => 'required|in:string,integer,boolean,json,file',
            'category' => 'nullable|in:general,security,notification,ui,integration',
            'display_name' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'is_public' => 'sometimes|boolean',
            'is_editable' => 'sometimes|boolean',
            'validation_rules' => 'nullable|array',
            'options' => 'nullable|array',
        ]);

        $setting = SystemSetting::create($validated);

        return response()->json($setting, 201);
    }

    public function show($key)
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();
        return response()->json($setting);
    }

    public function update(Request $request, $key)
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();

        if (!$setting->is_editable) {
            return response()->json(['message' => 'This setting cannot be edited'], 403);
        }

        $validated = $request->validate([
            'setting_value' => 'required',
        ]);

        $setting->update(['setting_value' => $validated['setting_value']]);

        return response()->json($setting);
    }

    public function destroy($key)
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();

        if (!$setting->is_editable) {
            return response()->json(['message' => 'This setting cannot be deleted'], 403);
        }

        $setting->delete();
        return response()->json(null, 204);
    }

    public function byCategory(Request $request, $category)
    {
        $settings = SystemSetting::where('category', $category)
                                  ->where(function ($query) {
                                      $query->where('is_public', true)
                                           ->orWhere('org_id', $request->org_id);
                                  })
                                  ->where('is_editable', true)
                                  ->orderBy('setting_key')
                                  ->get()
                                  ->keyBy('setting_key');

        return response()->json($settings);
    }
}

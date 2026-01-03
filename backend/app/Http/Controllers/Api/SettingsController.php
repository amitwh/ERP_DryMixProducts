<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\FeatureToggle;
use App\Models\ModuleConfiguration;
use App\Models\ThemeSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * Get all settings for organization
     */
    public function index(Request $request)
    {
        $settings = SystemSetting::byOrganization($request->org_id)
            ->editable()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get settings by category
     */
    public function getByCategory(Request $request, $category)
    {
        $settings = SystemSetting::byOrganization($request->org_id)
            ->byCategory($category)
            ->editable()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get public settings (no auth required for some)
     */
    public function getPublicSettings()
    {
        $settings = SystemSetting::public()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.setting_key' => 'required|string|exists:system_settings,setting_key',
            'settings.*.setting_value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->settings as $settingData) {
            $setting = SystemSetting::byOrganization($request->org_id)
                ->where('setting_key', $settingData['setting_key'])
                ->firstOrFail();

            $setting->update([
                'setting_value' => $settingData['setting_value'],
                'updated_by' => auth()->id(),
            ]);

            // Clear cache
            Cache::forget("settings.{$setting->setting_key}");
        }

        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Get all feature toggles
     */
    public function getFeatureToggles(Request $request)
    {
        $features = FeatureToggle::where(function ($query) use ($request) {
            $query->where('is_global', true)
                ->orWhere('org_id', $request->org_id);
        })->orderBy('display_name')
            ->get();

        return response()->json([
            'data' => $features,
        ]);
    }

    /**
     * Update feature toggle
     */
    public function updateFeatureToggle(Request $request, $id)
    {
        $feature = FeatureToggle::where('id', $id)
            ->where(function ($query) use ($request) {
                $query->where('is_global', true)
                    ->orWhere('org_id', $request->org_id);
            })
            ->firstOrFail();

        if (!$feature->is_global && $feature->org_id !== $request->org_id) {
            return response()->json([
                'message' => 'Feature not found',
            ], 404);
        }

        $feature->update([
            'is_enabled' => $request->boolean('is_enabled'),
            'enabled_by' => auth()->id(),
        ]);

        return response()->json([
            'data' => $feature,
            'message' => 'Feature toggle updated successfully',
        ]);
    }

    /**
     * Get module configurations
     */
    public function getModules(Request $request)
    {
        $modules = ModuleConfiguration::byOrganization($request->org_id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $modules,
        ]);
    }

    /**
     * Update module configuration
     */
    public function updateModule(Request $request, $id)
    {
        $module = ModuleConfiguration::byOrganization($request->org_id)
            ->findOrFail($id);

        if ($module->is_required) {
            return response()->json([
                'message' => 'Cannot disable required module',
            ], 400);
        }

        $module->update($request->only(['is_enabled', 'module_settings']));

        return response()->json([
            'data' => $module,
            'message' => 'Module configuration updated successfully',
        ]);
    }

    /**
     * Get theme settings
     */
    public function getTheme(Request $request)
    {
        // Get organization theme
        $orgTheme = ThemeSetting::byOrganization($request->org_id)
            ->organizationThemes()
            ->first();

        // Get user theme if exists
        $userTheme = ThemeSetting::byUser(auth()->id())->first();

        return response()->json([
            'data' => [
                'organization' => $orgTheme,
                'user' => $userTheme,
                'active' => $userTheme ?? $orgTheme,
            ],
        ]);
    }

    /**
     * Update theme settings
     */
    public function updateTheme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme_type' => 'required|in:light,dark,auto',
            'primary_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'background_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'text_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'border_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'font_settings' => 'nullable|array',
            'logo_settings' => 'nullable|array',
            'branding_settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = array_merge($request->all(), [
            'org_id' => $request->org_id,
            'user_id' => auth()->id(),
            'created_by' => auth()->id(),
        ]);

        $theme = ThemeSetting::updateOrCreate(
            [
                'org_id' => $request->org_id,
                'user_id' => auth()->id(),
            ],
            $data
        );

        return response()->json([
            'data' => $theme,
            'message' => 'Theme updated successfully',
        ]);
    }

    /**
     * Reset user theme to organization default
     */
    public function resetTheme(Request $request)
    {
        ThemeSetting::byUser(auth()->id())->delete();

        return response()->json([
            'message' => 'Theme reset to default successfully',
        ]);
    }
}

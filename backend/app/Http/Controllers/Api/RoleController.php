<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query();

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        if ($request->has('search')) {
            $query->where('role_name', 'like', '%' . $request->search . '%')
                  ->orWhere('role_code', 'like', '%' . $request->search . '%');
        }

        $roles = $query->with(['permissions', 'organization'])
                         ->paginate($request->per_page ?? 20);

        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'org_id' => 'required|exists:organizations,id',
            'role_code' => 'required|unique:roles,role_code,NULL,id,org_id,' . $request->org_id,
            'role_name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,permission_code',
        ]);

        $role = Role::create([
            'org_id' => $validated['org_id'],
            'role_code' => $validated['role_code'],
            'role_name' => $validated['role_name'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
            'is_system_role' => false,
        ]);

        return response()->json($role->load('permissions'), 201);
    }

    public function show($id)
    {
        $role = Role::with(['permissions', 'organization', 'users'])->findOrFail($id);
        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system_role) {
            return response()->json(['message' => 'Cannot modify system role'], 403);
        }

        $validated = $request->validate([
            'role_name' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,permission_code',
            'is_active' => 'sometimes|boolean',
        ]);

        $role->update($validated);

        return response()->json($role->load('permissions'));
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system_role) {
            return response()->json(['message' => 'Cannot delete system role'], 403);
        }

        $userCount = $role->users()->count();
        if ($userCount > 0) {
            return response()->json(['message' => "Role has {$userCount} assigned users"], 409);
        }

        $role->delete();
        return response()->json(null, 204);
    }

    public function assignPermissions(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);

        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        return response()->json($role->load('permissions'));
    }

    public function cloneRole(Request $request, $roleId)
    {
        $originalRole = Role::findOrFail($roleId);

        $newRole = Role::create([
            'org_id' => $originalRole->org_id,
            'role_code' => $request->new_role_code,
            'role_name' => $request->new_role_name,
            'description' => $originalRole->description,
            'permissions' => $originalRole->permissions,
            'is_system_role' => false,
        ]);

        return response()->json($newRole, 201);
    }
}

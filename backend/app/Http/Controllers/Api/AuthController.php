<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'nullable|exists:manufacturing_units,id',
            'name' => 'required|string|max:255|min:2',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20|regex:/^[+]?[\d\s-()]+$/',
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'password.min' => 'Password must be at least 12 characters long.',
            'password.letters' => 'Password must contain at least one letter.',
            'password.mixedCase' => 'Password must contain both uppercase and lowercase letters.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one special character.',
            'phone.regex' => 'Invalid phone number format.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'organization_id' => $request->organization_id,
            'manufacturing_unit_id' => $request->manufacturing_unit_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => 'active',
        ]);

        $user->assignRole('user');

        // Create token
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        // Return token in httpOnly cookie
        $isSecure = app()->environment('production');
        $cookie = cookie(
            'auth_token',
            $token,
            43200, // 30 days in minutes
            '/',
            null, // domain (default)
            $isSecure, // secure (HTTPS only in production)
            true, // httpOnly
            false, // raw
            'lax' // sameSite
        );

        // Set refresh token in separate cookie
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(30))->plainTextToken;
        $refreshCookie = cookie(
            'refresh_token',
            $refreshToken,
            43200,
            '/',
            null,
            $isSecure,
            true,
            false,
            'lax'
        );

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
            ],
        ], 201)->withCookie($cookie)->withCookie($refreshCookie);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Rate limiting check
        if ($this->hasTooManyLoginAttempts($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
                'retry_after' => $this->limiter()->availableIn($this->throttleKey($request)),
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $this->incrementLoginAttempts($request);

            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is not active. Please contact administrator.',
            ], 403);
        }

        // Clear login attempts
        $this->clearLoginAttempts($request);

        // Update last login
        $user->updateLastLogin();

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Create new tokens
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(30))->plainTextToken;

        // Set httpOnly cookies
        $isSecure = app()->environment('production');
        $cookie = cookie('auth_token', $token, 43200, '/', null, $isSecure, true, false, 'lax');
        $refreshCookie = cookie('refresh_token', $refreshToken, 43200, '/', null, $isSecure, true, false, 'lax');

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user->load(['organization', 'manufacturingUnit']),
            ],
        ])->withCookie($cookie)->withCookie($refreshCookie);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current access token
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        // Clear cookies
        $cookie = cookie('auth_token', null, -2628000, '/');
        $refreshCookie = cookie('refresh_token', null, -2628000, '/');

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ])->withCookie($cookie)->withCookie($refreshCookie);
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['organization', 'manufacturingUnit']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Refresh access token
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->cookie('refresh_token');

        if (!$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token not found',
            ], 401);
        }

        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($refreshToken);

        if (!$tokenModel || !$tokenModel->can('refresh')) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid refresh token',
            ], 401);
        }

        $user = $tokenModel->tokenable;

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is not active',
            ], 403);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        // Create new tokens
        $newToken = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;
        $newRefreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(30))->plainTextToken;

        // Set new httpOnly cookies
        $isSecure = app()->environment('production');
        $cookie = cookie('auth_token', $newToken, 43200, '/', null, $isSecure, true, false, 'lax');
        $refreshCookie = cookie('refresh_token', $newRefreshToken, 43200, '/', null, $isSecure, true, false, 'lax');

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed successfully',
        ])->withCookie($cookie)->withCookie($refreshCookie);
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Update authenticated user's profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|min:2',
            'phone' => 'nullable|string|max:20|regex:/^[+]?[\d\s-()]+$/',
            'avatar' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user->fresh()->load(['organization', 'manufacturingUnit']),
        ]);
    }

    /**
     * Check if user has too many login attempts
     */
    protected function hasTooManyLoginAttempts(Request $request): bool
    {
        return $this->limiter()->tooManyAttempts(
            $this->throttleKey($request),
            5, // Max attempts
            1 // Decay in minutes
        );
    }

    /**
     * Increment login attempts
     */
    protected function incrementLoginAttempts(Request $request): void
    {
        $this->limiter()->hit(
            $this->throttleKey($request),
            60 // Decay in seconds
        );
    }

    /**
     * Clear login attempts
     */
    protected function clearLoginAttempts(Request $request): void
    {
        $this->limiter()->clear($this->throttleKey($request));
    }

    /**
     * Get throttle key
     */
    protected function throttleKey(Request $request): string
    {
        return $request->ip() . '|' . $request->input('email');
    }

    /**
     * Get rate limiter
     */
    protected function limiter()
    {
        return app(\Illuminate\Cache\RateLimiter::class);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No account found with this email address.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if user is active
        $user = User::where('email', $request->email)->first();
        if (!$user || $user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'If an account exists with this email, a password reset link has been sent.',
            ], 200);
        }

        // Delete old tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Create password reset token
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => hash('sha256', $token),
            'created_at' => now(),
        ]);

        // In production, send email with reset link
        // For now, return the token (development only)
        $resetLink = config('app.frontend_url', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . $request->email;

        return response()->json([
            'success' => true,
            'message' => 'If an account exists with this email, a password reset link has been sent.',
            'data' => [
                'reset_link' => app()->environment('local') ? $resetLink : null,
            ],
        ], 200);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'password.min' => 'Password must be at least 12 characters long.',
            'password.letters' => 'Password must contain at least one letter.',
            'password.mixedCase' => 'Password must contain both uppercase and lowercase letters.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one special character.',
            'email.exists' => 'No account found with this email address.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find the reset token
        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
            ], 400);
        }

        // Verify token (hash comparison)
        if (!hash_equals($resetToken->token, hash('sha256', $request->token))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
            ], 400);
        }

        // Check if token is expired (60 minutes)
        if ($resetToken->created_at->lt(now()->subMinutes(60))) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired. Please request a new one.',
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        // Revoke all existing tokens (force logout from all devices)
        $user->tokens()->delete();

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Delete the reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. Please login with your new password.',
        ], 200);
    }

    /**
     * Verify password reset token
     */
    public function verifyResetToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token.',
            ], 400);
        }

        if (!hash_equals($resetToken->token, hash('sha256', $request->token))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token.',
            ], 400);
        }

        if ($resetToken->created_at->lt(now()->subMinutes(60))) {
            return response()->json([
                'success' => false,
                'message' => 'Token has expired.',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token is valid.',
        ], 200);
    }
}

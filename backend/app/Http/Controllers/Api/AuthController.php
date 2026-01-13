<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
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
}

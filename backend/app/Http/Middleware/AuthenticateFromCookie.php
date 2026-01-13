<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateFromCookie
{
    /**
     * Handle an incoming request.
     *
     * Extracts the auth_token from httpOnly cookie and adds it to the
     * Authorization header so Sanctum can authenticate the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if there's an auth_token cookie and no Authorization header
        // Read directly from $_COOKIE since API routes don't use EncryptCookies middleware
        $token = $_COOKIE['auth_token'] ?? null;

        if ($token && !$request->hasHeader('Authorization')) {
            // Add the token as a Bearer token to the request
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}

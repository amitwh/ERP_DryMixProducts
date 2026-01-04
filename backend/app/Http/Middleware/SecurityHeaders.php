<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SecurityHeaders
{
    /**
     * List of allowed domains for Content Security Policy
     */
    protected $allowedDomains = [
        "'self'",
        'https:',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $response = $next($request);

        // Add security headers
        return $this->addSecurityHeaders($response, $request);
    }

    /**
     * Add security headers to response
     *
     * @param  \Illuminate\Http\Response  $response
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    protected function addSecurityHeaders(Response $response, Request $request): Response
    {
        // Content-Security-Policy
        // Restricts sources of content that can be loaded
        $csp = implode(' ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' " . $this->getAllowedConnectDomains(),
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-src 'none'",
            "object-src 'none'",
        ]);

        $response->headers->set('Content-Security-Policy', $csp);

        // X-Frame-Options
        // Prevents clickjacking attacks
        $response->headers->set('X-Frame-Options', 'DENY');

        // X-Content-Type-Options
        // Prevents MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // X-XSS-Protection
        // Enables XSS filter in browsers
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer-Policy
        // Controls how much referrer information is sent
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions-Policy
        // Controls which features browser can use
        $permissions = implode(', ', [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'payment=()',
            'usb=()',
        ]);

        $response->headers->set('Permissions-Policy', $permissions);

        // Strict-Transport-Security
        // Enforces HTTPS connections
        if (app()->environment('production')) {
            $hsts = 'max-age=31536000; includeSubDomains; preload';
            $response->headers->set('Strict-Transport-Security', $hsts);
        }

        // X-Powered-By
        // Hide server information
        $response->headers->remove('X-Powered-By');

        return $response;
    }

    /**
     * Get allowed domains for connect-src
     *
     * @return string
     */
    protected function getAllowedConnectDomains(): string
    {
        $domains = ["'self'"];

        // Add frontend URLs
        if ($frontendUrl = env('FRONTEND_URL')) {
            $domains[] = $this->parseDomain($frontendUrl);
        }

        if ($frontendDevUrl = env('FRONTEND_URL_DEV')) {
            $domains[] = $this->parseDomain($frontendDevUrl);
        }

        // Add API URL if different
        if ($apiUrl = env('APP_URL')) {
            $apiDomain = $this->parseDomain($apiUrl);
            if (!in_array($apiDomain, $domains)) {
                $domains[] = $apiDomain;
            }
        }

        return implode(' ', $domains);
    }

    /**
     * Parse domain from URL
     *
     * @param  string  $url
     * @return string
     */
    protected function parseDomain(string $url): string
    {
        $url = parse_url($url, PHP_URL_HOST);

        if (!$url) {
            return '';
        }

        return $url;
    }
}

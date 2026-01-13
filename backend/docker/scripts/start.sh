#!/bin/bash
# =============================================================================
# ERP DryMix Products - Container Startup Script
# =============================================================================

set -e

echo "Starting ERP DryMix Products Backend..."

# Create log directory
mkdir -p /var/log/php
touch /var/log/php/error.log
chown -R www-data:www-data /var/log/php

# Create opcache directory
mkdir -p /tmp/opcache
chown -R www-data:www-data /tmp/opcache

# Wait for database to be ready
echo "Waiting for database connection..."
MAX_TRIES=30
TRIES=0
while ! php -r "new PDO('mysql:host=${DB_HOST:-mariadb};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-}');" 2>/dev/null; do
    TRIES=$((TRIES + 1))
    if [ $TRIES -ge $MAX_TRIES ]; then
        echo "Database connection failed after $MAX_TRIES attempts. Starting anyway..."
        break
    fi
    echo "Waiting for database... (attempt $TRIES/$MAX_TRIES)"
    sleep 2
done

echo "Database is ready!"

# Run Laravel optimizations
echo "Running Laravel optimizations..."

# Generate application key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    echo "Generating application key..."
    php artisan key:generate --force --no-interaction 2>/dev/null || true
fi

# Clear and cache configuration
php artisan config:clear 2>/dev/null || true
php artisan config:cache 2>/dev/null || true

# Clear and cache routes
php artisan route:clear 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# Clear and cache views
php artisan view:clear 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

# Run migrations (optional - uncomment if needed)
# echo "Running database migrations..."
# php artisan migrate --force --no-interaction 2>/dev/null || true

# Create storage link
php artisan storage:link 2>/dev/null || true

# Ensure proper permissions
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "Laravel optimizations complete!"

# Start Apache
echo "Starting Apache..."
exec apache2-foreground

#!/bin/bash
# =============================================================================
# ERP DryMix Products - Queue Worker Startup Script
# =============================================================================

set -e

echo "Starting ERP DryMix Products Queue Worker..."

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

# Wait for Redis to be ready
echo "Waiting for Redis connection..."
TRIES=0
while ! php -r "new Redis(); \$r = new Redis(); \$r->connect('${REDIS_HOST:-redis}', ${REDIS_PORT:-6379}); \$r->auth('${REDIS_PASSWORD:-}');" 2>/dev/null; do
    TRIES=$((TRIES + 1))
    if [ $TRIES -ge $MAX_TRIES ]; then
        echo "Redis connection failed after $MAX_TRIES attempts. Starting anyway..."
        break
    fi
    echo "Waiting for Redis... (attempt $TRIES/$MAX_TRIES)"
    sleep 2
done

echo "Redis is ready!"

# Clear old cache
php artisan cache:clear 2>/dev/null || true

echo "Starting queue worker..."

# Start the queue worker with production settings
exec php artisan queue:work redis \
    --queue=default,notifications,emails,reports \
    --tries=3 \
    --timeout=90 \
    --sleep=3 \
    --max-jobs=1000 \
    --max-time=3600

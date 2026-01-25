#!/bin/bash
# =============================================================================
# ERP DryMix Products - Docker Startup Script
# =============================================================================
# This script initializes the database and starts all Docker containers
# Usage: ./scripts/docker-start.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================="
echo "ERP DryMix Products - Docker Startup"
echo "============================================="

cd "$PROJECT_ROOT"

# Check if cinfo network exists
echo "[1/6] Checking Docker network..."
if ! docker network ls | grep -q "cinfo_app_network"; then
    echo "ERROR: cinfo_app_network not found!"
    echo "Please ensure the cinfo infrastructure is running first."
    echo "Run: cd /path/to/cinfo && docker-compose up -d"
    exit 1
fi
echo "      cinfo_app_network found"

# Check if MariaDB is running
echo "[2/6] Checking MariaDB container..."
if ! docker ps | grep -q "mariadb"; then
    echo "ERROR: MariaDB container not running!"
    echo "Please start the cinfo infrastructure first."
    exit 1
fi
echo "      MariaDB container is running"

# Initialize database
echo "[3/6] Initializing database..."
docker exec -i mariadb mysql -uroot -pangles123 -e "CREATE DATABASE IF NOT EXISTS erp_drymix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "      Database may already exist, continuing..."
}
echo "      Database erp_drymix ready"

# Build containers
echo "[4/6] Building Docker containers..."
docker-compose build --no-cache

# Start containers
echo "[5/6] Starting containers..."
docker-compose up -d

# Wait for backend to be ready
echo "[6/6] Waiting for backend to initialize..."
sleep 10

# Run migrations
echo "      Running database migrations..."
docker exec erp_drymix_backend php artisan migrate --force 2>/dev/null || {
    echo "      Note: Migrations may need to be run manually if this fails"
}

# Generate app key if needed
docker exec erp_drymix_backend php artisan key:generate --force 2>/dev/null || true

# Clear and cache config
docker exec erp_drymix_backend php artisan config:clear 2>/dev/null || true
docker exec erp_drymix_backend php artisan cache:clear 2>/dev/null || true

echo ""
echo "============================================="
echo "ERP DryMix Products - Startup Complete!"
echo "============================================="
echo ""
echo "Access Points:"
echo "  - Frontend:     http://localhost:3101"
echo "  - Backend API:  http://localhost:8101/api"
echo "  - Unified:      http://localhost:8100"
echo ""
echo "Shared Services (cinfo):"
echo "  - phpMyAdmin:   http://localhost:8080"
echo "  - MailHog:      http://localhost:8025"
echo "  - Grafana:      http://localhost:3000"
echo ""
echo "Container Status:"
docker-compose ps
echo ""

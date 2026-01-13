# ERP DryMix Products - Deployment Guide

## Overview

This guide explains how to deploy the ERP DryMix Products application using the centralized "cinfo" Docker infrastructure.

## Prerequisites

### Required Infrastructure (cinfo stack must be running)

Ensure the following services are running from the cinfo Docker stack:

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| MariaDB | mariadb | 3306 | Database |
| Redis | redis | 6379 | Cache/Queue |
| MailHog | mailhog | 1025/8025 | Email testing |
| Grafana | grafana | 3000 | Monitoring |
| phpMyAdmin | phpmyadmin | 8080 | DB Management |

### Verify cinfo stack

```bash
# Check if cinfo network exists
docker network ls | grep cinfo_app_network

# If not, create it or start the cinfo stack
docker network create cinfo_app_network

# Or start the full cinfo stack
cd /path/to/cinfo
docker-compose up -d
```

## Port Allocation

The ERP DryMix application uses the following ports:

| Service | Port | Description |
|---------|------|-------------|
| Nginx Proxy | 8100 | Unified entry point |
| Backend API | 8101 | Laravel API |
| Frontend | 3101 | React application |
| HTTPS (optional) | 8443 | SSL-enabled access |

## Quick Start

### 1. Clone and Configure

```bash
# Navigate to project directory
cd J:\apps\ERP_DryMixProducts

# Copy environment file
cp backend/.env.example backend/.env

# Generate Laravel application key
docker-compose run --rm erp-backend php artisan key:generate
```

### 2. Initialize Database

```bash
# Connect to MariaDB and create database
docker exec -i mariadb mysql -uroot -pangles123 < docker/init-db.sql

# Or manually create database
docker exec -it mariadb mysql -uroot -pangles123
# Then run: CREATE DATABASE erp_drymix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Build and Start Containers

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Run Migrations and Seeders

```bash
# Run database migrations
docker-compose exec erp-backend php artisan migrate

# Seed initial data (optional)
docker-compose exec erp-backend php artisan db:seed

# Create storage link
docker-compose exec erp-backend php artisan storage:link
```

## Access Points

After successful deployment, access the application at:

| URL | Description |
|-----|-------------|
| http://localhost:8100 | Unified ERP Application |
| http://localhost:3101 | Frontend (React) |
| http://localhost:8101/api | Backend API |
| http://localhost:8101/api/health | Health Check |
| http://localhost:8080 | phpMyAdmin (Database) |
| http://localhost:8025 | MailHog (Email Testing) |
| http://localhost:3000 | Grafana (Monitoring) |

## Environment Variables

### Key Configuration (backend/.env)

```env
# Database (cinfo MariaDB)
DB_CONNECTION=mysql
DB_HOST=mariadb
DB_PORT=3306
DB_DATABASE=erp_drymix
DB_USERNAME=root
DB_PASSWORD=angles123

# Redis (cinfo Redis)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=angles123

# Mail (cinfo MailHog)
MAIL_HOST=mailhog
MAIL_PORT=1025
```

## Container Management

### Start/Stop Commands

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Restart specific service
docker-compose restart erp-backend

# View logs
docker-compose logs -f erp-backend
docker-compose logs -f erp-frontend

# View all logs
docker-compose logs -f
```

### Rebuild Commands

```bash
# Rebuild specific service
docker-compose build erp-backend
docker-compose up -d erp-backend

# Rebuild all services (no cache)
docker-compose build --no-cache
docker-compose up -d
```

## Health Checks

### Backend Health

```bash
# Check via curl
curl http://localhost:8101/api/health

# Expected response
{
  "success": true,
  "message": "ERP DryMix API - All Modules Active",
  "version": "1.0.0",
  "status": "operational"
}
```

### Frontend Health

```bash
curl http://localhost:3101/health.json

# Expected response
{"status":"healthy","app":"erp-drymix-frontend"}
```

### Container Health Status

```bash
docker-compose ps
# All containers should show (healthy) status
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database exists
docker exec -it mariadb mysql -uroot -pangles123 -e "SHOW DATABASES;"

# Create database if missing
docker exec -it mariadb mysql -uroot -pangles123 -e "CREATE DATABASE IF NOT EXISTS erp_drymix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Test connection from backend container
docker-compose exec erp-backend php artisan db:show
```

### Redis Connection Issues

```bash
# Test Redis connection
docker exec -it redis redis-cli -a angles123 PING
# Should return: PONG

# Check Redis from backend
docker-compose exec erp-backend php artisan tinker
>>> Redis::ping();
# Should return: PONG
```

### Permission Issues

```bash
# Fix storage permissions
docker-compose exec erp-backend chmod -R 775 storage bootstrap/cache
docker-compose exec erp-backend chown -R www-data:www-data storage bootstrap/cache
```

### Clear Cache

```bash
# Clear all Laravel caches
docker-compose exec erp-backend php artisan cache:clear
docker-compose exec erp-backend php artisan config:clear
docker-compose exec erp-backend php artisan route:clear
docker-compose exec erp-backend php artisan view:clear

# Optimize for production
docker-compose exec erp-backend php artisan optimize
```

## Production Deployment

### Environment Changes for Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Security
SESSION_SECURE_COOKIE=true
```

### Build for Production

```bash
# Build with production settings
docker-compose -f docker-compose.yml build

# Or use specific build args
docker-compose build \
  --build-arg VITE_API_BASE_URL=https://api.your-domain.com/api/v1
```

### SSL Configuration

1. Place SSL certificates in `docker/nginx/ssl/`
2. Uncomment HTTPS server block in `docker/nginx/default.conf`
3. Update `APP_URL` in `.env`
4. Restart nginx container

## Backup and Restore

### Database Backup

```bash
# Create backup
docker exec mariadb mysqldump -uroot -pangles123 erp_drymix > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i mariadb mysql -uroot -pangles123 erp_drymix < backup_20240101.sql
```

### Full Application Backup

```bash
# Backup uploads and storage
tar -czvf storage_backup.tar.gz backend/storage/app/public
```

## Monitoring

### View Container Resources

```bash
docker stats erp_drymix_backend erp_drymix_frontend erp_drymix_nginx
```

### Access Grafana Dashboard

1. Open http://localhost:3000
2. Login with admin / angles123
3. Import ERP dashboard (if configured)

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Contact: info@concreteinfo.com

---

**Last Updated**: January 2026
**Version**: 1.0.0

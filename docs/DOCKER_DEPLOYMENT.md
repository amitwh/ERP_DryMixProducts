# ERP DryMix Products - Docker Deployment Guide

## Overview

This application is designed to run alongside the centralized **cinfo** Docker infrastructure, which provides shared services like MariaDB, Redis, MailHog, and Grafana.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        cinfo_app_network                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐                                                   │
│  │   erp-nginx      │ :8100 (Unified access)                           │
│  │   (Reverse Proxy)│                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                             │
│     ┌─────┴─────┐                                                       │
│     ▼           ▼                                                       │
│ ┌────────┐  ┌────────┐                                                  │
│ │Frontend│  │Backend │ :8101 (API)                                      │
│ │:3101   │  │(Laravel)│                                                 │
│ └────────┘  └────┬───┘                                                  │
│                  │                                                      │
│         ┌────────┼────────┐                                             │
│         ▼        ▼        ▼                                             │
│   ┌──────────┐ ┌──────┐ ┌─────────┐                                     │
│   │Queue     │ │Sched.│ │ cinfo   │                                     │
│   │Worker    │ │      │ │Services │                                     │
│   └──────────┘ └──────┘ └─────────┘                                     │
│                              │                                          │
│                    ┌─────────┴─────────┐                                │
│                    ▼         ▼         ▼                                │
│              ┌─────────┐ ┌───────┐ ┌────────┐                           │
│              │MariaDB  │ │Redis  │ │MailHog │                           │
│              │:3306    │ │:6379  │ │:1025   │                           │
│              └─────────┘ └───────┘ └────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Docker** and **Docker Compose** installed
2. **cinfo infrastructure** running with the following services:
   - MariaDB (port 3306)
   - Redis (port 6379)
   - MailHog (ports 1025, 8025)
   - Docker network: `cinfo_app_network`

## Port Allocation

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3101 | React application |
| Backend API | 8101 | Laravel PHP API |
| Nginx Proxy | 8100 | Unified access point |

## Quick Start

### Windows

```batch
# Navigate to project directory
cd J:\apps\ERP_DryMixProducts

# Run the startup script
scripts\docker-start.bat
```

### Linux/macOS

```bash
# Navigate to project directory
cd /path/to/ERP_DryMixProducts

# Make scripts executable
chmod +x scripts/*.sh

# Run the startup script
./scripts/docker-start.sh
```

## Manual Setup

### Step 1: Create the Database

```bash
# Connect to the MariaDB container and create the database
docker exec -it mariadb mysql -uroot -pangles123 -e \
  "CREATE DATABASE IF NOT EXISTS erp_drymix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 2: Build Containers

```bash
# Build all images
docker-compose build

# Or build without cache
docker-compose build --no-cache
```

### Step 3: Start Containers

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Run Migrations

```bash
# Run database migrations
docker exec erp_drymix_backend php artisan migrate --force

# Seed the database (optional)
docker exec erp_drymix_backend php artisan db:seed
```

## Container Details

### erp-backend (erp_drymix_backend)
- **Image**: PHP 8.2 with Apache
- **Port**: 8101:80
- **Role**: Laravel API server

### erp-frontend (erp_drymix_frontend)
- **Image**: Node 18 (build) + Nginx (serve)
- **Port**: 3101:80
- **Role**: React SPA serving

### erp-queue-worker (erp_drymix_queue)
- **Image**: PHP 8.2 CLI Alpine
- **Role**: Laravel queue processing

### erp-scheduler (erp_drymix_scheduler)
- **Image**: PHP 8.2 CLI Alpine
- **Role**: Laravel scheduled tasks (cron)

### erp-nginx (erp_drymix_nginx)
- **Image**: Nginx Alpine
- **Port**: 8100:80
- **Role**: Reverse proxy for unified access

## Access Points

After successful deployment:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3101 |
| **Backend API** | http://localhost:8101/api |
| **Unified Access** | http://localhost:8100 |
| **API Health Check** | http://localhost:8101/api/health |

## Shared cinfo Services

| Service | URL |
|---------|-----|
| phpMyAdmin | http://localhost:8080 |
| MailHog Web UI | http://localhost:8025 |
| Grafana | http://localhost:3000 |

## Environment Variables

### Root .env file
Located at project root, used by docker-compose:
```env
APP_ENV=local
APP_DEBUG=true
DB_USERNAME=root
DB_PASSWORD=angles123
REDIS_PASSWORD=angles123
```

### Backend .env file
Located at `backend/.env`, used by Laravel:
- Database, Redis, Mail configuration
- Sanctum token settings
- API rate limiting

## Common Commands

```bash
# View container status
docker-compose ps

# View logs
docker-compose logs -f erp-backend

# Restart a specific service
docker-compose restart erp-backend

# Execute artisan commands
docker exec erp_drymix_backend php artisan <command>

# Access backend shell
docker exec -it erp_drymix_backend bash

# Clear Laravel cache
docker exec erp_drymix_backend php artisan cache:clear
docker exec erp_drymix_backend php artisan config:clear

# Run queue worker manually
docker exec erp_drymix_backend php artisan queue:work
```

## Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

## Troubleshooting

### 1. Network not found
```
ERROR: Network cinfo_app_network not found
```
**Solution**: Start the cinfo infrastructure first.

### 2. Database connection refused
```
SQLSTATE[HY000] [2002] Connection refused
```
**Solution**: Ensure MariaDB container is running: `docker ps | grep mariadb`

### 3. Redis connection issues
Check Redis is running and password matches: `redis-cli -h localhost -p 6379 -a angles123 ping`

### 4. Permission denied on storage
```bash
docker exec erp_drymix_backend chown -R www-data:www-data /var/www/html/storage
docker exec erp_drymix_backend chmod -R 775 /var/www/html/storage
```

### 5. Frontend not loading
- Check if backend is healthy: `curl http://localhost:8101/api/health`
- Verify CORS settings in backend
- Check browser console for errors

## Production Deployment

For production deployment, update the following:

1. **Environment variables**:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Use secure passwords
   - Configure proper mail service

2. **SSL/TLS**:
   - Enable HTTPS in nginx configuration
   - Obtain SSL certificates
   - Update Sanctum stateful domains

3. **Optimizations**:
   ```bash
   docker exec erp_drymix_backend php artisan config:cache
   docker exec erp_drymix_backend php artisan route:cache
   docker exec erp_drymix_backend php artisan view:cache
   ```

4. **Monitoring**:
   - Configure Grafana dashboards
   - Set up Sentry for error tracking
   - Enable proper logging

## Health Checks

All containers have health checks configured:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' erp_drymix_backend
docker inspect --format='{{.State.Health.Status}}' erp_drymix_frontend
```

## Data Persistence

- **Database**: Persisted in cinfo MariaDB volume
- **File uploads**: `backend_storage` Docker volume
- **Cache**: `backend_cache` Docker volume
- **Redis data**: Persisted in cinfo Redis volume

@echo off
REM =============================================================================
REM ERP DryMix Products - Docker Startup Script (Windows)
REM =============================================================================
REM This script initializes the database and starts all Docker containers
REM Usage: scripts\docker-start.bat
REM =============================================================================

setlocal enabledelayedexpansion

echo =============================================
echo ERP DryMix Products - Docker Startup
echo =============================================

cd /d "%~dp0\.."

REM Check if Docker is running
echo [1/6] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo       Docker is running

REM Check if cinfo network exists
echo [2/6] Checking Docker network...
docker network ls | findstr "cinfo_app_network" >nul
if errorlevel 1 (
    echo ERROR: cinfo_app_network not found!
    echo Please ensure the cinfo infrastructure is running first.
    pause
    exit /b 1
)
echo       cinfo_app_network found

REM Check if MariaDB is running
echo [3/6] Checking MariaDB container...
docker ps | findstr "mariadb" >nul
if errorlevel 1 (
    echo ERROR: MariaDB container not running!
    echo Please start the cinfo infrastructure first.
    pause
    exit /b 1
)
echo       MariaDB container is running

REM Initialize database
echo [4/6] Initializing database...
docker exec -i mariadb mysql -uroot -pangles123 -e "CREATE DATABASE IF NOT EXISTS erp_drymix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
echo       Database erp_drymix ready

REM Build and start containers
echo [5/6] Building and starting Docker containers...
docker-compose build
docker-compose up -d

REM Wait for backend to be ready
echo [6/6] Waiting for backend to initialize...
timeout /t 15 /nobreak >nul

REM Run migrations
echo       Running database migrations...
docker exec erp_drymix_backend php artisan migrate --force 2>nul

REM Clear cache
docker exec erp_drymix_backend php artisan config:clear 2>nul
docker exec erp_drymix_backend php artisan cache:clear 2>nul

echo.
echo =============================================
echo ERP DryMix Products - Startup Complete!
echo =============================================
echo.
echo Access Points:
echo   - Frontend:     http://localhost:3101
echo   - Backend API:  http://localhost:8101/api
echo   - Unified:      http://localhost:8100
echo.
echo Shared Services (cinfo):
echo   - phpMyAdmin:   http://localhost:8080
echo   - MailHog:      http://localhost:8025
echo   - Grafana:      http://localhost:3000
echo.
echo Container Status:
docker-compose ps
echo.
pause

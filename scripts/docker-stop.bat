@echo off
REM =============================================================================
REM ERP DryMix Products - Docker Stop Script (Windows)
REM =============================================================================

echo =============================================
echo ERP DryMix Products - Stopping Containers
echo =============================================

cd /d "%~dp0\.."

docker-compose down

echo.
echo All ERP DryMix containers stopped.
echo Note: Shared cinfo services (MariaDB, Redis, etc.) are still running.
echo.
pause

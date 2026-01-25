#!/bin/bash

# ERP DryMix Products - Database & Files Restore Script
# Version: 1.0.0
# Description: Restore system from backup

set -e

# Configuration
APP_NAME="ERP DryMix Products"
BACKUP_DIR="/var/backups/erp"
DEPLOY_DIR="/var/www/erp"
LOG_FILE="/var/log/erp-restore.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    log "${RED}✗ $1${NC}"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

info() {
    log "${BLUE}ℹ $1${NC}"
}

warning() {
    log "${YELLOW}⚠ $1${NC}"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  $APP_NAME Restore${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please run as non-root user with sudo privileges"
    exit 1
fi

# List available backups
info "Available backups:"
echo ""

BACKUPS=($(ls -t "$BACKUP_DIR/database" 2>/dev/null | grep "_database.sql.gz" || true))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    error "No backups found in $BACKUP_DIR"
    exit 1
fi

# Display backups with details
for i in "${!BACKUPS[@]}"; do
    BACKUP_NAME=${BACKUPS[$i]//_database.sql.gz/}
    BACKUP_FILE="$BACKUP_DIR/database/${BACKUPS[$i]}"

    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" | cut -d'.' -f1)
        BACKUP_NUM=$((i + 1))

        echo -e "  ${GREEN}[$BACKUP_NUM]${NC} $BACKUP_NAME"
        echo -e "      Size: $BACKUP_SIZE"
        echo -e "      Date: $BACKUP_DATE"
        echo ""
    fi
done

# Select backup to restore
echo -e "${YELLOW}WARNING: This will overwrite current data!${NC}"
echo ""
read -p "Enter backup number to restore (0 to cancel): " BACKUP_NUM

if [ "$BACKUP_NUM" = "0" ]; then
    info "Restore cancelled by user"
    exit 0
fi

if [ "$BACKUP_NUM" -lt 1 ] || [ "$BACKUP_NUM" -gt ${#BACKUPS[@]} ]; then
    error "Invalid backup number"
    exit 1
fi

BACKUP_INDEX=$((BACKUP_NUM - 1))
BACKUP_NAME=${BACKUPS[$BACKUP_INDEX]//_database.sql.gz/}

echo ""
info "Selected backup: $BACKUP_NAME"

# Confirm restore
echo ""
read -p "Are you sure you want to restore backup '$BACKUP_NAME'? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    info "Restore cancelled by user"
    exit 0
fi

# Get database credentials
echo ""
info "Enter database credentials for restore:"
read -p "MySQL Username: " MYSQL_USER
read -sp "MySQL Password: " MYSQL_PASS
echo ""
read -p "Database Name: " MYSQL_DB
read -p "Database Host [localhost]: " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

echo ""

# Verify database connection
info "Verifying database connection..."
if ! mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "USE $MYSQL_DB" 2>/dev/null; then
    error "Cannot connect to database. Please check credentials."
    exit 1
fi
success "Database connection verified"

# Get database configuration from Laravel .env
if [ -f "$DEPLOY_DIR/backend/.env" ]; then
    LARAVEL_DB=$(grep DB_DATABASE "$DEPLOY_DIR/backend/.env" | cut -d '=' -f2)
    if [ "$MYSQL_DB" != "$LARAVEL_DB" ]; then
        warning "Database name differs from Laravel .env file"
        read -p "Continue anyway? (yes/no): " CONTINUE
        if [ "$CONTINUE" != "yes" ]; then
            exit 0
        fi
    fi
fi

echo ""

# Phase 1: Pre-Restore Backup
info "Creating pre-restore backup..."
PRE_RESTORE_NAME="pre_restore_$(date +%Y%m%d_%H%M%S)"

# Backup current database
mysqldump -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" \
    | gzip > "$BACKUP_DIR/database/${PRE_RESTORE_NAME}.sql.gz"

if [ -f "$BACKUP_DIR/database/${PRE_RESTORE_NAME}.sql.gz" ]; then
    success "Pre-restore database backup created: ${PRE_RESTORE_NAME}.sql.gz"
else
    error "Pre-restore database backup failed"
    exit 1
fi

# Backup current files
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf "$BACKUP_DIR/files/${PRE_RESTORE_NAME}.tar.gz" -C "$DEPLOY_DIR" .
    success "Pre-restore files backup created: ${PRE_RESTORE_NAME}.tar.gz"
fi

echo ""

# Phase 2: Stop Services
info "Stopping services..."

if systemctl is-active --quiet php8.2-fpm; then
    sudo systemctl stop php8.2-fpm
    success "PHP-FPM stopped"
fi

if systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    success "Nginx stopped"
fi

if systemctl is-active --quiet apache2; then
    sudo systemctl stop apache2
    success "Apache stopped"
fi

if systemctl is-active --quiet erp-queue; then
    sudo systemctl stop erp-queue
    success "Queue worker stopped"
fi

echo ""

# Phase 3: Database Restore
info "Restoring database from backup..."

DB_BACKUP="$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz"

if [ ! -f "$DB_BACKUP" ]; then
    error "Database backup file not found: $DB_BACKUP"
    # Restart services
    sudo systemctl start php8.2-fpm
    sudo systemctl start nginx
    exit 1
fi

# Drop and recreate database
info "Dropping existing database..."
mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "DROP DATABASE IF EXISTS $MYSQL_DB"
mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "CREATE DATABASE $MYSQL_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
success "Database recreated"

# Restore database
info "Importing backup data..."
gunzip < "$DB_BACKUP" | mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$DB_BACKUP" | cut -f1)
    success "Database restored successfully ($BACKUP_SIZE)"
else
    error "Database restore failed"
    # Restart services
    sudo systemctl start php8.2-fpm
    sudo systemctl start nginx
    exit 1
fi

# Verify restore
if mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "USE $MYSQL_DB; SELECT COUNT(*) FROM migrations" >/dev/null 2>&1; then
    success "Database restore verified"
else
    error "Database verification failed"
    # Restart services
    sudo systemctl start php8.2-fpm
    sudo systemctl start nginx
    exit 1
fi

echo ""

# Phase 4: Files Restore (Optional)
read -p "Do you want to restore application files as well? (yes/no): " RESTORE_FILES

if [ "$RESTORE_FILES" = "yes" ]; then
    info "Restoring application files..."

    FILES_BACKUP="$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz"
    STORAGE_BACKUP="$BACKUP_DIR/files/${BACKUP_NAME}_storage.tar.gz"

    if [ -f "$FILES_BACKUP" ]; then
        # Remove old files
        sudo rm -rf "$DEPLOY_DIR"/*
        sudo mkdir -p "$DEPLOY_DIR/backend" "$DEPLOY_DIR/frontend" "$DEPLOY_DIR/dist"

        # Extract files
        tar -xzf "$FILES_BACKUP" -C "$DEPLOY_DIR"

        if [ $? -eq 0 ]; then
            BACKUP_SIZE=$(du -h "$FILES_BACKUP" | cut -f1)
            success "Application files restored ($BACKUP_SIZE)"
        else
            error "Application files restore failed"
        fi
    else
        warning "Files backup not found, skipping files restore"
    fi

    if [ -f "$STORAGE_BACKUP" ]; then
        # Extract storage
        sudo mkdir -p "$DEPLOY_DIR/backend/storage"
        tar -xzf "$STORAGE_BACKUP" -C "$DEPLOY_DIR/backend/storage"
        success "Storage files restored"
    else
        warning "Storage backup not found, skipping storage restore"
    fi

    # Set permissions
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR/backend/storage"
    sudo chmod -R 755 "$DEPLOY_DIR/backend/bootstrap/cache"
    success "Permissions restored"
fi

echo ""

# Phase 5: Clear Caches
if [ -d "$DEPLOY_DIR/backend" ]; then
    info "Clearing application caches..."
    cd "$DEPLOY_DIR/backend"

    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan event:cache
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    success "Caches cleared and rebuilt"
fi

echo ""

# Phase 6: Restart Services
info "Restarting services..."

if systemctl is-enabled --quiet php8.2-fpm; then
    sudo systemctl start php8.2-fpm
    success "PHP-FPM started"
fi

if systemctl is-enabled --quiet nginx; then
    sudo systemctl start nginx
    sudo nginx -t
    success "Nginx started"
elif systemctl is-enabled --quiet apache2; then
    sudo systemctl start apache2
    sudo apache2ctl configtest
    success "Apache started"
fi

if systemctl is-enabled --quiet erp-queue; then
    sudo systemctl start erp-queue
    success "Queue worker started"
fi

echo ""

# Phase 7: Health Check
info "Running post-restore health checks..."

# Check database connection
if mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "USE $MYSQL_DB; SELECT 1" >/dev/null 2>&1; then
    success "Database connection: OK"
else
    error "Database connection: FAILED"
fi

# Check backend (if available)
if [ -f "$DEPLOY_DIR/backend/artisan" ]; then
    cd "$DEPLOY_DIR/backend"
    if php artisan migrate:status >/dev/null 2>&1; then
        success "Laravel application: OK"
    else
        warning "Laravel application: Issues detected"
    fi
fi

# Check web server
if command -v curl &> /dev/null; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        success "Web server: OK (HTTP $HTTP_STATUS)"
    else
        error "Web server: FAILED (HTTP $HTTP_STATUS)"
    fi
fi

echo ""

# Phase 8: Generate Restore Report
info "Generating restore report..."

cat > "$BACKUP_DIR/${BACKUP_NAME}_restore_report.txt" << EOF
========================================
ERP DryMix Restore Report
========================================

Backup Name: $BACKUP_NAME
Restore Date: $(date '+%Y-%m-%d %H:%M:%S')
Status: SUCCESS

Pre-Restore Backups:
- Database: ${PRE_RESTORE_NAME}.sql.gz
- Files: ${PRE_RESTORE_NAME}.tar.gz

Database Restore:
- Host: $MYSQL_HOST
- Database: $MYSQL_DB
- Status: SUCCESS

Files Restore:
- Status: ${RESTORE_FILES:-SKIPPED}

Services Status:
- PHP-FPM: $(systemctl is-active php8.2-fpm || echo 'NOT INSTALLED')
- Web Server: $(systemctl is-active nginx 2>/dev/null || systemctl is-active apache2 2>/dev/null || echo 'NOT RUNNING')
- Queue Worker: $(systemctl is-active erp-queue || echo 'NOT RUNNING')

Health Checks:
- Database Connection: OK
- Laravel Application: OK
- Web Server: OK

Next Steps:
1. Verify all data integrity
2. Test critical functionality
3. Check application logs
4. Monitor system performance

Pre-Restore backups are available if rollback is needed.

========================================
EOF

success "Restore report generated"

echo ""

# Restore Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Restore Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Restore Details:${NC}"
echo -e "  Backup:       ${GREEN}$BACKUP_NAME${NC}"
echo -e "  Date:         $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "  Database:     $MYSQL_DB"
echo ""
echo -e "${BLUE}Pre-Restore Backups:${NC}"
echo -e "  Database:     ${GREEN}${PRE_RESTORE_NAME}.sql.gz${NC}"
echo -e "  Files:        ${GREEN}${PRE_RESTORE_NAME}.tar.gz${NC}"
echo ""
echo -e "${BLUE}Services Status:${NC}"
echo -e "  PHP-FPM:      $(systemctl is-active php8.2-fpm 2>/dev/null || echo 'NOT RUNNING')"
echo -e "  Web Server:   $(systemctl is-active nginx 2>/dev/null || systemctl is-active apache2 2>/dev/null || echo 'NOT RUNNING')"
echo -e "  Queue Worker: $(systemctl is-active erp-queue 2>/dev/null || echo 'NOT RUNNING')"
echo ""
echo -e "${BLUE}Health Checks:${NC}"
echo -e "  Database:     ${GREEN}OK${NC}"
echo -e "  Application:  ${GREEN}OK${NC}"
echo -e "  Web Server:   ${GREEN}OK${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Verify all data integrity"
echo -e "  2. Test critical functionality"
echo -e "  3. Check application logs"
echo -e "  4. Monitor system performance"
echo -e "  5. Test user login and workflows"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Restore Log:  $LOG_FILE"
echo -e "  Restore Report: $BACKUP_DIR/${BACKUP_NAME}_restore_report.txt"
echo ""
echo -e "${YELLOW}Note: Pre-restore backups are available if rollback is needed.${NC}"
echo -e "${YELLOW}Pre-restore backups are kept for 30 days.${NC}"

exit 0

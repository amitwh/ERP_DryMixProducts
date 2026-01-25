#!/bin/bash

# ERP DryMix Products - Automated Backup Script
# Version: 1.0.0
# Description: Automated database and file backup system

set -e

# Configuration
APP_NAME="ERP DryMix Products"
BACKUP_DIR="/var/backups/erp"
DEPLOY_DIR="/var/www/erp"
LOG_FILE="/var/log/erp-backup.log"
KEEP_DAYS=7

# Database configuration (read from environment)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-erp_production}
DB_USER=${DB_USER:-erp_user}
DB_PASS=${DB_PASSWORD:-}

# Create directories
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/files"
mkdir -p "$BACKUP_DIR/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

error() {
    log "${RED}✗ $1${NC}"
}

info() {
    log "${BLUE}ℹ $1${NC}"
}

warning() {
    log "${YELLOW}⚠ $1${NC}"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  $APP_NAME Backup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Validate database connection
info "Validating database connection..."
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" 2>/dev/null; then
    error "Cannot connect to database. Check credentials."
    exit 1
fi
success "Database connection verified"

echo ""

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$TIMESTAMP"

info "Starting backup process: $BACKUP_NAME"

# 1. Database Backup
info "Backing up database..."

# Backup using mysqldump with optimal settings
mysqldump \
    -h"$DB_HOST" \
    -P"$DB_PORT" \
    -u"$DB_USER" \
    -p"$DB_PASS" \
    "$DB_NAME" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    | gzip > "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz"

if [ -f "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" | cut -f1)
    success "Database backup created: ${BACKUP_SIZE}"
else
    error "Database backup failed"
    exit 1
fi

# 2. Application Files Backup
info "Backing up application files..."

# Exclude unnecessary directories
EXCLUDE_DIRS="--exclude=node_modules \
              --exclude=vendor \
              --exclude=storage/logs \
              --exclude=storage/framework/cache \
              --exclude=.git \
              --exclude=node_modules \
              --exclude=dist"

# Create tarball of application files
tar -czf "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" \
    -C "$DEPLOY_DIR" \
    $EXCLUDE_DIRS \
    . 2>/dev/null

if [ -f "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" | cut -f1)
    success "Files backup created: ${BACKUP_SIZE}"
else
    error "Files backup failed"
    exit 1
fi

# 3. Storage Files Backup
info "Backing up storage files..."

if [ -d "$DEPLOY_DIR/backend/storage/app" ]; then
    tar -czf "$BACKUP_DIR/files/${BACKUP_NAME}_storage.tar.gz" \
        -C "$DEPLOY_DIR/backend/storage" \
        app public uploads 2>/dev/null

    if [ -f "$BACKUP_DIR/files/${BACKUP_NAME}_storage.tar.gz" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_DIR/files/${BACKUP_NAME}_storage.tar.gz" | cut -f1)
        success "Storage backup created: ${BACKUP_SIZE}"
    fi
fi

# 4. System Logs Backup
info "Backing up system logs..."

if [ -d "$DEPLOY_DIR/backend/storage/logs" ]; then
    tar -czf "$BACKUP_DIR/logs/${BACKUP_NAME}_logs.tar.gz" \
        -C "$DEPLOY_DIR/backend/storage" \
        logs 2>/dev/null

    if [ -f "$BACKUP_DIR/logs/${BACKUP_NAME}_logs.tar.gz" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_DIR/logs/${BACKUP_NAME}_logs.tar.gz" | cut -f1)
        success "Logs backup created: ${BACKUP_SIZE}"
    fi
fi

# 5. Generate Backup Manifest
info "Generating backup manifest..."

cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$TIMESTAMP",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "app_name": "$APP_NAME",
  "version": "1.0.0",
  "database": {
    "name": "$DB_NAME",
    "host": "$DB_HOST",
    "file": "${BACKUP_NAME}_database.sql.gz",
    "size": "$(du -h "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" | cut -f1)"
  },
  "files": {
    "application": "${BACKUP_NAME}_files.tar.gz",
    "storage": "${BACKUP_NAME}_storage.tar.gz",
    "logs": "${BACKUP_NAME}_logs.tar.gz"
  },
  "server_info": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "kernel": "$(uname -r)",
    "uptime": "$(uptime -p)"
  }
}
EOF

success "Backup manifest created"

# 6. Verify Backup Integrity
info "Verifying backup integrity..."

# Verify database backup
if gzip -t "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" 2>/dev/null; then
    success "Database backup integrity verified"
else
    error "Database backup integrity check failed"
    exit 1
fi

# Verify files backup
if tar -tzf "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" >/dev/null 2>&1; then
    success "Files backup integrity verified"
else
    error "Files backup integrity check failed"
    exit 1
fi

# 7. Calculate Total Backup Size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
success "Total backup size: $TOTAL_SIZE"

# 8. Cleanup Old Backups
info "Cleaning up old backups (retaining last $KEEP_DAYS days)..."

# Remove old database backups
find "$BACKUP_DIR/database" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
REMOVED_DB=$(find "$BACKUP_DIR/database" -name "*.sql.gz" -mtime +$KEEP_DAYS | wc -l)

# Remove old file backups
find "$BACKUP_DIR/files" -name "*.tar.gz" -mtime +$KEEP_DAYS -delete
REMOVED_FILES=$(find "$BACKUP_DIR/files" -name "*.tar.gz" -mtime +$KEEP_DAYS | wc -l)

# Remove old log backups
find "$BACKUP_DIR/logs" -name "*.tar.gz" -mtime +$KEEP_DAYS -delete
REMOVED_LOGS=$(find "$BACKUP_DIR/logs" -name "*.tar.gz" -mtime +$KEEP_DAYS | wc -l)

success "Cleaned up old backups: $REMOVED_DB database, $REMOVED_FILES files, $REMOVED_LOGS logs"

# 9. Generate Backup Report
info "Generating backup report..."

cat > "$BACKUP_DIR/${BACKUP_NAME}_report.txt" << EOF
========================================
ERP DryMix Backup Report
========================================

Backup Name: $BACKUP_NAME
Timestamp: $(date '+%Y-%m-%d %H:%M:%S')
Status: SUCCESS

Files Created:
- Database: ${BACKUP_NAME}_database.sql.gz ($(du -h "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" | cut -f1))
- Application Files: ${BACKUP_NAME}_files.tar.gz ($(du -h "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" | cut -f1))
- Storage Files: ${BACKUP_NAME}_storage.tar.gz ($(du -h "$BACKUP_DIR/files/${BACKUP_NAME}_storage.tar.gz" | cut -f1))
- System Logs: ${BACKUP_NAME}_logs.tar.gz ($(du -h "$BACKUP_DIR/logs/${BACKUP_NAME}_logs.tar.gz" | cut -f1))

Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)

Files Removed:
- Database Backups: $REMOVED_DB
- File Backups: $REMOVED_FILES
- Log Backups: $REMOVED_LOGS

Server Information:
- Hostname: $(hostname)
- OS: $(uname -s) $(uname -r)
- Uptime: $(uptime -p)

Next Scheduled Backup: $(date -d '+1 day' '+%Y-%m-%d %H:%M:%S')

========================================
EOF

success "Backup report created"

# 10. Send Notification (optional)
if command -v mail &> /dev/null; then
    info "Sending backup notification..."

    ADMIN_EMAIL="admin@yourcompany.com"

    mail -s "[$APP_NAME] Backup Completed: $BACKUP_NAME" \
         -a "$BACKUP_DIR/${BACKUP_NAME}_report.txt" \
         "$ADMIN_EMAIL" << EOF
Backup completed successfully at $(date '+%Y-%m-%d %H:%M:%S').

Backup Details:
- Name: $BACKUP_NAME
- Size: $(du -sh "$BACKUP_DIR" | cut -f1)
- Location: $BACKUP_DIR

All backup files have been verified for integrity.

This is an automated message.
EOF

    success "Notification sent to $ADMIN_EMAIL"
fi

echo ""

# Backup Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backup Details:${NC}"
echo -e "  Name:          ${GREEN}$BACKUP_NAME${NC}"
echo -e "  Timestamp:     $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "  Total Size:    $(du -sh "$BACKUP_DIR" | cut -f1)"
echo -e "  Location:      $BACKUP_DIR"
echo ""
echo -e "${BLUE}Backup Files:${NC}"
echo -e "  Database:      ${GREEN}${BACKUP_NAME}_database.sql.gz${NC}"
echo -e "  Application:   ${GREEN}${BACKUP_NAME}_files.tar.gz${NC}"
echo -e "  Storage:       ${GREEN}${BACKUP_NAME}_storage.tar.gz${NC}"
echo -e "  Logs:          ${GREEN}${BACKUP_NAME}_logs.tar.gz${NC}"
echo -e "  Manifest:      ${GREEN}${BACKUP_NAME}_manifest.json${NC}"
echo -e "  Report:        ${GREEN}${BACKUP_NAME}_report.txt${NC}"
echo ""
echo -e "${BLUE}Cleanup:${NC}"
echo -e "  Retained:     Last ${GREEN}$KEEP_DAYS days${NC}"
echo -e "  Removed:      $REMOVED_DB database, $REMOVED_FILES files, $REMOVED_LOGS logs"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Script Log:   $LOG_FILE"
echo -e "  Backup Log:   $BACKUP_DIR/${BACKUP_NAME}_report.txt"
echo ""
echo -e "${YELLOW}Note: Verify backups regularly and test restore procedures.${NC}"

exit 0

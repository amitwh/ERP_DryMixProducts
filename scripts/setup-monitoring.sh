#!/bin/bash

# ERP DryMix Products - Monitoring Setup Script
# Version: 1.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MONITORING_DIR="/opt/erp-monitoring"
LOG_FILE="/var/log/erp-monitoring-setup.log"
DEPLOY_DIR="/var/www/erp"

# Functions
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ERP Monitoring Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create monitoring directory
info "Creating monitoring directory..."
sudo mkdir -p "$MONITORING_DIR"
sudo mkdir -p "$MONITORING_DIR/scripts"
sudo mkdir -p "$MONITORING_DIR/logs"
sudo mkdir -p "$MONITORING_DIR/data"
success "Monitoring directory created"

echo ""

# 1. Install Monitoring Tools
info "Installing monitoring tools..."

# Install Node.js monitoring tools
if command -v npm &> /dev/null; then
    sudo npm install -g pm2
    success "PM2 installed globally"
else
    error "npm is not installed"
fi

# Install system monitoring tools
sudo apt-get update -qq
sudo apt-get install -y \
    htop \
    iotop \
    nethogs \
    iftop \
    sysstat \
    netdata \
    monit \
    prometheus \
    grafana \
    nodejs-exporter \
    mysqld-exporter \
    nginx-prometheus-exporter \
    redis-exporter
success "System monitoring tools installed"

echo ""

# 2. Application Health Check Script
info "Creating application health check script..."

cat << 'EOF' | sudo tee "$MONITORING_DIR/scripts/health-check.sh" > /dev/null
#!/bin/bash

# ERP Application Health Check
# Checks: Backend, Frontend, Database, Redis, Disk Space

APP_URL="http://localhost"
BACKEND_URL="$APP_URL/api/v1"
LOG_FILE="/opt/erp-monitoring/logs/health-check.log"
DISK_THRESHOLD=80

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "✓ $1"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    log "✗ $1"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "⚠ $1"
}

echo "=== ERP Health Check ===" | tee -a "$LOG_FILE"

# 1. Check Backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    success "Backend: OK (HTTP $BACKEND_STATUS)"
else
    error "Backend: FAILED (HTTP $BACKEND_STATUS)"
fi

# 2. Check Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "301" ] || [ "$FRONTEND_STATUS" = "302" ]; then
    success "Frontend: OK (HTTP $FRONTEND_STATUS)"
else
    error "Frontend: FAILED (HTTP $FRONTEND_STATUS)"
fi

# 3. Check Database
if mysqladmin ping -h localhost --silent 2>/dev/null; then
    DB_CONNECTIONS=$(mysql -e "SHOW STATUS LIKE 'Threads_connected'" -s | awk '{print $2}')
    success "Database: OK ($DB_CONNECTIONS connections)"
else
    error "Database: FAILED (Cannot connect)"
fi

# 4. Check Redis
if redis-cli ping 2>/dev/null | grep -q PONG; then
    REDIS_MEMORY=$(redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    success "Redis: OK (Memory: $REDIS_MEMORY)"
else
    error "Redis: FAILED (Cannot connect)"
fi

# 5. Check Disk Space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')
if [ "$DISK_USAGE" -lt "$DISK_THRESHOLD" ]; then
    success "Disk: OK ($DISK_USAGE% used, $DISK_AVAILABLE available)"
else
    error "Disk: CRITICAL ($DISK_USAGE% used, $DISK_AVAILABLE available)"
fi

# 6. Check PHP-FPM
if systemctl is-active --quiet php8.2-fpm; then
    PHP_FPM_PROCS=$(pgrep -c php-fpm)
    success "PHP-FPM: OK ($PHP_FPM_PROCS processes)"
else
    error "PHP-FPM: FAILED (Not running)"
fi

# 7. Check Nginx
if systemctl is-active --quiet nginx; then
    NGINX_CONNECTIONS=$(curl -s http://localhost/nginx_status | grep "Active connections" | awk '{print $3}')
    success "Nginx: OK ($NGINX_CONNECTIONS active connections)"
elif systemctl is-active --quiet apache2; then
    APACHE_CONNECTIONS=$(curl -s http://localhost/server-status?auto | grep -c "GET")
    success "Apache: OK (Estimated $APACHE_CONNECTIONS connections)"
else
    error "Web Server: FAILED (Neither Nginx nor Apache is running)"
fi

# 8. Check Queue Worker
if systemctl is-active --quiet erp-queue; then
    success "Queue Worker: OK (Running)"
else
    error "Queue Worker: FAILED (Not running)"
fi

# 9. Check Scheduler
if systemctl is-active --quiet erp-scheduler; then
    success "Scheduler: OK (Running)"
else
    warning "Scheduler: NOT CONFIGURED (Manual cron required)"
fi

# 10. Check SSL Certificate
if [ -d "/etc/letsencrypt/live/erp.yourcompany.com" ]; then
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/erp.yourcompany.com/fullchain.pem | cut -d= -f2)
    CERT_DAYS=$(( ($(date -d "$CERT_EXPIRY" +%s) - $(date +%s)) / 86400 ))
    if [ "$CERT_DAYS" -gt 30 ]; then
        success "SSL Certificate: OK (Expires in $CERT_DAYS days)"
    elif [ "$CERT_DAYS" -gt 7 ]; then
        warning "SSL Certificate: Expiring soon ($CERT_DAYS days)"
    else
        error "SSL Certificate: CRITICAL (Expires in $CERT_DAYS days)"
    fi
else
    warning "SSL Certificate: NOT CONFIGURED"
fi

echo ""
echo "Health check completed at $(date)" | tee -a "$LOG_FILE"
EOF

sudo chmod +x "$MONITORING_DIR/scripts/health-check.sh"
success "Health check script created"

echo ""

# 3. Performance Monitoring Script
info "Creating performance monitoring script..."

cat << 'EOF' | sudo tee "$MONITORING_DIR/scripts/perf-monitor.sh" > /dev/null
#!/bin/bash

# ERP Performance Monitoring
# Monitors: CPU, RAM, Disk I/O, Network, Application response time

LOG_FILE="/opt/erp-monitoring/logs/perf-monitor.log"
DATA_FILE="/opt/erp-monitoring/data/perf-data.csv"

# Initialize data file
if [ ! -f "$DATA_FILE" ]; then
    echo "timestamp,cpu_usage,ram_usage,disk_usage,disk_io_read,disk_io_write,network_rx,network_tx,app_response_time" > "$DATA_FILE"
fi

# Get current timestamp
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

# RAM Usage
RAM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

# Disk I/O
DISK_IO_READ=$(iostat -d 1 2 | grep sda | awk 'NR==2 {print $3}')
DISK_IO_WRITE=$(iostat -d 1 2 | grep sda | awk 'NR==2 {print $4}')

# Network
NETWORK_RX=$(cat /proc/net/dev | grep eth0 | awk '{print $2}')
NETWORK_TX=$(cat /proc/net/dev | grep eth0 | awk '{print $10}')

# Application Response Time
APP_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost/api/v1/health)

# Log data
echo "$TIMESTAMP,$CPU_USAGE,$RAM_USAGE,$DISK_USAGE,$DISK_IO_READ,$DISK_IO_WRITE,$NETWORK_RX,$NETWORK_TX,$APP_RESPONSE_TIME" >> "$DATA_FILE"

# Log to file
echo "[$TIMESTAMP] CPU: ${CPU_USAGE}%, RAM: ${RAM_USAGE}%, Disk: ${DISK_USAGE}%, App Response: ${APP_RESPONSE_TIME}s" >> "$LOG_FILE"

# Alert on high resource usage
if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
    echo "WARNING: High CPU usage: $CPU_USAGE%" >> "$LOG_FILE"
fi

if (( $(echo "$RAM_USAGE > 90" | bc -l) )); then
    echo "WARNING: High RAM usage: $RAM_USAGE%" >> "$LOG_FILE"
fi

if [ "$APP_RESPONSE_TIME" > "5.0" ]; then
    echo "WARNING: Slow application response: ${APP_RESPONSE_TIME}s" >> "$LOG_FILE"
fi
EOF

sudo chmod +x "$MONITORING_DIR/scripts/perf-monitor.sh"
success "Performance monitoring script created"

echo ""

# 4. Log Monitoring Script
info "Creating log monitoring script..."

cat << 'EOF' | sudo tee "$MONITORING_DIR/scripts/log-monitor.sh" > /dev/null
#!/bin/bash

# ERP Log Monitoring
# Monitors: Application errors, Database errors, Web server errors

LOG_FILE="/opt/erp-monitoring/logs/log-monitor.log"
ERROR_LOG="/opt/erp-monitoring/logs/errors.log"

# Monitor Laravel logs
LARAVEL_LOG="/var/www/erp/backend/storage/logs/laravel.log"
if [ -f "$LARAVEL_LOG" ]; then
    # Count errors in last hour
    ERROR_COUNT=$(tail -n 1000 "$LARAVEL_LOG" | grep -c "ERROR\|CRITICAL" || echo "0")
    if [ "$ERROR_COUNT" -gt 10 ]; then
        echo "WARNING: High error rate in Laravel logs: $ERROR_COUNT errors" | tee -a "$ERROR_LOG"
    fi
fi

# Monitor Nginx logs
NGINX_ERROR_LOG="/var/log/nginx/error.log"
if [ -f "$NGINEX_ERROR_LOG" ]; then
    ERROR_COUNT=$(tail -n 1000 "$NGINX_ERROR_LOG" | wc -l)
    if [ "$ERROR_COUNT" -gt 50 ]; then
        echo "WARNING: High error rate in Nginx logs: $ERROR_COUNT errors" | tee -a "$ERROR_LOG"
    fi
fi

# Monitor MySQL logs
MYSQL_ERROR_LOG="/var/log/mysql/error.log"
if [ -f "$MYSQL_ERROR_LOG" ]; then
    ERROR_COUNT=$(tail -n 1000 "$MYSQL_ERROR_LOG" | grep -c "ERROR\|Warning" || echo "0")
    if [ "$ERROR_COUNT" -gt 10 ]; then
        echo "WARNING: High error rate in MySQL logs: $ERROR_COUNT errors" | tee -a "$ERROR_LOG"
    fi
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Log monitoring completed" >> "$LOG_FILE"
EOF

sudo chmod +x "$MONITORING_DIR/scripts/log-monitor.sh"
success "Log monitoring script created"

echo ""

# 5. Setup Cron Jobs
info "Setting up monitoring cron jobs..."

# Add cron jobs
(crontab -l 2>/dev/null; echo "*/5 * * * * $MONITORING_DIR/scripts/health-check.sh >> /opt/erp-monitoring/logs/health-cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "* * * * * $MONITORING_DIR/scripts/perf-monitor.sh >> /opt/erp-monitoring/logs/perf-cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/10 * * * * $MONITORING_DIR/scripts/log-monitor.sh >> /opt/erp-monitoring/logs/log-cron.log 2>&1") | crontab -

success "Monitoring cron jobs configured"

echo ""

# 6. Start Netdata Dashboard
info "Starting Netdata dashboard..."
sudo systemctl enable netdata
sudo systemctl start netdata
success "Netdata started (http://localhost:19999)"

echo ""

# 7. Start Monit
info "Starting Monit..."
sudo systemctl enable monit
sudo systemctl start monit
success "Monit started"

echo ""

# Setup Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Monitoring Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Monitoring Tools:${NC}"
echo -e "  - Netdata Dashboard: ${GREEN}http://localhost:19999${NC}"
echo -e "  - PM2 Process Manager: ${GREEN}pm2 monit${NC}"
echo -e "  - Monit Web Interface: ${GREEN}http://localhost:2812${NC}"
echo -e "  - Prometheus: ${GREEN}http://localhost:9090${NC}"
echo -e "  - Grafana: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Monitoring Scripts:${NC}"
echo -e "  - Health Check: ${GREEN}$MONITORING_DIR/scripts/health-check.sh${NC}"
echo -e "  - Performance Monitor: ${GREEN}$MONITORING_DIR/scripts/perf-monitor.sh${NC}"
echo -e "  - Log Monitor: ${GREEN}$MONITORING_DIR/scripts/log-monitor.sh${NC}"
echo ""
echo -e "${BLUE}Data & Logs:${NC}"
echo -e "  - Performance Data: ${GREEN}$MONITORING_DIR/data/perf-data.csv${NC}"
echo -e "  - Monitoring Logs: ${GREEN}$MONITORING_DIR/logs/${NC}"
echo -e "  - Error Logs: ${GREEN}$MONITORING_DIR/logs/errors.log${NC}"
echo ""
echo -e "${BLUE}Cron Jobs:${NC}"
echo -e "  - Health Check: Every 5 minutes"
echo -e "  - Performance Monitor: Every 1 minute"
echo -e "  - Log Monitor: Every 10 minutes"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Access Netdata at http://localhost:19999"
echo -e "  2. Configure Grafana dashboards"
echo -e "  3. Set up alert notifications"
echo -e "  4. Review monitoring logs regularly"
echo ""
echo -e "${YELLOW}Note: Monitoring is now running automatically via cron jobs.${NC}"

exit 0

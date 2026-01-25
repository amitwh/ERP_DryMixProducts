#!/bin/bash

# ERP DryMix Products - Production Deployment Script
# Version: 1.0.0
# Description: Automated production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="ERP DryMix Products"
DEPLOY_DIR="/var/www/erp"
BACKUP_DIR="/var/backups/erp"
LOG_FILE="/var/log/erp-deploy.log"
BRANCH="main"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}✓ $1${NC}"
}

# Warning message
warning() {
    log "${YELLOW}⚠ $1${NC}"
}

# Info message
info() {
    log "${BLUE}ℹ $1${NC}"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  $APP_NAME Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Pre-flight checks
info "Running pre-flight checks..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error_exit "Please run as non-root user with sudo privileges"
fi

# Check git
if ! command -v git &> /dev/null; then
    error_exit "Git is not installed"
fi
success "Git is available"

# Check PHP
if ! command -v php &> /dev/null; then
    error_exit "PHP is not installed"
fi
success "PHP is available: $(php -v | head -n 1)"

# Check Composer
if ! command -v composer &> /dev/null; then
    error_exit "Composer is not installed"
fi
success "Composer is available: $(composer --version | head -n 1)"

# Check Node.js
if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed"
fi
success "Node.js is available: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed"
fi
success "npm is available: $(npm -v)"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    error_exit "MySQL client is not installed"
fi
success "MySQL client is available"

# Check database connection
read -p "Enter MySQL username: " MYSQL_USER
read -sp "Enter MySQL password: " MYSQL_PASS
echo ""
read -p "Enter database name: " MYSQL_DB

if ! mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "USE $MYSQL_DB" 2>/dev/null; then
    error_exit "Cannot connect to database. Please check credentials."
fi
success "Database connection verified"

echo ""

# Create backup
info "Creating backup..."
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"

# Backup database
mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" > "$BACKUP_DIR/$BACKUP_NAME.sql"
success "Database backup created: $BACKUP_NAME.sql"

# Backup files
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz" -C "$DEPLOY_DIR" .
    success "Files backup created: ${BACKUP_NAME}_files.tar.gz"
fi

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
success "Old backups cleaned up (last 7 days retained)"

echo ""

# Deploy backend
info "Deploying backend..."

# Create deployment directory if it doesn't exist
sudo mkdir -p "$DEPLOY_DIR/backend"
sudo chown -R $USER:$USER "$DEPLOY_DIR"

# Pull latest code
cd "$DEPLOY_DIR/backend"
if [ -d ".git" ]; then
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    git clone -b "$BRANCH" $(cd ..; git config --get remote.origin.url) .
fi
success "Code updated"

# Install dependencies
composer install --optimize-autoloader --no-dev --no-interaction
success "Dependencies installed"

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
success "Caches cleared"

# Set environment
export APP_ENV=production
export APP_DEBUG=false

# Optimize application
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
success "Application optimized"

# Run migrations
php artisan migrate --force
success "Migrations run"

# Create storage link
php artisan storage:link
success "Storage link created"

# Set permissions
sudo chown -R www-data:www-data "$DEPLOY_DIR/backend/storage"
sudo chown -R www-data:www-data "$DEPLOY_DIR/backend/bootstrap/cache"
sudo chmod -R 755 "$DEPLOY_DIR/backend/storage"
sudo chmod -R 755 "$DEPLOY_DIR/backend/bootstrap/cache"
success "Permissions set"

echo ""

# Deploy frontend
info "Deploying frontend..."

# Create deployment directory
sudo mkdir -p "$DEPLOY_DIR/frontend"
cd "$DEPLOY_DIR/frontend"

# Pull latest code
if [ -d ".git" ]; then
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    git clone -b "$BRANCH" $(cd ..; git config --get remote.origin.url) .
fi
success "Code updated"

# Install dependencies
npm install --production --no-audit --no-fund
success "Dependencies installed"

# Build for production
npm run build
success "Frontend built"

# Copy build files
sudo mkdir -p "$DEPLOY_DIR/dist"
sudo cp -r dist/* "$DEPLOY_DIR/dist/"
sudo chown -R www-data:www-data "$DEPLOY_DIR/dist"
sudo chmod -R 755 "$DEPLOY_DIR/dist"
success "Frontend deployed"

echo ""

# Configure web server
info "Configuring web server..."

# Check which web server is installed
if command -v nginx &> /dev/null; then
    info "Configuring Nginx..."
    sudo cp "$DEPLOY_DIR/nginx.conf" "/etc/nginx/sites-available/erp"
    sudo ln -sf "/etc/nginx/sites-available/erp" "/etc/nginx/sites-enabled/erp"
    sudo nginx -t
    sudo systemctl reload nginx
    success "Nginx configured and reloaded"
elif command -v apache2 &> /dev/null; then
    info "Configuring Apache..."
    sudo cp "$DEPLOY_DIR/apache.conf" "/etc/apache2/sites-available/erp.conf"
    sudo a2ensite erp.conf
    sudo apache2ctl configtest
    sudo systemctl reload apache2
    success "Apache configured and reloaded"
else
    warning "No web server found. Please configure Nginx or Apache manually."
fi

echo ""

# Start services
info "Starting services..."

# Start Laravel queue worker
sudo systemctl enable erp-queue
sudo systemctl start erp-queue
success "Queue worker started"

# Restart PHP-FPM
if systemctl is-active --quiet php8.2-fpm; then
    sudo systemctl restart php8.2-fpm
    success "PHP-FPM restarted"
fi

echo ""

# Health check
info "Running health checks..."

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    success "Backend health check passed"
else
    error_exit "Backend health check failed (HTTP $BACKEND_STATUS)"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    success "Frontend health check passed"
else
    error_exit "Frontend health check failed (HTTP $FRONTEND_STATUS)"
fi

echo ""

# Deployment summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Deployment Details:${NC}"
echo -e "  Branch:        $BRANCH"
echo -e "  Deploy Dir:    $DEPLOY_DIR"
echo -e "  Backup Name:   $BACKUP_NAME"
echo -e "  Log File:      $LOG_FILE"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
read -p "Enter your domain (e.g., erp.yourcompany.com): " DOMAIN
echo -e "  Frontend: ${GREEN}https://$DOMAIN${NC}"
echo -e "  Backend:  ${GREEN}https://$DOMAIN/api/v1${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Update DNS records to point to this server"
echo -e "  2. Configure SSL certificate"
echo -e "  3. Update .env file with production settings"
echo -e "  4. Test all functionality"
echo -e "  5. Monitor application logs"
echo ""
echo -e "${YELLOW}Note: The first login will be slow as caches warm up.${NC}"
echo ""
echo -e "${YELLOW}Important: Change default passwords immediately!${NC}"
echo ""

# Create post-deployment checklist
cat > "$DEPLOY_DIR/post-deployment-checklist.md" << 'EOF'
# Post-Deployment Checklist

## Security
- [ ] Change admin password
- [ ] Change database password
- [ ] Configure SSL/HTTPS
- [ ] Set up firewall rules
- [ ] Enable fail2ban
- [ ] Configure regular backups

## Configuration
- [ ] Update APP_URL in .env
- [ ] Configure email settings
- [ ] Set up SMTP server
- [ ] Configure file storage
- [ ] Set up CDN for static assets
- [ ] Configure time zone

## Testing
- [ ] Test login functionality
- [ ] Test all major modules
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Test PDF generation
- [ ] Test export functionality

## Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Configure log monitoring
- [ ] Set up performance monitoring

## Users
- [ ] Create production user accounts
- [ ] Assign roles and permissions
- [ ] Train users on new system
- [ ] Distribute user manuals

## Documentation
- [ ] Update system documentation
- [ ] Create user guides
- [ ] Record configuration changes
- [ ] Document deployment process
EOF

success "Post-deployment checklist created"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${BLUE}Review the checklist at: $DEPLOY_DIR/post-deployment-checklist.md${NC}"

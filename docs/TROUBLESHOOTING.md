# ERP DryMix Products - Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Login & Authentication](#login--authentication)
3. [Performance Issues](#performance-issues)
4. [Database Issues](#database-issues)
5. [Frontend Issues](#frontend-issues)
6. [Backend Issues](#backend-issues)
7. [Email Issues](#email-issues)
8. [File Upload Issues](#file-upload-issues)
9. [Report Generation Issues](#report-generation-issues)
10. [Integration Issues](#integration-issues)

---

## Common Issues

### Issue: Page Not Loading

**Symptoms:**
- Blank white screen
- Loading spinner spinning indefinitely
- Error 404 or 500

**Solutions:**

1. **Check server status:**
   ```bash
   sudo systemctl status nginx
   sudo systemctl status php8.2-fpm
   ```

2. **Check application logs:**
   ```bash
   tail -n 50 /var/www/erp/backend/storage/logs/laravel.log
   tail -n 50 /var/log/nginx/error.log
   ```

3. **Clear caches:**
   ```bash
   cd /var/www/erp/backend
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

4. **Restart services:**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart php8.2-fpm
   ```

### Issue: Slow Performance

**Symptoms:**
- Pages take long to load
- API responses are slow
- Database queries are slow

**Solutions:**

1. **Check server resources:**
   ```bash
   htop
   iotop
   nethogs
   ```

2. **Optimize database:**
   ```bash
   mysql -u root -p
   OPTIMIZE TABLE users, sales_orders, products;
   ANALYZE TABLE users, sales_orders, products;
   ```

3. **Enable caching:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

4. **Check slow queries:**
   ```bash
   # Enable slow query log
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;

   # View slow queries
   cat /var/log/mysql/slow.log
   ```

5. **Optimize PHP configuration:**
   ```bash
   # Edit /etc/php/8.2/fpm/php.ini
   memory_limit = 256M
   max_execution_time = 300
   max_input_time = 300
   upload_max_filesize = 100M
   post_max_size = 100M

   sudo systemctl restart php8.2-fpm
   ```

---

## Login & Authentication

### Issue: Cannot Login

**Symptoms:**
- Login page shows "Invalid credentials"
- Page refreshes without error
- Redirects to login page after successful login

**Solutions:**

1. **Verify credentials:**
   - Check email and password
   - Ensure account is active
   - Check if account is locked

2. **Clear browser data:**
   - Clear cookies
   - Clear cache
   - Try incognito mode

3. **Check user status in database:**
   ```bash
   mysql -u root -p erp_production

   SELECT id, email, status, locked_until FROM users WHERE email = 'admin@erp.com';

   -- Update status if needed
   UPDATE users SET status = 'active', locked_until = NULL WHERE email = 'admin@erp.com';
   ```

4. **Reset password:**
   ```bash
   cd /var/www/erp/backend
   php artisan tinker

   >>> $user = App\Models\User::where('email', 'admin@erp.com')->first();
   >>> $user->password = Hash::make('new_password');
   >>> $user->save();
   >>> exit
   ```

5. **Check session configuration:**
   ```bash
   # Check .env file
   SESSION_DRIVER=file
   SESSION_LIFETIME=120
   ```

### Issue: Session Timeout Too Frequent

**Symptoms:**
- Logged out after few minutes of inactivity
- Lost work when session expires

**Solutions:**

1. **Increase session lifetime:**
   ```bash
   # Edit .env file
   SESSION_LIFETIME=480  # 8 hours
   ```

2. **Check session driver:**
   ```bash
   # Use database or Redis for sessions
   SESSION_DRIVER=redis

   # Configure Redis
   REDIS_HOST=127.0.0.1
   REDIS_PASSWORD=null
   REDIS_PORT=6379
   ```

3. **Clear session cache:**
   ```bash
   php artisan cache:clear
   php artisan session:clear
   ```

---

## Performance Issues

### Issue: Database Slow

**Symptoms:**
- Queries take long to execute
- Page loads are slow
- High CPU usage

**Solutions:**

1. **Check MySQL configuration:**
   ```bash
   # Edit /etc/mysql/mysql.conf.d/mysqld.cnf

   [mysqld]
   innodb_buffer_pool_size = 2G
   innodb_log_file_size = 512M
   innodb_flush_log_at_trx_commit = 2
   query_cache_size = 64M
   query_cache_type = 1

   sudo systemctl restart mysql
   ```

2. **Add indexes to frequently queried columns:**
   ```bash
   mysql -u root -p erp_production

   CREATE INDEX idx_status ON sales_orders(status);
   CREATE INDEX idx_customer_id ON sales_orders(customer_id);
   CREATE INDEX idx_order_date ON sales_orders(order_date);
   ```

3. **Run ANALYZE TABLE:**
   ```bash
   mysql -u root -p erp_production

   ANALYZE TABLE sales_orders, invoices, products;
   ```

4. **Check for long-running queries:**
   ```bash
   mysql -u root -p erp_production

   SHOW FULL PROCESSLIST;

   -- Kill long-running query
   KILL <process_id>;
   ```

### Issue: Frontend Slow

**Symptoms:**
- Page loads slowly
- JavaScript errors in console
- High memory usage

**Solutions:**

1. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for slow requests

2. **Enable production build:**
   ```bash
   cd /var/www/erp/frontend
   npm run build

   # Clear Vite cache
   rm -rf node_modules/.vite
   ```

3. **Optimize images:**
   - Compress images before uploading
   - Use WebP format
   - Implement lazy loading

4. **Enable CDN:**
   ```nginx
   # Configure CDN for static assets
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

5. **Reduce bundle size:**
   - Use code splitting
   - Remove unused dependencies
   - Implement tree shaking

---

## Database Issues

### Issue: Database Connection Error

**Symptoms:**
- "SQLSTATE[HY000] [2002] Connection refused"
- "Access denied for user"
- "Could not connect to database"

**Solutions:**

1. **Check MySQL service:**
   ```bash
   sudo systemctl status mysql
   sudo systemctl start mysql
   ```

2. **Verify database credentials:**
   ```bash
   # Check .env file
   DB_DATABASE=erp_production
   DB_USERNAME=erp_user
   DB_PASSWORD=secure_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```

3. **Test database connection:**
   ```bash
   mysql -h 127.0.0.1 -u erp_user -p erp_production
   ```

4. **Create database if missing:**
   ```bash
   mysql -u root -p

   CREATE DATABASE erp_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON erp_production.* TO 'erp_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Check firewall:**
   ```bash
   sudo ufw allow 3306/tcp
   sudo ufw reload
   ```

### Issue: Database Migration Failed

**Symptoms:**
- Migration fails with error
- Tables not created properly
- Foreign key constraint errors

**Solutions:**

1. **Check migration status:**
   ```bash
   php artisan migrate:status
   ```

2. **Rollback failed migration:**
   ```bash
   php artisan migrate:rollback
   ```

3. **Run migration fresh (WARNING: Deletes all data):**
   ```bash
   php artisan migrate:fresh
   ```

4. **Fix migration file:**
   ```php
   // Check for syntax errors
   // Verify foreign key relationships
   // Ensure column data types match
   ```

5. **Run specific migration:**
   ```bash
   php artisan migrate --path=database/migrations/2024_01_15_000000_create_users_table.php
   ```

### Issue: Foreign Key Constraint Error

**Symptoms:**
- "SQLSTATE[23000]: Integrity constraint violation"
- Cannot delete or update parent row
- Foreign key constraint fails

**Solutions:**

1. **Check foreign key relationships:**
   ```bash
   mysql -u root -p erp_production

   SELECT
       CONSTRAINT_NAME,
       TABLE_NAME,
       REFERENCED_TABLE_NAME
   FROM
       information_schema.KEY_COLUMN_USAGE
   WHERE
       TABLE_SCHEMA = 'erp_production'
       AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

2. **Disable foreign key checks temporarily:**
   ```bash
   php artisan tinker

   >>> DB::statement('SET FOREIGN_KEY_CHECKS=0;');
   >>> DB::statement('SET FOREIGN_KEY_CHECKS=1;');
   ```

3. **Update migration to add ON DELETE:**
   ```php
   $table->foreign('customer_id')
         ->references('id')
         ->on('customers')
         ->onDelete('cascade');
   ```

---

## Frontend Issues

### Issue: Blank Screen After Build

**Symptoms:**
- White screen after npm run build
- No console errors
- All assets loaded

**Solutions:**

1. **Check build logs:**
   ```bash
   npm run build
   # Check for build warnings and errors
   ```

2. **Clear build cache:**
   ```bash
   rm -rf dist
   rm -rf node_modules/.vite
   npm run build
   ```

3. **Check environment variables:**
   ```bash
   cat .env
   # Verify VITE_API_URL is set correctly
   ```

4. **Check Vite configuration:**
   ```javascript
   // vite.config.js
   export default defineConfig({
     base: '/', // Should match your deployment path
     build: {
       outDir: 'dist',
       assetsDir: 'assets',
       sourcemap: false
     }
   });
   ```

5. **Check web server configuration:**
   ```nginx
   # Ensure try_files is correct
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### Issue: API Call Fails

**Symptoms:**
- Network error in console
- 404 Not Found
- CORS error

**Solutions:**

1. **Check API URL in .env:**
   ```bash
   cat .env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

2. **Test API endpoint:**
   ```bash
   curl -X GET http://localhost:8000/api/v1/health
   ```

3. **Check CORS configuration:**
   ```php
   // config/cors.php
   'paths' => ['api/*'],
   'allowed_methods' => ['*'],
   'allowed_origins' => ['http://localhost:5173', 'https://erp.yourcompany.com'],
   'allowed_headers' => ['*'],
   ```

4. **Check network tab in browser:**
   - Open Developer Tools
   - Go to Network tab
   - Check failed requests
   - View request and response headers

5. **Check authentication token:**
   ```javascript
   // Verify token is being sent
   const token = localStorage.getItem('access_token');
   console.log('Token:', token);
   ```

---

## Backend Issues

### Issue: 500 Internal Server Error

**Symptoms:**
- Generic 500 error
- No specific error message
- Page loads partially

**Solutions:**

1. **Check Laravel logs:**
   ```bash
   tail -n 100 /var/www/erp/backend/storage/logs/laravel.log
   ```

2. **Enable debug mode (temporarily):**
   ```bash
   # Edit .env file
   APP_DEBUG=true

   # Clear config cache
   php artisan config:clear
   ```

3. **Check file permissions:**
   ```bash
   sudo chmod -R 755 /var/www/erp/backend/storage
   sudo chmod -R 755 /var/www/erp/backend/bootstrap/cache
   sudo chown -R www-data:www-data /var/www/erp/backend/storage
   ```

4. **Check PHP version and extensions:**
   ```bash
   php -v
   php -m
   ```

5. **Check Composer dependencies:**
   ```bash
   composer update
   composer dump-autoload
   ```

### Issue: Queue Jobs Not Processing

**Symptoms:**
- Queue jobs stuck in pending
- Emails not sending
- Background tasks not running

**Solutions:**

1. **Start queue worker:**
   ```bash
   php artisan queue:work

   # Or use supervisor
   sudo supervisorctl start erp-queue-worker:*
   ```

2. **Check queue configuration:**
   ```bash
   # Check .env file
   QUEUE_CONNECTION=redis
   ```

3. **Check Redis connection:**
   ```bash
   redis-cli ping
   # Should return PONG
   ```

4. **View failed jobs:**
   ```bash
   php artisan queue:failed

   # Retry failed jobs
   php artisan queue:retry all

   # Clear failed jobs
   php artisan queue:flush
   ```

5. **Check queue logs:**
   ```bash
   tail -f /var/log/supervisor/erp-queue-worker.log
   ```

---

## Email Issues

### Issue: Emails Not Sending

**Symptoms:**
- Password reset email not received
- Order confirmation not sent
- No error in application

**Solutions:**

1. **Check email configuration:**
   ```bash
   # Check .env file
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourcompany.com
   ```

2. **Test email sending:**
   ```bash
   php artisan tinker

   >>> Mail::raw('Test email', function($message) {
   >>>     $message->to('test@example.com')->subject('Test');
   >>> });
   ```

3. **Check mail log:**
   ```bash
   tail -f /var/log/mail.log
   ```

4. **Use MailHog for testing (development):**
   ```bash
   # Install MailHog
   sudo docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

   # Update .env
   MAIL_HOST=127.0.0.1
   MAIL_PORT=1025

   # Access web interface at http://localhost:8025
   ```

5. **Check SMTP firewall:**
   ```bash
   sudo ufw allow 587/tcp
   sudo ufw reload
   ```

---

## File Upload Issues

### Issue: File Upload Fails

**Symptoms:**
- "File too large" error
- Upload progress stuck
- Timeout error

**Solutions:**

1. **Increase upload limits:**
   ```bash
   # Edit /etc/php/8.2/fpm/php.ini
   upload_max_filesize = 100M
   post_max_size = 100M
   max_execution_time = 300
   max_input_time = 300

   sudo systemctl restart php8.2-fpm
   ```

2. **Increase Nginx limits:**
   ```nginx
   # Edit nginx.conf
   client_max_body_size 100M;
   client_body_timeout 300s;

   sudo systemctl reload nginx
   ```

3. **Check disk space:**
   ```bash
   df -h
   # Ensure enough space for uploads
   ```

4. **Check storage permissions:**
   ```bash
   sudo chmod -R 755 /var/www/erp/backend/storage/app
   sudo chown -R www-data:www-data /var/www/erp/backend/storage/app
   ```

5. **Check file type restrictions:**
   ```php
   // config/filesystems.php
   'allowed_file_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
   ```

---

## Report Generation Issues

### Issue: PDF Generation Fails

**Symptoms:**
- PDF download fails
- Blank PDF generated
- Error during PDF generation

**Solutions:**

1. **Check PDF library installation:**
   ```bash
   composer show | grep dompdf
   composer require dompdf/dompdf
   ```

2. **Check PHP GD library:**
   ```bash
   php -m | grep gd
   sudo apt-get install php8.2-gd
   sudo systemctl restart php8.2-fpm
   ```

3. **Check font availability:**
   ```bash
   # Verify fonts are installed
   fc-list | grep -i "arial"
   ```

4. **Increase memory limit:**
   ```bash
   # Edit .env file
   REPORT_MEMORY_LIMIT=512M

   # Or in config
   ini_set('memory_limit', '512M');
   ```

5. **Check disk space for PDF:**
   ```bash
   df -h
   # Ensure enough space for PDF generation
   ```

---

## Integration Issues

### Issue: External API Integration Fails

**Symptoms:**
- Connection timeout
- Authentication error
- Data not syncing

**Solutions:**

1. **Test API endpoint:**
   ```bash
   curl -X GET https://external-api.com/endpoint \
     -H "Authorization: Bearer token"
   ```

2. **Check firewall rules:**
   ```bash
   sudo ufw allow out 443/tcp
   sudo ufw allow out 80/tcp
   ```

3. **Check SSL certificate:**
   ```bash
   curl -X GET https://external-api.com/endpoint \
     --cacert /path/to/certificate.pem
   ```

4. **Increase timeout:**
   ```php
   // config/http.php
   'timeout' => 120
   ```

5. **Check API rate limits:**
   ```bash
   # Review API documentation
   # Implement rate limiting
   # Use exponential backoff
   ```

---

## Getting Additional Help

### Check Logs

```bash
# Application logs
tail -f /var/www/erp/backend/storage/logs/laravel.log

# Web server logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PHP logs
tail -f /var/log/php8.2-fpm/error.log

# System logs
journalctl -xe
```

### Collect System Information

```bash
# System info
uname -a
df -h
free -h
uptime

# Service status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo systemctl status redis

# Network info
ifconfig
netstat -tulpn
```

### Contact Support

If issues persist:
1. Document the problem
2. Collect error logs
3. Describe steps to reproduce
4. Provide system information
5. Contact support team

**Support Email:** support@erp.com
**Support Phone:** +91-XXXXXXXXXX
**Support Portal:** https://support.erp.com

---

## Emergency Procedures

### Full System Reset (WARNING: Last Resort)

```bash
# 1. Stop all services
sudo systemctl stop nginx
sudo systemctl stop php8.2-fpm
sudo systemctl stop mysql
sudo systemctl stop redis

# 2. Backup current data
./scripts/backup.sh

# 3. Clear application caches
cd /var/www/erp/backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 4. Restart services
sudo systemctl start mysql
sudo systemctl start redis
sudo systemctl start php8.2-fpm
sudo systemctl start nginx

# 5. Run health check
./scripts/health-check.sh
```

---

*Version: 1.0.0*
*Last Updated: 2026-01-15*

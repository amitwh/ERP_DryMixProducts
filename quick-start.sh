#!/bin/bash

# ERP DryMix Products - Quick Start Script
# Version: 1.0.0
# Description: Quick development environment startup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOG_DIR="$SCRIPT_DIR/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ERP DryMix Quick Start${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v php &> /dev/null; then
    echo -e "${RED}✗ PHP is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PHP found: $(php -v | head -n 1)${NC}"

if ! command -v composer &> /dev/null; then
    echo -e "${RED}✗ Composer is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Composer found: $(composer --version | head -n 1)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"

echo ""

# Check if mysql is running
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL command not found, assuming database is ready${NC}"
else
    if mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "${GREEN}✓ MySQL is running${NC}"
    else
        echo -e "${RED}✗ MySQL is not running${NC}"
        echo -e "${YELLOW}  Please start MySQL service${NC}"
        exit 1
    fi
fi

echo ""

# Backend setup
echo -e "${BLUE}=== Backend Setup ===${NC}"
cd "$BACKEND_DIR"

# Check if composer dependencies are installed
if [ ! -d "vendor" ]; then
    echo -e "${YELLOW}Installing PHP dependencies...${NC}"
    composer install --no-interaction --prefer-dist
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    php artisan key:generate
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
php artisan migrate --force
echo -e "${GREEN}✓ Migrations completed${NC}"

# Seed database
echo -e "${YELLOW}Seeding database...${NC}"
php artisan db:seed --force
echo -e "${GREEN}✓ Database seeded${NC}"

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
echo -e "${GREEN}✓ Caches cleared${NC}"

echo ""

# Frontend setup
echo -e "${BLUE}=== Frontend Setup ===${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""

# Start services
echo -e "${BLUE}=== Starting Services ===${NC}"

# Start Laravel backend
echo -e "${YELLOW}Starting Laravel backend...${NC}"
cd "$BACKEND_DIR"
php artisan serve > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo -e "${YELLOW}  Check $LOG_DIR/backend.log for errors${NC}"
    exit 1
fi

# Start Vite frontend
echo -e "${YELLOW}Starting Vite frontend...${NC}"
cd "$FRONTEND_DIR"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to start
sleep 5

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    echo -e "${YELLOW}  Check $LOG_DIR/frontend.log for errors${NC}"
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Services Running Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "  API:      ${GREEN}http://localhost:8000/api/v1${NC}"
echo ""
echo -e "${BLUE}Login Credentials:${NC}"
echo -e "  Email:    ${GREEN}admin@erp.com${NC}"
echo -e "  Password: ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
echo -e "  Backend:  $BACKEND_PID"
echo -e "  Frontend: $FRONTEND_PID"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Backend:  $LOG_DIR/backend.log"
echo -e "  Frontend: $LOG_DIR/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"

    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped${NC}"
    fi

    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi

    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

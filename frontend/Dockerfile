# =============================================================================
# ERP DryMix Products - Frontend Dockerfile
# =============================================================================
# Multi-stage build for React + TypeScript application
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL=http://localhost:8101/api/v1
ARG VITE_APP_NAME="ERP DryMix Products"

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Copy package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create health check file
RUN echo '{"status":"healthy","app":"erp-drymix-frontend"}' > /usr/share/nginx/html/health.json

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Add nginx user to run as non-root
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

# Expose port
EXPOSE 80

# Run nginx as non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

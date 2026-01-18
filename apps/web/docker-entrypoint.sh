#!/bin/sh
set -e

# Default API URL if not provided
API_URL="${API_URL:-http://host.docker.internal:3001}"

echo "Configuring nginx to proxy API requests to: $API_URL"

# Replace placeholder in nginx config with actual API URL
sed -i "s|API_UPSTREAM_PLACEHOLDER|${API_URL}|g" /etc/nginx/nginx.conf

echo "Starting nginx..."
exec nginx -g 'daemon off;'

#!/usr/bin/env bash

PORT="${PORT:-10000}"
echo "Configuring Apache to listen on port $PORT..."
echo "Listen $PORT" > /etc/apache2/ports.conf
sed -ri -e "s!\\*:[0-9]+!\\*:$PORT!g" /etc/apache2/sites-available/*.conf

echo "Running migrations..."
php artisan migrate --force || echo "Migration failed but continuing..."

echo "Caching configurations..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan storage:link || true

echo "Starting Apache on port $PORT..."
exec apache2-foreground

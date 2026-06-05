#!/usr/bin/env bash

PORT="${PORT:-10000}"
echo "Configuring Apache to listen on port $PORT..."
echo "Listen $PORT" > /etc/apache2/ports.conf
sed -ri -e "s!\\*:[0-9]+!\\*:$PORT!g" /etc/apache2/sites-available/*.conf
sed -ri -e "s!Listen [0-9]+!Listen $PORT!g" /etc/apache2/ports.conf

echo "Running migrations..."
php artisan migrate --force

echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
apache2-foreground

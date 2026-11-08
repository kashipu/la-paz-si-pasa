#!/bin/bash
set -euo pipefail

for origen in /opt/wp-content/themes/*; do
    [ -d "$origen" ] || continue
    destino="/var/www/html/wp-content/themes/$(basename "$origen")"
    # Borrar un bind mount borraría también el tema del checkout local.
    if awk -v destino="$destino" '$5 == destino { montado = 1 } END { exit !montado }' /proc/self/mountinfo; then
        continue
    fi
    mkdir -p "$(dirname "$destino")"
    rm -rf "$destino"
    cp -r "$origen" "$destino"
    chown -R www-data:www-data "$destino"
done

exec docker-entrypoint.sh "$@"

#!/bin/bash
# Copia mu-plugins y scf-json desde la imagen al volumen antes de arrancar Apache.
#
# Van fuera de /var/www/html porque esa ruta es un volumen y taparia lo horneado: los
# volumenes con nombre solo se pueblan desde la imagen cuando estan vacios, y este ya
# tiene la instalacion de WordPress.
#
# Se envuelve el entrypoint y no se reemplaza el CMD: docker-entrypoint.sh solo corre
# su preparacion de /var/www/html si su primer argumento empieza por apache2, asi que
# hay que pasarselo tal cual.
set -euo pipefail

for dir in mu-plugins scf-json; do
    destino="/var/www/html/wp-content/$dir"
    mkdir -p "$(dirname "$destino")"
    rm -rf "$destino"
    cp -r "/opt/wp-content/$dir" "$destino"
    chown -R www-data:www-data "$destino"
done

exec docker-entrypoint.sh "$@"

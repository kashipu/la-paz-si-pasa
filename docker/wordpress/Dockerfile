FROM wordpress:php8.3-apache

# Todo esto viajaba como bind mount desde el repo. Dokploy borra y re-clona code/ en
# cada deploy, y un bind mount queda atado al directorio que existia al CREAR el
# contenedor: tras el deploy apuntaba a un directorio borrado y se veia vacio. Como el
# bloque del servicio no cambiaba, compose no recreaba el contenedor y WordPress
# arrancaba sin ningun mu-plugin, sin fallar. Horneado, el contenido cambia la imagen,
# la imagen cambia el config-hash y compose recrea el contenedor solo.
COPY apps/wordpress/php/zz-opcache-overrides.ini /usr/local/etc/php/conf.d/
COPY apps/wordpress/seed /opt/seed

# /var/www/html es un volumen: lo horneado bajo esa ruta queda tapado, y Docker solo
# copia el contenido de la imagen a un volumen VACIO. Por eso estos dos viajan fuera y
# el entrypoint los copia en cada arranque.
COPY apps/wordpress/mu-plugins /opt/wp-content/mu-plugins
COPY apps/wordpress/scf-json /opt/wp-content/scf-json

COPY docker/wordpress/sincronizar-wp-content.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/sincronizar-wp-content.sh

ENTRYPOINT ["sincronizar-wp-content.sh"]
CMD ["apache2-foreground"]

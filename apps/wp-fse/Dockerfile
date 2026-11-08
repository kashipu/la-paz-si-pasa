FROM wordpress:7.1.3-php8.3-apache

# pipefail: si curl falla, la verificación de sha256 no debe pasar en silencio.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# wp-cli guarda su caché en /tmp: el home de www-data (/var/www) no es escribible.
ENV WP_CLI_CACHE_DIR=/tmp/wp-cli-cache
RUN curl -fsSL https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar -o /usr/local/bin/wp \
    && echo 'ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c  /usr/local/bin/wp' | sha256sum -c - \
    && chmod +x /usr/local/bin/wp

COPY apps/wordpress/php/zz-opcache-overrides.ini /usr/local/etc/php/conf.d/
# /var/www/html es un volumen: el entrypoint lleva el tema a su destino en cada arranque.
COPY apps/wordpress/themes/lapaz /opt/wp-content/themes/lapaz
COPY apps/wp-fse/docker/entrypoint.sh apps/wp-fse/docker/lapaz-setup /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/lapaz-setup

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]

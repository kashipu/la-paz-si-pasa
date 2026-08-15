# La Paz Sí Pasa

Sitio público construido con Astro 7 y WordPress headless. Astro renderiza el
frontend mediante SSR y WordPress administra el contenido por su API REST.

## Estructura

```text
apps/frontend/               aplicación Astro
apps/wordpress/mu-plugins/   integración propia de WordPress
apps/wordpress/php/          configuración PHP
docker/astro/                imagen del frontend
docker-compose.yml           entorno local
compose.prod.yaml            despliegue de producción
```

La documentación operativa, los entregables y la configuración de asistentes
se mantienen localmente fuera del repositorio público.

## Desarrollo local

1. Crea los archivos locales de variables:

```sh
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env
```

2. Levanta WordPress y MariaDB:

```sh
docker compose up -d cms db
```

3. Inicia el frontend:

```sh
cd apps/frontend
npm install
npm run dev
```

Servicios locales:

```text
Astro:     http://localhost:4321
WordPress: http://localhost:8080
REST:      http://localhost:8080/wp-json/wp/v2/
```

## Verificación

```sh
cd apps/frontend
npm run check
npm run build
```

## Despliegue

`PUBLIC_SITE_URL` debe apuntar al dominio público real: Astro lo hornea en el
build (llega como build arg) y de ahí salen el enlace canónico, `og:url`,
`og:image` y el sitemap. Si queda con el valor local, esas etiquetas se publican
apuntando a `localhost` y las redes sociales no muestran la previsualización.

`compose.prod.yaml` define los servicios de producción para Dokploy. Las
credenciales y variables reales deben configurarse en el entorno de despliegue;
nunca se guardan en Git.

### Después de cada deploy

Dokploy re-clona el repositorio en cada despliegue y los bind mounts del servicio
`cms` quedan apuntando al directorio borrado. WordPress deja de cargar los
mu-plugins sin emitir ningún error, y el frontend cae a contenido de prueba.
Comprobación obligatoria:

```sh
curl -sL "https://cms.lapazsipasa.com/index.php?rest_route=/" | grep -q headless/v1 \
  && echo OK || echo "ROTO: recrear cms"
```

Si sale `ROTO`, recrear el contenedor (los volúmenes no se tocan):

```sh
docker compose -f compose.prod.yaml up -d --force-recreate cms
```

Sin acceso al host, cambiar cualquier variable que consuma `cms` en el panel de
Dokploy y desplegar: al cambiar su entorno cambia el `config-hash` y Compose lo
recrea solo. El detalle está en `compose.prod.yaml`, junto al montaje.

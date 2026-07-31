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

`compose.prod.yaml` define los servicios de producción para Dokploy. Las
credenciales y variables reales deben configurarse en el entorno de despliegue;
nunca se guardan en Git.

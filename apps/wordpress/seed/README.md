# Carga inicial del contenido del micrositio

`contenido.json` tiene transcrito el contenido de las hojas «Home -Galeria» y
«PAISSANA» del Excel del cliente; `media/` trae las fotos y los audios ya
comprimidos para web. `seed.php` lo carga en los CPT.

Son 54 entradas: 15 `retrato`, 9 `video`, 15 `feria` y 15 `audio_relato`.

Es idempotente: busca cada entrada por título y post_type y la actualiza en vez
de duplicarla, y reconoce los medios por nombre de archivo. Se puede correr las
veces que haga falta.

## Local

```bash
docker compose run --rm --user 33 wpcli wp eval-file /opt/seed/seed.php
```

El `--user 33` no es opcional: la imagen `wpcli` es Alpine y ahí `www-data` es
uid 82, pero la de WordPress es Debian y usa uid 33, que es quien posee
`wp-content/uploads`. Sin eso, cada subida falla con «no se ha podido escribir».

## Producción (Dokploy)

Prerrequisito: **Secure Custom Fields tiene que estar instalado y activo**. Es un
plugin, no vive en el repo, y sin él no se registra ningún CPT — el sitio queda
con los tipos nativos de WordPress y nada más. Se instala desde
`wp-admin` → Plugins → Añadir nuevo → «Secure Custom Fields».

Después, un solo comando dentro del contenedor `cms` (no hace falta wp-cli ni
instalar nada; el `su` es para que los archivos queden de www-data y no de root):

```bash
su -s /bin/sh www-data -c 'php /opt/seed/seed.php'
```

Se puede lanzar desde la terminal de Dokploy sobre el servicio `cms`, o como
Schedule de tipo compose apuntando a ese servicio.

También existe el servicio `wpcli` bajo el perfil `tools`, que no se levanta en
los despliegues normales, por si hace falta wp-cli para otra cosa:

```bash
docker compose -f compose.prod.yaml run --rm --user 33 wpcli wp <comando>
```

Para comprobar:

```bash
curl -s https://cms.<dominio>/wp-json/wp/v2/feria?per_page=1
```

## Qué queda incompleto

- `feria.galeria` vacía en las 15: las fotos no tienen enlace en SharePoint.
- `audio_relato.subtitulos` vacío en los 15: la transcripción no está en el Excel.
- Las ferias con varios shorts (Agroexpo, Cafés de Colombia, Chocoshow, Carnaval,
  ANATO) solo tienen el primero; el CPT acepta un video.

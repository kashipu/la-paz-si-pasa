# Production Rules

Standing rules for build, images, resources and deploy. Each one names the file
it lives in and the reason it exists. Break one on purpose if you must, but
update this page when you do.

## Images

### R1 · Two origins, two treatments

| Origin | Where | Optimized |
|---|---|---|
| Design (fixed: hero, maps, backgrounds) | [`apps/frontend/src/assets/`](../../apps/frontend/src/assets/) | by `astro:assets`, at **build** |
| Content (uploaded by editors) | WordPress → `wordpress_data` volume | by WordPress, at **upload** |

These do not mix. A design image is never uploaded to the CMS, and a content
image is never committed to the repo.

### R2 · WordPress images ship as `srcset`, not `<Image>`

WordPress already generates the variants on upload (`medium` 300,
`medium_large` 768, `large` 1024, `1536x1536`, `2048x2048`) and scales the
original down to 2560px via `big_image_size_threshold`. That work is done and
stored.

The mapper reads those variants and builds a `srcset`; the component renders a
plain `<img>`. See [`mapHero.ts`](../../apps/frontend/src/adapters/wordpress/mappers/mapHero.ts).

```astro
<img src={hero.imageUrl} srcset={hero.srcset}
     sizes="100vw" width={hero.width} height={hero.height}
     alt={hero.imageAlt} loading="lazy" decoding="async" />
```

**Why not `<Image>`:** under `output: "server"`, optimizing a remote image runs
sharp **on every request**, inside a 384M container. More CPU, more RAM and more
moving parts to reach the same result WordPress already handed us for free.

### R3 · No `image.domains` / `remotePatterns` in `astro.config.mjs`

Authorizing remote domains is precisely what enables the runtime sharp path R2
avoids. See [`astro.config.mjs`](../../apps/frontend/astro.config.mjs) — it has
no `image` block today, and it should stay that way.

If this ever becomes justified, recalculate the `frontend` memory limit in
[`compose.prod.yaml`](../../compose.prod.yaml) first.

### R4 · Compress heavy design images before committing

`astro:assets` optimizes the output, not the source. A 6MB PNG in `src/assets/`
still costs build time, sharp memory, and repo weight forever.

## Build

### R5 · `astro check` does not run in the production build

[`package.json`](../../apps/frontend/package.json) keeps `build` and `check`
separate. Type checking belongs in local and CI runs, where failing is useful;
in a release build it only burns RAM and takes the deploy down with it.

> This already happened: a `ts(7053)` error in `PaisSanaMapaCarrusel.astro` made
> `astro check && astro build` exit non-zero, failing the whole `docker build`.

### R6 · Build-only dependencies belong in `devDependencies`

`@astrojs/check` and `typescript` are devDependencies, and the
[`Dockerfile`](../../docker/astro/Dockerfile) runs `npm prune --omit=dev` before
copying into the runtime stage.

### R7 · `package-lock.json` stays in sync with `package.json`

`npm ci` **aborts** when they diverge. After touching dependencies, run
`npm install --package-lock-only` and commit the lockfile.

### R8 · Keep the Docker build context small

[`.dockerignore`](../../.dockerignore) excludes `.git`, `node_modules`, `dist`,
`docs/` and `documentacion/`. The build context is the repo root, so without it
everything gets shipped to the daemon on every build.

## Resources

### R9 · Every service declares a memory limit

In [`compose.prod.yaml`](../../compose.prod.yaml):

| Service | Limit | Measured usage |
|---|---|---|
| `frontend` | 384M | ~31 MiB |
| `cms` | 512M | ~67 MiB |
| `db` | 512M | ~125 MiB |

Measured under 40 concurrent requests, no OOM kills. Docker sets swap to twice
the limit; that headroom is deliberate, not an oversight.

### R10 · No tuning flags copied from MySQL

`db` is **mariadb:11**, not MySQL. Two concrete traps:

- `--performance-schema=OFF` is a no-op — MariaDB ships with it already off.
- `--innodb-buffer-pool-size=192M` **raises** memory use; the default is 128M.

This is why the `db` service carries no `command:`.

## Deploy

### R11 · Dokploy deploys `main`, not `frontend`

```text
branch:      main
composePath: ./compose.prod.yaml
autoDeploy:  true  (fires on push)
```

Pushing to `frontend` **deploys nothing**. Publishing means merging to `main`.
See [`dokploy.md`](dokploy.md).

### R12 · Data lives in named volumes

`wordpress_data` (`/var/www/html`, which includes `wp-content/uploads`) and
`db_data` (`/var/lib/mysql`). Recreating a container does **not** wipe the
volume — only `docker volume rm` or `compose down -v` do.

### R13 · Changing a service's config recreates it

Compose recreates a container when its `config-hash` changes, not only when the
image does. Adding memory limits to `cms` and `db` recreated both, with the
service interruption that implies. Deploys that only touch frontend code leave
`cms` and `db` running.

## Known debt

Deliberate calls, not oversights:

- **Production DB passwords are the example ones** (`wordpress` /
  `root-password`). MariaDB's port is not published, so exposure is internal,
  but they need rotating.
- **Source PNGs over 3MB** in `src/assets/` (footer 6.5M, hero 5.2M, retratos
  4.1M and 3.8M) — pending compression, see R4.
- **Unreferenced SVGs** in `src/assets/mapas/` (~9.1M): the components use the
  `@3x.png` variants. Kept on request.
- **No WebP/AVIF conversion.** WordPress core does not convert formats; it needs
  a plugin. Worth revisiting only if measurement justifies it — most of the win
  is serving 768px instead of 2560px, not the codec.
- **`getHero()` exists but nothing calls it.** The Hero hardcodes the local PNG,
  so an image uploaded in WordPress does not reach the frontend today. Note that
  `withFallback` in [`adapters/index.ts`](../../apps/frontend/src/adapters/index.ts)
  falls back to mocks silently when ACF does not expose the field over REST — the
  only trace is a `console.warn` in the container logs.

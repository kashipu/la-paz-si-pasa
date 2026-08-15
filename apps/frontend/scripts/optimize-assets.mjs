// Optimiza los assets pesados del repo. Se corre a mano cuando entra arte nueva:
//   node scripts/optimize-assets.mjs
//
// Dos trabajos:
//  1. Genera el hero como WebP estatico en public/hero/. El hero es el elemento LCP,
//     asi que no pasa por astro:assets: con output:"server" cada request pagaria una
//     transformacion de sharp sin cache.
//  2. Baja los PNG fuente al doble del ancho que realmente consume cada componente.
//     Se conserva nombre y extension para no tocar ningun import.
//
// Los originales se recuperan con git checkout si algo sale mal.

import assert from "node:assert/strict";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "src/assets");

// El hero es una foto con grano riso deliberado. Ese dither es ruido de alta
// frecuencia puro, y ahi WebP y AVIF se hunden: medido sobre este archivo a 1440px,
// mozjpeg q45 da 235 KB, WebP q45 da 398 KB y AVIF q45 da 596 KB. Por eso va en JPEG.
// El grano tambien es la razon de cortar en 1200: al ser textura estocastica, subir
// de escala se lee como grano un poco mas grueso, que es justo el efecto buscado.
const HERO_SOURCE = path.join(assets, "hero/hero-image.png");
const HERO_OUT = path.join(root, "public/hero");
const HERO_WIDTHS = [640, 960, 1200];
const HERO_QUALITY = 55;
const HERO_MAX_BYTES = 200 * 1024;

// Imagen para compartir en redes (og:image). Se arma como el hero del sitio: la
// foto recortada a 1.91:1 con el logo encima. El recorte baja 220px sobre el
// original de 1800x1200 para que el logo blanco caiga sobre la linea de arboles
// y no sobre el cielo, donde no se leeria.
const HERO_LOGO = path.join(assets, "hero/hero-logo.svg");
const OG_OUT = path.join(root, "public/og.jpg");
const OG_SIZE = { width: 1200, height: 630 };
const OG_CROP = { left: 0, top: 220, width: 1800, height: 945 };
const OG_LOGO_WIDTH = 620;
const OG_MAX_BYTES = 300 * 1024;

// Favicon: el sol amarillo del logo, el unico trazo con class="cls-1".
const FAVICON_OUT = path.join(root, "public/favicon.svg");
const APPLE_ICON_OUT = path.join(root, "public/apple-touch-icon.png");
const APPLE_ICON_SIZE = 180;
const APPLE_ICON_BG = "#171717"; // --color-brand

// Ancho destino = 2x el ancho que pide el componente que lo usa.
const SOURCES = [
  ["footer/footer-foto@3x.png", 1200], //          Footer.astro          <Image width={600}>
  ["retratos/foto-retratos@3x.png", 1200], //      RetratosPazSlider     sizes 45vw/55vw
  ["retratos/retratos-fondo.png", 1600], //        RetratosPazSlider     getImage width 1100
  ["retratos/retratos-fondo-mb.png", 1200], //     RetratosPazSlider     getImage width 600
  ["paissana/paisanos-mapa-bg@2x.png", 1200], //   PaisSanaMapaIntro     <Image width={600}>
  ["paissana/paisana-retrato@3x.png", 1000], //    PaisSanaMapaIntro     <Image width={500}>
  ["paissana/paisana-hero-image@3x.png", 1200], // PaisSanaHero          <Image width={600}>
  ["hacemos/noticias-banner@3x.png", 1800], //     LoQueHacemosBannerCta getImage width 1440
  ["mapas/amazonia@3x.png", 1300], //              PaisSanaMapaCarrusel  <Image width={650}>
  ["mapas/andina@3x.png", 1300],
  ["mapas/caribe@3x.png", 1300],
  ["mapas/orinoquia@3x.png", 1300],
  ["mapas/pacifica@3x.png", 1300],
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function buildHero() {
  await mkdir(HERO_OUT, { recursive: true });
  const meta = await sharp(HERO_SOURCE).metadata();

  for (const width of HERO_WIDTHS) {
    const out = path.join(HERO_OUT, `hero-${width}.jpg`);
    await sharp(HERO_SOURCE)
      .resize({ width })
      .jpeg({ quality: HERO_QUALITY, mozjpeg: true })
      .toFile(out);
    console.log(`hero-${width}.jpg  ${kb((await stat(out)).size)}`);
  }

  // Relacion de aspecto del original, para los width/height de Hero.astro.
  return { width: meta.width, height: meta.height };
}

async function buildOgImage() {
  const logo = await sharp(HERO_LOGO, { density: 300 })
    .resize({ width: OG_LOGO_WIDTH })
    .png()
    .toBuffer();

  await sharp(HERO_SOURCE)
    .extract(OG_CROP)
    .resize(OG_SIZE)
    .composite([{ input: logo, gravity: "center" }])
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(OG_OUT);

  console.log(`og.jpg  ${kb((await stat(OG_OUT)).size)}`);
}

async function buildIcons() {
  const svg = await readFile(HERO_LOGO, "utf8");
  const sol = svg.match(/<path class="cls-1"[^>]*\sd="([^"]+)"/)?.[1];
  assert.ok(sol, "no se encontro el trazo cls-1 (el sol) en hero-logo.svg");

  // El sol vive dentro del viewBox del logotipo completo. Para recortarlo sin
  // calcular la geometria a mano se rasteriza a escala conocida, se recorta el
  // vacio con trim y los offsets se traducen de vuelta a unidades del viewBox.
  const [, , boxWidth, boxHeight] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const scale = 4;
  const soloSol = (viewBox, extra = "") =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path fill="#f8e281" d="${sol}"/>${extra}</svg>`,
    );

  const { info } = await sharp(soloSol(`0 0 ${boxWidth} ${boxHeight}`), { density: 72 * scale })
    .trim()
    .toBuffer({ resolveWithObject: true });
  const round = (n) => Math.round(n * 100) / 100;
  const [x, y, ancho, alto] = [-info.trimOffsetLeft, -info.trimOffsetTop, info.width, info.height].map(
    (n) => round(n / scale),
  );

  // En el logotipo el sol sale cortado: su lado derecho es plano porque ahi
  // empieza el texto. Suelto se leeria como media rueda, asi que se refleja
  // sobre ese borde para cerrar la corona. El viewBox pasa a ser cuadrado.
  const caja = [x, y, ancho * 2, alto].join(" ");
  const espejo = round((x + ancho) * 2) - 2; // solape: sin el, la union de las dos mitades deja una costura visible
  await writeFile(
    FAVICON_OUT,
    `${soloSol(caja, `<path transform="translate(${espejo} 0) scale(-1 1)" fill="#f8e281" d="${sol}"/>`)}\n`,
  );

  // El icono de iOS no admite transparencia: va sobre el fondo de marca.
  const lado = Math.round(APPLE_ICON_SIZE * 0.72);
  const icono = await sharp(FAVICON_OUT, { density: 300 })
    .resize({ width: lado, height: lado, fit: "contain", background: "#0000" })
    .toBuffer();
  await sharp({
    create: { width: APPLE_ICON_SIZE, height: APPLE_ICON_SIZE, channels: 4, background: APPLE_ICON_BG },
  })
    .composite([{ input: icono, gravity: "center" }])
    .png()
    .toFile(APPLE_ICON_OUT);

  console.log(`favicon.svg  ${kb((await stat(FAVICON_OUT)).size)}    apple-touch-icon.png  ${kb((await stat(APPLE_ICON_OUT)).size)}`);
}

async function shrinkSources() {
  for (const [relative, targetWidth] of SOURCES) {
    const file = path.join(assets, relative);
    const before = (await stat(file)).size;
    const { width } = await sharp(file).metadata();

    if (width <= targetWidth) {
      console.log(`${relative}  ya mide ${width}px, se deja`);
      continue;
    }

    // sharp no puede leer y escribir el mismo archivo en streaming: se pasa por buffer.
    const buffer = await sharp(file)
      .resize({ width: targetWidth })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await sharp(buffer).toFile(file);

    const after = (await stat(file)).size;
    console.log(`${relative}  ${width}px ${kb(before)} -> ${targetWidth}px ${kb(after)}`);
  }
}

async function check(hero) {
  const heroFiles = await readdir(HERO_OUT);
  for (const width of HERO_WIDTHS) {
    assert.ok(heroFiles.includes(`hero-${width}.jpg`), `falta hero-${width}.jpg`);
  }

  const largest = (await stat(path.join(HERO_OUT, `hero-${Math.max(...HERO_WIDTHS)}.jpg`))).size;
  assert.ok(
    largest < HERO_MAX_BYTES,
    `el hero mas grande pesa ${kb(largest)}, tope ${kb(HERO_MAX_BYTES)}`
  );

  for (const [relative, targetWidth] of SOURCES) {
    const { width } = await sharp(path.join(assets, relative)).metadata();
    assert.ok(width <= targetWidth, `${relative} mide ${width}px, tope ${targetWidth}px`);
  }

  const og = await sharp(OG_OUT).metadata();
  assert.equal(og.width, OG_SIZE.width, "og.jpg debe medir 1200px de ancho");
  assert.equal(og.height, OG_SIZE.height, "og.jpg debe medir 630px de alto");
  const ogBytes = (await stat(OG_OUT)).size;
  assert.ok(ogBytes < OG_MAX_BYTES, `og.jpg pesa ${kb(ogBytes)}, tope ${kb(OG_MAX_BYTES)}`);

  const icono = await sharp(APPLE_ICON_OUT).metadata();
  assert.equal(icono.width, APPLE_ICON_SIZE, "apple-touch-icon.png debe ser cuadrado de 180px");
  assert.equal(icono.height, APPLE_ICON_SIZE, "apple-touch-icon.png debe ser cuadrado de 180px");
  const favicon = await sharp(FAVICON_OUT).metadata();
  assert.ok(
    Math.abs(favicon.width / favicon.height - 1) < 0.15,
    `favicon.svg quedo en ${favicon.width}x${favicon.height}, deberia ser casi cuadrado`,
  );

  console.log(`\nOK. Hero ${hero.width}x${hero.height}, mayor variante ${kb(largest)}.`);
}

const hero = await buildHero();
await buildOgImage();
await buildIcons();
await shrinkSources();
await check(hero);

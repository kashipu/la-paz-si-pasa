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
import { mkdir, readdir, stat } from "node:fs/promises";
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

  console.log(`\nOK. Hero ${hero.width}x${hero.height}, mayor variante ${kb(largest)}.`);
}

const hero = await buildHero();
await shrinkSources();
await check(hero);

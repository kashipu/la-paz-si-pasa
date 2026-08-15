import assert from "node:assert/strict";
import test from "node:test";
import { mapFeria } from "../src/adapters/wordpress/mappers/mapFeria.ts";

const feria = (acf) => mapFeria({ id: 1, title: { rendered: "Agroexpo 2025" }, acf });

test("mapea el repetidor de videos en orden", () => {
  const { videos } = feria({
    videos: [
      { fuente_video: "youtube", video_youtube: "https://youtube.com/shorts/6m8NAKEPSUg" },
      { fuente_video: "youtube", video_youtube: "https://youtu.be/nzgpt7ER3_k" },
    ],
  });

  assert.equal(videos.length, 2);
  assert.equal(videos[0].url, "https://www.youtube-nocookie.com/embed/6m8NAKEPSUg");
  assert.equal(videos[1].url, "https://www.youtube-nocookie.com/embed/nzgpt7ER3_k");
  assert.equal(videos[0].fuente, "youtube");
  assert.match(videos[0].alt, /1 de 2/);
});

test("cae a los campos planos mientras producción no tenga el repetidor", () => {
  // Sin este respaldo las 12 ferias ya cargadas se quedan sin video entre el
  // deploy del frontend y la corrida del seed.
  const { videos } = feria({ video_youtube: "https://youtube.com/shorts/6m8NAKEPSUg" });

  assert.equal(videos.length, 1);
  assert.equal(videos[0].url, "https://www.youtube-nocookie.com/embed/6m8NAKEPSUg");
  assert.equal(videos[0].alt, "Video Agroexpo 2025", "con un solo video el alt no numera");
});

test("una feria sin video no trae ninguno", () => {
  // ICARRD+20, Mercados campesinos y Filbo: el Excel dice N/A.
  assert.deepEqual(feria({}).videos, []);
  assert.deepEqual(feria({ videos: [] }).videos, []);
});

test("descarta las filas cuya URL no es un video reconocible", () => {
  const { videos } = feria({
    videos: [
      { video_youtube: "https://youtube.com/shorts/6m8NAKEPSUg" },
      { video_youtube: "https://ejemplo.com/no-es-youtube" },
      { video_youtube: "" },
    ],
  });

  assert.equal(videos.length, 1);
});

test("la galería sale del campo gallery, que el mu-plugin entrega ya formateado", () => {
  const { galeria } = feria({
    galeria: [
      { url: "https://cms/foto-1.jpg", sizes: { "1536x1536": "https://cms/foto-1-1536x1024.jpg" } },
      { url: "https://cms/foto-2.jpg", alt: "Stand PaisSana" },
    ],
  });

  assert.equal(galeria.length, 2);
  assert.equal(galeria[0].url, "https://cms/foto-1-1536x1024.jpg", "prefiere el tamaño intermedio");
  assert.equal(galeria[0].alt, "Agroexpo 2025 1", "sin alt propio, numera con el título");
  assert.equal(galeria[1].alt, "Stand PaisSana");
});

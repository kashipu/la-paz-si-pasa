import assert from "node:assert/strict";
import test from "node:test";
import { videoSource, youtubeId } from "../src/adapters/youtube.js";

test("extrae IDs de enlaces de YouTube admitidos", () => {
  const id = "WEYN6vodbPc";
  [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
  ].forEach((url) => assert.equal(youtubeId(url), id));
});

test("rechaza enlaces inválidos y dominios ajenos", () => {
  ["https://vimeo.com/WEYN6vodbPc", "https://youtube.com/watch?v=corto", "no-es-un-enlace"].forEach((url) => {
    assert.equal(youtubeId(url), undefined);
  });
});

test("usa el MP4 de WordPress o informa contenido no disponible", () => {
  assert.deepEqual(videoSource("https://vimeo.com/WEYN6vodbPc", "https://wp.example/video.mp4"), {
    fuente: "wordpress",
    estado: "disponible",
    videoUrl: "https://wp.example/video.mp4",
    thumbnailUrl: "",
  });
  assert.equal(videoSource("https://vimeo.com/WEYN6vodbPc", "").estado, "no-disponible");
});

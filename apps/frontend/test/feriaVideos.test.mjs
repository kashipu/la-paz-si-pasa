import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import { detenerVideos, guardarMiniatura } from "../src/components/paisana/feriaVideos.ts";

const { document } = new Window();

// Una feria como la renderiza PaisSanaFeriaItem: miniatura + botón de play.
function crearFeria() {
  const feria = document.createElement("details");
  feria.innerHTML = `
    <div class="video-media" data-video-source="youtube">
      <img src="mini.jpg" alt="Miniatura">
      <button class="play-btn-overlay"></button>
    </div>`;
  return feria;
}

// Lo que hace el handler de play: guardar la miniatura y montar el reproductor.
function reproducir(feria) {
  const media = feria.querySelector(".video-media");
  guardarMiniatura(media);
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube-nocookie.com/embed/x?autoplay=1";
  media.replaceChildren(iframe);
  return media;
}

test("al detener, el reproductor desaparece y vuelve la miniatura con su play", () => {
  const feria = crearFeria();
  const media = reproducir(feria);
  assert.ok(media.querySelector("iframe"), "el play montó el reproductor");

  detenerVideos(feria);

  assert.equal(media.querySelector("iframe"), null, "sin iframe no hay audio");
  assert.ok(media.querySelector("img"), "la miniatura vuelve");
  assert.ok(media.querySelector(".play-btn-overlay"), "el botón de play vuelve");
});

test("sin reproductor activo no toca nada", () => {
  const feria = crearFeria();
  const antes = feria.innerHTML;

  detenerVideos(feria); // nunca se pulsó play
  assert.equal(feria.innerHTML, antes);
});

test("solo detiene los videos dentro de la raíz dada", () => {
  // Caso carrusel/acordeón: cerrar una feria no debe callar la otra.
  const abierta = crearFeria();
  const cerrada = crearFeria();
  reproducir(abierta);
  reproducir(cerrada);

  detenerVideos(cerrada);

  assert.ok(abierta.querySelector("iframe"), "la feria abierta sigue reproduciendo");
  assert.equal(cerrada.querySelector("iframe"), null);
});

test("detener dos veces es inofensivo y se puede volver a reproducir", () => {
  const feria = crearFeria();
  reproducir(feria);
  detenerVideos(feria);
  detenerVideos(feria);

  const media = reproducir(feria);
  assert.ok(media.querySelector("iframe"), "el segundo play vuelve a montar el reproductor");
  detenerVideos(feria);
  assert.ok(media.querySelector("img"), "y la miniatura se restaura otra vez");
});

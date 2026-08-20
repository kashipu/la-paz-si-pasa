// Control de los reproductores del acordeón de ferias. "Detener" = quitar el
// iframe/video del DOM y restaurar la miniatura: es lo único que corta el
// audio de un embed de YouTube sin cargar su API de JS.
const miniaturas = new WeakMap<HTMLElement, Node[]>();

/** Guarda la miniatura y el botón de play antes de reemplazarlos por el reproductor. */
export function guardarMiniatura(media: HTMLElement) {
  if (!miniaturas.has(media)) miniaturas.set(media, [...media.childNodes]);
}

/** Detiene cualquier video sonando dentro de `raiz` restaurando su miniatura. */
export function detenerVideos(raiz: Element) {
  raiz.querySelectorAll<HTMLElement>(".video-media").forEach((media) => {
    const original = miniaturas.get(media);
    if (original && media.querySelector("iframe, video")) media.replaceChildren(...original);
  });
}

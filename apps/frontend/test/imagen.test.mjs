import assert from "node:assert/strict";
import test from "node:test";
import { imagenUrl } from "../src/adapters/wordpress/mappers/imagen.ts";

const foto = {
  url: "https://cms/uploads/retrato.jpg", // 1920x1280, ~600 KB
  sizes: {
    medium: "https://cms/uploads/retrato-300x200.jpg",
    large: "https://cms/uploads/retrato-1024x683.jpg",
    "1536x1536": "https://cms/uploads/retrato-1536x1024.jpg", // ~237 KB
  },
};

test("prefiere el tamano intermedio sobre el original", () => {
  assert.equal(imagenUrl(foto), "https://cms/uploads/retrato-1536x1024.jpg");
});

test("cae al original cuando la imagen es mas chica que el tope", () => {
  // WordPress no genera 1536x1536 para un logo de 400px: solo existe el original.
  const logo = { url: "https://cms/uploads/logo.png", sizes: { medium: "https://cms/uploads/logo-300x120.png" } };
  assert.equal(imagenUrl(logo), "https://cms/uploads/logo.png");
});

test("devuelve cadena vacia, no undefined, cuando no hay imagen", () => {
  // mapVideo y mapFeria encadenan con ||, asi que el vacio tiene que ser falsy
  // para que el thumbnail de YouTube tome el relevo.
  for (const vacio of [undefined, null, {}, { sizes: {} }]) {
    assert.equal(imagenUrl(vacio), "");
    assert.ok(!imagenUrl(vacio), "el valor vacio debe ser falsy");
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { mapNoticia, toIsoDate } from "../src/adapters/wordpress/mappers/mapNoticia.ts";

test("normaliza los formatos de fecha que devuelve WordPress", () => {
  assert.equal(toIsoDate("20260809"), "2026-08-09"); // date_picker de ACF
  assert.equal(toIsoDate("2026-08-01"), "2026-08-01"); // ya normalizada
  assert.equal(toIsoDate("2026-08-09T14:32:10"), "2026-08-09"); // fecha del post
  assert.equal(toIsoDate(""), "");
  assert.equal(toIsoDate("no es una fecha"), "");
});

test("ordena igual sin importar el formato de origen", () => {
  const noticias = [
    mapNoticia({ id: 1, acf: { fecha: "20260801" } }),
    mapNoticia({ id: 2, acf: { fecha: "2026-08-09" } }),
    mapNoticia({ id: 3, acf: {}, date: "2026-08-05T10:00:00" }),
  ];

  const ordenadas = [...noticias].sort((a, b) => b.fecha.localeCompare(a.fecha));
  assert.deepEqual(ordenadas.map((n) => n.id), ["2", "3", "1"]);
});

test("usa la fecha del post cuando el campo ACF viene vacío", () => {
  assert.equal(mapNoticia({ id: 9, acf: { fecha: "" }, date: "2025-01-02T00:00:00" }).fecha, "2025-01-02");
});

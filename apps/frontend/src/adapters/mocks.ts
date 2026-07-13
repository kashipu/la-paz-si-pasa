import type { HeroData, Retrato, Subcuenta, Noticia, Video } from "./contracts";

import logoVictimas from "../assets/subcuentas/victimas.png";
import logoServicioSocial from "../assets/subcuentas/servicio-social-paz.png";
import logoTrabajo from "../assets/subcuentas/min-trabajo.png";
import logoCatastroCatatumbo from "../assets/subcuentas/catastro-zeii-catatumbo.png";
import logoArnComunitarias from "../assets/subcuentas/arn-acciones-comunitarias.png";
import logoAgenciaDesarrolloRural from "../assets/subcuentas/agencia-desarrollo-rural.png";
import logoAfd from "../assets/subcuentas/afd.png";
import logoAgricultura from "../assets/subcuentas/min-agricultura.png";
import logoKfw from "../assets/subcuentas/kfw.png";
import logoVisionAmazonia from "../assets/subcuentas/vision-amazonia.png";
import logoBidFacilidad from "../assets/subcuentas/bid-facilidad.png";
import logoHeco from "../assets/subcuentas/heco.png";
import logoAgenciaTierras from "../assets/subcuentas/agencia-nacional-tierras.png";
import logoImplementacion from "../assets/subcuentas/implementacion-acuerdo-paz.png";
import logoCatastroMultiproposito from "../assets/subcuentas/catastro-multiproposito.png";
import logoTejiendoPaz from "../assets/subcuentas/fcp-funcionamiento.png";
import logoPrimeraInfancia from "../assets/subcuentas/icbf-primera-infancia.png";
import logoNinezAdolescencia from "../assets/subcuentas/icbf-ninez-adolescencia.png";
import logoAmbiente from "../assets/subcuentas/min-ambiente.png";
import logoBidPrestamo from "../assets/subcuentas/bid-prestamo.png";
import logoPdet from "../assets/subcuentas/pdet.png";
import logoArnReincorporacion from "../assets/subcuentas/arn-reincorporacion.png";
import logoSustitucion from "../assets/subcuentas/sustitucion.png";

// ponytail: mocks de desarrollo — se usan como fallback mientras los CPT no existan en WP
export const mockHero: HeroData = {
  imageUrl: "https://picsum.photos/seed/hero/1600/700",
  imageAlt: "Paisaje de Colombia",
};

export const mockRetratos: Retrato[] = [
  {
    id: "1",
    fotoUrl: "https://picsum.photos/seed/retrato1/600/800",
    descripcion: "Familia campesina retomando su tierra",
    proyecto: "Colombia Sostenible",
    lugar: "Caquetá",
  },
  {
    id: "2",
    fotoUrl: "https://picsum.photos/seed/retrato2/600/800",
    descripcion: "Brigada de salud rural",
    proyecto: "PaisSana",
    lugar: "Chocó",
  },
  {
    id: "3",
    fotoUrl: "https://picsum.photos/seed/retrato3/600/800",
    descripcion: "Vía terciaria terminada",
    proyecto: "PDET",
    lugar: "Catatumbo",
  },
];

export const mockSubcuentas: Subcuenta[] = [
  { id: "1", nombre: "Atención Integral de las Víctimas", iconoUrl: logoVictimas.src },
  { id: "2", nombre: "Servicio Social para la Paz", iconoUrl: logoServicioSocial.src },
  { id: "3", nombre: "Ministerio del Trabajo", iconoUrl: logoTrabajo.src },
  { id: "4", nombre: "Zona ZEII Catatumbo - Catastro", iconoUrl: logoCatastroCatatumbo.src },
  { id: "5", nombre: "ARN - Acciones comunitarias y restaurativas", iconoUrl: logoArnComunitarias.src },
  { id: "6", nombre: "Agencia de Desarrollo Rural", iconoUrl: logoAgenciaDesarrolloRural.src },
  { id: "7", nombre: "Agencia Francesa de Desarrollo - AFD", iconoUrl: logoAfd.src },
  { id: "8", nombre: "Ministerio de Agricultura y Desarrollo Rural", iconoUrl: logoAgricultura.src },
  { id: "9", nombre: "Banco de Desarrollo Alemán - KFW", iconoUrl: logoKfw.src },
  { id: "10", nombre: "Visión Amazonía", iconoUrl: logoVisionAmazonia.src },
  { id: "11", nombre: "BID Facilidad", iconoUrl: logoBidFacilidad.src },
  { id: "12", nombre: "Herencia Colombia", iconoUrl: logoHeco.src },
  { id: "13", nombre: "Agencia Nacional de Tierras", iconoUrl: logoAgenciaTierras.src },
  { id: "14", nombre: "Implementación del Acuerdo de Paz", iconoUrl: logoImplementacion.src },
  { id: "15", nombre: "Catastro Multipropósito", iconoUrl: logoCatastroMultiproposito.src },
  { id: "16", nombre: "Tejiendo Paz - Funcionamiento", iconoUrl: logoTejiendoPaz.src },
  { id: "17", nombre: "Primera Infancia ICBF", iconoUrl: logoPrimeraInfancia.src },
  { id: "18", nombre: "Niñez y Adolescencia ICBF", iconoUrl: logoNinezAdolescencia.src },
  { id: "19", nombre: "Ambiente y Desarrollo Sostenible", iconoUrl: logoAmbiente.src },
  { id: "20", nombre: "BID Préstamo", iconoUrl: logoBidPrestamo.src },
  { id: "21", nombre: "Programas de Desarrollo con Enfoque Territorial", iconoUrl: logoPdet.src },
  { id: "22", nombre: "ARN Reincorporación", iconoUrl: logoArnReincorporacion.src },
  { id: "23", nombre: "Sustitución", iconoUrl: logoSustitucion.src },
];

export const mockNoticias: Noticia[] = [
  { id: "1", titulo: "El fondo entrega resultados de gestión", url: "https://example.com/1", fecha: "2026-05-10" },
  { id: "2", titulo: "Nuevos proyectos en territorios PDET", url: "https://example.com/2", fecha: "2026-03-22" },
  { id: "3", titulo: "Balance de Colombia Sostenible", url: "https://example.com/3", fecha: "2025-11-05" },
];

export const mockVideos: Video[] = [
  {
    id: "1",
    titulo: "Así avanza la paz en los territorios",
    descripcion: "Recorrido por los proyectos del fondo",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/seed/video1/640/360",
    tags: ["PDET"],
  },
  {
    id: "2",
    titulo: "Salud para la paz",
    descripcion: "Historias del programa PaisSana",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/seed/video2/640/360",
    tags: ["PaisSana", "Colombia Sostenible"],
  },
];

import type { HeroData, Retrato, Subcuenta, Noticia, Video } from "./contracts";
import { youtubeId, youtubeVideo } from "./youtube.js";

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
import fotoRetrato1 from "../assets/retratos/foto-retratos@3x.png";

// ponytail: mocks de desarrollo — se usan como fallback mientras los CPT no existan en WP
export const mockHero: HeroData = {
  imageUrl: "https://picsum.photos/seed/hero/1600/700",
  imageAlt: "Paisaje de Colombia",
};

export const mockRetratos: Retrato[] = [
  {
    id: "1",
    fotoUrl: "https://picsum.photos/seed/retrato2/600/800",
    descripcion:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    proyecto: "Programa Piloto de Inversiones Prioritarias en Municipios PDET",
    lugar: "Santander de Quilichao, Cauca",
  },
  {
    id: "2",
    fotoUrl: "https://picsum.photos/seed/retrato3/600/800",
    descripcion:
      "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.",
    proyecto: "PaisSana",
    lugar: "Tumaco, Nariño",
  },
  {
    id: "3",
    fotoUrl: fotoRetrato1,
    descripcion:
      "Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum.",
    proyecto: "Colombia Sostenible",
    lugar: "San Vicente del Caguán, Caquetá",
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
  { id: "3", titulo: "Balance de Colombia Sostenible", url: "https://example.com/3", fecha: "2026-01-14" },
  { id: "4", titulo: "Lorem ipsum dolor sit amet consectetuer", url: "https://example.com/4", fecha: "2025-09-18" },
  { id: "5", titulo: "Adipiscing elit sed diam nonummy nibh", url: "https://example.com/5", fecha: "2025-06-02" },
  { id: "6", titulo: "Euismod tincidunt ut laoreet dolore magna", url: "https://example.com/6", fecha: "2025-02-27" },
  { id: "7", titulo: "Aliquam erat volutpat ut wisi enim", url: "https://example.com/7", fecha: "2024-10-11" },
  { id: "8", titulo: "Ad minim veniam quis nostrud exerci", url: "https://example.com/8", fecha: "2024-07-05" },
  { id: "9", titulo: "Tation ullamcorper suscipit lobortis nisl", url: "https://example.com/9", fecha: "2024-03-19" },
  { id: "10", titulo: "Ut aliquip ex ea commodo consequat", url: "https://example.com/10", fecha: "2023-11-30" },
  { id: "11", titulo: "Duis autem vel eum iriure dolor", url: "https://example.com/11", fecha: "2023-08-08" },
  { id: "12", titulo: "In hendrerit in vulputate velit esse", url: "https://example.com/12", fecha: "2023-04-16" },
];

// El primero es el destacado inicial; el resto va al carrusel "Ver más"
export const mockVideos: Video[] = [
  {
    id: "1",
    titulo: "Artonitas | El Castillo, Meta",
    descripcion:
      "El Castillo, Meta, ha sido uno de los territorios más golpeados por la violencia. Pero allí, un grupo de mujeres decidió organizarse y crear un proyecto que las ha llevado de la tierra al aire. Sus Artonitas: tostaditas de plátano llanero, hoy se venden en supermercados y vuelan en los aviones de clic",
    fuente: "youtube",
    estado: "disponible",
    ...youtubeVideo(youtubeId("https://www.youtube.com/watch?v=WEYN6vodbPc")!),
    tags: ["PaiSana"],
  },
  {
    id: "2",
    titulo: "Aroma de Paz | Rionegro, Santander",
    descripcion:
      "Las mujeres de nuestro campo no solo cultivan: transforman realidades y siembran esperanza. Desde Rionegro, Santander, la asociación de cacaocultores víctimas, Aroma de Paz, nos enseña el verdadero significado de la resiliencia: estas mujeres decidieron darle un giro a sus vidas, pasando de la comercialización del grano a convertirse en empresarias de su propio chocolate de mesa.",
    fuente: "youtube",
    estado: "disponible",
    ...youtubeVideo(youtubeId("https://youtu.be/GlSj8XMwMyA")!),
    tags: ["PaiSana"],
  },
  {
    id: "3",
    titulo: "Asociación Jóvenes Agricultores del Perijá | Corregimiento San José del Oriente, La Paz, Cesar",
    descripcion:
      "Detrás de cada taza de Café Del Oriente hay una historia que se escribe con berraquera. Leylis, madre, líder comunitaria y representante legal de la Asociación Jóvenes Agricultores del Perijá, nos abre las puertas de San José del Oriente para mostrarnos cómo el campo se transforma gracias al empoderamiento femenino y juvenil.",
    fuente: "youtube",
    estado: "disponible",
    ...youtubeVideo(youtubeId("https://www.youtube.com/embed/qzaVIDIdFPA")!),
    tags: ["PaiSana"],
  },
  {
    id: "4",
    titulo: "Ruta Etnoecoturística del pueblo zenú | San Antonio de Palmito, Sucre",
    descripcion:
      "San Antonio de Palmito guarda un encanto que va más allá del paisaje, es un lugar donde la naturaleza y la espiritualidad se encuentran. La Ruta Etnoecoturística del Pueblo Zenú combina recorridos culturales, gastronómicos y productivos que permiten conocer una tradición viva. Los visitantes no solo llegan a un destino, llegan a una historia milenaria que los invita a descubrirse a sí mismos.",
    fuente: "youtube",
    estado: "disponible",
    // ponytail: el CSV repite el enlace del vídeo 3 aquí — reemplazar cuando llegue el correcto
    ...youtubeVideo(youtubeId("https://www.youtube.com/shorts/qzaVIDIdFPA")!),
    tags: ["Programa Colombia Sostenible"],
  },
  {
    id: "5",
    titulo: "Juan Pablo | Corregimiento La Marina, Tolima",
    descripcion:
      "A los 16 años, Juan Pablo quería irse de su vereda, dejar atrás el trabajo del campo y buscar una vida distinta. Pero eso cambió. Lo que antes era rutina se convirtió en pasión. Junto a su padre aprendió sobre la catación, el tostado y el valor que tiene cuidar cada planta de café. Entendió que su finca no era solo un terreno: era una empresa familiar, una herencia viva.",
    fuente: "youtube",
    estado: "disponible",
    ...youtubeVideo(youtubeId("https://www.youtube.com/live/QU9YVzdOX6Q")!),
    tags: ["Programa Colombia Sostenible"],
  },
  {
    id: "6",
    titulo: "Chocolates Tumaco | Tumaco, Nariño",
    descripcion:
      "En medio de las dificultades nacen las mejores oportunidades. En el 2013, Tumaco enfrentaba un comercio de cacao desorganizado y lleno de intermediarios. Allí surgió la idea de unirse y crear Chocolates Tumaco, una asociación que se convirtió en referente de resiliencia y construcción de paz. Con el apoyo del Programa Colombia Sostenible del Fondo Colombia en Paz, 500 familias de 7 Consejos Comunitarios lograron mejorar la productividad, fortalecer la infraestructura y acceder a conocimientos técnicos que transformaron sus economías. Hoy, el cacao no solo es su sustento, también es la herramienta con la que las comunidades apuestan por un futuro inclusivo, con mujeres liderando procesos y niños soñando con quedarse en su territorio. #ConDignidadCumplimos",
    fuente: "youtube",
    estado: "disponible",
    ...youtubeVideo(youtubeId("https://www.youtube.com/watch?v=mgSRb-MAUeM")!),
    tags: ["Programa Colombia Sostenible"],
  },
];

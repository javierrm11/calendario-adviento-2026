import type { TicketMeta, TicketType } from "./types";

const ENTRIES: ReadonlyArray<readonly [TicketType, string]> = [
  ["api", "Consume la API de regalos y cuenta los pendientes"],
  ["datos", "Normaliza cartas que llegan en tres formatos"],
  ["ia", "Clasifica cartas con el modelo elfo-mini"],
  ["algo", "El trineo carga 100 kg: elige qué regalos van"],
  ["minigame", "El Wordle de los elfos"],
  ["api", "Pagina el listado de 40.000 niños"],
  ["ia", "Haz que el modelo responda en JSON válido"],
  ["datos", "Detecta cartas duplicadas"],
  ["api", "Avisa al almacén con un webhook cuando sale un pedido"],
  ["minigame", "Misterio en el almacén"],
  ["algo", "Ruta más corta entre 12 ciudades nevadas"],
  ["api", "La API de regalos falla a ratos"],
  ["ia", "Resume cartas largas sin pasarte de tokens"],
  ["api", "Caché para no repetir llamadas caras"],
  ["minigame", "Revisa el PR de un elfo"],
  ["ia", "Búsqueda semántica en el catálogo de juguetes"],
  ["algo", "Turnos de elfos sin solapes"],
  ["ia", "Lee la respuesta del modelo en streaming"],
  ["api", "Límite de peticiones por elfo"],
  ["minigame", "Defiende al asistente de cartas trampa"],
  ["datos", "Calcula el coste en tokens de la campaña"],
  ["ia", "Un agente que consulta stock y reserva"],
  ["algo", "Plan de reparto por husos horarios"],
  ["api", "Nochebuena: todo el sistema en producción"],
];

export const CATALOG: readonly TicketMeta[] = ENTRIES.map(([type, title], index) => ({
  day: index + 1,
  id: `NP-${String(index + 1).padStart(3, "0")}`,
  type,
  title,
}));

export function getTicketMeta(day: number): TicketMeta | undefined {
  return CATALOG[day - 1];
}

import { pick, seededRandom } from "./random";
import type { GiftCounts } from "./scenarios";

export type GiftState = "pendiente" | "entregado";

export interface Gift {
  id: string;
  nino: string;
  juguete: string;
  peso_kg: number;
  estado: GiftState;
}

const NAMES = [
  "Lucía",
  "Hugo",
  "Martina",
  "Leo",
  "Sofía",
  "Mateo",
  "Julia",
  "Daniel",
  "Valeria",
  "Pablo",
  "Emma",
  "Álvaro",
  "Carla",
  "Marco",
  "Noa",
  "Bruno",
] as const;

const TOYS: ReadonlyArray<readonly [string, number]> = [
  ["Patinete", 4.5],
  ["Puzle de 1000 piezas", 0.9],
  ["Tren de madera", 2.1],
  ["Cometa", 0.6],
  ["Telescopio", 3.8],
  ["Balón", 0.45],
  ["Kit de robótica", 1.7],
  ["Muñeca de trapo", 0.5],
  ["Bicicleta", 11],
  ["Juego de mesa", 1.2],
];

/** Lista de regalos determinista: la misma semilla da siempre los mismos regalos, en el mismo orden. */
export function generateGifts(seed: string, { pending, delivered }: GiftCounts): Gift[] {
  const random = seededRandom(`gifts:${seed}`);
  const states: GiftState[] = [
    ...Array<GiftState>(pending).fill("pendiente"),
    ...Array<GiftState>(delivered).fill("entregado"),
  ];
  // Mezcla Fisher-Yates para que los estados no vengan agrupados.
  for (let i = states.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [states[i], states[j]] = [states[j] as GiftState, states[i] as GiftState];
  }
  return states.map((estado, index) => {
    const [juguete, peso] = pick(TOYS, random);
    return {
      id: `R-${String(index + 1).padStart(4, "0")}`,
      nino: pick(NAMES, random),
      juguete,
      peso_kg: peso,
      estado,
    };
  });
}

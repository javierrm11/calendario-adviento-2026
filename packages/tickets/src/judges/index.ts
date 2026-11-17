import type { Judge } from "../types";
import { np001 } from "./np-001";

/** Un juez por ticket. Añadir un ticket = añadir su contenido en content/ y su juez aquí. */
export const JUDGES: Readonly<Record<string, Judge>> = {
  "NP-001": np001,
};

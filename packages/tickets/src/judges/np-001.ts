import { giftCounts } from "@np/shared";
import type { Judge } from "../types";

/** NP-001: cuántos regalos pendientes hay. */
export const np001: Judge = {
  expected: ({ scenario, seed }) => giftCounts(scenario, seed).pending,
  explain: ({ scenario, seed }, got) => {
    const { pending, delivered } = giftCounts(scenario, seed);
    if (got === pending + delivered) {
      return `Esperaba ${pending} y has devuelto ${got}. Sin ?estado=pendiente también cuentas los entregados.`;
    }
    return undefined;
  },
};

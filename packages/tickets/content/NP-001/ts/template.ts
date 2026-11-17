// NP-001: cuenta los regalos pendientes
// NP_API_URL y NP_TOKEN ya están definidas cuando se ejecuta tu código.

type Regalo = { id: string; nino: string; juguete: string; peso_kg: number; estado: string };

async function contarPendientes(): Promise<number> {
  // TODO: pide GET /v1/regalos?estado=pendiente con tu token
  // y devuelve cuántos regalos hay.
  throw new Error("Sin implementar");
}

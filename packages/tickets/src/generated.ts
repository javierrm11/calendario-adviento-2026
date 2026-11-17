// Generado por scripts/generate.mjs a partir de content/. No lo edites a mano.
import type { TicketContent } from "./types";

export const CONTENT: Record<string, TicketContent> = {
  "NP-001": {
    "id": "NP-001",
    "statement": "**Berta Llorens**, jefa de almacén, abrió este ticket a las 6:00.\n\n## Qué pasa\n\nCada mañana el almacén necesita saber cuántos regalos quedan por preparar. Hasta ahora un elfo los contaba a mano, pero la lista ya está en la API de regalos.\n\n## Qué tiene que hacer la función\n\n- Pide `GET /v1/regalos?estado=pendiente` a la API del Polo Norte.\n- Manda tu token en la cabecera `Authorization: Bearer <token>`.\n- Devuelve cuántos regalos pendientes hay.\n\n## La llamada\n\n```http\nGET /v1/regalos?estado=pendiente\nAuthorization: Bearer <token de tu cuenta>\n```\n\nLa respuesta es una lista de regalos:\n\n```json\n[\n  { \"id\": \"R-0001\", \"nino\": \"Lucía\", \"juguete\": \"Patinete\", \"peso_kg\": 4.5, \"estado\": \"pendiente\" }\n]\n```\n\n`NP_API_URL` y `NP_TOKEN` ya están definidas cuando se ejecuta tu código. Cada test usa datos distintos, así que tu función tiene que pedirlos a la API.",
    "hint": "Sin el filtro `?estado=pendiente`, la API devuelve también los regalos entregados. Pide la lista ya filtrada y cuenta cuántos elementos tiene.",
    "tests": [
      {
        "name": "Cuenta los regalos pendientes",
        "scenario": "pendientes-varios"
      },
      {
        "name": "Devuelve 0 si no hay pendientes",
        "scenario": "pendientes-ninguno"
      },
      {
        "name": "Funciona con más de 100 regalos",
        "scenario": "pendientes-muchos"
      }
    ],
    "languages": {
      "js": {
        "template": "// NP-001: cuenta los regalos pendientes\n// NP_API_URL y NP_TOKEN ya están definidas cuando se ejecuta tu código.\n\nasync function contarPendientes() {\n  // TODO: pide GET /v1/regalos?estado=pendiente con tu token\n  // y devuelve cuántos regalos hay.\n  throw new Error(\"Sin implementar\");\n}\n",
        "reference": "async function contarPendientes() {\n  const res = await fetch(`${NP_API_URL}/v1/regalos?estado=pendiente`, {\n    headers: { Authorization: `Bearer ${NP_TOKEN}` },\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  const regalos = await res.json();\n  return regalos.length;\n}\n",
        "call": "contarPendientes()"
      },
      "ts": {
        "template": "// NP-001: cuenta los regalos pendientes\n// NP_API_URL y NP_TOKEN ya están definidas cuando se ejecuta tu código.\n\ntype Regalo = { id: string; nino: string; juguete: string; peso_kg: number; estado: string };\n\nasync function contarPendientes(): Promise<number> {\n  // TODO: pide GET /v1/regalos?estado=pendiente con tu token\n  // y devuelve cuántos regalos hay.\n  throw new Error(\"Sin implementar\");\n}\n",
        "reference": "type Regalo = { id: string; nino: string; juguete: string; peso_kg: number; estado: string };\n\nasync function contarPendientes(): Promise<number> {\n  const res = await fetch(`${NP_API_URL}/v1/regalos?estado=pendiente`, {\n    headers: { Authorization: `Bearer ${NP_TOKEN}` },\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  const regalos = (await res.json()) as Regalo[];\n  return regalos.length;\n}\n",
        "call": "contarPendientes()"
      },
      "py": {
        "template": "# NP-001: cuenta los regalos pendientes\n# NP_API_URL y NP_TOKEN ya están definidas cuando se ejecuta tu código.\nimport json\nimport urllib.request\n\n\ndef contar_pendientes() -> int:\n    # TODO: pide GET /v1/regalos?estado=pendiente con tu token\n    # y devuelve cuántos regalos hay.\n    raise NotImplementedError(\"Sin implementar\")\n",
        "reference": "import json\nimport urllib.request\n\n\ndef contar_pendientes() -> int:\n    peticion = urllib.request.Request(\n        f\"{NP_API_URL}/v1/regalos?estado=pendiente\",\n        headers={\"Authorization\": f\"Bearer {NP_TOKEN}\"},\n    )\n    with urllib.request.urlopen(peticion) as respuesta:\n        return len(json.load(respuesta))\n",
        "call": "contar_pendientes()"
      }
    }
  }
};

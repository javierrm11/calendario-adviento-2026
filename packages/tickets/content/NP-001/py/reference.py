import json
import urllib.request


def contar_pendientes() -> int:
    peticion = urllib.request.Request(
        f"{NP_API_URL}/v1/regalos?estado=pendiente",
        headers={"Authorization": f"Bearer {NP_TOKEN}"},
    )
    with urllib.request.urlopen(peticion) as respuesta:
        return len(json.load(respuesta))

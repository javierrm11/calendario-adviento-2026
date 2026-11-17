**Berta Llorens**, jefa de almacén, abrió este ticket a las 6:00.

## Qué pasa

Cada mañana el almacén necesita saber cuántos regalos quedan por preparar. Hasta ahora un elfo los contaba a mano, pero la lista ya está en la API de regalos.

## Qué tiene que hacer la función

- Pide `GET /v1/regalos?estado=pendiente` a la API del Polo Norte.
- Manda tu token en la cabecera `Authorization: Bearer <token>`.
- Devuelve cuántos regalos pendientes hay.

## La llamada

```http
GET /v1/regalos?estado=pendiente
Authorization: Bearer <token de tu cuenta>
```

La respuesta es una lista de regalos:

```json
[
  { "id": "R-0001", "nino": "Lucía", "juguete": "Patinete", "peso_kg": 4.5, "estado": "pendiente" }
]
```

`NP_API_URL` y `NP_TOKEN` ya están definidas cuando se ejecuta tu código. Cada test usa datos distintos, así que tu función tiene que pedirlos a la API.

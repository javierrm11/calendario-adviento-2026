# DevAdviento · Calendario de adviento de programación (by Molero)

Calendario de adviento para la comunidad: 24 tickets del 1 al 24 de diciembre, con trabajo práctico de empresa (integrar APIs, conectar un modelo de IA, procesar datos) y algún algoritmo. Público: gente que programa o empieza y usa IA a diario. Interfaz en español.

## Glosario

Usa siempre estas palabras, en el código y en la interfaz.

- **Ticket**: el reto de un día (`NP-001`…`NP-024`).
- **Minijuego**: reto extra de los días 5, 10, 15 y 20. Da una insignia, no estrellas.
- **Estrella (★)**: puntos de un ticket. Fácil 1, Media 2, Difícil 3; la pista resta 0,5.
- **Mejor lenguaje**: el lenguaje en el que el usuario tiene más estrellas. Su puntuación es la de ese lenguaje.
- **Racha**: días seguidos con al menos un ticket resuelto.
- **Pista**: ayuda opcional de un ticket.
- **API del Polo Norte**: API simulada que usan los tickets en vez de un proveedor real.
- **Caso**: cada test de un ticket. Tiene nombre, escenario de la API y una semilla nueva en cada ejecución.
- **Ejecución**: un intento de «Ejecutar tests». El servidor la firma, caduca a los 5 minutos y solo se puede enviar una vez.
- **Ejecutor**: el Web Worker del navegador que ejecuta el código del usuario.
- **Juez**: la función del servidor que calcula la respuesta correcta de cada caso. Nunca sale del servidor.

## Producto (decisiones cerradas)

- Cada día se abre un ticket a las 6:00 (hora de España).
- Lenguajes: **JavaScript, TypeScript y Python** (C y C++ descartados). Un ticket se puede resolver en varios lenguajes.
- El código se ejecuta **en el navegador** de cada participante y el **servidor juzga** las respuestas. No hay servidor de ejecución.
- **Puntuación = estrellas del mejor lenguaje**, no la suma de todos. La velocidad nunca puntúa.
- Login **solo con GitHub**.
- Los tickets llaman a la API del Polo Norte. Nunca se pide una API key de un proveedor real.
- Nombre: **DevAdviento** (dominios previstos: `devadviento.dev` y `devadviento.com`). Es un proyecto de la marca **Molero**, que aparece en el calendario, en "Cómo funciona" y en el pie. El logo definitivo está pendiente.
- El título para buscadores lleva siempre «calendario de adviento de programación»: es lo que busca la gente.
- «API del Polo Norte» es parte del cuento de los tickets, no la marca. Por eso el código interno conserva `NP` (`@np/*`, `NP_…`, `NP-001`) y la carpeta `northpole/`.
- Navegación: Calendario (inicio) · Ticket de hoy · Perfil · Cómo funciona.

## Diseño (decisiones cerradas)

- Referencia visual: `diseno/northpole-prototipo.html`, diseño **Fotos reales** y paleta **Nochebuena (oscura)**. Si el código y el prototipo no coinciden, manda el prototipo, salvo que el usuario diga otra cosa.
- Los días del calendario muestran solo: número, etiqueta de dificultad, foto y estado (★, «Hoy», «Sin resolver», candado). **No llevan títulos ni descripción, y el calendario no lleva leyenda.**
- Los días bloqueados se muestran en blanco y negro. El de hoy lleva un halo dorado.
- Etiquetas de dificultad (iguales en cualquier paleta): Fácil `#9BE3A5`/`#0E3A18`, Media `#FFD36B`/`#4A3000`, Difícil `#FF8F86`/`#5A0D0D`, Extra `#C9D4FF`/`#1C2A66`, con 1 a 3 puntos.
- Tipografías: Young Serif (títulos), Figtree (texto) y JetBrains Mono (código). Se sirven desde el propio dominio, sin cargarlas de Google en tiempo de ejecución.
- Fotos: `diseno/fotos/`, todas CC0 o CC BY. Cualquier foto nueva necesita licencia libre y una entrada en `creditos.json`. Nunca se usan fotos de Google Imágenes.

## Stack (decidido)

TypeScript en todo, para compartir tipos, datos y lógica entre la web y la API.

- **Web:** Next.js (App Router) + TypeScript, desplegada en Vercel.
- **Datos y login:** Supabase (Postgres + Auth con GitHub).
- **API del Polo Norte:** Hono + TypeScript en Cloudflare Workers.
- **Ejecución:** en el navegador, con Web Workers. JavaScript directamente, TypeScript quitando los tipos con Sucrase y Python con Pyodide 0.29.5 desde el CDN de jsDelivr. Cada motor se descarga solo al elegir su lenguaje. **No hay VPS.**
- **Monorepo** con pnpm workspaces:
  - `apps/web`
  - `apps/api`
  - `packages/shared`: tipos, datos públicos de los días, lógica de dominio y generadores de datos de la API.
  - `packages/ui`: tokens y componentes.
  - `packages/tickets`: contenido y jueces (solo servidor) y el constructor de programas (`@np/tickets/program`, seguro para el navegador).

## Principios de código

### Reutilizar antes de crear

- Antes de escribir un componente, hook, utilidad o estilo, busca si ya existe uno igual o parecido y extiéndelo.
- Regla de dos: si algo aparece dos veces, se extrae.
- Los colores, espacios, radios y tipografías salen siempre de los **tokens de diseño** (variables CSS). Ningún componente usa colores literales. Las únicas excepciones son las etiquetas de dificultad y el botón de GitHub, que son tokens propios.

### Extensible por datos, no por código

- Los días, los lenguajes, los niveles, los tipos de ticket y las insignias se definen como **datos tipados** en un solo sitio.
- Añadir un lenguaje, un día o una insignia tiene que ser añadir una entrada, sin tocar componentes.
- La lógica de dominio (puntuación, mejor lenguaje, rachas, desbloqueo) son **funciones puras con tests** en `packages/shared`, compartidas entre la web y la API.
- Los textos de la interfaz viven en un archivo de mensajes, nunca sueltos dentro de los componentes.

### Legible

- Identificadores en inglés y textos de la interfaz en español.
- Funciones cortas que hacen una sola cosa. Los nombres explican el qué; los comentarios, solo el porqué.
- TypeScript en modo `strict`. Nada de `any` sin justificarlo en un comentario.
- No se añade una dependencia si se resuelve con pocas líneas propias. Cada dependencia nueva se justifica en el PR.

### Lo que no se hace en este proyecto

- No pedir datos con `useEffect` si se pueden obtener en el servidor.
- No encadenar peticiones una detrás de otra: se lanzan en paralelo o se resuelven en el servidor.
- `"use client"` solo en los componentes que lo necesitan, y lo más abajo posible del árbol.
- No usar spinners ni cargas que mueven el diseño (ver «Cargas sin saltos»).
- Nada de librerías de UI pesadas ni CSS-in-JS en tiempo de ejecución.

## Rendimiento (requisito, no opción)

La web tiene que sentirse **instantánea**: cambiar de pestaña no puede tardar más de unos 100 ms percibidos.

**Presupuestos por ruta:**

- LCP < 1,5 s en 4G.
- **CLS < 0,05** (objetivo 0).
- INP < 100 ms.
- JS inicial < 100 KB gzip.

**Cómo se consigue:**

- **Prefetch** de las cuatro pestañas en cuanto la cabecera es visible. Los datos ya cargados se reutilizan desde caché del cliente; nunca se vuelven a pedir al volver a una pestaña.
- El calendario y "Cómo funciona" se sirven **estáticos desde CDN** y se regeneran al cambiar de día. El estado del usuario (estrellas, hechos) se pinta encima sin bloquear.
- **UI optimista** en las acciones del usuario (pistas, filtros, cambiar de lenguaje).

**Cargas sin saltos (skeletons):**

- Cada vista con datos remotos tiene un skeleton con **las mismas dimensiones exactas** que el contenido final: filas de altura fija, círculos para avatares y barras para textos y números.
- El skeleton solo aparece si la carga pasa de unos 150 ms, para evitar parpadeos.
- Se reserva siempre el espacio de imágenes, avatares y fotos (`width`/`height` o `aspect-ratio`).
- Las fuentes llevan métricas de fallback ajustadas (`size-adjust`) para que el cambio de fuente no mueva nada.
- Nunca se inserta contenido encima de lo que ya se ve. Banners, avisos y toasts van en capas fijas.

**Imágenes:**

- AVIF o WebP, con tamaños por celda (`srcset`/`sizes`).
- Carga diferida salvo la primera fila del calendario.
- Mientras carga, el hueco se pinta con el color dominante de la foto.

## Fechas y desbloqueo

- Zona horaria única: `Europe/Madrid`. El ticket del día N se abre el N de diciembre a las 6:00 en esa zona.
- **El servidor decide qué está desbloqueado.** El cliente solo pinta lo que recibe; nunca usa el reloj del navegador para dar acceso.
- La regla vive en una función pura de `packages/shared`, con tests de los bordes: 5:59:59, 6:00:00, día 1 y día 24.
- En desarrollo la fecha se simula con `NP_FECHA_SIMULADA` (no con parámetros en la URL: las páginas son estáticas). En producción no tiene efecto.

## Contenido futuro: nunca antes de tiempo

- El enunciado, las plantillas y los tests de ejemplo de un día bloqueado **no pueden aparecer** en el JS, en el HTML estático ni en ninguna respuesta de la API.
- El contenido de los tickets vive solo en el servidor. Ningún componente de cliente lo importa.
- De un día bloqueado solo es público: número, nivel y foto.

## Puntuación y trampas

- **Nivel de protección aceptado: difícil, no imposible.** El código corre en el navegador, así que no se puede impedir del todo; se impide lo fácil.
- **Las respuestas correctas solo existen en el servidor** (los jueces). El navegador recibe casos (nombre y URL de la API), nunca lo que tiene que salir.
- **Cada ejecución usa semillas nuevas:** los datos cambian en cada intento, así que no se pueden memorizar respuestas.
- **Las ejecuciones van firmadas**, caducan (`RUN_TTL_MS`) y solo se pueden enviar una vez (`submissions.run_id` es único).
- La puntuación se calcula **solo en el servidor** y es idempotente: cada combinación de usuario, día y lenguaje puntúa una sola vez, y reenviar no suma.
- Usar una pista se registra en el servidor antes de mostrarla.
- Hay límite de envíos por usuario y minuto (el valor está por decidir).
- Para aparecer en la clasificación, la cuenta de GitHub necesita una antigüedad mínima (el valor está por decidir).

## Formato de un ticket

Cada ticket es un paquete de datos:

| Campo              | Dónde                             | Contenido                                                                                                                            |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Datos públicos     | `packages/shared/src/days.ts`     | Día, nivel y foto                                                                                                                    |
| Catálogo           | `packages/tickets/src/catalog.ts` | Id, tipo y título (solo servidor)                                                                                                    |
| Casos              | `content/NP-XXX/ticket.json`      | Nombre de cada test y escenario de la API que usa                                                                                    |
| Enunciado y pista  | `statement.md`, `hint.md`         | Markdown escrito como un ticket real: quién lo abre, qué pasa y criterios de aceptación                                              |
| Por lenguaje       | `js/`, `ts/`, `py/`               | `template` (falla), `reference` (pasa) y `call`: una expresión que llama a la función del usuario. TypeScript reutiliza el `call.js` |
| Juez               | `packages/tickets/src/judges/`    | Calcula la respuesta correcta de un caso a partir de su escenario y su semilla. Si puede, explica el error típico                    |
| API del Polo Norte | `packages/shared/src/northpole/`  | Escenarios: datos generados por semilla y fallos simulados                                                                           |

**Antes de publicar un ticket:**

- [ ] Hay una solución de referencia en los 3 lenguajes y pasa todos los tests (`pnpm tickets:verify`).
- [ ] La plantilla inicial falla los tests.
- [ ] El juez explica el error típico (por ejemplo, olvidar el filtro o ignorar `Retry-After`).
- [ ] Una persona lo ha resuelto en el tiempo que marca su nivel (10, 20 o 30 min).
- [ ] El enunciado no menciona nada de un ticket futuro.

## API del Polo Norte

- **Formato compatible con OpenAI** (`/v1/chat/completions`, `/v1/embeddings`), más los endpoints del dominio (`/v1/regalos`, etc.).
- **Determinista:** la misma petición con el mismo caso da siempre la misma respuesta. `/c/<caso>/v1/...` sirve los datos de un caso (escenario + semilla); `/v1/...` es de uso libre.
- **Fallos simulados por escenario:** 429 con `Retry-After` y 503 en orden. El contador está en memoria: en Cloudflare hay que pasarlo a un Durable Object antes del primer ticket con fallos en secuencia.
- **Versionada:** una versión publicada (`/v1`) nunca cambia de comportamiento; los cambios van en una versión nueva.
- **Autenticación** con el token de la cuenta del calendario. **CORS abierto**, porque la llama el navegador de cada participante.

## Tests

- **Unitarios (Vitest)** para todo `packages/shared`: puntuación, mejor lenguaje, rachas y desbloqueo.
- **De punta a punta (Playwright)** para los flujos clave: entrar con GitHub (simulado), abrir el ticket de hoy, enviar una solución y ver la estrella, y ver la clasificación.
- **Lighthouse en la integración continua** con los presupuestos de rendimiento. Si un cambio los rompe, el CI falla.
- Cada ticket se verifica con `pnpm tickets:verify`: ejecuta referencia y plantilla contra la API real y las juzga con su juez.

## Textos de la interfaz

- Se tutea, en español de España. Frases cortas y verbos claros. Sin emojis en la interfaz.
- Cada botón dice lo que hace («Ejecutar tests», «Entrar con GitHub»), y la misma acción se llama igual en todo el flujo.
- Los errores dicen qué ha pasado y cómo arreglarlo, sin disculpas ni vaguedades.

## Accesibilidad, seguridad y privacidad

- Foco visible, navegación completa con teclado, `prefers-reduced-motion` y contraste AA en todas las paletas.
- El código de los usuarios **solo** se ejecuta en su propio navegador (Web Worker), nunca en el servidor ni en la API.
- Los secretos solo viven en el servidor.
- OAuth de GitHub con el permiso mínimo (`read:user`). De GitHub solo se guarda lo necesario: id, usuario, nombre, avatar y fecha de creación de la cuenta.

## Cómo trabajar en este repo

1. Lee este archivo y el prototipo antes de tocar la interfaz.
2. Busca reutilizar (ver arriba) antes de crear archivos nuevos.
3. Antes de dar algo por terminado: `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde. En cambios de interfaz, comprueba que no hay saltos de diseño (CLS) y que cambiar de pestaña sigue siendo inmediato.
4. Si una decisión de producto o diseño cambia, actualiza este archivo en el mismo cambio.

### Comandos

| Comando                     | Qué hace                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm install`              | Instala todo el monorepo (Node 22, pnpm 10)                                                                  |
| `pnpm dev`                  | Web (localhost:3000) y API del Polo Norte (localhost:8787)                                                   |
| `pnpm lint` / `pnpm format` | Biome: comprueba / arregla formato y lint                                                                    |
| `pnpm typecheck`            | TypeScript en todos los paquetes                                                                             |
| `pnpm test`                 | Vitest en `shared`, `api` y `tickets`                                                                        |
| `pnpm build`                | Compila la web y el paquete de la API                                                                        |
| `pnpm db:migrate`           | Aplica las migraciones pendientes (`migrations/1.sql`, `2.sql`…) en orden                                    |
| `pnpm tickets:generate`     | Regenera `packages/tickets/src/generated.ts` tras tocar `content/`                                           |
| `pnpm tickets:verify`       | Ejecuta referencia y plantilla de cada ticket contra la API y las juzga (Python necesita `python` instalado) |

### Migraciones

- Una migración por archivo en `migrations/`, numeradas: `1.sql`, `2.sql`… Nunca se edita una migración ya aplicada: los cambios van en la siguiente.
- `pnpm db:migrate` guarda las aplicadas en `public.schema_migrations`.

### Variables de entorno

Todas están en `.env.example`. La web lee `apps/web/.env.local`; la API y las migraciones, el `.env` de la raíz.

- **Públicas:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Secretas (solo servidor):** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` y `NP_TOKEN_SECRET` (compartido entre web y API).
- **Del servidor, pero no secreta:** `NP_API_URL`, la URL pública de la API, que el servidor pone en cada caso.
- **Desarrollo:** `NP_FECHA_SIMULADA` simula la fecha (por ejemplo `2026-12-12T07:00:00+01:00`). No tiene efecto en producción.

### Dónde va cada cosa

- **`apps/web/app/`**: rutas.
  - `page.tsx`: el calendario, estático.
  - `ticket/`: el ticket de hoy y cada día, generados al pedirlos.
  - `perfil/`: perfil y clasificación, dinámicas.
  - `como-funciona/`.
  - `api/`: `runs` (prepara una ejecución), `submissions` (juzga y puntúa) y `hints`.
  - `auth/`: login con GitHub.
- **`apps/web/components/`**: componentes por pantalla (`calendar/`, `ticket/`, `profile/`, `layout/`).
- **`apps/web/lib/`**:
  - `messages.ts`: **todos** los textos de la interfaz.
  - `progress.ts`: sesión y progreso en el navegador.
  - `server/`: solo servidor (`server-only`): fecha, tickets, ejecuciones (`runs.ts`) y clasificación.
  - `runner/`: el ejecutor del navegador. `run-code.ts` lanza los Workers con límite de tiempo; `js-worker.ts` y `py-worker.ts` son los propios Workers.
  - `supabase/`: clientes de Supabase.
- **`packages/shared/src/`**: datos públicos de los días, lenguajes, niveles, puntuación, rachas, insignias, desbloqueo, firmas (tokens y ejecuciones) y `northpole/` (escenarios y generadores de datos de la API), todo con tests.
- **`packages/ui/src/`**: `tokens.css` (paleta Nochebuena), `components.css` y componentes (`LevelTag`, `Skeleton*`, `Avatar`, `Stars`).
- **`packages/tickets/`**:
  - `content/NP-XXX/`: el contenido de cada ticket (ver «Formato de un ticket»).
  - `src/judges/`: un juez por ticket, registrado en `judges/index.ts`.
  - `src/catalog.ts`: tipo y título de los 24 días.
  - `src/program.ts`: une constantes, código del usuario y llamada a cada caso. Lo usan el navegador y el verificador.
- **`apps/api/src/`**: la API del Polo Norte (Hono): regalos por caso (`app.ts`), fallos en orden (`failures.ts`) y modelo simulado `elfo-mini` (`model.ts`). `worker.ts` es la entrada de Cloudflare y `node.ts` la de Node, para desarrollo local.

### Cómo funciona un envío

1. **Preparar (`POST /api/runs`).** El servidor comprueba la sesión, que el día esté abierto y el límite por minuto. Crea los casos con semillas nuevas y devuelve:
   - la ejecución firmada;
   - el token de la API;
   - la expresión `call`;
   - la URL de cada caso (`NP_API_URL/c/<caso>`).
2. **Ejecutar (navegador).** El Web Worker monta el programa (`buildJsProgram` / `buildPythonProgram`). Para cada caso apunta `NP_API_URL` a su URL, llama a la función del usuario y recoge el valor o el error. Tiene un límite de 15 s; la primera carga de Python, 90 s.
3. **Juzgar (`POST /api/submissions`).** El servidor:
   - verifica la firma, la caducidad y que la ejecución sea del usuario;
   - calcula con el juez la respuesta correcta de cada caso y compara;
   - guarda el envío (`run_id` único: no se puede reenviar);
   - si pasan todos los tests, inserta en `solves` con `ON CONFLICT DO NOTHING`, así que repetir no suma.

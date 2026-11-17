# Pendiente

Lo que falta para abrir NorthPole Inc. el 1 de diciembre a las 6:00. Primero lo que solo puedes hacer tú (cuentas, claves y decisiones); al final, lo que falta de desarrollo, que te puedo hacer yo.

## 1. Cuentas y configuración (solo tú)

### Repositorio

- [ ] `git init`, primer commit y subirlo a un repositorio **privado** de GitHub. Vercel despliega desde ahí.

### Secreto compartido

- [ ] Genera `NP_TOKEN_SECRET` con:

  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Usa el **mismo valor** en la web (Vercel) y en la API (Cloudflare). Si no coinciden, ninguna ejecución funciona.

### Supabase (base de datos y login)

- [ ] Crea un proyecto en [supabase.com](https://supabase.com). Región en Europa (Frankfurt o Irlanda).
- [ ] Crea una **OAuth App en GitHub**: Settings → Developer settings → OAuth Apps → New OAuth App.
  - Homepage URL: tu dominio (o `http://localhost:3000` mientras tanto).
  - Authorization callback URL: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
- [ ] En Supabase → Authentication → Providers → **GitHub**: actívalo y pega el Client ID y el Client Secret de la OAuth App.
- [ ] En Supabase → Authentication → URL Configuration:
  - Site URL: tu dominio de producción.
  - Redirect URLs: `http://localhost:3000/auth/callback` y `https://<tu-dominio>/auth/callback`.
- [ ] Copia las claves (Project Settings → API Keys y Database → Connection string):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (la secreta)
  - `DATABASE_URL`. Si tu red no tiene IPv6, usa la del Session pooler.
- [ ] Crea las tablas: pon `DATABASE_URL` en el `.env` de la raíz y ejecuta `pnpm db:migrate`.

### Cloudflare (API del Polo Norte)

- [ ] Crea una cuenta gratuita en [cloudflare.com](https://cloudflare.com).
- [ ] Desde la raíz del repo:

  ```
  pnpm --filter @np/api exec wrangler login
  pnpm --filter @np/api exec wrangler secret put NP_TOKEN_SECRET
  pnpm --filter @np/api deploy
  ```
- [ ] Apunta la URL que te da (`https://northpole-api.<tu-cuenta>.workers.dev`). Va en `NP_API_URL` de la web. Si quieres, ponle un dominio propio (por ejemplo `api.tu-dominio`).

### Vercel (la web)

- [ ] Importa el repositorio en [vercel.com](https://vercel.com) con **Root Directory: `apps/web`**.
- [ ] Añade las variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NP_TOKEN_SECRET`
  - `NP_API_URL`
- [ ] Conecta tu dominio.
- [ ] **Revisa el plan.** Hobby es gratis pero solo para uso no comercial, y con Molero de patrocinador probablemente no encaje. Las opciones son Pro (20 $/mes) o desplegar en Cloudflare con OpenNext, que es gratis y lo puedo preparar yo.

### En tu ordenador

- [ ] Copia `.env.example` como `.env` (raíz) y como `apps/web/.env.local`, y rellénalos.
- [ ] Para ver un día abierto antes de diciembre, añade en `apps/web/.env.local`:

  ```
  NP_FECHA_SIMULADA=2026-12-01T07:00:00+01:00
  ```
- [ ] `pnpm dev` y abre `http://localhost:3000`.

## 2. Probar antes de abrir

Todo esto está verificado con tests, pero no con un navegador de verdad (ni con Supabase real):

- [ ] Entrar con GitHub, ver tu avatar en la cabecera y cerrar sesión.
- [ ] Abrir NP-001 y ejecutarlo en **JavaScript, TypeScript y Python** con una solución correcta y otra incorrecta. Python es lo que menos garantías tiene en el navegador: la primera vez descarga Pyodide (~8 MB).
- [ ] Comprobar que la estrella aparece en el calendario y en el perfil, y que repetir el ticket no suma.
- [ ] Ver la clasificación con dos cuentas distintas.
- [ ] Probar en el móvil (Android e iPhone), sobre todo Python.
- [ ] Pasar Lighthouse al calendario y al ticket. Objetivos: CLS < 0,05, LCP < 1,5 s y cambio de pestaña inmediato.
- [ ] Resolver NP-001 tú mismo con el cronómetro. Tiene que salir en unos 10 minutos.

## 3. Decisiones que te tocan

- [ ] **Límite de ejecuciones por minuto.** Ahora es 6, provisional (`packages/shared/src/config.ts`).
- [ ] **Antigüedad mínima de la cuenta de GitHub** para salir en la clasificación. Ahora no hay requisito. Unos 30 días frenan las cuentas falsas.
- [ ] **Logo y colores de Molero.** Pásame el SVG o PNG; ahora hay un monograma provisional.
- [ ] **Dominio** de la web y, si quieres, de la API.
- [ ] **Qué son los 4 minijuegos** (días 5, 10, 15 y 20). Hay títulos provisionales, pero no están diseñados ni montados.
- [ ] **Qué pasa después del 24:** ¿el calendario sigue abierto para practicar? ¿La clasificación se congela?
- [ ] **Textos legales:** página de privacidad (qué se guarda de GitHub: id, usuario, nombre, avatar y fecha de la cuenta) y aviso legal. Las cookies son solo las de sesión.

## 4. Contenido: lo más grande que falta

Solo está escrito **NP-001**. Faltan **19 tickets** (días 2-4, 6-9, 11-14, 16-19 y 21-24) y los **4 minijuegos**. Los títulos y tipos provisionales están en `packages/tickets/src/catalog.ts`.

Cada ticket necesita:

- Enunciado y pista.
- Plantilla y solución en los 3 lenguajes.
- Sus casos.
- Su juez.
- Si hace falta, escenarios nuevos en la API.

Puedo escribirlos yo. Lo tuyo sería revisarlos y resolver cada uno con el cronómetro (es la casilla «una persona lo ha resuelto» del CLAUDE.md). Con dos semanas, conviene tener cerrada al menos la **primera semana (días 1-7)** antes del 1 de diciembre e ir escribiendo el resto durante el mes: cada día solo tiene que estar listo antes de su 6:00.

## 5. Desarrollo que falta (te lo hago yo cuando me digas)

- [ ] **Fallos en secuencia en Cloudflare:** pasar el contador de fallos de la API a un Durable Object. Hace falta antes del primer ticket con 429/503 en orden (por ejemplo, «La API de regalos falla a ratos», día 12).
- [ ] **Minijuegos:** montarlos cuando decidas qué son, más sus insignias (la tabla `user_badges` ya existe).
- [ ] **Tests de punta a punta** con Playwright y **Lighthouse en la integración continua**, como pide el CLAUDE.md.
- [ ] **Integración continua** (GitHub Actions): lint, tipos, tests y `tickets:verify` en cada push.
- [ ] **Página de privacidad** con el texto que decidas.
- [ ] **Despliegue en Cloudflare con OpenNext**, si prefieres no pagar Vercel Pro.

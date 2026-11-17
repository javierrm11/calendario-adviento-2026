// Aplica en orden las migraciones de migrations/ (1.sql, 2.sql…) que falten.
// Uso: DATABASE_URL=... pnpm db:migrate
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Cópiala de Supabase (Project Settings → Database) a tu .env.");
  process.exit(1);
}

const dir = join(import.meta.dirname, "..", "migrations");
const files = (await readdir(dir))
  .filter((name) => /^\d+\.sql$/.test(name))
  .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));

const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
  await sql`
    create table if not exists public.schema_migrations (
      version int primary key,
      applied_at timestamptz not null default now()
    )`;
  const applied = new Set(
    (await sql`select version from public.schema_migrations`).map((row) => row.version),
  );

  let count = 0;
  for (const file of files) {
    const version = Number.parseInt(file, 10);
    if (applied.has(version)) continue;
    const content = await readFile(join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`insert into public.schema_migrations (version) values (${version})`;
    });
    console.log(`Aplicada ${file}`);
    count++;
  }
  console.log(count ? `${count} migraciones aplicadas.` : "La base de datos ya estaba al día.");
} finally {
  await sql.end();
}

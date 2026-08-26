import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to run CMS migrations.");

const migrationsDirectory = path.join(process.cwd(), "supabase", "migrations");
const ssl = process.env.DATABASE_SSL === "disable" ? false : "require";
const sql = postgres(databaseUrl, { max: 1, ssl, idle_timeout: 20, connect_timeout: 20 });

try {
  await sql.unsafe("create schema if not exists cms_private");
  await sql.unsafe(`
    create table if not exists cms_private.schema_migrations (
      version text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();
  const appliedRows = await sql`select version, checksum from cms_private.schema_migrations`;
  const applied = new Map(appliedRows.map((row) => [row.version, row.checksum]));
  const supabaseHistoryExists = (await sql`select to_regclass('supabase_migrations.schema_migrations') as name`)[0]?.name;
  const supabaseVersions = new Set(supabaseHistoryExists ? (await sql`select version from supabase_migrations.schema_migrations`).map((row) => row.version) : []);

  for (const file of files) {
    const source = await readFile(path.join(migrationsDirectory, file), "utf8");
    const checksum = createHash("sha256").update(source).digest("hex");
    if (applied.has(file)) {
      if (applied.get(file) !== checksum) throw new Error(`Migration checksum changed after application: ${file}`);
      continue;
    }
    const version = file.split("_")[0];
    if (supabaseVersions.has(version)) {
      await sql`insert into cms_private.schema_migrations (version, checksum) values (${file}, ${checksum})`;
      process.stdout.write(`Adopted Supabase migration ${file}\n`);
      continue;
    }

    await sql.begin(async (transaction) => {
      await transaction`select pg_advisory_xact_lock(hashtext('liju-pankaj-cms-migrations'))`;
      await transaction.unsafe(source);
      await transaction`insert into cms_private.schema_migrations (version, checksum) values (${file}, ${checksum})`;
    });
    process.stdout.write(`Applied migration ${file}\n`);
  }

  const defaults = JSON.parse(await readFile(path.join(process.cwd(), "scripts", "cms-defaults.json"), "utf8"));
  await sql`update public.site_content set draft_content = ${sql.json(defaults.sections)} where singleton and draft_content = '{}'::jsonb`;
  await sql`update public.theme_settings set draft_theme = ${sql.json(defaults.theme)} where singleton and draft_theme = '{}'::jsonb`;
  await sql`update public.published_site set snapshot = ${sql.json(defaults.snapshot)} where singleton and revision = 0 and snapshot -> 'sections' = '{}'::jsonb`;
} finally {
  await sql.end({ timeout: 5 });
}

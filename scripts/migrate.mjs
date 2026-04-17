import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

// Run from repo root: DATABASE_URL=... pnpm migrate

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const version = "001_initial";

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const already = await client.query(
    "SELECT 1 FROM schema_migrations WHERE version = $1 LIMIT 1",
    [version],
  );
  if (already.rowCount > 0) {
    console.log(`Migration ${version} already recorded. Skipping.`);
    process.exit(0);
  }

  const usersExists = await client.query(
    `SELECT to_regclass('public.users') AS reg`,
  );
  if (usersExists.rows?.[0]?.reg) {
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [version]);
    console.log(`Migration ${version} appears already applied (users table exists). Recorded and skipping.`);
    process.exit(0);
  }

  const sql = readFileSync(join(root, "migrations", `${version}.sql`), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations(version) VALUES ($1)", [version]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
  console.log(`Migration ${version}.sql applied.`);
} finally {
  await client.end();
}

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
  const sql = readFileSync(join(root, "migrations", "001_initial.sql"), "utf8");
  await client.query(sql);
  console.log("Migration 001_initial.sql applied.");
} finally {
  await client.end();
}

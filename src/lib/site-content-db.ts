import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import type { SiteContent } from "@/types/store";

const siteContentJsonPath = path.join(process.cwd(), "src/data/site-content.json");

let pool: Pool | null = null;
let initialized = false;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

async function readSiteContentJson() {
  const data = await fs.readFile(siteContentJsonPath, "utf8");
  return JSON.parse(data) as SiteContent;
}

async function initializeSiteContentTable() {
  if (initialized || !isDatabaseConfigured()) {
    return;
  }

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_site_content (
      id INTEGER PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const countResult = await db.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM store_site_content");
  const total = Number.parseInt(countResult.rows[0]?.total ?? "0", 10);

  if (total === 0) {
    const payload = await readSiteContentJson();
    await db.query(
      `
        INSERT INTO store_site_content (id, payload)
        VALUES (1, $1::jsonb)
        ON CONFLICT (id) DO NOTHING
      `,
      [JSON.stringify(payload)]
    );
  }

  initialized = true;
}

export async function getSiteContentFromStore() {
  if (!isDatabaseConfigured()) {
    return readSiteContentJson();
  }

  await initializeSiteContentTable();
  const db = getPool();
  const result = await db.query<{ payload: SiteContent }>(
    `
      SELECT payload
      FROM store_site_content
      WHERE id = 1
      LIMIT 1
    `
  );

  const row = result.rows[0];

  if (!row) {
    const payload = await readSiteContentJson();
    await db.query(
      `
        INSERT INTO store_site_content (id, payload)
        VALUES (1, $1::jsonb)
        ON CONFLICT (id) DO NOTHING
      `,
      [JSON.stringify(payload)]
    );
    return payload;
  }

  return row.payload;
}

export async function updateSiteContentInStore(payload: SiteContent) {
  if (!isDatabaseConfigured()) {
    await fs.writeFile(siteContentJsonPath, JSON.stringify(payload, null, 2), "utf8");
    return payload;
  }

  await initializeSiteContentTable();
  const db = getPool();

  await db.query(
    `
      INSERT INTO store_site_content (id, payload, updated_at)
      VALUES (1, $1::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        updated_at = NOW()
    `,
    [JSON.stringify(payload)]
  );

  return payload;
}

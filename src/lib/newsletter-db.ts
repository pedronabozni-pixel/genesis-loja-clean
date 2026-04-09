import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import type { NewsletterLead } from "@/types/store";

const newsletterJsonPath = path.join(process.cwd(), "src/data/newsletter-leads.json");

let pool: Pool | null = null;
let initialized = false;

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /ENOTFOUND|ECONNREFUSED|DATABASE_URL|postgres\.railway\.internal/i.test(error.message);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  return databaseUrl;
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

async function readLegacyLeadsJson() {
  try {
    const data = await fs.readFile(newsletterJsonPath, "utf8");
    return JSON.parse(data) as NewsletterLead[];
  } catch {
    return [];
  }
}

async function writeLegacyLeadsJson(leads: NewsletterLead[]) {
  await fs.writeFile(newsletterJsonPath, JSON.stringify(leads, null, 2), "utf8");
}

async function initializeNewsletterDb() {
  if (initialized) return;

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS newsletter_leads (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const countResult = await db.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM newsletter_leads");
  const total = Number.parseInt(countResult.rows[0]?.total ?? "0", 10);

  if (total === 0) {
    const legacyLeads = await readLegacyLeadsJson();

    for (const lead of legacyLeads) {
      await db.query(
        `
          INSERT INTO newsletter_leads (email, created_at)
          VALUES ($1, $2)
          ON CONFLICT (email) DO NOTHING
        `,
        [lead.email.trim().toLowerCase(), lead.createdAt]
      );
    }
  }

  initialized = true;
}

export async function saveNewsletterLeadToDb(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const lead: NewsletterLead = {
    email: normalizedEmail,
    createdAt: new Date().toISOString()
  };

  if (!process.env.DATABASE_URL) {
    const legacyLeads = await readLegacyLeadsJson();
    const existingLead = legacyLeads.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail);

    if (existingLead) {
      return {
        email: existingLead.email.trim().toLowerCase(),
        createdAt: existingLead.createdAt
      } satisfies NewsletterLead;
    }

    await writeLegacyLeadsJson([lead, ...legacyLeads]);
    return lead;
  }

  try {
    await initializeNewsletterDb();
    const db = getPool();

    const existing = await db.query<{ email: string; created_at: string }>(
      `
        SELECT email, created_at
        FROM newsletter_leads
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existing.rows[0]) {
      return {
        email: existing.rows[0].email,
        createdAt: new Date(existing.rows[0].created_at).toISOString()
      } satisfies NewsletterLead;
    }

    await db.query(
      `
        INSERT INTO newsletter_leads (email, created_at)
        VALUES ($1, $2)
      `,
      [lead.email, lead.createdAt]
    );

    const legacyLeads = await readLegacyLeadsJson();
    const alreadySaved = legacyLeads.some((entry) => entry.email.trim().toLowerCase() === normalizedEmail);

    if (!alreadySaved) {
      await writeLegacyLeadsJson([lead, ...legacyLeads]);
    }

    return lead;
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    const legacyLeads = await readLegacyLeadsJson();
    const existingLead = legacyLeads.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail);

    if (existingLead) {
      return {
        email: existingLead.email.trim().toLowerCase(),
        createdAt: existingLead.createdAt
      } satisfies NewsletterLead;
    }

    await writeLegacyLeadsJson([lead, ...legacyLeads]);
    return lead;
  }
}

export async function getNewsletterLeadsFromDb() {
  if (!process.env.DATABASE_URL) {
    return readLegacyLeadsJson();
  }

  try {
    await initializeNewsletterDb();
    const db = getPool();

    const result = await db.query<{ email: string; created_at: string }>(
      `
        SELECT email, created_at
        FROM newsletter_leads
        ORDER BY created_at DESC
      `
    );

    return result.rows.map((row) => ({
      email: row.email,
      createdAt: new Date(row.created_at).toISOString()
    })) satisfies NewsletterLead[];
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return readLegacyLeadsJson();
    }

    throw error;
  }
}

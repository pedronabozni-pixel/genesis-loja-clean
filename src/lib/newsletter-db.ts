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
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query("ALTER TABLE newsletter_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'");

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
    createdAt: new Date().toISOString(),
    status: "new"
  };

  if (!process.env.DATABASE_URL) {
    const legacyLeads = await readLegacyLeadsJson();
    const existingLead = legacyLeads.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail);

    if (existingLead) {
      return {
        email: existingLead.email.trim().toLowerCase(),
        createdAt: existingLead.createdAt,
        status: existingLead.status ?? "new"
      } satisfies NewsletterLead;
    }

    await writeLegacyLeadsJson([lead, ...legacyLeads]);
    return lead;
  }

  try {
    await initializeNewsletterDb();
    const db = getPool();

    const existing = await db.query<{ email: string; created_at: string; status: string }>(
      `
        SELECT email, created_at, status
        FROM newsletter_leads
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existing.rows[0]) {
      return {
        email: existing.rows[0].email,
        createdAt: new Date(existing.rows[0].created_at).toISOString(),
        status: existing.rows[0].status === "contacted" ? "contacted" : "new"
      } satisfies NewsletterLead;
    }

    await db.query(
      `
        INSERT INTO newsletter_leads (email, status, created_at)
        VALUES ($1, $2, $3)
      `,
      [lead.email, lead.status, lead.createdAt]
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
        createdAt: existingLead.createdAt,
        status: existingLead.status ?? "new"
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

    const result = await db.query<{ email: string; created_at: string; status: string }>(
      `
        SELECT email, created_at, status
        FROM newsletter_leads
        ORDER BY created_at DESC
      `
    );

    return result.rows.map((row) => ({
      email: row.email,
      createdAt: new Date(row.created_at).toISOString(),
      status: row.status === "contacted" ? "contacted" : "new"
    })) satisfies NewsletterLead[];
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return readLegacyLeadsJson();
    }

    throw error;
  }
}

export async function updateNewsletterLeadStatus(email: string, status: "new" | "contacted") {
  const normalizedEmail = email.trim().toLowerCase();

  if (!process.env.DATABASE_URL) {
    const leads = await readLegacyLeadsJson();
    const updated = leads.map((lead) =>
      lead.email.trim().toLowerCase() === normalizedEmail ? { ...lead, status } : { ...lead, status: lead.status ?? "new" }
    );
    await writeLegacyLeadsJson(updated);
    return updated.find((lead) => lead.email.trim().toLowerCase() === normalizedEmail) ?? null;
  }

  try {
    await initializeNewsletterDb();
    const db = getPool();
    const result = await db.query<{ email: string; created_at: string; status: string }>(
      `
        UPDATE newsletter_leads
        SET status = $2
        WHERE email = $1
        RETURNING email, created_at, status
      `,
      [normalizedEmail, status]
    );

    if (!result.rows[0]) {
      return null;
    }

    const leads = await readLegacyLeadsJson();
    const updatedLegacy = leads.map((lead) =>
      lead.email.trim().toLowerCase() === normalizedEmail ? { ...lead, status } : { ...lead, status: lead.status ?? "new" }
    );
    await writeLegacyLeadsJson(updatedLegacy);

    return {
      email: result.rows[0].email,
      createdAt: new Date(result.rows[0].created_at).toISOString(),
      status: result.rows[0].status === "contacted" ? "contacted" : "new"
    } satisfies NewsletterLead;
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    const leads = await readLegacyLeadsJson();
    const updated = leads.map((lead) =>
      lead.email.trim().toLowerCase() === normalizedEmail ? { ...lead, status } : { ...lead, status: lead.status ?? "new" }
    );
    await writeLegacyLeadsJson(updated);
    return updated.find((lead) => lead.email.trim().toLowerCase() === normalizedEmail) ?? null;
  }
}

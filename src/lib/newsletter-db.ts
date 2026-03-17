import { promises as fs } from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import type { NewsletterLead } from "@/types/store";

const newsletterJsonPath = path.join(process.cwd(), "src/data/newsletter-leads.json");
const defaultDbPath = path.join(process.cwd(), ".data", "newsletter.sqlite");

let dbPromise: Promise<sqlite3.Database> | null = null;

function getDatabasePath() {
  return process.env.NEWSLETTER_DB_PATH
    ? path.resolve(process.env.NEWSLETTER_DB_PATH)
    : defaultDbPath;
}

async function ensureDatabaseDir() {
  await fs.mkdir(path.dirname(getDatabasePath()), { recursive: true });
}

function openDatabase(filePath: string) {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    const db = new sqlite3.Database(filePath, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(db);
    });
  });
}

function run(db: sqlite3.Database, sql: string, params: Array<string | number | null> = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function get<T>(db: sqlite3.Database, sql: string, params: Array<string | number | null> = []) {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row as T | undefined);
    });
  });
}

function all<T>(db: sqlite3.Database, sql: string, params: Array<string | number | null> = []) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve((rows as T[]) ?? []);
    });
  });
}

async function readLegacyLeadsJson() {
  try {
    const data = await fs.readFile(newsletterJsonPath, "utf8");
    return JSON.parse(data) as NewsletterLead[];
  } catch {
    return [];
  }
}

async function migrateLegacyNewsletterJson(db: sqlite3.Database) {
  const existing = await get<{ total: number }>(db, "SELECT COUNT(*) as total FROM newsletter_leads");

  if ((existing?.total ?? 0) > 0) {
    return;
  }

  const legacyLeads = await readLegacyLeadsJson();

  for (const lead of legacyLeads) {
    await run(
      db,
      `
        INSERT OR IGNORE INTO newsletter_leads (email, created_at)
        VALUES (?, ?)
      `,
      [lead.email.trim().toLowerCase(), lead.createdAt]
    );
  }
}

async function initializeDatabase() {
  await ensureDatabaseDir();
  const db = await openDatabase(getDatabasePath());

  await run(
    db,
    `
      CREATE TABLE IF NOT EXISTS newsletter_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      )
    `
  );

  await migrateLegacyNewsletterJson(db);
  return db;
}

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }

  return dbPromise;
}

export async function saveNewsletterLeadToDb(email: string) {
  const db = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await get<{ email: string; created_at: string }>(
    db,
    `
      SELECT email, created_at
      FROM newsletter_leads
      WHERE email = ?
    `,
    [normalizedEmail]
  );

  if (existing) {
    return {
      email: existing.email,
      createdAt: existing.created_at
    } satisfies NewsletterLead;
  }

  const lead: NewsletterLead = {
    email: normalizedEmail,
    createdAt: new Date().toISOString()
  };

  await run(
    db,
    `
      INSERT INTO newsletter_leads (email, created_at)
      VALUES (?, ?)
    `,
    [lead.email, lead.createdAt]
  );

  return lead;
}

export async function getNewsletterLeadsFromDb() {
  const db = await getDatabase();

  const rows = await all<{ email: string; created_at: string }>(
    db,
    `
      SELECT email, created_at
      FROM newsletter_leads
      ORDER BY created_at DESC
    `
  );

  return rows.map((row) => ({
    email: row.email,
    createdAt: row.created_at
  })) satisfies NewsletterLead[];
}

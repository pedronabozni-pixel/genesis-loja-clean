import { Pool } from "pg";

type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitAmount: number;
  image?: string;
};

type OrderPayload = {
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  customerEmail?: string | null;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  items: OrderItem[];
  paidAt?: string | null;
  rawPayload: unknown;
};

let pool: Pool | null = null;
let initialized = false;

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

async function initializeOrdersTable() {
  if (initialized) return;

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_orders (
      id BIGSERIAL PRIMARY KEY,
      stripe_session_id TEXT NOT NULL UNIQUE,
      stripe_payment_intent_id TEXT,
      customer_email TEXT,
      amount_total INTEGER NOT NULL,
      currency TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      paid_at TIMESTAMPTZ,
      raw_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  initialized = true;
}

export async function savePaidOrder(order: OrderPayload) {
  await initializeOrdersTable();
  const db = getPool();

  await db.query(
    `
      INSERT INTO store_orders (
        stripe_session_id,
        stripe_payment_intent_id,
        customer_email,
        amount_total,
        currency,
        payment_status,
        items,
        paid_at,
        raw_payload,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, NOW())
      ON CONFLICT (stripe_session_id)
      DO UPDATE SET
        stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
        customer_email = EXCLUDED.customer_email,
        amount_total = EXCLUDED.amount_total,
        currency = EXCLUDED.currency,
        payment_status = EXCLUDED.payment_status,
        items = EXCLUDED.items,
        paid_at = EXCLUDED.paid_at,
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()
    `,
    [
      order.stripeSessionId,
      order.stripePaymentIntentId ?? null,
      order.customerEmail ?? null,
      order.amountTotal,
      order.currency,
      order.paymentStatus,
      JSON.stringify(order.items),
      order.paidAt ?? null,
      JSON.stringify(order.rawPayload)
    ]
  );
}

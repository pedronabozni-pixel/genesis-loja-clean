import { Pool } from "pg";
import type { DashboardMetrics, DashboardPeriod, StoreCustomerSummary, StoreOrderItem, StoreOrderRecord, StoreOrderStatus } from "@/types/store";

type OrderPayload = {
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  items: StoreOrderItem[];
  paidAt?: string | null;
  rawPayload: unknown;
};

type OrderRow = {
  id: string;
  gateway: string;
  gateway_order_id: string;
  gateway_payment_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  amount_total: number;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  items: StoreOrderItem[];
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

let pool: Pool | null = null;
let initialized = false;

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /ENOTFOUND|ECONNREFUSED|DATABASE_URL|postgres\.railway\.internal/i.test(error.message);
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

function mapFulfillmentStatus(value: string | null | undefined): StoreOrderStatus {
  if (value === "paid" || value === "shipped" || value === "delivered") {
    return value;
  }

  return "pending";
}

function normalizeTimestamp(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function rowToOrder(row: OrderRow): StoreOrderRecord {
  return {
    id: row.id,
    gateway: row.gateway,
    gatewayOrderId: row.gateway_order_id,
    gatewayPaymentId: row.gateway_payment_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    amountTotal: Number(row.amount_total),
    currency: row.currency,
    paymentStatus: row.payment_status,
    fulfillmentStatus: mapFulfillmentStatus(row.fulfillment_status),
    items: Array.isArray(row.items) ? row.items : [],
    paidAt: normalizeTimestamp(row.paid_at),
    createdAt: normalizeTimestamp(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: normalizeTimestamp(row.updated_at) ?? new Date(0).toISOString()
  };
}

async function initializeOrdersTable() {
  if (initialized) return;

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_orders (
      id BIGSERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE,
      stripe_payment_intent_id TEXT,
      gateway TEXT NOT NULL DEFAULT 'stripe',
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      amount_total INTEGER NOT NULL,
      currency TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      fulfillment_status TEXT NOT NULL DEFAULT 'pending',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      paid_at TIMESTAMPTZ,
      raw_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS gateway TEXT NOT NULL DEFAULT 'stripe'");
  await db.query("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS gateway_order_id TEXT");
  await db.query("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT");
  await db.query("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS customer_name TEXT");
  await db.query("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'pending'");
  await db.query(
    "UPDATE store_orders SET gateway = 'stripe', gateway_order_id = COALESCE(gateway_order_id, stripe_session_id), gateway_payment_id = COALESCE(gateway_payment_id, stripe_payment_intent_id)"
  );
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS store_orders_gateway_payment_id_idx ON store_orders (gateway_payment_id)");

  initialized = true;
}

export async function savePaidOrder(order: OrderPayload) {
  await initializeOrdersTable();
  const db = getPool();

  await db.query(
    `
      INSERT INTO store_orders (
        gateway,
        gateway_order_id,
        gateway_payment_id,
        customer_name,
        customer_email,
        amount_total,
        currency,
        payment_status,
        fulfillment_status,
        items,
        paid_at,
        raw_payload,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, NOW())
      ON CONFLICT (gateway_payment_id)
      DO UPDATE SET
        gateway = EXCLUDED.gateway,
        gateway_order_id = EXCLUDED.gateway_order_id,
        gateway_payment_id = EXCLUDED.gateway_payment_id,
        customer_name = EXCLUDED.customer_name,
        customer_email = EXCLUDED.customer_email,
        amount_total = EXCLUDED.amount_total,
        currency = EXCLUDED.currency,
        payment_status = EXCLUDED.payment_status,
        fulfillment_status = EXCLUDED.fulfillment_status,
        items = EXCLUDED.items,
        paid_at = EXCLUDED.paid_at,
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()
    `,
    [
      order.gateway,
      order.gatewayOrderId,
      order.gatewayPaymentId ?? null,
      order.customerName ?? null,
      order.customerEmail ?? null,
      order.amountTotal,
      order.currency,
      order.paymentStatus,
      order.paymentStatus === "paid" || order.paymentStatus === "approved" ? "paid" : "pending",
      JSON.stringify(order.items),
      order.paidAt ?? null,
      JSON.stringify(order.rawPayload)
    ]
  );
}

export async function getOrders() {
  if (!process.env.DATABASE_URL) {
    return [] as StoreOrderRecord[];
  }

  try {
    await initializeOrdersTable();
    const db = getPool();
    const result = await db.query<OrderRow>(
      `
        SELECT
          id::text,
          gateway,
          gateway_order_id,
          gateway_payment_id,
          customer_name,
          customer_email,
          amount_total,
          currency,
          payment_status,
          fulfillment_status,
          items,
          paid_at,
          created_at,
          updated_at
        FROM store_orders
        ORDER BY COALESCE(paid_at, created_at) DESC, id DESC
      `
    );

    return result.rows.map(rowToOrder);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao carregar pedidos.";

    if (!isDatabaseConnectionError(error)) {
      console.error("[admin:getOrders] fallback to empty list:", message);
    }

    return [] as StoreOrderRecord[];
  }
}

export async function getDashboardMetrics() {
  const orders = await getOrders();
  return buildDashboardMetrics(orders, "30d");
}

function getReferenceDate(order: StoreOrderRecord) {
  return normalizeTimestamp(order.paidAt ?? order.createdAt) ?? new Date(0).toISOString();
}

function isInsidePeriod(referenceDate: string, period: DashboardPeriod, now: Date) {
  if (period === "all") {
    return true;
  }

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (periodDays - 1));
  return new Date(referenceDate) >= cutoff;
}

function buildDashboardMetrics(orders: StoreOrderRecord[], period: DashboardPeriod) {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const filteredOrders = orders.filter((order) => isInsidePeriod(getReferenceDate(order), period, now));
  const todayOrders = filteredOrders.filter((order) => getReferenceDate(order).slice(0, 10) === todayKey);

  const revenueToday = todayOrders.reduce((sum, order) => sum + order.amountTotal, 0);
  const ordersToday = todayOrders.length;
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.amountTotal, 0);
  const ordersInPeriod = filteredOrders.length;
  const averageTicket = ordersInPeriod > 0 ? Math.round(totalSales / ordersInPeriod) : 0;
  const topProductMap = new Map<string, { productId: string; name: string; quantitySold: number; revenue: number }>();
  const salesSeriesMap = new Map<string, { label: string; revenue: number; orders: number }>();

  for (const order of filteredOrders) {
    const dayKey = getReferenceDate(order).slice(0, 10);
    const currentDay = salesSeriesMap.get(dayKey);
    salesSeriesMap.set(dayKey, {
      label: dayKey,
      revenue: (currentDay?.revenue ?? 0) + order.amountTotal,
      orders: (currentDay?.orders ?? 0) + 1
    });

    for (const item of order.items) {
      const key = item.productId || item.name;
      const current = topProductMap.get(key);
      const revenue = item.quantity * item.unitAmount;
      topProductMap.set(key, {
        productId: item.productId,
        name: item.name,
        quantitySold: (current?.quantitySold ?? 0) + item.quantity,
        revenue: (current?.revenue ?? 0) + revenue
      });
    }
  }

  const topProducts = Array.from(topProductMap.values())
    .sort((a, b) => (b.quantitySold === a.quantitySold ? b.revenue - a.revenue : b.quantitySold - a.quantitySold))
    .slice(0, 5);
  const salesSeries = Array.from(salesSeriesMap.values()).sort((a, b) => a.label.localeCompare(b.label));

  return {
    period,
    revenueToday,
    totalSales,
    ordersToday,
    ordersInPeriod,
    averageTicket,
    recentOrders: filteredOrders.slice(0, 8),
    topProducts
    ,
    salesSeries
  } satisfies DashboardMetrics;
}

export async function getDashboardMetricsForPeriod(period: DashboardPeriod) {
  const orders = await getOrders();
  return buildDashboardMetrics(orders, period);
}

export async function getCustomerSummaries() {
  const orders = await getOrders();
  const customerMap = new Map<string, StoreCustomerSummary & { productMap: Map<string, { name: string; quantity: number }> }>();

  for (const order of orders) {
    const email = order.customerEmail?.trim().toLowerCase();

    if (!email && !order.customerName?.trim()) {
      continue;
    }

    const customerId = email || `manual:${order.customerName?.trim().toLowerCase()}`;
    const current = customerMap.get(customerId);
    const nameFromEmail = (email?.split("@")[0] ?? order.customerName ?? "Cliente").replace(/[._-]+/g, " ");
    const name = (order.customerName?.trim() || nameFromEmail)
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    customerMap.set(customerId, {
      id: customerId,
      name,
      email: email ?? "Sem e-mail",
      totalSpent: (current?.totalSpent ?? 0) + order.amountTotal,
      ordersCount: (current?.ordersCount ?? 0) + 1,
      purchasedProducts: current?.purchasedProducts ?? [],
      productMap: current?.productMap ?? new Map<string, { name: string; quantity: number }>(),
      lastOrderAt:
        !current?.lastOrderAt || new Date(order.createdAt) > new Date(current.lastOrderAt)
          ? order.createdAt
          : current.lastOrderAt
    });

    const customer = customerMap.get(customerId);

    if (!customer) {
      continue;
    }

    for (const item of order.items) {
      const key = item.productId || item.slug || item.name;
      const existing = customer.productMap.get(key);

      customer.productMap.set(key, {
        name: item.name,
        quantity: (existing?.quantity ?? 0) + item.quantity
      });
    }
  }

  return Array.from(customerMap.values())
    .map(({ productMap, ...customer }) => ({
      ...customer,
      purchasedProducts: Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function createManualOrder(input: {
  customerName: string;
  customerEmail?: string | null;
  fulfillmentStatus: StoreOrderStatus;
  paidAt?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    unitAmount: number;
  }>;
}) {
  const timestamp = Date.now();
  const gatewayOrderId = `manual-${timestamp}`;
  const amountTotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitAmount, 0);

  await savePaidOrder({
    gateway: "manual",
    gatewayOrderId,
    gatewayPaymentId: `manual-payment-${timestamp}`,
    customerName: input.customerName,
    customerEmail: input.customerEmail?.trim() || null,
    amountTotal,
    currency: "brl",
    paymentStatus: input.fulfillmentStatus === "pending" ? "pending" : "paid",
    items: input.items.map((item, index) => ({
      productId: `manual-${timestamp}-${index}`,
      slug: "",
      name: item.name,
      quantity: item.quantity,
      unitAmount: item.unitAmount
    })),
    paidAt: input.paidAt ?? new Date().toISOString(),
    rawPayload: {
      source: "manual_admin_entry",
      customerName: input.customerName,
      customerEmail: input.customerEmail ?? null
    }
  });

  const db = getPool();
  await db.query("UPDATE store_orders SET fulfillment_status = $2 WHERE gateway_order_id = $1", [gatewayOrderId, input.fulfillmentStatus]);

  const orders = await getOrders();
  return orders.find((order) => order.gatewayOrderId === gatewayOrderId) ?? null;
}

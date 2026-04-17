import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import type { Product } from "@/types/store";

const productsJsonPath = path.join(process.cwd(), "src/data/products.json");

let pool: Pool | null = null;
let initialized = false;

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /ENOTFOUND|ECONNREFUSED|DATABASE_URL|postgres\.railway\.internal/i.test(error.message);
}

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

async function readProductsJson() {
  const data = await fs.readFile(productsJsonPath, "utf8");
  return JSON.parse(data) as Product[];
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sku: string | null;
  cost_cents: number;
  price_cents: number;
  short_description: string;
  description: string;
  image: string;
  video_url: string | null;
  checkout_url: string;
  rating: number;
  reviews_count: number;
  is_best_seller: boolean;
  is_anchor: boolean;
  stock_hint: string | null;
  stock_quantity: number | null;
  colors: string[];
  features: string[];
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    sku: row.sku ?? "",
    costCents: Number(row.cost_cents),
    priceCents: Number(row.price_cents),
    shortDescription: row.short_description,
    description: row.description,
    image: row.image,
    videoUrl: row.video_url ?? "",
    checkoutUrl: row.checkout_url,
    rating: Number(row.rating),
    reviewsCount: Number(row.reviews_count),
    isBestSeller: row.is_best_seller,
    isAnchor: row.is_anchor,
    stockHint: row.stock_hint ?? "",
    stockQuantity: row.stock_quantity === null ? null : Number(row.stock_quantity),
    colors: Array.isArray(row.colors) ? row.colors : [],
    features: Array.isArray(row.features) ? row.features : []
  };
}

function normalizeProduct(product: Product): Product {
  const stockQuantity =
    typeof product.stockQuantity === "number" && Number.isFinite(product.stockQuantity)
      ? Math.max(0, Math.trunc(product.stockQuantity))
      : null;

  return {
    ...product,
    sku: product.sku?.trim() ?? "",
    videoUrl: product.videoUrl ?? "",
    stockHint: product.stockHint ?? "",
    stockQuantity,
    isBestSeller: Boolean(product.isBestSeller),
    isAnchor: Boolean(product.isAnchor),
    colors: Array.isArray(product.colors)
      ? product.colors.map((color) => String(color).trim()).filter(Boolean)
      : [],
    features: Array.isArray(product.features) ? product.features : []
  };
}

async function initializeProductsTable() {
  if (initialized || !isDatabaseConfigured()) {
    return;
  }

  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT,
      cost_cents INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      video_url TEXT,
      checkout_url TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL,
      reviews_count INTEGER NOT NULL,
      is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
      is_anchor BOOLEAN NOT NULL DEFAULT FALSE,
      stock_hint TEXT,
      stock_quantity INTEGER,
      colors JSONB NOT NULL DEFAULT '[]'::jsonb,
      features JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);

  await db.query("ALTER TABLE store_products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER");
  await db.query("ALTER TABLE store_products ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]'::jsonb");
  await db.query("ALTER TABLE store_products ADD COLUMN IF NOT EXISTS sku TEXT");

  const result = await db.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM store_products");
  const total = Number.parseInt(result.rows[0]?.total ?? "0", 10);

  if (total === 0) {
    const products = await readProductsJson();

    for (const product of products.map(normalizeProduct)) {
      await db.query(
        `
          INSERT INTO store_products (
            id, slug, name, category, cost_cents, price_cents, short_description, description,
            sku, image, video_url, checkout_url, rating, reviews_count, is_best_seller, is_anchor,
            stock_hint, stock_quantity, colors, features
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19::jsonb, $20::jsonb
          )
          ON CONFLICT (id) DO NOTHING
        `,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.costCents,
          product.priceCents,
          product.shortDescription,
          product.description,
          product.sku || null,
          product.image,
          product.videoUrl || null,
          product.checkoutUrl,
          product.rating,
          product.reviewsCount,
          Boolean(product.isBestSeller),
          Boolean(product.isAnchor),
          product.stockHint || null,
          product.stockQuantity ?? null,
          JSON.stringify(product.colors ?? []),
          JSON.stringify(product.features)
        ]
      );
    }
  }

  initialized = true;
}

function nextProductId(products: Product[]) {
  const maxId = products.reduce((max, product) => {
    const current = Number.parseInt(product.id.replace(/^p/, ""), 10);
    if (Number.isNaN(current)) return max;
    return Math.max(max, current);
  }, 0);
  return `p${maxId + 1}`;
}

export async function getProductsFromStore() {
  if (!isDatabaseConfigured()) {
    return readProductsJson();
  }

  try {
    await initializeProductsTable();
    const db = getPool();
    const result = await db.query<ProductRow>("SELECT * FROM store_products ORDER BY id ASC");
    return result.rows.map(rowToProduct);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return readProductsJson();
    }

    throw error;
  }
}

export async function getProductBySlugFromStore(slug: string) {
  if (!isDatabaseConfigured()) {
    const products = await readProductsJson();
    return products.find((product) => product.slug === slug);
  }

  try {
    await initializeProductsTable();
    const db = getPool();
    const result = await db.query<ProductRow>("SELECT * FROM store_products WHERE slug = $1 LIMIT 1", [slug]);
    const row = result.rows[0];
    return row ? rowToProduct(row) : undefined;
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      const products = await readProductsJson();
      return products.find((product) => product.slug === slug);
    }

    throw error;
  }
}

export async function updateProductInStore(slug: string, payload: Product) {
  if (!isDatabaseConfigured()) {
    const products = await readProductsJson();
    const index = products.findIndex((product) => product.slug === slug);

    if (index === -1) {
      return null;
    }

    products[index] = payload;
    await fs.writeFile(productsJsonPath, JSON.stringify(products, null, 2), "utf8");
    return products[index];
  }

  await initializeProductsTable();
  const db = getPool();
  const product = normalizeProduct(payload);

  const result = await db.query<ProductRow>(
    `
      UPDATE store_products
      SET slug = $2,
          name = $3,
          category = $4,
          sku = $5,
          cost_cents = $6,
          price_cents = $7,
          short_description = $8,
          description = $9,
          image = $10,
          video_url = $11,
          checkout_url = $12,
          rating = $13,
          reviews_count = $14,
          is_best_seller = $15,
          is_anchor = $16,
          stock_hint = $17,
          stock_quantity = $18,
          colors = $19::jsonb,
          features = $20::jsonb
      WHERE slug = $1
      RETURNING *
    `,
    [
      slug,
      product.slug,
      product.name,
      product.category,
      product.sku || null,
      product.costCents,
      product.priceCents,
      product.shortDescription,
      product.description,
      product.image,
      product.videoUrl || null,
      product.checkoutUrl,
      product.rating,
      product.reviewsCount,
      Boolean(product.isBestSeller),
      Boolean(product.isAnchor),
      product.stockHint || null,
      product.stockQuantity ?? null,
      JSON.stringify(product.colors ?? []),
      JSON.stringify(product.features)
    ]
  );

  const row = result.rows[0];
  return row ? rowToProduct(row) : null;
}

export async function createProductInStore(payload: Product) {
  const products = await getProductsFromStore();
  const product = normalizeProduct({ ...payload, id: payload.id || nextProductId(products) });

  if (!isDatabaseConfigured()) {
    const updated = [...products, product];
    await fs.writeFile(productsJsonPath, JSON.stringify(updated, null, 2), "utf8");
    return product;
  }

  await initializeProductsTable();
  const db = getPool();

  const result = await db.query<ProductRow>(
    `
      INSERT INTO store_products (
        id, slug, name, category, sku, cost_cents, price_cents, short_description, description,
        image, video_url, checkout_url, rating, reviews_count, is_best_seller, is_anchor,
        stock_hint, stock_quantity, colors, features
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19::jsonb, $20::jsonb
      )
      RETURNING *
    `,
    [
      product.id,
      product.slug,
      product.name,
      product.category,
      product.sku || null,
      product.costCents,
      product.priceCents,
      product.shortDescription,
      product.description,
      product.image,
      product.videoUrl || null,
      product.checkoutUrl,
      product.rating,
      product.reviewsCount,
      Boolean(product.isBestSeller),
      Boolean(product.isAnchor),
      product.stockHint || null,
      product.stockQuantity ?? null,
      JSON.stringify(product.colors ?? []),
      JSON.stringify(product.features)
    ]
  );

  return rowToProduct(result.rows[0]);
}

export async function deleteProductFromStore(slug: string) {
  if (!isDatabaseConfigured()) {
    const products = await readProductsJson();
    const filtered = products.filter((product) => product.slug !== slug);

    if (filtered.length === products.length) {
      return false;
    }

    await fs.writeFile(productsJsonPath, JSON.stringify(filtered, null, 2), "utf8");
    return true;
  }

  await initializeProductsTable();
  const db = getPool();
  const result = await db.query("DELETE FROM store_products WHERE slug = $1", [slug]);
  return (result.rowCount ?? 0) > 0;
}

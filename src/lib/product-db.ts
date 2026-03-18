import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import type { Product } from "@/types/store";

const productsJsonPath = path.join(process.cwd(), "src/data/products.json");

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

async function readProductsJson() {
  const data = await fs.readFile(productsJsonPath, "utf8");
  return JSON.parse(data) as Product[];
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
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
  features: string[];
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
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
    features: Array.isArray(row.features) ? row.features : []
  };
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    videoUrl: product.videoUrl ?? "",
    stockHint: product.stockHint ?? "",
    isBestSeller: Boolean(product.isBestSeller),
    isAnchor: Boolean(product.isAnchor),
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
      features JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);

  const result = await db.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM store_products");
  const total = Number.parseInt(result.rows[0]?.total ?? "0", 10);

  if (total === 0) {
    const products = await readProductsJson();

    for (const product of products.map(normalizeProduct)) {
      await db.query(
        `
          INSERT INTO store_products (
            id, slug, name, category, cost_cents, price_cents, short_description, description,
            image, video_url, checkout_url, rating, reviews_count, is_best_seller, is_anchor,
            stock_hint, features
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            $16, $17::jsonb
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
          product.image,
          product.videoUrl || null,
          product.checkoutUrl,
          product.rating,
          product.reviewsCount,
          Boolean(product.isBestSeller),
          Boolean(product.isAnchor),
          product.stockHint || null,
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

  await initializeProductsTable();
  const db = getPool();
  const result = await db.query<ProductRow>("SELECT * FROM store_products ORDER BY id ASC");
  return result.rows.map(rowToProduct);
}

export async function getProductBySlugFromStore(slug: string) {
  if (!isDatabaseConfigured()) {
    const products = await readProductsJson();
    return products.find((product) => product.slug === slug);
  }

  await initializeProductsTable();
  const db = getPool();
  const result = await db.query<ProductRow>("SELECT * FROM store_products WHERE slug = $1 LIMIT 1", [slug]);
  const row = result.rows[0];
  return row ? rowToProduct(row) : undefined;
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
          cost_cents = $5,
          price_cents = $6,
          short_description = $7,
          description = $8,
          image = $9,
          video_url = $10,
          checkout_url = $11,
          rating = $12,
          reviews_count = $13,
          is_best_seller = $14,
          is_anchor = $15,
          stock_hint = $16,
          features = $17::jsonb
      WHERE slug = $1
      RETURNING *
    `,
    [
      slug,
      product.slug,
      product.name,
      product.category,
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
        id, slug, name, category, cost_cents, price_cents, short_description, description,
        image, video_url, checkout_url, rating, reviews_count, is_best_seller, is_anchor,
        stock_hint, features
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16, $17::jsonb
      )
      RETURNING *
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
      product.image,
      product.videoUrl || null,
      product.checkoutUrl,
      product.rating,
      product.reviewsCount,
      Boolean(product.isBestSeller),
      Boolean(product.isAnchor),
      product.stockHint || null,
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

import { promises as fs } from "fs";
import path from "path";
import type { NewsletterLead, Product, SiteContent } from "@/types/store";
import { saveNewsletterLeadToDb } from "@/lib/newsletter-db";
import {
  createProductInStore,
  deleteProductFromStore,
  getProductBySlugFromStore,
  getProductsFromStore,
  updateProductInStore
} from "@/lib/product-db";

const siteContentPath = path.join(process.cwd(), "src/data/site-content.json");

export async function getProducts(): Promise<Product[]> {
  return getProductsFromStore();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return getProductBySlugFromStore(slug);
}

export async function updateProduct(slug: string, payload: Product): Promise<Product | null> {
  return updateProductInStore(slug, payload);
}

export async function createProduct(payload: Product): Promise<Product> {
  return createProductInStore(payload);
}

export async function deleteProduct(slug: string): Promise<boolean> {
  return deleteProductFromStore(slug);
}

export async function saveNewsletterLead(email: string): Promise<NewsletterLead> {
  return saveNewsletterLeadToDb(email);
}

export async function getSiteContent(): Promise<SiteContent> {
  const data = await fs.readFile(siteContentPath, "utf8");
  return JSON.parse(data) as SiteContent;
}

export async function updateSiteContent(payload: SiteContent): Promise<SiteContent> {
  await fs.writeFile(siteContentPath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(priceCents / 100);
}

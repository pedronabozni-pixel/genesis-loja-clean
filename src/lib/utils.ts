import type { Product } from "@/types/store";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

export function getOriginalPriceCentsFromDiscounted(
  discountedCents: number,
  discountRate = 0.3
) {
  const factor = 1 - discountRate;
  return Math.round(discountedCents / factor);
}

export function getProductStockQuantity(product: Product) {
  if (typeof product.stockQuantity !== "number") {
    return null;
  }

  return Math.max(0, Math.trunc(product.stockQuantity));
}

export function isProductOutOfStock(product: Product) {
  const stockQuantity = getProductStockQuantity(product);
  return stockQuantity !== null && stockQuantity <= 0;
}

export function hasProductColorOptions(product: Product) {
  return Array.isArray(product.colors) && product.colors.length > 0;
}

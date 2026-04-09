"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatMoney, getOriginalPriceCentsFromDiscounted, hasProductColorOptions, isProductOutOfStock } from "@/lib/utils";
import type { Product, SiteContent } from "@/types/store";

export function ProductCard({
  product,
  buttonLabel = "Ver detalhes"
}: {
  product: Product;
  buttonLabel?: SiteContent["home"]["productCardButtonLabel"];
}) {
  const originalPriceCents = getOriginalPriceCentsFromDiscounted(product.priceCents);
  const isOutOfStock = isProductOutOfStock(product);
  const hasColors = hasProductColorOptions(product);

  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:-translate-y-1 hover:border-amber-500/70">
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <img
          alt={product.name}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
          src={product.image}
        />
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-xs uppercase tracking-wider text-amber-300">{product.category}</p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">{product.name}</h3>
        </div>
        <p className="text-sm text-zinc-300">{product.shortDescription}</p>
        {isOutOfStock ? <p className="text-sm font-semibold text-red-300">Produto esgotado no momento</p> : null}
        {!isOutOfStock && hasColors ? (
          <p className="text-sm text-zinc-400">Escolha a cor na página do produto antes de comprar.</p>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">
              Lancamento com 30% off
            </p>
            <p className="text-sm text-zinc-500 line-through">
              {formatMoney(originalPriceCents)}
            </p>
            <p className="text-xl font-bold text-amber-300">{formatMoney(product.priceCents)}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              className="flex min-h-14 items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-center text-sm font-semibold leading-tight text-zinc-950 transition hover:bg-amber-300"
              href={`/produtos/${product.slug}`}
            >
              {buttonLabel}
            </Link>
            {hasColors ? (
              <Link
                className="flex min-h-14 items-center justify-center rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm font-semibold leading-tight text-zinc-100 transition hover:border-amber-400 hover:text-amber-300"
                href={`/produtos/${product.slug}`}
              >
                Escolher cor
              </Link>
            ) : (
              <AddToCartButton
                className="flex min-h-14 items-center justify-center rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm font-semibold leading-tight text-zinc-100 transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isOutOfStock}
                productId={product.id}
                productName={product.name}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

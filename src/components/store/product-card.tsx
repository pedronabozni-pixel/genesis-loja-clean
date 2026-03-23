"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatMoney } from "@/lib/utils";
import type { Product, SiteContent } from "@/types/store";
import { StarRating } from "@/components/store/star-rating";

export function ProductCard({
  product,
  buttonLabel = "Ver detalhes"
}: {
  product: Product;
  buttonLabel?: SiteContent["home"]["productCardButtonLabel"];
}) {
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

        <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
        <p className="text-sm text-zinc-300">{product.shortDescription}</p>

        <div className="space-y-3">
          <p className="text-xl font-bold text-amber-300">{formatMoney(product.priceCents)}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              className="rounded-lg bg-amber-400 px-3 py-2 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
              href={`/produtos/${product.slug}`}
            >
              {buttonLabel}
            </Link>
            <AddToCartButton
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-amber-400 hover:text-amber-300"
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { isProductOutOfStock } from "@/lib/utils";
import type { Product } from "@/types/store";

export function ProductPurchasePanel({
  product,
  checkoutButtonLabel
}: {
  product: Product;
  checkoutButtonLabel: string;
}) {
  const colors = product.colors ?? [];
  const hasColors = colors.length > 0;
  const isOutOfStock = isProductOutOfStock(product);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const colorRequiredAndMissing = hasColors && !selectedColor;

  return (
    <div className="space-y-4">
      {hasColors ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-100">Escolha a cor</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = color === selectedColor;

              return (
                <button
                  className={
                    active
                      ? "rounded-full border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950"
                      : "rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-400 hover:text-amber-300"
                  }
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  type="button"
                >
                  {color}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-zinc-400">A cor escolhida vai acompanhar o item no carrinho e no checkout.</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <AddToCartButton
          className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-950 transition hover:scale-[1.02] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isOutOfStock || colorRequiredAndMissing}
          label={checkoutButtonLabel}
          productId={product.id}
          productName={product.name}
          redirectToCart
          selectedColor={selectedColor}
        />
        <AddToCartButton
          className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isOutOfStock || colorRequiredAndMissing}
          productId={product.id}
          productName={product.name}
          selectedColor={selectedColor}
        />
      </div>

      {colorRequiredAndMissing ? <p className="text-sm text-red-300">Selecione uma cor para continuar.</p> : null}
      {isOutOfStock ? <p className="text-sm text-red-300">Este produto está sem estoque e não pode ser adicionado ao carrinho.</p> : null}
    </div>
  );
}

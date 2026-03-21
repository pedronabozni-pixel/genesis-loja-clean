"use client";

import Link from "next/link";
import { CartCheckoutButton } from "@/components/store/cart-checkout-button";
import { mapCartItems, useCart } from "@/components/store/cart-provider";
import { FavoriteButton } from "@/components/store/favorite-button";
import { formatMoney } from "@/lib/utils";
import type { Product } from "@/types/store";

export function CartPageClient({ products }: { products: Product[] }) {
  const { items, removeItem, setQuantity, clearCart } = useCart();
  const entries = mapCartItems(products, items);
  const total = entries.reduce((sum, entry) => sum + entry.product.priceCents * entry.quantity, 0);

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Carrinho vazio</p>
          <h1 className="mt-3 font-serif text-4xl">Seu carrinho ainda está vazio</h1>
          <p className="mt-3 text-zinc-300">Adicione produtos para montar um checkout único na Stripe com tudo o que o cliente escolheu.</p>
          <Link className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-semibold text-zinc-950" href="/">
            Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Carrinho</p>
            <h1 className="font-serif text-4xl">Revise seus produtos</h1>
          </div>
          <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={clearCart} type="button">
            Limpar carrinho
          </button>
        </div>

        <div className="space-y-3">
          {entries.map(({ product, quantity }) => (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4" key={product.id}>
              <div className="flex flex-col gap-4 md:flex-row">
                <img alt={product.name} className="h-28 w-full rounded-xl object-cover md:w-36" src={product.image} />
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{product.category}</p>
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <p className="text-sm text-zinc-300">{product.shortDescription}</p>
                    </div>
                    <FavoriteButton slug={product.slug} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-lg border border-zinc-700 text-lg text-zinc-200"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        className="h-9 w-9 rounded-lg border border-zinc-700 text-lg text-zinc-200"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-amber-300">{formatMoney(product.priceCents * quantity)}</p>
                      <button className="text-sm text-red-300" onClick={() => removeItem(product.id)} type="button">
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Resumo</p>
        <h2 className="mt-2 font-serif text-2xl">Seu pedido</h2>

        <div className="mt-5 space-y-3 text-sm text-zinc-300">
          {entries.map(({ product, quantity }) => (
            <div className="flex items-start justify-between gap-3" key={product.id}>
              <span>
                {product.name} x{quantity}
              </span>
              <span>{formatMoney(product.priceCents * quantity)}</span>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-zinc-800" />

        <div className="flex items-center justify-between">
          <span className="text-zinc-300">Total</span>
          <span className="text-2xl font-bold text-amber-300">{formatMoney(total)}</span>
        </div>

        <p className="mt-3 text-sm text-zinc-400">No checkout da Stripe, o cliente verá todos os itens selecionados em uma única compra.</p>

        <CartCheckoutButton className="mt-5 w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60" />

        <Link className="mt-3 inline-flex w-full justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200" href="/">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}

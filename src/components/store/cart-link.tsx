"use client";

import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";

export function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link
      className="relative inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 font-semibold text-zinc-100 transition hover:border-amber-400 hover:text-amber-300"
      href="/carrinho"
    >
      <span aria-hidden="true">🛒</span>
      <span>Carrinho</span>
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-zinc-950">
        {totalItems}
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";

export function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link className="relative rounded px-2 py-1 transition hover:bg-zinc-800" href="/carrinho">
      Carrinho
      {totalItems > 0 ? (
        <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-zinc-950">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}

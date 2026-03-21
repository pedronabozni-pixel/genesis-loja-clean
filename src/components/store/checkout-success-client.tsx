"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/store/cart-provider";

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = params.get("session_id");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Pedido enviado</p>
      <h1 className="mt-3 font-serif text-4xl">Checkout aberto com sucesso</h1>
      <p className="mt-3 text-zinc-300">
        Se o pagamento for concluído, vamos registrar seu pedido automaticamente pela Stripe. Você pode voltar para a loja ou continuar navegando.
      </p>
      {sessionId ? (
        <p className="mt-4 text-xs text-zinc-500">Sessão Stripe: {sessionId}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-zinc-950" href="/">
          Voltar para a Home
        </Link>
        <Link className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200" href="/produtos/h12-ultra-se">
          Ver produto destaque
        </Link>
      </div>
    </div>
  );
}

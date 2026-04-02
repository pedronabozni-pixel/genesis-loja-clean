"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/store/cart-provider";

export function CheckoutSuccessClient() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-10 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-4xl">
        ✅
      </div>
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Compra confirmada</p>
      <h1 className="mt-3 font-serif text-4xl text-zinc-100">Obrigado pelo seu pedido!</h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-300">
        Seu pagamento foi processado com sucesso. Em breve voce recebera um e-mail de confirmacao.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-amber-300" href="/">
          Voltar para a loja
        </Link>
        <Link className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:border-amber-400/50" href="https://wa.me/5511922152213" target="_blank">
          Falar com suporte
        </Link>
      </div>
    </div>
  );
}

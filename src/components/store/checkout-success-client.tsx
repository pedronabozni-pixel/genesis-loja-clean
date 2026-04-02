"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/store/cart-provider";

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearCart();
    setReady(true);
  }, [clearCart]);

  if (!ready) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-300">
        Carregando...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-10 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-4xl">
        ✅
      </div>

      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Compra confirmada</p>
      <h1 className="mt-3 font-serif text-4xl text-zinc-100">Obrigado pelo seu pedido!</h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-300">
        Seu pagamento foi processado com sucesso pela Stripe. Em breve voce recebera um e-mail de confirmacao com os detalhes do seu pedido.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left text-sm text-zinc-300 space-y-2">
        <p>Envio nacional com rastreamento</p>
        <p>Confirmacao enviada para o seu e-mail</p>
        <p>Duvidas? Fale pelo WhatsApp</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="rounded-xl bg-amber-400 px-6 py

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/store/cart-provider";

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = params.get("session_id");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearCart();
    setReady(true);
  }, [clearCart]);

  if (!ready) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-300">
        Carregando confirmação...
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
        Seu pagamento foi processado com sucesso pela Stripe. Em breve você receberá um e-mail de confirmação com os detalhes do seu pedido.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left text-sm text-zinc-300 space-y-2">
        <p>📦 <strong className="text-zinc-100">Envio nacional</strong> com rastreamento</p>
        <p>📧 Confirmação enviada para o seu e-mail</p>
        <p>💬 Dúvidas? Fale pelo <strong className="text-amber-300">WhatsApp</strong> ou em <strong className="text-amber-300">Contato</strong></p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-amber-300"
          href="/"
        >
          Voltar para a loja
        </Link>
        
          className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:border-amber-400/50"
          href="https://wa.me/5511922152213?text=Olá!%20Acabei%20de%20fazer%20uma%20compra%20e%20preciso%20de%20suporte."
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar com suporte
        </a>
      </div>
    </div>
  );
}

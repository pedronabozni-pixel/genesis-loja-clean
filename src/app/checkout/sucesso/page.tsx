import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Pagamento iniciado</p>
      <h1 className="mt-3 font-serif text-4xl">Pedido enviado para a Stripe</h1>
      <p className="mt-3 text-zinc-300">
        Se o pagamento for concluído, o pedido será processado normalmente. Você pode voltar para a loja ou acompanhar a confirmação pela Stripe.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-zinc-950" href="/">
          Voltar para a Home
        </Link>
        <Link className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200" href="/carrinho">
          Voltar para o carrinho
        </Link>
      </div>
    </div>
  );
}

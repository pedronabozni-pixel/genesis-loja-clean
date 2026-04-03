import { Suspense } from "react";
import { CheckoutSuccessClient } from "@/components/store/checkout-success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-300">Carregando...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}

"use client";

import { useState } from "react";

type CheckoutItem = {
  productId: string;
  quantity: number;
  selectedColor?: string;
};

type Props = {
  className?: string;
  disabled?: boolean;
  items: CheckoutItem[];
};

export function CartCheckoutButton({ className = "", disabled = false, items }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (loading || disabled) {
      return;
    }

    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        signal: controller.signal
      });

      let data: { url?: string; message?: string } = {};

      try {
        data = (await response.json()) as { url?: string; message?: string };
      } catch {
        data = {};
      }

      if (!response.ok || !data.url) {
        setError(data.message ?? "Não foi possível iniciar o checkout.");
        return;
      }

      window.location.assign(data.url);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        setError("O checkout demorou mais do que o esperado. Tente novamente.");
      } else {
        setError("Não foi possível conectar com o checkout. Tente novamente.");
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-center text-sm text-zinc-300">
        💬 Pagamento via <strong className="text-amber-300">PIX</strong>? Fale conosco pelo{" "}
        <strong className="text-amber-300">WhatsApp</strong>.<br />
        💳 Pagamento com <strong className="text-amber-300">cartão</strong> direto pelo site abaixo.
      </p>
      <button className={className} disabled={disabled || loading || items.length === 0} onClick={handleCheckout} type="button">
        {loading ? "Abrindo checkout..." : "Finalizar compra com cartão"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

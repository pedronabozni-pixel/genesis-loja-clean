"use client";

import { useState } from "react";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type Props = {
  className?: string;
  items: CheckoutItem[];
};

export function CartCheckoutButton({ className = "", items }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (loading) {
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
      <button className={className} disabled={loading || items.length === 0} onClick={handleCheckout} type="button">
        {loading ? "Redirecionando..." : "Finalizar compra com Stripe"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

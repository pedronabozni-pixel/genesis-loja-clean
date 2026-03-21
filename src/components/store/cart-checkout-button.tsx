"use client";

import { useState } from "react";
import { useCart } from "@/components/store/cart-provider";

type Props = {
  className?: string;
};

export function CartCheckoutButton({ className = "" }: Props) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    const data = (await response.json()) as { url?: string; message?: string };
    setLoading(false);

    if (!response.ok || !data.url) {
      setError(data.message ?? "Não foi possível iniciar o checkout.");
      return;
    }

    window.location.href = data.url;
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

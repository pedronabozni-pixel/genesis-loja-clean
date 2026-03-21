"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/store/cart-provider";
import { trackPixelEvent } from "@/lib/pixel";

type Props = {
  productId: string;
  productName: string;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  productName,
  className = "",
  label = "Adicionar ao carrinho"
}: Props) {
  const { addItem, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const quantity = getQuantity(productId);

  const buttonLabel = useMemo(() => {
    if (justAdded) {
      return "Adicionado";
    }

    if (quantity > 0) {
      return `No carrinho (${quantity})`;
    }

    return label;
  }, [justAdded, label, quantity]);

  return (
    <button
      className={className}
      onClick={() => {
        addItem(productId, 1);
        trackPixelEvent("AddToCart", { product_id: productId, product_name: productName });
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
      }}
      type="button"
    >
      {buttonLabel}
    </button>
  );
}

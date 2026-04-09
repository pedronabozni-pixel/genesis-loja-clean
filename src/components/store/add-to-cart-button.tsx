"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/cart-provider";
import { trackPixelEvent } from "@/lib/pixel";

type Props = {
  productId: string;
  productName: string;
  className?: string;
  label?: string;
  selectedColor?: string;
  disabled?: boolean;
  redirectToCart?: boolean;
};

export function AddToCartButton({
  productId,
  productName,
  className = "",
  label = "Adicionar ao carrinho",
  selectedColor,
  disabled = false,
  redirectToCart = false
}: Props) {
  const router = useRouter();
  const { addItem, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const quantity = getQuantity(productId, selectedColor);

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
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }

        addItem(productId, 1, selectedColor);
        trackPixelEvent("AddToCart", {
          product_id: productId,
          product_name: productName,
          selected_color: selectedColor ?? ""
        });
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);

        if (redirectToCart) {
          router.push("/carrinho");
          router.refresh();
        }
      }}
      type="button"
    >
      {buttonLabel}
    </button>
  );
}

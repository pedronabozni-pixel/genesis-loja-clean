import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/store-data";
import { getStripeServer } from "@/lib/stripe";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  selectedColor: z.string().trim().min(1).optional()
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1)
});

function getAppOrigin() {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!rawAppUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL não configurada.");
  }

  try {
    return new URL(rawAppUrl).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL inválida. Use uma URL completa, por exemplo https://genesisecom.com.br");
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body = bodySchema.parse(rawBody);
    const products = await getProducts();
    const appOrigin = getAppOrigin();
    const normalizedItems = new Map<string, { productId: string; quantity: number; selectedColor?: string }>();

    for (const item of body.items) {
      const key = `${item.productId}::${item.selectedColor ?? ""}`;
      const currentEntry = normalizedItems.get(key);
      const nextQuantity = Math.min((currentEntry?.quantity ?? 0) + item.quantity, 99);
      normalizedItems.set(key, {
        productId: item.productId,
        quantity: nextQuantity,
        selectedColor: item.selectedColor
      });
    }

    const normalizedEntries = Array.from(normalizedItems.values());
    const hasInvalidItems = normalizedEntries.some(({ productId, quantity }) => {
      const product = products.find((entry) => entry.id === productId);

      if (!product) {
        return true;
      }

      return typeof product.stockQuantity === "number" && product.stockQuantity < quantity;
    });

    if (hasInvalidItems) {
      return NextResponse.json(
        { message: "Alguns itens ficaram sem estoque ou foram alterados. Revise o carrinho e tente novamente." },
        { status: 400 }
      );
    }

    const lineItems = normalizedEntries.flatMap(({ productId, quantity, selectedColor }) => {
      const product = products.find((entry) => entry.id === productId);

      if (!product) {
        return [];
      }

      const imageUrl = product.image
        ? product.image.startsWith("http")
          ? product.image
          : new URL(product.image, appOrigin).toString()
        : undefined;

      return [
        {
          quantity,
          price_data: {
            currency: "brl",
            unit_amount: product.priceCents,
            product_data: {
              name: selectedColor ? `${product.name} - ${selectedColor}` : product.name,
              description: product.shortDescription,
              images: imageUrl ? [imageUrl] : undefined,
              metadata: {
                product_id: product.id,
                product_slug: product.slug,
                selected_color: selectedColor ?? ""
              }
            }
          }
        }
      ];
    });

    if (lineItems.length === 0) {
      return NextResponse.json(
        { message: "Seu carrinho foi atualizado. Revise os itens e tente novamente." },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          installments: {
            enabled: true
          }
        }
      },
      line_items: lineItems,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["BR"]
      },
      phone_number_collection: {
        enabled: true
      },
      success_url: new URL("/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}", appOrigin).toString(),
      cancel_url: new URL("/carrinho", appOrigin).toString(),
      locale: "pt-BR",
      allow_promotion_codes: true,
      metadata: {
        source: "genesis_store",
        item_count: String(lineItems.length)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Seu carrinho foi atualizado. Revise os itens e tente novamente." },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Falha ao iniciar checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

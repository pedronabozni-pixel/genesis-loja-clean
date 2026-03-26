import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/store-data";
import { getStripeServer } from "@/lib/stripe";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99)
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
    const normalizedItems = new Map<string, number>();

    for (const item of body.items) {
      const currentQuantity = normalizedItems.get(item.productId) ?? 0;
      normalizedItems.set(item.productId, Math.min(currentQuantity + item.quantity, 99));
    }

    const lineItems = Array.from(normalizedItems.entries()).flatMap(([productId, quantity]) => {
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
              name: product.name,
              description: product.shortDescription,
              images: imageUrl ? [imageUrl] : undefined,
              metadata: {
                product_id: product.id,
                product_slug: product.slug
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
      payment_method_types: ["card", "pix"],
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

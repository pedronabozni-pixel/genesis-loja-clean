import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/store-data";
import { getStripeServer } from "@/lib/stripe";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20)
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1)
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body = bodySchema.parse(rawBody);
    const products = await getProducts();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json({ message: "NEXT_PUBLIC_APP_URL não configurada." }, { status: 500 });
    }

    const lineItems = body.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        throw new Error("Produto inválido no carrinho.");
      }

      const imageUrl = product.image
        ? product.image.startsWith("http")
          ? product.image
          : `${appUrl}${product.image}`
        : undefined;

      return {
        quantity: item.quantity,
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
      };
    });

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      billing_address_collection: "auto",
      success_url: `${appUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/carrinho`,
      locale: "pt-BR",
      allow_promotion_codes: true,
      metadata: {
        source: "genesis_store",
        item_count: String(body.items.length)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Carrinho inválido." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Falha ao iniciar checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

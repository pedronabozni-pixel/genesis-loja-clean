import { NextResponse } from "next/server";
import Stripe from "stripe";
import { savePaidOrder } from "@/lib/order-db";
import { getStripeServer } from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET não configurada.");
  }

  return secret;
}

function isStripeProduct(
  product: string | Stripe.Product | Stripe.DeletedProduct | null | undefined
): product is Stripe.Product {
  return Boolean(product && typeof product !== "string" && !("deleted" in product));
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Assinatura Stripe ausente.", { status: 400 });
    }

    const rawBody = await request.text();
    const stripe = getStripeServer();
    const event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"]
      });

      const items = lineItems.data.map((item) => {
        const product = item.price?.product;
        const metadata = isStripeProduct(product) ? product.metadata : undefined;
        const images = isStripeProduct(product) ? product.images : undefined;

        return {
          productId: metadata?.product_id ?? item.price?.id ?? item.description ?? "produto",
          slug: metadata?.product_slug ?? "",
          name: item.description ?? (isStripeProduct(product) ? product.name : undefined) ?? "Produto",
          quantity: item.quantity ?? 1,
          unitAmount: item.price?.unit_amount ?? 0,
          image: images?.[0]
        };
      });

      await savePaidOrder({
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
        customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "brl",
        paymentStatus: session.payment_status ?? "unpaid",
        items,
        paidAt: session.payment_status === "paid" ? new Date().toISOString() : null,
        rawPayload: event
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao processar webhook Stripe.";
    return new NextResponse(message, { status: 400 });
  }
}

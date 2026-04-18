import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createManualOrder } from "@/lib/order-db";
import { ADMIN_CONFIG, ADMIN_COOKIE_NAME } from "@/lib/store-config";

const manualOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Informe o nome do cliente."),
  customerEmail: z.string().trim().email("Informe um e-mail valido.").optional().or(z.literal("")),
  fulfillmentStatus: z.enum(["pending", "paid", "shipped", "delivered"]),
  paidAt: z.string().datetime().nullable().optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Informe o nome do produto."),
        quantity: z.number().int().min(1, "A quantidade deve ser maior que zero."),
        unitPrice: z.number().nonnegative("O valor unitario nao pode ser negativo.")
      })
    )
    .min(1, "Adicione pelo menos um item.")
});

function unauthorized() {
  return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== ADMIN_CONFIG.sessionToken) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = manualOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const order = await createManualOrder({
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail?.trim() ? parsed.data.customerEmail.trim() : null,
    fulfillmentStatus: parsed.data.fulfillmentStatus,
    paidAt: parsed.data.paidAt ?? null,
    items: parsed.data.items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity,
      unitAmount: Math.round(item.unitPrice * 100)
    }))
  });

  revalidatePath("/admin-loja");
  revalidatePath("/admin-loja/pedidos");
  revalidatePath("/admin-loja/clientes");

  return NextResponse.json({ order });
}

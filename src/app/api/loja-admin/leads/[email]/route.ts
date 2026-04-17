import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_CONFIG, ADMIN_COOKIE_NAME } from "@/lib/store-config";
import { updateNewsletterLeadStatus } from "@/lib/newsletter-db";

export async function PUT(request: Request, context: { params: Promise<{ email: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== ADMIN_CONFIG.sessionToken) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const { email } = await context.params;
  const body = (await request.json()) as { status?: "new" | "contacted" };
  const status = body.status === "contacted" ? "contacted" : "new";
  const lead = await updateNewsletterLeadStatus(decodeURIComponent(email), status);

  if (!lead) {
    return NextResponse.json({ message: "Lead não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

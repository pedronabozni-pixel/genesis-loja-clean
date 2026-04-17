import { cookies } from "next/headers";
import { ADMIN_CONFIG, ADMIN_COOKIE_NAME } from "@/lib/store-config";
import { getNewsletterLeadsFromDb } from "@/lib/newsletter-db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== ADMIN_CONFIG.sessionToken) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const leads = await getNewsletterLeadsFromDb();
  const rows = [["email", "created_at", "status"], ...leads.map((lead) => [lead.email, lead.createdAt, lead.status ?? "new"])];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="genesis-leads.csv"'
    }
  });
}

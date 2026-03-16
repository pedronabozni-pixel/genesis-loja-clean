import { NextResponse } from "next/server";
import { z } from "zod";
import { appendNewsletterLeadToGoogleSheets, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { saveNewsletterLead } from "@/lib/store-data";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido.")
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const lead = await saveNewsletterLead(parsed.data.email);

  if (isGoogleSheetsConfigured()) {
    try {
      await appendNewsletterLeadToGoogleSheets(lead.email, lead.createdAt);
    } catch (error) {
      // Mantemos o lead salvo localmente mesmo se a planilha estiver indisponivel.
      console.error("Falha ao enviar lead para o Google Sheets:", error);
    }
  }

  return NextResponse.json({ message: "Cadastro realizado com sucesso." });
}

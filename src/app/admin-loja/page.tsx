import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StoreAdminProductEditor } from "@/components/admin/store-admin-product-editor";
import { getNewsletterLeadsFromDb } from "@/lib/newsletter-db";
import { ADMIN_CONFIG, ADMIN_COOKIE_NAME } from "@/lib/store-config";
import { getProducts, getSiteContent } from "@/lib/store-data";

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AltStoreAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== ADMIN_CONFIG.sessionToken) {
    redirect("/admin-loja/login");
  }

  const [products, siteContent, leads] = await Promise.all([
    getProducts(),
    getSiteContent(),
    getNewsletterLeadsFromDb()
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div>
          <h1 className="font-serif text-4xl">Admin da Loja</h1>
          <p className="mt-2 text-zinc-300">Edite nome, preço, descrição, imagem, vídeo e link Stripe de cada produto.</p>
        </div>
        <StoreAdminProductEditor initialProducts={products} initialSiteContent={siteContent} loginPath="/admin-loja/login" />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-zinc-100">Leads da Newsletter</h2>
              <p className="mt-1 text-sm text-zinc-400">E-mails captados na loja e salvos no Postgres.</p>
            </div>
            <div className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">
              {leads.length} {leads.length === 1 ? "lead" : "leads"}
            </div>
          </div>

          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-400">Nenhum e-mail cadastrado ainda.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-zinc-950/80 text-left text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Data de cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {leads.map((lead) => (
                    <tr className="bg-zinc-900/40" key={`${lead.email}-${lead.createdAt}`}>
                      <td className="px-4 py-3 text-zinc-100">{lead.email}</td>
                      <td className="px-4 py-3 text-zinc-300">{formatLeadDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

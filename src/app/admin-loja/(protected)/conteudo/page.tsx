import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { getSiteContent } from "@/lib/store-data";

export default async function AdminStoreContentPage() {
  const siteContent = await getSiteContent();

  return (
    <StoreAdminShell
      currentPath="/admin-loja/conteudo"
      description="Edite textos institucionais, página Sobre e dados de contato da loja."
      title="Conteúdo da Loja"
    >
      <SiteContentEditor initialSiteContent={siteContent} />
    </StoreAdminShell>
  );
}

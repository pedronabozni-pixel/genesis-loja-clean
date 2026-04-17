import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { getSiteContent } from "@/lib/store-data";

export default async function AdminStoreContentPage() {
  const siteContent = await getSiteContent();

  return (
    <StoreAdminShell
      currentPath="/admin-loja/conteudo"
      description="Structured CMS with focused areas for Home, Product Page, About and Contact."
      title="Content (CMS)"
    >
      <SiteContentEditor initialSiteContent={siteContent} />
    </StoreAdminShell>
  );
}

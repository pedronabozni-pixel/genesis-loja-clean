import { StoreAdminProductEditor } from "@/components/admin/store-admin-product-editor";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { requireStoreAdminSession } from "@/lib/admin-auth";
import { getProducts } from "@/lib/store-data";

export default async function AdminStoreProductsPage() {
  await requireStoreAdminSession();
  const products = await getProducts();

  return (
    <StoreAdminShell
      currentPath="/admin-loja/produtos"
      description="Gerencie catálogo, preços, mídias e links de checkout da loja."
      title="Produtos da Loja"
    >
      <StoreAdminProductEditor initialProducts={products} loginPath="/admin-loja/login" />
    </StoreAdminShell>
  );
}

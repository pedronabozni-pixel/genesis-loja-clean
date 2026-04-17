import Link from "next/link";
import { ProductListTable } from "@/components/admin/product-list-table";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { getProducts } from "@/lib/store-data";

export default async function AdminStoreProductsPage() {
  const products = await getProducts();

  return (
    <StoreAdminShell
      actions={
        <Link className="rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200" href="/admin-loja/produtos/novo">
          Create Product
        </Link>
      }
      currentPath="/admin-loja/produtos"
      description="Scalable catalog management with list, actions and dedicated editing flow."
      title="Products"
    >
      <ProductListTable initialProducts={products} />
    </StoreAdminShell>
  );
}

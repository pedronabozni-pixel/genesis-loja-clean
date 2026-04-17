import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import { getProductBySlug } from "@/lib/store-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <StoreAdminShell
      currentPath="/admin-loja/produtos"
      description="Refine catalog data with focused tabs and clearer information hierarchy."
      title={`Edit · ${product.name}`}
    >
      <ProductForm initialProduct={product} mode="edit" slug={slug} />
    </StoreAdminShell>
  );
}

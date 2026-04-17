import { ProductForm } from "@/components/admin/product-form";
import { StoreAdminShell } from "@/components/admin/store-admin-shell";
import type { Product } from "@/types/store";

function createEmptyProduct(): Product {
  return {
    id: "",
    slug: "",
    name: "",
    category: "",
    sku: "",
    costCents: 0,
    priceCents: 0,
    shortDescription: "",
    description: "",
    image: "",
    videoUrl: "",
    checkoutUrl: "",
    rating: 5,
    reviewsCount: 0,
    isBestSeller: false,
    isAnchor: false,
    stockHint: "",
    stockQuantity: null,
    colors: [],
    features: []
  };
}

export default function AdminNewProductPage() {
  return (
    <StoreAdminShell
      currentPath="/admin-loja/produtos/novo"
      description="Create a product using a tabbed workflow that separates core information, inventory, media and checkout."
      title="Create Product"
    >
      <ProductForm initialProduct={createEmptyProduct()} mode="create" />
    </StoreAdminShell>
  );
}

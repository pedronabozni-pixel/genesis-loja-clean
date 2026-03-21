import { CartPageClient } from "@/components/store/cart-page-client";
import { getProducts } from "@/lib/store-data";

export const revalidate = 300;

export default async function CartPage() {
  const products = await getProducts();

  return <CartPageClient products={products} />;
}

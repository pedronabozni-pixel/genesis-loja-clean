"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState } from "@/components/admin/admin-ui";
import { formatAdminCurrency, getProductStatus } from "@/lib/admin-format";
import type { Product } from "@/types/store";

export function ProductListTable({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.slug, product.sku ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [products, query]);

  async function removeProduct(slug: string) {
    if (!window.confirm("Excluir este produto do catálogo?")) {
      return;
    }

    setBusySlug(slug);
    const response = await fetch("/api/loja-admin/products/delete", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    setBusySlug(null);

    if (!response.ok) {
      return;
    }

    setProducts((current) => current.filter((product) => product.slug !== slug));
    router.refresh();
  }

  async function duplicateProduct(product: Product) {
    setBusySlug(product.slug);
    const response = await fetch("/api/loja-admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        id: "",
        slug: "",
        name: `${product.name} Copy`
      })
    });
    setBusySlug(null);

    const data = (await response.json()) as { product?: Product };

    if (!response.ok || !data.product) {
      return;
    }

    setProducts((current) => [data.product!, ...current]);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <AdminCard className="p-5">
          <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Search</p>
          <input
            className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-400/40"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, category, slug or SKU"
            value={query}
          />
        </AdminCard>

        <AdminCard className="grid min-w-[220px] grid-cols-2 gap-3 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Products</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-50">{products.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Visible</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-50">{filteredProducts.length}</p>
          </div>
        </AdminCard>
      </div>

      {filteredProducts.length === 0 ? (
        <AdminEmptyState
          description="Ainda não existem produtos para exibir neste recorte. Crie um novo item ou ajuste a busca."
          title="No products found"
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Manage pricing, stock health and operational actions from one table."
            eyebrow="Catalog"
            title="Product List"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-950/80 text-left text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Margin</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredProducts.map((product) => {
                  const marginValue = product.priceCents - product.costCents;
                  const marginPercent = product.priceCents > 0 ? Math.round((marginValue / product.priceCents) * 100) : 0;
                  const status = getProductStatus(product.stockQuantity);
                  const isBusy = busySlug === product.slug;

                  return (
                    <tr className="bg-zinc-900/40 transition hover:bg-zinc-900/70" key={product.slug}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img alt={product.name} className="h-12 w-12 rounded-2xl border border-zinc-800 object-cover" src={product.image || "/favicon.png"} />
                          <div>
                            <p className="font-medium text-zinc-100">{product.name}</p>
                            <p className="text-xs text-zinc-500">{product.category} {product.sku ? `• ${product.sku}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-200">{formatAdminCurrency(product.priceCents)}</td>
                      <td className="px-6 py-4 text-zinc-300">{typeof product.stockQuantity === "number" ? product.stockQuantity : "—"}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-100">{formatAdminCurrency(marginValue)}</p>
                        <p className="text-xs text-zinc-500">{marginPercent}% gross margin</p>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge label={status.label} tone={status.tone} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600" href={`/admin-loja/produtos/${product.slug}`}>
                            Edit
                          </Link>
                          <button
                            className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => duplicateProduct(product)}
                            type="button"
                          >
                            Duplicate
                          </button>
                          <button
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => removeProduct(product.slug)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

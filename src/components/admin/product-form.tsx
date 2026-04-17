"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminCard, AdminCardHeader } from "@/components/admin/admin-ui";
import { formatAdminCurrency, getProductStatus } from "@/lib/admin-format";
import type { Product } from "@/types/store";

const tabs = [
  { id: "basic", label: "Basic Info" },
  { id: "inventory", label: "Inventory" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "checkout", label: "Checkout" }
] as const;

type ProductTabId = (typeof tabs)[number]["id"];

type Props = {
  mode: "create" | "edit";
  initialProduct: Product;
  slug?: string;
};

function centsToInput(value: number) {
  return (value / 100).toFixed(2);
}

function inputToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function arrayToText(value?: string[]) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function textToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFieldClasses(span = "") {
  return `space-y-2 ${span}`;
}

export function ProductForm({ mode, initialProduct, slug }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [activeTab, setActiveTab] = useState<ProductTabId>("basic");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [message, setMessage] = useState("");

  const derivedMargin = useMemo(() => product.priceCents - product.costCents, [product.costCents, product.priceCents]);
  const derivedStatus = getProductStatus(product.stockQuantity);

  function patch<T extends keyof Product>(field: T, value: Product[T]) {
    setProduct((current) => ({ ...current, [field]: value }));
  }

  async function uploadAsset(endpoint: string, file: File | null, onSuccess: (url: string) => void, kind: "image" | "video") {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append(kind === "image" ? "imageFile" : "videoFile", file);

    if (kind === "image") {
      setUploadingImage(true);
    } else {
      setUploadingVideo(true);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = (await response.json()) as { imageUrl?: string; videoUrl?: string; message?: string };

    if (kind === "image") {
      setUploadingImage(false);
    } else {
      setUploadingVideo(false);
    }

    if (!response.ok) {
      setMessage(data.message ?? `Failed to upload ${kind}.`);
      return;
    }

    onSuccess((kind === "image" ? data.imageUrl : data.videoUrl) ?? "");
    setMessage(`${kind === "image" ? "Image" : "Video"} uploaded. Save the product to persist changes.`);
  }

  async function saveProduct() {
    setSaving(true);
    setMessage("");

    const response = await fetch(mode === "create" ? "/api/loja-admin/products" : `/api/loja-admin/products/${slug}`, {
      method: mode === "create" ? "POST" : "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    const data = (await response.json()) as { product?: Product; message?: string };
    setSaving(false);

    if (!response.ok || !data.product) {
      setMessage(data.message ?? "Could not save product.");
      return;
    }

    setProduct(data.product);
    setMessage("Product saved successfully.");
    router.push(`/admin-loja/produtos/${data.product.slug}`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="space-y-4">
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Tabs</p>
          <div className="mt-4 space-y-2">
            {tabs.map((tab) => (
              <button
                className={
                  activeTab === tab.id
                    ? "w-full rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-left text-sm font-medium text-zinc-50"
                    : "w-full rounded-2xl border border-transparent px-4 py-3 text-left text-sm text-zinc-400 transition hover:border-zinc-800 hover:bg-zinc-950"
                }
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Snapshot</p>
          <div className="mt-4 flex items-center gap-4">
            <img alt={product.name || "Product"} className="h-16 w-16 rounded-3xl border border-zinc-800 object-cover" src={product.image || "/favicon.png"} />
            <div>
              <p className="font-medium text-zinc-100">{product.name || "Untitled product"}</p>
              <p className="text-sm text-zinc-500">{product.category || "Uncategorized"}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Price</span>
              <span className="text-zinc-100">{formatAdminCurrency(product.priceCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Margin</span>
              <span className="text-zinc-100">{formatAdminCurrency(derivedMargin)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Status</span>
              <AdminBadge label={derivedStatus.label} tone={derivedStatus.tone} />
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="space-y-5">
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            description="Structured editing flow designed to reduce long forms and make product operations clearer."
            eyebrow={mode === "create" ? "Create Product" : "Edit Product"}
            title={mode === "create" ? "New Product" : product.name || "Product"}
          />

          <div className="border-t border-zinc-800 p-5 md:p-6">
            {activeTab === "basic" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className={createFieldClasses("md:col-span-2")}>
                  <label className="text-sm font-medium text-zinc-300">Product name</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("name", event.target.value)} value={product.name} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Category</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("category", event.target.value)} value={product.category} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">SKU</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("sku", event.target.value)} placeholder="GEN-H12-001" value={product.sku ?? ""} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Price</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("priceCents", inputToCents(event.target.value))} step="0.01" type="number" value={centsToInput(product.priceCents)} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Cost</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("costCents", inputToCents(event.target.value))} step="0.01" type="number" value={centsToInput(product.costCents)} />
                </div>
              </div>
            ) : null}

            {activeTab === "inventory" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Stock quantity</label>
                  <input
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none"
                    onChange={(event) => patch("stockQuantity", event.target.value === "" ? null : Number.parseInt(event.target.value, 10) || 0)}
                    placeholder="Leave empty to disable control"
                    type="number"
                    value={product.stockQuantity ?? ""}
                  />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Stock hint</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("stockHint", event.target.value)} placeholder="Example: limited units this week" value={product.stockHint ?? ""} />
                </div>
                <div className={createFieldClasses("md:col-span-2")}>
                  <label className="text-sm font-medium text-zinc-300">Color variants</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("colors", textToArray(event.target.value))} placeholder="Black, White, Blue" value={arrayToText(product.colors)} />
                </div>
              </div>
            ) : null}

            {activeTab === "content" ? (
              <div className="grid gap-5">
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Short description</label>
                  <textarea className="min-h-[120px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("shortDescription", event.target.value)} value={product.shortDescription} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Full description</label>
                  <textarea className="min-h-[200px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("description", event.target.value)} value={product.description} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Highlights</label>
                  <textarea className="min-h-[120px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("features", textToArray(event.target.value))} placeholder="Fast shipping, high battery, premium finish" value={arrayToText(product.features)} />
                </div>
              </div>
            ) : null}

            {activeTab === "media" ? (
              <div className="grid gap-5">
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Image URL</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("image", event.target.value)} placeholder="https://..." value={product.image} />
                  <input accept="image/*" className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300" onChange={(event: ChangeEvent<HTMLInputElement>) => uploadAsset("/api/loja-admin/upload-image", event.target.files?.[0] ?? null, (url) => patch("image", url), "image")} type="file" />
                  {uploadingImage ? <p className="text-xs text-zinc-500">Uploading image...</p> : null}
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Video URL</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("videoUrl", event.target.value)} placeholder="https://youtube.com/..." value={product.videoUrl ?? ""} />
                  <input accept="video/mp4,video/webm,video/ogg,video/quicktime" className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300" onChange={(event: ChangeEvent<HTMLInputElement>) => uploadAsset("/api/loja-admin/upload-video", event.target.files?.[0] ?? null, (url) => patch("videoUrl", url), "video")} type="file" />
                  {uploadingVideo ? <p className="text-xs text-zinc-500">Uploading video...</p> : null}
                </div>
              </div>
            ) : null}

            {activeTab === "checkout" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className={createFieldClasses("md:col-span-2")}>
                  <label className="text-sm font-medium text-zinc-300">Payment link</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" onChange={(event) => patch("checkoutUrl", event.target.value)} placeholder="Mercado Pago or external checkout link" value={product.checkoutUrl} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Rating</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" max="5" min="0" onChange={(event) => patch("rating", Number(event.target.value) || 0)} step="0.1" type="number" value={product.rating} />
                </div>
                <div className={createFieldClasses()}>
                  <label className="text-sm font-medium text-zinc-300">Reviews count</label>
                  <input className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none" min="0" onChange={(event) => patch("reviewsCount", Number.parseInt(event.target.value, 10) || 0)} type="number" value={product.reviewsCount} />
                </div>
              </div>
            ) : null}
          </div>
        </AdminCard>

        {message ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">{message}</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className="rounded-2xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100" onClick={() => router.push("/admin-loja/produtos")} type="button">
            Back to list
          </button>
          <button className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60" disabled={saving} onClick={saveProduct} type="button">
            {saving ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

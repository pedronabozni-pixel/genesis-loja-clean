"use client";

import { useState } from "react";
import { AdminCard, AdminCardHeader } from "@/components/admin/admin-ui";
import type { SiteContent } from "@/types/store";

const cmsTabs = [
  { id: "home", label: "Home" },
  { id: "product", label: "Product Page" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" }
] as const;

type CmsTab = (typeof cmsTabs)[number]["id"];

function Field({
  label,
  value,
  onChange,
  textarea = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {textarea ? (
        <textarea
          className="min-h-[140px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  );
}

function Block({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AdminCard>
      <AdminCardHeader description={description} title={title} />
      <div className="grid gap-5 border-t border-zinc-800 p-5 md:grid-cols-2 md:p-6">{children}</div>
    </AdminCard>
  );
}

export function SiteContentEditor({ initialSiteContent }: { initialSiteContent: SiteContent }) {
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [activeTab, setActiveTab] = useState<CmsTab>("home");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveSiteContent() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/loja-admin/site-content", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteContent)
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.message ?? "Failed to save content.");
      return;
    }

    setMessage("Content updated successfully.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <AdminCard className="p-4">
        <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">CMS Areas</p>
        <div className="mt-4 space-y-2">
          {cmsTabs.map((tab) => (
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

      <div className="space-y-5">
        {activeTab === "home" ? (
          <>
            <Block description="Main content and hero actions for the storefront landing page." title="Home Hero">
              <Field label="Badge" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, badge: value } } }))} value={siteContent.home.hero.badge} />
              <Field label="Primary CTA" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, checkoutButtonPrefix: value } } }))} value={siteContent.home.hero.checkoutButtonPrefix} />
              <div className="md:col-span-2">
                <Field label="Title" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, title: value } } }))} value={siteContent.home.hero.title} />
              </div>
              <div className="md:col-span-2">
                <Field label="Description" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, description: value } } }))} textarea value={siteContent.home.hero.description} />
              </div>
            </Block>

            <Block description="Cards, social proof and newsletter messages that support conversion." title="Support Blocks">
              <Field label="Featured products title" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, featuredProductsTitle: value } }))} value={siteContent.home.featuredProductsTitle} />
              <Field label="Product card button" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, productCardButtonLabel: value } }))} value={siteContent.home.productCardButtonLabel} />
              <Field label="Social proof eyebrow" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, socialProof: { ...current.home.socialProof, eyebrow: value } } }))} value={siteContent.home.socialProof.eyebrow} />
              <Field label="Social proof title" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, socialProof: { ...current.home.socialProof, title: value } } }))} value={siteContent.home.socialProof.title} />
              <Field label="Newsletter title" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, newsletter: { ...current.home.newsletter, title: value } } }))} value={siteContent.home.newsletter.title} />
              <Field label="Newsletter success message" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, newsletter: { ...current.home.newsletter, successMessage: value } } }))} textarea value={siteContent.home.newsletter.successMessage} />
            </Block>
          </>
        ) : null}

        {activeTab === "product" ? (
          <Block description="Messages and labels used in the product detail experience." title="Product Page">
            <Field label="Badge" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, productPage: { ...current.home.productPage, badge: value } } }))} value={siteContent.home.productPage.badge} />
            <Field label="Checkout button label" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, productPage: { ...current.home.productPage, checkoutButtonLabel: value } } }))} value={siteContent.home.productPage.checkoutButtonLabel} />
            <Field label="SEO title suffix" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, productPage: { ...current.home.productPage, metadataTitleSuffix: value } } }))} value={siteContent.home.productPage.metadataTitleSuffix} />
            <Field label="Related products title" onChange={(value) => setSiteContent((current) => ({ ...current, home: { ...current.home, productPage: { ...current.home.productPage, relatedProductsTitle: value } } }))} value={siteContent.home.productPage.relatedProductsTitle} />
          </Block>
        ) : null}

        {activeTab === "about" ? (
          <Block description="Institutional content used on the About page." title="About Page">
            <div className="md:col-span-2">
              <Field label="Title" onChange={(value) => setSiteContent((current) => ({ ...current, about: { ...current.about, title: value } }))} value={siteContent.about.title} />
            </div>
            <Field label="Paragraph 1" onChange={(value) => setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph1: value } }))} textarea value={siteContent.about.paragraph1} />
            <Field label="Paragraph 2" onChange={(value) => setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph2: value } }))} textarea value={siteContent.about.paragraph2} />
            <div className="md:col-span-2">
              <Field label="Paragraph 3" onChange={(value) => setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph3: value } }))} textarea value={siteContent.about.paragraph3} />
            </div>
          </Block>
        ) : null}

        {activeTab === "contact" ? (
          <Block description="Operational contact information exposed on the storefront." title="Contact Page">
            <div className="md:col-span-2">
              <Field label="Title" onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, title: value } }))} value={siteContent.contact.title} />
            </div>
            <div className="md:col-span-2">
              <Field label="Subtitle" onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, subtitle: value } }))} textarea value={siteContent.contact.subtitle} />
            </div>
            <Field label="Email" onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, email: value } }))} value={siteContent.contact.email} />
            <Field label="WhatsApp" onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, whatsapp: value } }))} value={siteContent.contact.whatsapp} />
            <div className="md:col-span-2">
              <Field label="Business hours" onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, hours: value } }))} value={siteContent.contact.hours} />
            </div>
          </Block>
        ) : null}

        {message ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">{message}</div> : null}

        <div className="flex justify-end">
          <button className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60" disabled={saving} onClick={saveSiteContent} type="button">
            {saving ? "Saving..." : "Save content changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

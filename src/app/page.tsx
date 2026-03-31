import { HeroAnchor } from "@/components/store/hero-anchor";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ProductCard } from "@/components/store/product-card";
import { getProducts, getSiteContent } from "@/lib/store-data";

export const revalidate = 300;

export default async function StoreHomePage() {
  const products = await getProducts();
  const siteContent = await getSiteContent();
  const anchor = products.find((product) => product.isAnchor) ?? products[0];

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <HeroAnchor content={siteContent.home.hero} product={anchor} />
      </div>

      <section className="animate-fade-up grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center md:grid-cols-3 md:text-left">
        {siteContent.home.infoCards.map((card) => (
          <div key={card.title}>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{card.title}</p>
            <p className="mt-1 text-zinc-200">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="animate-fade-up space-y-4">
        <h2 className="font-serif text-3xl">{siteContent.home.featuredProductsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} buttonLabel={siteContent.home.productCardButtonLabel} product={product} />
          ))}
        </div>
      </section>

      <div className="animate-fade-up">
        <NewsletterForm content={siteContent.home.newsletter} />
      </div>
    </div>
  );
}

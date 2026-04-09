import Link from "next/link";
import { CheckoutButton } from "@/components/store/hotmart-button";
import type { Product, SiteContent } from "@/types/store";
import { ScarcityCountdown } from "@/components/store/scarcity-countdown";
import { formatMoney, hasProductColorOptions, isProductOutOfStock } from "@/lib/utils";

export function HeroAnchor({
  product,
  content
}: {
  product: Product;
  content: SiteContent["home"]["hero"];
}) {
  const title = content.title || "30% de desconto em todos os produtos na primeira semana";
  const description = content.description || "Aproveite condições especiais na nossa primeira semana e garanta seus produtos com desconto por tempo limitado.";
  const badge = content.badge || "Atualizações Genesis";
  const isOutOfStock = isProductOutOfStock(product);
  const hasColors = hasProductColorOptions(product);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 md:p-14">
      <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative space-y-6 text-center">
        <p className="inline-flex rounded-full border border-amber-400/50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
          {badge}
        </p>

        <h1 className="font-serif text-4xl leading-tight text-zinc-100 md:text-6xl">
          {title}
        </h1>

        <p className="mx-auto max-w-xl text-zinc-400 md:text-lg">
          {description}
        </p>

        {product.stockHint ? (
          <p className="mx-auto max-w-xl rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
            {product.stockHint}
          </p>
        ) : null}

        <div className="mx-auto max-w-xl">
          <ScarcityCountdown content={content} />
        </div>

        {isOutOfStock ? <p className="text-sm font-semibold text-red-300">Produto esgotado. Novas compras indisponíveis no momento.</p> : null}
        {!isOutOfStock && hasColors ? (
          <p className="text-sm text-zinc-300">Este produto possui variações de cor. A compra começa na página do produto.</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isOutOfStock && !hasColors ? (
            <CheckoutButton
              className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-950 transition hover:scale-[1.02] hover:bg-amber-300"
              href={product.checkoutUrl}
              label={`${content.checkoutButtonPrefix} - ${formatMoney(product.priceCents)}`}
              productName={product.name}
            />
          ) : null}

          <Link className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-400 hover:text-amber-300" href={`/produtos/${product.slug}`}>
            {content.secondaryButtonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

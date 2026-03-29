import type { Product, SiteContent } from "@/types/store";

export function HeroAnchor({
  product,
  content
}: {
  product: Product;
  content: SiteContent["home"]["hero"];
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 md:p-14">
      <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative space-y-6 text-center">
        <p className="inline-flex rounded-full border border-amber-400/50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
          {content.badge}
        </p>

        <h1 className="font-serif text-4xl leading-tight text-zinc-100 md:text-6xl">
          {content.title}
        </h1>

        <p className="mx-auto max-w-xl text-zinc-400 md:text-lg">
          {content.description}
        </p>
      </div>
    </section>
  );
}

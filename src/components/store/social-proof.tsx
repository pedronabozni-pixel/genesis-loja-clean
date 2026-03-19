import type { SiteContent } from "@/types/store";

export function SocialProof({ content }: { content: SiteContent["home"]["socialProof"] }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{content.eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl text-zinc-100">{content.title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {content.testimonials.map((item) => (
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4" key={item.name}>
            <p className="text-amber-300">{"★".repeat(item.stars)}</p>
            <p className="mt-2 text-sm text-zinc-300">"{item.text}"</p>
            <p className="mt-3 text-sm font-semibold text-zinc-100">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

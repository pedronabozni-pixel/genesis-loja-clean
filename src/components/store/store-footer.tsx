import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-14 border-t border-zinc-800 bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
        <p>Genesis Distribuidora © {new Date().getFullYear()} - Tecnologia premium com entrega nacional.</p>
        <div className="flex flex-col gap-3 md:items-end">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-emerald-400/60 hover:text-emerald-200"
            href="https://www.reclameaqui.com.br/"
            rel="noreferrer"
            target="_blank"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Selo de segurança Reclame AQUI
          </a>
          <div className="flex gap-4">
          <Link className="hover:text-amber-300" href="/sobre">
            Sobre
          </Link>
          <Link className="hover:text-amber-300" href="/contato">
            Contato
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

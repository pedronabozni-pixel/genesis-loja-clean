import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-14 border-t border-zinc-800 bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
        <p>Genesis Distribuidora © {new Date().getFullYear()} - Tecnologia premium com entrega nacional.</p>
        <div className="flex flex-col gap-3 md:items-end">
          <a
            className="inline-flex overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:scale-[1.01]"
            href="https://www.reclameaqui.com.br/"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt="Selo Verificada por Reclame AQUI"
              className="h-auto w-[220px] md:w-[260px]"
              src="/brand/reclame-aqui-verificada.svg"
            />
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

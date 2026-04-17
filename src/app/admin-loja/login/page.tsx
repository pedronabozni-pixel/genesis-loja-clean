import { StoreAdminLoginForm } from "@/components/admin/store-admin-login-form";

export default function AltStoreAdminLoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(253,186,116,0.14),transparent_22%),linear-gradient(180deg,#09090b_0%,#111114_45%,#09090b_100%)] px-4 py-8 text-zinc-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-amber-400/20 bg-zinc-950/80 p-8 shadow-[0_30px_120px_-60px_rgba(245,158,11,0.55)] backdrop-blur-xl md:p-10">
          <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-400/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-300/10 blur-3xl" />
          <div className="relative space-y-6">
            <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
              Genesis Distribuidora
            </div>
            <div className="space-y-3">
              <h1 className="max-w-xl font-serif text-4xl leading-tight text-zinc-50 md:text-5xl">
                Um painel mais elegante para operar a loja com clareza.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-zinc-300 md:text-base">
                Acesse o admin para atualizar catálogo, ajustar a comunicação da marca e acompanhar a captação de leads em um espaço visualmente mais refinado.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Catálogo</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">Produtos e mídia</p>
                <p className="mt-1 text-sm text-zinc-400">Preços, estoque, imagens e vídeo no mesmo fluxo.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Marca</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">Conteúdo editável</p>
                <p className="mt-1 text-sm text-zinc-400">Home, prova social, newsletter e páginas institucionais.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Base</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">Leads centralizados</p>
                <p className="mt-1 text-sm text-zinc-400">Visibilidade rápida sobre interesse e captação.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-zinc-800/90 bg-zinc-950/78 p-6 shadow-[0_28px_100px_-70px_rgba(0,0,0,1)] backdrop-blur-xl md:p-8">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Área protegida</p>
            <h2 className="mt-3 font-serif text-3xl text-zinc-100">Entrar no painel</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Acesso protegido por senha para gerenciar produtos, conteúdo e leads da Genesis.
            </p>
          </div>

          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/55 p-5">
            <StoreAdminLoginForm nextPath="/admin-loja" />
          </div>
        </section>
      </div>
    </div>
  );
}

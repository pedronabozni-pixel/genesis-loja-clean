import Link from "next/link";
import { ReactNode } from "react";

type NavGroup = {
  label: string;
  items: Array<{
    href: string;
    label: string;
    exact?: boolean;
  }>;
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin-loja", label: "Dashboard", exact: true }]
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin-loja/produtos", label: "Products", exact: true },
      { href: "/admin-loja/produtos/novo", label: "Create Product" },
      { href: "/admin-loja/pedidos", label: "Orders" },
      { href: "/admin-loja/clientes", label: "Customers" }
    ]
  },
  {
    label: "Growth",
    items: [
      { href: "/admin-loja/conteudo", label: "Content (CMS)" },
      { href: "/admin-loja/leads", label: "Leads" },
      { href: "/admin-loja/configuracoes", label: "Settings" }
    ]
  }
];

function isActivePath(currentPath: string, href: string, exact = false) {
  if (exact) {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function StoreAdminShell({
  children,
  currentPath,
  description,
  title,
  actions
}: {
  children: ReactNode;
  currentPath: string;
  description: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0d] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-800/80 bg-zinc-950/95 px-5 py-6 backdrop-blur xl:block">
        <div className="flex h-full flex-col">
          <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/12 via-zinc-900 to-zinc-950 p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80">Genesis Admin</p>
            <h1 className="mt-3 font-serif text-3xl text-zinc-50">Commerce OS</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Painel central para catálogo, pedidos, conteúdo e crescimento.</p>
          </div>

          <nav className="mt-8 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-[11px] uppercase tracking-[0.26em] text-zinc-500">{group.label}</p>
                <div className="mt-3 space-y-1.5">
                  {group.items.map((item) => {
                    const active = isActivePath(currentPath, item.href, item.exact);
                    return (
                      <Link
                        className={
                          active
                            ? "flex items-center justify-between rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-medium text-zinc-50"
                            : "flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm text-zinc-400 transition hover:border-zinc-800 hover:bg-zinc-900/80 hover:text-zinc-100"
                        }
                        href={item.href}
                        key={item.href}
                      >
                        <span>{item.label}</span>
                        {active ? <span className="h-2 w-2 rounded-full bg-amber-300" /> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">Genesis Distribuidora</p>
            <p className="mt-1 text-sm text-zinc-400">Catálogo e conteúdo centralizados com estrutura pronta para escalar.</p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <div className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Genesis Admin</p>
              <h2 className="truncate text-2xl font-semibold text-zinc-50">{title}</h2>
              <p className="mt-1 hidden max-w-3xl text-sm text-zinc-400 md:block">{description}</p>
            </div>

            <div className="flex items-center gap-3">
              {actions}
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-300 text-sm font-bold text-zinc-950">
                  GA
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-zinc-100">Genesis Team</p>
                  <p className="text-xs text-zinc-500">Admin profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
          <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900/55 p-5 md:hidden">
            <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">Navigation</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {navGroups.flatMap((group) => group.items).map((item) => {
                const active = isActivePath(currentPath, item.href, item.exact);
                return (
                  <Link
                    className={
                      active
                        ? "rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-medium text-zinc-50"
                        : "rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400"
                    }
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

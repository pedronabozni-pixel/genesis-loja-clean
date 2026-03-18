import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin-loja/produtos", label: "Produtos" },
  { href: "/admin-loja/conteudo", label: "Conteúdo" },
  { href: "/admin-loja/leads", label: "Leads" }
];

export function StoreAdminShell({
  children,
  currentPath,
  description,
  title
}: {
  children: ReactNode;
  currentPath: string;
  description: string;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="space-y-3">
          <div>
            <h1 className="font-serif text-4xl">{title}</h1>
            <p className="mt-2 text-zinc-300">{description}</p>
          </div>

          <nav className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
            {navItems.map((item) => {
              const active = item.href === currentPath;
              return (
                <Link
                  className={
                    active
                      ? "rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950"
                      : "rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-amber-400/60 hover:text-zinc-100"
                  }
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </div>
  );
}

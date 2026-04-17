import { ReactNode } from "react";
import { getToneClasses } from "@/lib/admin-format";

export function AdminCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`rounded-3xl border border-zinc-800 bg-zinc-900/60 ${className}`}>{children}</section>;
}

export function AdminCardHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
      <div>
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">{eyebrow}</p> : null}
        <h3 className="mt-2 text-xl font-semibold text-zinc-50">{title}</h3>
        {description ? <p className="mt-1 max-w-2xl text-sm text-zinc-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <AdminCard className="p-5">
      <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-zinc-50">{value}</p>
      {detail ? <p className="mt-2 text-sm text-zinc-400">{detail}</p> : null}
    </AdminCard>
  );
}

export function AdminBadge({
  label,
  tone
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getToneClasses(tone)}`}>
      {label}
    </span>
  );
}

export function AdminEmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AdminCard className="border-dashed p-10 text-center">
      <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </AdminCard>
  );
}

export function AdminButton({
  children,
  href,
  tone = "primary"
}: {
  children: ReactNode;
  href?: string;
  tone?: "primary" | "secondary" | "ghost";
}) {
  const className =
    tone === "primary"
      ? "inline-flex items-center rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
      : tone === "secondary"
        ? "inline-flex items-center rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600"
        : "inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100";

  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return <span className={className}>{children}</span>;
}

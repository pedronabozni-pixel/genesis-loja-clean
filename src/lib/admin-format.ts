export function formatAdminCurrency(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueCents / 100);
}

export function formatAdminDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatRelativeCompactDate(value?: string | null) {
  if (!value) {
    return "Sem atividade";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatAdminDayLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function getProductStatus(stockQuantity?: number | null) {
  if (stockQuantity === 0) {
    return {
      label: "Sem estoque",
      tone: "danger" as const
    };
  }

  if (typeof stockQuantity === "number" && stockQuantity > 0 && stockQuantity <= 5) {
    return {
      label: "Baixo estoque",
      tone: "warning" as const
    };
  }

  if (typeof stockQuantity === "number") {
    return {
      label: "Ativo",
      tone: "success" as const
    };
  }

  return {
    label: "Sem controle",
    tone: "neutral" as const
  };
}

export function getOrderStatusMeta(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved" || normalized === "paid") {
    return { label: "Pago", tone: "success" as const };
  }

  if (normalized === "shipped") {
    return { label: "Enviado", tone: "info" as const };
  }

  if (normalized === "delivered") {
    return { label: "Entregue", tone: "success" as const };
  }

  return { label: "Pendente", tone: "warning" as const };
}

export function getLeadStatusMeta(status?: "new" | "contacted") {
  if (status === "contacted") {
    return { label: "Contacted", tone: "success" as const };
  }

  return { label: "New", tone: "warning" as const };
}

export function getToneClasses(tone: "success" | "warning" | "danger" | "info" | "neutral") {
  switch (tone) {
    case "success":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
    case "warning":
      return "border-amber-400/25 bg-amber-400/10 text-amber-200";
    case "danger":
      return "border-red-400/25 bg-red-400/10 text-red-200";
    case "info":
      return "border-sky-400/25 bg-sky-400/10 text-sky-200";
    default:
      return "border-zinc-700 bg-zinc-800/70 text-zinc-300";
  }
}

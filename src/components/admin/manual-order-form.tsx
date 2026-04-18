"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ManualOrderItem = {
  id: string;
  name: string;
  quantity: string;
  unitPrice: string;
};

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" }
] as const;

function createItem(): ManualOrderItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: "1",
    unitPrice: ""
  };
}

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatCurrencyInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

export function ManualOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<(typeof statusOptions)[number]["value"]>("paid");
  const [paidAt, setPaidAt] = useState(toDatetimeLocalValue(new Date()));
  const [items, setItems] = useState<ManualOrderItem[]>([createItem()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Math.round(Number(item.unitPrice || "0") * 100);

        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
          return sum;
        }

        return sum + Math.max(1, Math.trunc(quantity)) * Math.max(0, unitPrice);
      }, 0),
    [items]
  );

  function updateItem(id: string, field: keyof Omit<ManualOrderItem, "id">, value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((current) => [...current, createItem()]);
  }

  function removeItem(id: string) {
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  }

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setFulfillmentStatus("paid");
    setPaidAt(toDatetimeLocalValue(new Date()));
    setItems([createItem()]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const payload = {
          customerName,
          customerEmail,
          fulfillmentStatus,
          paidAt: paidAt ? new Date(paidAt).toISOString() : null,
          items: items.map((item) => ({
            name: item.name,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice)
          }))
        };

        const response = await fetch("/api/loja-admin/orders/manual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = (await response.json().catch(() => null)) as { message?: string } | null;

        if (!response.ok) {
          throw new Error(data?.message ?? "Não foi possível cadastrar a venda manual.");
        }

        resetForm();
        setSuccess("Venda externa registrada com sucesso no admin.");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Não foi possível cadastrar a venda manual.");
      }
    });
  }

  return (
    <form className="border-t border-zinc-800 p-5 md:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Nome do cliente</span>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Ex: Maria Oliveira"
            required
            value={customerName}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">E-mail do cliente</span>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Opcional"
            type="email"
            value={customerEmail}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Status da venda</span>
          <select
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300"
            onChange={(event) => setFulfillmentStatus(event.target.value as (typeof statusOptions)[number]["value"])}
            value={fulfillmentStatus}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Data da venda</span>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300"
            onChange={(event) => setPaidAt(event.target.value)}
            type="datetime-local"
            value={paidAt}
          />
        </label>
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-100">Itens da venda</p>
            <p className="mt-1 text-sm text-zinc-400">Adicione os produtos vendidos fora do checkout para refletir no dashboard e na base de clientes.</p>
          </div>
          <button
            className="inline-flex items-center rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600"
            onClick={addItem}
            type="button"
          >
            Adicionar item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 md:grid-cols-[1.5fr_120px_160px_auto]" key={item.id}>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Produto {index + 1}</span>
                <input
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
                  onChange={(event) => updateItem(item.id, "name", event.target.value)}
                  placeholder="Nome do produto"
                  required
                  value={item.name}
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Qtd.</span>
                <input
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300"
                  min="1"
                  onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                  required
                  step="1"
                  type="number"
                  value={item.quantity}
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Valor unit.</span>
                <input
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300"
                  min="0"
                  onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                  placeholder="0,00"
                  required
                  step="0.01"
                  type="number"
                  value={item.unitPrice}
                />
              </label>

              <div className="flex items-end">
                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-200"
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total da venda</p>
            <p className="mt-1 text-lg font-semibold text-zinc-50">{formatCurrencyInput(total)}</p>
          </div>

          <button
            className="inline-flex items-center rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Salvando..." : "Salvar venda manual"}
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
      </div>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Product, WhatsAppOrderFormData } from "@/types/store";
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from "@/lib/whatsapp";

type CartWhatsAppOrderFormProps = {
  entries: Array<{
    product: Product;
    quantity: number;
  }>;
  totalCents: number;
};

const initialForm: WhatsAppOrderFormData = {
  fullName: "",
  phone: "",
  cityState: "",
  customerType: "Consumidor final",
  notes: ""
};

export function CartWhatsAppOrderForm({ entries, totalCents }: CartWhatsAppOrderFormProps) {
  const [form, setForm] = useState<WhatsAppOrderFormData>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER ?? "";
  const isCartEmpty = entries.length === 0;
  const canSubmit = useMemo(() => {
    return !isCartEmpty && form.fullName.trim() && form.phone.trim() && form.cityState.trim();
  }, [form.cityState, form.fullName, form.phone, isCartEmpty]);

  function updateField<K extends keyof WhatsAppOrderFormData>(field: K, value: WhatsAppOrderFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCartEmpty) {
      setError("Seu carrinho está vazio.");
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.cityState.trim()) {
      setError("Preencha nome completo, telefone e cidade/estado para continuar.");
      return;
    }

    if (!whatsappNumber) {
      setError("Número do WhatsApp da loja não configurado.");
      return;
    }

    setIsSubmitting(true);

    try {
      const message = buildWhatsAppOrderMessage({
        form,
        entries,
        totalCents
      });
      const url = buildWhatsAppOrderUrl(whatsappNumber, message);
      window.location.href = url;
    } catch {
      setError("Não foi possível gerar sua mensagem para o WhatsApp.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-zinc-200">
        Seu pedido será enviado para nosso atendimento comercial no WhatsApp. O valor final com frete e pagamento será confirmado por lá.
      </div>

      <div className="grid gap-3">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>Nome completo</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400"
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Seu nome"
            value={form.fullName}
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Telefone</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400"
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(11) 99999-9999"
            value={form.phone}
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Cidade/Estado</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400"
            onChange={(event) => updateField("cityState", event.target.value)}
            placeholder="São Paulo/SP"
            value={form.cityState}
          />
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Tipo de cliente</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400"
            onChange={(event) => updateField("customerType", event.target.value as WhatsAppOrderFormData["customerType"])}
            value={form.customerType}
          >
            <option value="Lojista">Lojista</option>
            <option value="Revendedor">Revendedor</option>
            <option value="Consumidor final">Consumidor final</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Observações do pedido</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400"
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Observações adicionais para o atendimento"
            value={form.notes}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-lg font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !canSubmit}
        type="submit"
      >
        {isSubmitting ? "Gerando pedido..." : "Enviar pedido no WhatsApp"}
      </button>
    </form>
  );
}

import { formatMoney } from "@/lib/utils";
import type { Product, WhatsAppOrderFormData } from "@/types/store";

type WhatsAppOrderEntry = {
  product: Product;
  quantity: number;
};

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppOrderMessage({
  form,
  entries,
  totalCents
}: {
  form: WhatsAppOrderFormData;
  entries: WhatsAppOrderEntry[];
  totalCents: number;
}) {
  const notes = form.notes.trim() || "-";
  const items = entries
    .map(({ product, quantity }) => {
      const subtotal = product.priceCents * quantity;
      return `- ${product.name} | SKU: ${product.id} | Qtd: ${quantity} | Unit: ${formatMoney(product.priceCents)} | Subtotal: ${formatMoney(subtotal)}`;
    })
    .join("\n");

  return [
    "Olá, gostaria de solicitar um pedido.",
    "",
    `Nome: ${form.fullName}`,
    `Telefone: ${form.phone}`,
    `Cidade/Estado: ${form.cityState}`,
    `Tipo de cliente: ${form.customerType}`,
    "",
    "Itens do pedido:",
    items,
    "",
    `Subtotal do pedido: ${formatMoney(totalCents)}`,
    "",
    "Observações:",
    notes,
    "",
    "Aguardo valor final com frete e chave Pix."
  ].join("\n");
}

export function buildWhatsAppOrderUrl(number: string, message: string) {
  const normalized = normalizeWhatsAppNumber(number);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

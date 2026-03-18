"use client";

import { useState } from "react";
import type { SiteContent } from "@/types/store";

export function SiteContentEditor({ initialSiteContent }: { initialSiteContent: SiteContent }) {
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);
  const [message, setMessage] = useState("");
  const [savingSiteContent, setSavingSiteContent] = useState(false);

  async function saveSiteContent() {
    setSavingSiteContent(true);
    const response = await fetch("/api/loja-admin/site-content", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteContent)
    });
    setSavingSiteContent(false);

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(data.message ?? "Falha ao salvar conteúdo do site.");
      return;
    }

    setMessage("Conteúdo do site atualizado com sucesso.");
  }

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="font-serif text-2xl text-zinc-100">Conteúdo do site</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-300 md:col-span-2">
          Título da página Sobre
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, about: { ...current.about, title: event.target.value } }))
            }
            value={siteContent.about.title}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Sobre - parágrafo 1
          <textarea
            className="mt-1 min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph1: event.target.value } }))
            }
            value={siteContent.about.paragraph1}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Sobre - parágrafo 2
          <textarea
            className="mt-1 min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph2: event.target.value } }))
            }
            value={siteContent.about.paragraph2}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Sobre - parágrafo 3
          <textarea
            className="mt-1 min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph3: event.target.value } }))
            }
            value={siteContent.about.paragraph3}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Contato - título
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, title: event.target.value } }))
            }
            value={siteContent.contact.title}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Contato - subtítulo
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, subtitle: event.target.value } }))
            }
            value={siteContent.contact.subtitle}
          />
        </label>

        <label className="text-sm text-zinc-300">
          E-mail
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, email: event.target.value } }))
            }
            value={siteContent.contact.email}
          />
        </label>

        <label className="text-sm text-zinc-300">
          WhatsApp
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, whatsapp: event.target.value } }))
            }
            value={siteContent.contact.whatsapp}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Horário de atendimento
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, hours: event.target.value } }))
            }
            value={siteContent.contact.hours}
          />
        </label>
      </div>

      <button
        className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        disabled={savingSiteContent}
        onClick={saveSiteContent}
        type="button"
      >
        {savingSiteContent ? "Salvando conteúdo..." : "Salvar conteúdo do site"}
      </button>

      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </section>
  );
}

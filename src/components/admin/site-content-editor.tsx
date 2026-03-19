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
        <label className="text-sm text-zinc-300">
          Home - selo do hero
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, badge: event.target.value } } }))
            }
            value={siteContent.home.hero.badge}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Home - botão principal do hero
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, hero: { ...current.home.hero, checkoutButtonPrefix: event.target.value } }
              }))
            }
            value={siteContent.home.hero.checkoutButtonPrefix}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Home - botão secundário do hero
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, hero: { ...current.home.hero, secondaryButtonLabel: event.target.value } }
              }))
            }
            value={siteContent.home.hero.secondaryButtonLabel}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Home - texto de espera do contador
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, hero: { ...current.home.hero, countdownLoadingText: event.target.value } }
              }))
            }
            value={siteContent.home.hero.countdownLoadingText}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Home - prefixo do contador
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, hero: { ...current.home.hero, countdownPrefix: event.target.value } }
              }))
            }
            value={siteContent.home.hero.countdownPrefix}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Home - título da seção de produtos
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) => setSiteContent((current) => ({ ...current, home: { ...current.home, featuredProductsTitle: event.target.value } }))}
            value={siteContent.home.featuredProductsTitle}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Home - botão dos cards de produto
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({ ...current, home: { ...current.home, productCardButtonLabel: event.target.value } }))
            }
            value={siteContent.home.productCardButtonLabel}
          />
        </label>

        {siteContent.home.infoCards.map((card, index) => (
          <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 md:col-span-2 md:grid-cols-2" key={`${card.title}-${index}`}>
            <label className="text-sm text-zinc-300">
              Home - card {index + 1} título
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                onChange={(event) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      infoCards: current.home.infoCards.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, title: event.target.value } : item
                      )
                    }
                  }))
                }
                value={card.title}
              />
            </label>

            <label className="text-sm text-zinc-300">
              Home - card {index + 1} texto
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                onChange={(event) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      infoCards: current.home.infoCards.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, text: event.target.value } : item
                      )
                    }
                  }))
                }
                value={card.text}
              />
            </label>
          </div>
        ))}

        <label className="text-sm text-zinc-300">
          Prova social - selo
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, socialProof: { ...current.home.socialProof, eyebrow: event.target.value } }
              }))
            }
            value={siteContent.home.socialProof.eyebrow}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Prova social - título
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, socialProof: { ...current.home.socialProof, title: event.target.value } }
              }))
            }
            value={siteContent.home.socialProof.title}
          />
        </label>

        {siteContent.home.socialProof.testimonials.map((testimonial, index) => (
          <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 md:col-span-2 md:grid-cols-3" key={`${testimonial.name}-${index}`}>
            <label className="text-sm text-zinc-300">
              Avaliação {index + 1} - nome
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                onChange={(event) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      socialProof: {
                        ...current.home.socialProof,
                        testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item
                        )
                      }
                    }
                  }))
                }
                value={testimonial.name}
              />
            </label>

            <label className="text-sm text-zinc-300 md:col-span-2">
              Avaliação {index + 1} - texto
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                onChange={(event) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      socialProof: {
                        ...current.home.socialProof,
                        testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, text: event.target.value } : item
                        )
                      }
                    }
                  }))
                }
                value={testimonial.text}
              />
            </label>

            <label className="text-sm text-zinc-300">
              Avaliação {index + 1} - estrelas
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                max={5}
                min={1}
                onChange={(event) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      socialProof: {
                        ...current.home.socialProof,
                        testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, stars: Number(event.target.value) || 5 } : item
                        )
                      }
                    }
                  }))
                }
                type="number"
                value={testimonial.stars}
              />
            </label>
          </div>
        ))}

        <label className="text-sm text-zinc-300">
          Newsletter - selo
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, eyebrow: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.eyebrow}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - título
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, title: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.title}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - placeholder
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, placeholder: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.placeholder}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - texto do botão
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, buttonLabel: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.buttonLabel}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - texto carregando
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, loadingLabel: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.loadingLabel}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - mensagem de e-mail inválido
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  newsletter: { ...current.home.newsletter, invalidEmailMessage: event.target.value }
                }
              }))
            }
            value={siteContent.home.newsletter.invalidEmailMessage}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Newsletter - mensagem de erro
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  newsletter: { ...current.home.newsletter, genericErrorMessage: event.target.value }
                }
              }))
            }
            value={siteContent.home.newsletter.genericErrorMessage}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Newsletter - mensagem de sucesso
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, successMessage: event.target.value } }
              }))
            }
            value={siteContent.home.newsletter.successMessage}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Página de produto - título se não encontrar
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  productPage: { ...current.home.productPage, notFoundTitle: event.target.value }
                }
              }))
            }
            value={siteContent.home.productPage.notFoundTitle}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Página de produto - sufixo do SEO
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  productPage: { ...current.home.productPage, metadataTitleSuffix: event.target.value }
                }
              }))
            }
            value={siteContent.home.productPage.metadataTitleSuffix}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Página de produto - selo
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, productPage: { ...current.home.productPage, badge: event.target.value } }
              }))
            }
            value={siteContent.home.productPage.badge}
          />
        </label>

        <label className="text-sm text-zinc-300">
          Página de produto - botão comprar
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  productPage: { ...current.home.productPage, checkoutButtonLabel: event.target.value }
                }
              }))
            }
            value={siteContent.home.productPage.checkoutButtonLabel}
          />
        </label>

        <label className="text-sm text-zinc-300 md:col-span-2">
          Página de produto - título dos relacionados
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            onChange={(event) =>
              setSiteContent((current) => ({
                ...current,
                home: {
                  ...current.home,
                  productPage: { ...current.home.productPage, relatedProductsTitle: event.target.value }
                }
              }))
            }
            value={siteContent.home.productPage.relatedProductsTitle}
          />
        </label>

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

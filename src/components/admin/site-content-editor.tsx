"use client";

import { ReactNode, useState } from "react";
import type { SiteContent } from "@/types/store";

function SectionCard({
  title,
  description,
  defaultOpen = false,
  children
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5" open={defaultOpen}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-zinc-100">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
            Expandir
          </span>
        </div>
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </details>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  min,
  max
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="text-sm text-zinc-300">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm text-zinc-300 md:col-span-2">
      {label}
      <textarea
        className="mt-1 min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

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
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="font-serif text-3xl text-zinc-100">Conteúdo do site</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Edite os textos da Home, página de produto, Sobre e Contato em blocos separados.
        </p>
      </div>

      <SectionCard
        defaultOpen
        description="Controle os textos principais do produto âncora na Home."
        title="Hero da Home"
      >
        <InputField
          label="Selo do hero"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, hero: { ...current.home.hero, badge: value } }
            }))
          }
          value={siteContent.home.hero.badge}
        />
        <InputField
          label="Botão principal do hero"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, hero: { ...current.home.hero, checkoutButtonPrefix: value } }
            }))
          }
          value={siteContent.home.hero.checkoutButtonPrefix}
        />
        <InputField
          label="Botão secundário do hero"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, hero: { ...current.home.hero, secondaryButtonLabel: value } }
            }))
          }
          value={siteContent.home.hero.secondaryButtonLabel}
        />
        <InputField
          label="Texto de espera do contador"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, hero: { ...current.home.hero, countdownLoadingText: value } }
            }))
          }
          value={siteContent.home.hero.countdownLoadingText}
        />
        <InputField
          label="Prefixo do contador"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, hero: { ...current.home.hero, countdownPrefix: value } }
            }))
          }
          value={siteContent.home.hero.countdownPrefix}
        />
      </SectionCard>

      <SectionCard
        description="Gerencie os cards de informação e os botões da vitrine."
        title="Home e Cards"
      >
        <InputField
          label="Título da seção de produtos"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, featuredProductsTitle: value }
            }))
          }
          value={siteContent.home.featuredProductsTitle}
        />
        <InputField
          label="Botão dos cards de produto"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, productCardButtonLabel: value }
            }))
          }
          value={siteContent.home.productCardButtonLabel}
        />

        {siteContent.home.infoCards.map((card, index) => (
          <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 md:col-span-2 md:grid-cols-2" key={`${card.title}-${index}`}>
            <InputField
              label={`Card ${index + 1} - título`}
              onChange={(value) =>
                setSiteContent((current) => ({
                  ...current,
                  home: {
                    ...current.home,
                    infoCards: current.home.infoCards.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: value } : item
                    )
                  }
                }))
              }
              value={card.title}
            />
            <InputField
              label={`Card ${index + 1} - texto`}
              onChange={(value) =>
                setSiteContent((current) => ({
                  ...current,
                  home: {
                    ...current.home,
                    infoCards: current.home.infoCards.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: value } : item
                    )
                  }
                }))
              }
              value={card.text}
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        description="Edite o título da seção e os depoimentos usados na Home."
        title="Provas Sociais"
      >
        <InputField
          label="Selo da seção"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, socialProof: { ...current.home.socialProof, eyebrow: value } }
            }))
          }
          value={siteContent.home.socialProof.eyebrow}
        />
        <InputField
          label="Título da seção"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, socialProof: { ...current.home.socialProof, title: value } }
            }))
          }
          value={siteContent.home.socialProof.title}
        />

        {siteContent.home.socialProof.testimonials.map((testimonial, index) => (
          <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 md:col-span-2 md:grid-cols-3" key={`${testimonial.name}-${index}`}>
            <InputField
              label={`Avaliação ${index + 1} - nome`}
              onChange={(value) =>
                setSiteContent((current) => ({
                  ...current,
                  home: {
                    ...current.home,
                    socialProof: {
                      ...current.home.socialProof,
                      testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, name: value } : item
                      )
                    }
                  }
                }))
              }
              value={testimonial.name}
            />
            <div className="md:col-span-2">
              <InputField
                label={`Avaliação ${index + 1} - texto`}
                onChange={(value) =>
                  setSiteContent((current) => ({
                    ...current,
                    home: {
                      ...current.home,
                      socialProof: {
                        ...current.home.socialProof,
                        testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, text: value } : item
                        )
                      }
                    }
                  }))
                }
                value={testimonial.text}
              />
            </div>
            <InputField
              label={`Avaliação ${index + 1} - estrelas`}
              max={5}
              min={1}
              onChange={(value) =>
                setSiteContent((current) => ({
                  ...current,
                  home: {
                    ...current.home,
                    socialProof: {
                      ...current.home.socialProof,
                      testimonials: current.home.socialProof.testimonials.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, stars: Number(value) || 5 } : item
                      )
                    }
                  }
                }))
              }
              type="number"
              value={testimonial.stars}
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        description="Controle o bloco de captação de e-mail e suas mensagens."
        title="Newsletter"
      >
        <InputField
          label="Selo da newsletter"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, eyebrow: value } }
            }))
          }
          value={siteContent.home.newsletter.eyebrow}
        />
        <InputField
          label="Título da newsletter"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, title: value } }
            }))
          }
          value={siteContent.home.newsletter.title}
        />
        <InputField
          label="Placeholder do campo"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, placeholder: value } }
            }))
          }
          value={siteContent.home.newsletter.placeholder}
        />
        <InputField
          label="Texto do botão"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, buttonLabel: value } }
            }))
          }
          value={siteContent.home.newsletter.buttonLabel}
        />
        <InputField
          label="Texto carregando"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, loadingLabel: value } }
            }))
          }
          value={siteContent.home.newsletter.loadingLabel}
        />
        <InputField
          label="Mensagem de e-mail inválido"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, invalidEmailMessage: value } }
            }))
          }
          value={siteContent.home.newsletter.invalidEmailMessage}
        />
        <InputField
          label="Mensagem de erro"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, newsletter: { ...current.home.newsletter, genericErrorMessage: value } }
            }))
          }
          value={siteContent.home.newsletter.genericErrorMessage}
        />
        <div className="md:col-span-2">
          <InputField
            label="Mensagem de sucesso"
            onChange={(value) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, newsletter: { ...current.home.newsletter, successMessage: value } }
              }))
            }
            value={siteContent.home.newsletter.successMessage}
          />
        </div>
      </SectionCard>

      <SectionCard
        description="Textos fixos da página individual do produto."
        title="Página de Produto"
      >
        <InputField
          label="Título se não encontrar"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, productPage: { ...current.home.productPage, notFoundTitle: value } }
            }))
          }
          value={siteContent.home.productPage.notFoundTitle}
        />
        <InputField
          label="Sufixo do título SEO"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, productPage: { ...current.home.productPage, metadataTitleSuffix: value } }
            }))
          }
          value={siteContent.home.productPage.metadataTitleSuffix}
        />
        <InputField
          label="Selo da página"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, productPage: { ...current.home.productPage, badge: value } }
            }))
          }
          value={siteContent.home.productPage.badge}
        />
        <InputField
          label="Botão de compra"
          onChange={(value) =>
            setSiteContent((current) => ({
              ...current,
              home: { ...current.home, productPage: { ...current.home.productPage, checkoutButtonLabel: value } }
            }))
          }
          value={siteContent.home.productPage.checkoutButtonLabel}
        />
        <div className="md:col-span-2">
          <InputField
            label="Título dos relacionados"
            onChange={(value) =>
              setSiteContent((current) => ({
                ...current,
                home: { ...current.home, productPage: { ...current.home.productPage, relatedProductsTitle: value } }
              }))
            }
            value={siteContent.home.productPage.relatedProductsTitle}
          />
        </div>
      </SectionCard>

      <SectionCard
        description="Textos institucionais da Genesis."
        title="Sobre a Genesis"
      >
        <div className="md:col-span-2">
          <InputField
            label="Título da página Sobre"
            onChange={(value) =>
              setSiteContent((current) => ({ ...current, about: { ...current.about, title: value } }))
            }
            value={siteContent.about.title}
          />
        </div>
        <TextAreaField
          label="Parágrafo 1"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph1: value } }))
          }
          value={siteContent.about.paragraph1}
        />
        <TextAreaField
          label="Parágrafo 2"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph2: value } }))
          }
          value={siteContent.about.paragraph2}
        />
        <TextAreaField
          label="Parágrafo 3"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, about: { ...current.about, paragraph3: value } }))
          }
          value={siteContent.about.paragraph3}
        />
      </SectionCard>

      <SectionCard
        description="Informações de contato e suporte da loja."
        title="Contato"
      >
        <InputField
          label="Título"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, contact: { ...current.contact, title: value } }))
          }
          value={siteContent.contact.title}
        />
        <InputField
          label="Subtítulo"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, contact: { ...current.contact, subtitle: value } }))
          }
          value={siteContent.contact.subtitle}
        />
        <InputField
          label="E-mail"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, contact: { ...current.contact, email: value } }))
          }
          value={siteContent.contact.email}
        />
        <InputField
          label="WhatsApp"
          onChange={(value) =>
            setSiteContent((current) => ({ ...current, contact: { ...current.contact, whatsapp: value } }))
          }
          value={siteContent.contact.whatsapp}
        />
        <div className="md:col-span-2">
          <InputField
            label="Horário de atendimento"
            onChange={(value) =>
              setSiteContent((current) => ({ ...current, contact: { ...current.contact, hours: value } }))
            }
            value={siteContent.contact.hours}
          />
        </div>
      </SectionCard>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-zinc-100">Salvar alterações</p>
          <p className="text-xs text-zinc-400">As mudanças de conteúdo serão aplicadas no site após salvar.</p>
        </div>
        <button
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          disabled={savingSiteContent}
          onClick={saveSiteContent}
          type="button"
        >
          {savingSiteContent ? "Salvando conteúdo..." : "Salvar conteúdo do site"}
        </button>
      </div>

      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}

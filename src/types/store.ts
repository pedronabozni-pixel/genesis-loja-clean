export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  costCents: number;
  priceCents: number;
  shortDescription: string;
  description: string;
  image: string;
  videoUrl?: string;
  checkoutUrl: string;
  rating: number;
  reviewsCount: number;
  isBestSeller?: boolean;
  isAnchor?: boolean;
  stockHint?: string;
  features: string[];
};

export type NewsletterLead = {
  email: string;
  createdAt: string;
};

export type SiteContent = {
  home: {
    hero: {
      badge: string;
      checkoutButtonPrefix: string;
      secondaryButtonLabel: string;
      countdownLoadingText: string;
      countdownPrefix: string;
    };
    infoCards: Array<{
      title: string;
      text: string;
    }>;
    featuredProductsTitle: string;
    productCardButtonLabel: string;
    socialProof: {
      eyebrow: string;
      title: string;
      testimonials: Array<{
        name: string;
        text: string;
        stars: number;
      }>;
    };
    newsletter: {
      eyebrow: string;
      title: string;
      placeholder: string;
      buttonLabel: string;
      loadingLabel: string;
      invalidEmailMessage: string;
      genericErrorMessage: string;
      successMessage: string;
    };
    productPage: {
      notFoundTitle: string;
      metadataTitleSuffix: string;
      badge: string;
      checkoutButtonLabel: string;
      relatedProductsTitle: string;
    };
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    whatsapp: string;
    hours: string;
  };
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sku?: string;
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
  stockQuantity?: number | null;
  colors?: string[];
  features: string[];
};

export type CustomerType = "Lojista" | "Revendedor" | "Consumidor final";

export type WhatsAppOrderFormData = {
  fullName: string;
  phone: string;
  cityState: string;
  customerType: CustomerType;
  notes: string;
};

export type NewsletterLead = {
  email: string;
  createdAt: string;
  status?: "new" | "contacted";
};

export type StoreOrderStatus = "pending" | "paid" | "shipped" | "delivered";

export type StoreOrderItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitAmount: number;
  image?: string;
};

export type StoreOrderRecord = {
  id: string;
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  customerEmail?: string | null;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: StoreOrderStatus;
  items: StoreOrderItem[];
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoreCustomerSummary = {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderAt?: string | null;
};

export type DashboardMetrics = {
  revenueToday: number;
  ordersToday: number;
  averageTicket: number;
  recentOrders: StoreOrderRecord[];
  topProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
};

export type SiteContent = {
  home: {
    hero: {
      badge: string;
      title: string;
      description: string;
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

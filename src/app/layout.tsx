import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/store/cart-provider";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";

export const metadata: Metadata = {
  title: {
    default: "Genesis Distribuidora | Loja Oficial",
    template: "%s | Genesis Distribuidora"
  },
  description:
    "Loja oficial da Genesis Distribuidora com produtos de tecnologia, ofertas em destaque e checkout seguro.",
  openGraph: {
    title: "Genesis Distribuidora",
    description: "Produtos de tecnologia com foco em alta conversão.",
    type: "website"
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <StoreHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <StoreFooter />
      </div>
    </CartProvider>
  );
}

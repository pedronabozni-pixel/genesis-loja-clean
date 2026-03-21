import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/store/cart-link";

const links = [
  { href: "/", label: "Home" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" }
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between overflow-visible px-4">
        <Link className="block overflow-visible" href="/">
          <Image
            alt="Genesis Distribuidora"
            className="h-28 w-auto object-contain"
            height={112}
            priority
            src="/brand/genesis-oficial.png?v=2"
            width={580}
          />
        </Link>
        <nav className="flex items-center gap-2 text-sm text-zinc-200 md:gap-5">
          {links.map((link) => (
            <Link className="rounded px-2 py-1 transition hover:bg-zinc-800" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <CartLink />
        </nav>
      </div>
    </header>
  );
}

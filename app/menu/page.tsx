import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MenuClient from "./MenuClient";
import { DISH_ORDER_URL, jsonLd } from "@/lib/seo";
import { getMenu } from "@/lib/db";

export const metadata: Metadata = {
  title: "Il Nostro Menu - GotBun Riccione",
  description: "Sfoglia il menu di GotBun Riccione: hamburger nostrani con manzo a Km 0, falafel e pulled pork fatti in casa, wrap veloci, piadine e sfiziosità artigianali. Personalizza il tuo bun.",
  alternates: {
    canonical: "https://gotbunriccione.it/menu",
  },
};

export default async function MenuPage() {
  // Complete database of menu categories and items loaded dynamically, filtering unavailable ones
  const rawCategories = await getMenu();
  const menuCategories = rawCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.isAvailable !== false)
  }));

  // Schema.org Restaurant Menu JSON-LD
  const schemaMenu = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Menu GotBun Riccione",
    "description": "Menu completo di GotBun Riccione: hamburger nostrani, wraps, hot dog, piadine e salse artigianali.",
    "hasMenuSection": menuCategories
      .filter(cat => cat.id !== "create-my-bun")
      .map(cat => ({
        "@type": "MenuSection",
        "name": cat.label,
        "hasMenuItem": cat.items.map(item => ({
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description || "",
          "offers": {
            "@type": "Offer",
            "price": item.price.toFixed(2),
            "priceCurrency": "EUR"
          }
        }))
      }))
  };

  return (
    <main className="menu-page">
      {/* Schema.org Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schemaMenu)} />

      {/* Header section with back home navigation */}
      <header className="menu-page-header">
        <Link className="main-logo-centered-link" href="/" aria-label="Torna alla homepage">
          <div className="main-logo-container">
            <Image
              className="main-logo-large"
              src="/gotbun_logo.png"
              alt="GotBun Riccione"
              width={320}
              height={80}
              priority
            />
          </div>
          <span className="main-logo-subtitle">riccione</span>
        </Link>
        <h1 className="menu-page-subtitle">Scegli & Addenta</h1>
        <p className="menu-page-description">
          Sfoglia il nostro listino artigianale. La carne è fresca, il pane è dorato in piastra e le salse sono preparate in casa ogni giorno.
        </p>
      </header>

      {/* Interactive Client Component */}
      <MenuClient categories={menuCategories} />

      {/* Call to Order Info */}
      <section className="main-final-cta menu-final-cta">
        <div>
          <p className="main-eyebrow">Ci siamo</p>
          <h2 id="final-cta-title" style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)" }}>Ti è venuta fame?</h2>
          <p>Ordina ora sul nostro portale ufficiale DISH Order per ricevere a casa o asportare in orario.</p>
        </div>
        <a className="main-cta-btn cta-order" href={DISH_ORDER_URL} rel="noreferrer" target="_blank">
          Ordina ora
        </a>
      </section>

      {/* Page Footer */}
      <footer className="main-footer menu-page-footer">
        <p>© GotBun Riccione</p>
        <nav className="menu-page-footer-links" aria-label="Link utili">
          <Link href="/">Homepage</Link>
          <Link href="/privacy">Privacy e condizioni</Link>
        </nav>
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BurgerAnimation from "./components/BurgerAnimation";
import { business, DISH_URL, homeFaqs, jsonLd, MAPS_URL, MENU_URL, PROMO_URL, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Burger a Riccione, menu online e promo 2x1",
  description: "GotBun Riccione in Viale Emilia 40: smash burger, hot dog, wrap, menu online, ordini e promo 2x1 al tavolo.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    url: SITE_URL,
    title: "GotBun Riccione - Burger, menu e promo 2x1",
    description: "Smash burger, menu online, ordini e promo 2x1 da gustare in locale a Riccione.",
  },
};

const infoCards = [
  {
    label: "Orari",
    title: "Aperti tutti i giorni",
    text: "Dalle 18:30 alle 22:45. Passa per cena, ordina online o fermati al tavolo quando parte la voglia di burger.",
    action: "Vedi il menu",
    href: MENU_URL,
  },
  {
    label: "Indirizzo",
    title: "Viale Emilia 40",
    text: "GotBun Riccione, Viale Emilia 40, 47838 Riccione. Apri Maps, parti e arriva affamato.",
    action: "Apri Maps",
    href: MAPS_URL,
  },
  {
    label: "Contatti",
    title: "0541 645598",
    text: "Hai bisogno di sentire il locale? Chiama GotBun Riccione e togli il dubbio prima di partire.",
    action: "Chiama ora",
    href: "tel:+390541645598",
  },
];

export default function Home() {
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: business.name,
    description: business.description,
    url: SITE_URL,
    telephone: business.phone,
    image: [`${SITE_URL}/gotbun_logo.png`, `${SITE_URL}/gotbun-hero-burger.png`],
    logo: `${SITE_URL}/gotbun_logo.png`,
    servesCuisine: ["Burger", "Smash burger", "Street food", "Hot dog", "Wrap"],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.latitude,
      longitude: business.longitude,
    },
    openingHours: business.openingHours,
    hasMenu: MENU_URL,
    acceptsReservations: false,
    sameAs: [DISH_URL, MENU_URL, MAPS_URL, PROMO_URL],
    potentialAction: {
      "@type": "OrderAction",
      target: MENU_URL,
      deliveryMethod: "https://schema.org/OnSitePickup",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: business.name,
    url: SITE_URL,
    inLanguage: "it-IT",
    publisher: {
      "@id": `${SITE_URL}/#restaurant`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "GotBun Riccione",
        item: SITE_URL,
      },
    ],
  };

  return (
    <main className="main-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(restaurantSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema)} />

      {/* Sfondo animato burger — fixed, semi‑trasparente, dietro i contenuti */}
      <BurgerAnimation />

      <header className="main-header-centered" aria-label="Intestazione GotBun Riccione">
        <Link className="main-logo-centered-link" href="/" aria-label="GotBun Riccione home">
          <div className="main-logo-container">
            <Image className="main-logo-large" src="/gotbun_logo.png" alt="GotBun Riccione" width={320} height={80} priority />
          </div>
          <span className="main-logo-subtitle">riccione</span>
        </Link>
      </header>

      <section className="main-hero" aria-labelledby="main-hero-title">
        <div className="main-pills-container" aria-label="I punti di forza di GotBun">
          <div className="main-pill-item">
            <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Salta la fila</span>
          </div>
          <div className="main-pill-item">
            <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Zero attesa</span>
          </div>
          <Link href="/promo" className="main-pill-item pill-link">
            <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Promo esclusive</span>
          </Link>
        </div>

        <div className="main-hero-copy">
          <h1 id="main-hero-title">
            Street food caldo, croccante, <span>serio</span>.
          </h1>
          <p className="main-hero-text">
            A Riccione la piastra è accesa: smash burger con crosticina, pane tostato, salse sporche al punto giusto e ordini online senza perdere tempo.
          </p>
        </div>

        {/* 4 CTAs */}
        <div className="main-cta-group" aria-label="Azioni principali">
          <a className="main-cta-btn cta-order" href={MENU_URL} rel="noreferrer" target="_blank">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Ordina Online</span>
          </a>
          <a className="main-cta-btn cta-menu" href={MENU_URL} rel="noreferrer" target="_blank">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Menu</span>
          </a>
          <a className="main-cta-btn cta-call" href="tel:+390541645598">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Chiama</span>
          </a>
          <a className="main-cta-btn cta-whatsapp" href="https://wa.me/390541645598" rel="noreferrer" target="_blank">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Two Bubbles */}
        <div className="main-bubbles-grid">
          <Link href="/promo" className="main-bubble bubble-2x1">
            <div className="bubble-badge">Promo Tavolo</div>
            <div className="bubble-content">
              <span className="bubble-title">Promo</span>
              <span className="bubble-highlight">2x1</span>
              <span className="bubble-details">Lun - Gio · Solo al tavolo</span>
            </div>
            <span className="bubble-action">Sblocca Coupon &rarr;</span>
          </Link>
          <div className="main-bubble bubble-discount">
            <div className="bubble-badge">Sconto Online</div>
            <div className="bubble-content">
              <span className="bubble-title">Sconto Delivery & Asporto</span>
              <span className="bubble-highlight">-10%</span>
              <span className="bubble-details">Codice: <strong className="code-text">BUN26</strong></span>
            </div>
            <span className="bubble-note">Utilizzabile sul nostro sito</span>
          </div>
        </div>
      </section>

      {/* Featured Photo section */}
      <section className="main-photo-gallery" aria-label="I nostri Smash Burger">
        <div className="main-gallery-card">
          <div className="gallery-image-wrapper">
            <Image
              className="gallery-image"
              src="/gotbun-hero-burger.png"
              alt="GotBun Smash Burger caldo e croccante"
              width={1200}
              height={800}
              priority
            />
            <div className="gallery-image-overlay">
              <span className="gallery-tag">🔥 Smash Burger Originale</span>
              <p className="gallery-caption">Carne selezionata croccante sulla piastra, pane morbido tostato, salse e tanto formaggio filante.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="main-section main-menu-section" aria-labelledby="menu-title">
        <div>
          <p className="main-eyebrow">Menu e ordini</p>
          <h2 id="menu-title">Scegli. Ordina. Addenta.</h2>
        </div>
        <div className="main-section-copy">
          <p>Signature burger pieni, smash burger bassi e cattivi con crosticina da applauso, hot dog carichi, wrap veloci e insalate per chi oggi vuole stare leggero senza mangiare triste.</p>
          <a className="main-cta-btn cta-menu" style={{ width: 'fit-content' }} href={MENU_URL} rel="noreferrer" target="_blank">
            Sfoglia il menu
          </a>
        </div>
      </section>

      <section className="main-promo-card" aria-labelledby="promo-title">
        <div>
          <p className="main-eyebrow">Promo 2x1</p>
          <h2 id="promo-title">Uno lo paghi. L&apos;altro lo morde chi vuoi.</h2>
          <p>Dal lunedì al giovedì, 18:30-22:30, ti siedi al tavolo e ti giochi il 2x1 senza prenotazione. Scarichi il coupon, lo mostri in cassa e trasformi una fame normale in una scelta molto più intelligente.</p>
        </div>
        <Link className="main-cta-btn cta-order" style={{ width: 'fit-content' }} href="/promo">
          Ottieni il coupon
        </Link>
      </section>

      <section className="main-section main-visit-section" aria-labelledby="visit-title">
        <div>
          <p className="main-eyebrow">Zero frizione</p>
          <h2 id="visit-title">Tu arriva. Noi grigliamo.</h2>
        </div>
        <div className="info-grid">
          {infoCards.map((card) => (
            <article className="info-card" key={card.label}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <a href={card.href} rel="noreferrer" target="_blank">
                {card.action}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="main-section main-faq-section" aria-labelledby="faq-title">
        <div>
          <p className="main-eyebrow">Domande veloci</p>
          <h2 id="faq-title">Quello che ti serve sapere.</h2>
        </div>
        <div className="main-faq-list">
          {homeFaqs.map((item) => (
            <article className="main-faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="main-final-cta" aria-labelledby="final-cta-title">
        <div>
          <p className="main-eyebrow">Ci siamo</p>
          <h2 id="final-cta-title">Ti è venuta fame? Ordina GotBun.</h2>
          <p>Vai al portale ufficiale, scegli il tuo burger e lascia che la piastra faccia il resto.</p>
        </div>
        <a className="main-cta-btn cta-order" href={MENU_URL} rel="noreferrer" target="_blank">
          Ordina ora
        </a>
      </section>

      <footer className="main-footer">
        <p>© GotBun Riccione</p>
        <nav aria-label="Link utili">
          <Link href="/privacy">Privacy e condizioni promo</Link>
          <a href={DISH_URL} rel="noreferrer" target="_blank">
            Sito vetrina DISH
          </a>
        </nav>
      </footer>
    </main>
  );
}

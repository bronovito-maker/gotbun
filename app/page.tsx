import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
      <header className="main-header" aria-label="Intestazione GotBun Riccione">
        <Link className="main-logo-link" href="/" aria-label="GotBun Riccione home">
          <Image className="main-logo" src="/gotbun_logo.png" alt="GotBun Riccione" width={360} height={90} priority />
          <span>Riccione</span>
        </Link>
        <a className="main-header-action" href={MENU_URL} rel="noreferrer" target="_blank">
          Menu
        </a>
      </header>

      <section className="main-hero" aria-labelledby="main-hero-title">
        <div className="main-hero-copy">
          <h1 id="main-hero-title">
            Street food caldo, croccante, <span>serio</span>.
          </h1>
          <p className="main-hero-text">A Riccione la piastra è accesa: smash burger con crosticina, pane tostato, salse sporche al punto giusto e ordini online senza perdere tempo.</p>
          <div className="main-actions" aria-label="Azioni principali">
            <a className="main-button main-button-primary" href={MENU_URL} rel="noreferrer" target="_blank">
              Vedi il menu
            </a>
            <a className="main-button main-button-secondary" href={MENU_URL} rel="noreferrer" target="_blank">
              Ordina online
            </a>
          </div>
          <a className="promo-pill" href={PROMO_URL}>
            <span aria-hidden="true">%</span>
            Scopri il coupon 2x1
          </a>
        </div>

        <div className="main-hero-visual" aria-label="Burger GotBun">
          <div className="main-visual-badge">
            <span>🔥 Burger del mese</span>
            <strong>Habanero 🌶️🌶️🌶️</strong>
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
          <a className="main-button main-button-primary" href={MENU_URL} rel="noreferrer" target="_blank">
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
        <a className="main-button main-button-primary" href={PROMO_URL}>
          Ottieni il coupon
        </a>
      </section>

      <section className="main-section" aria-labelledby="visit-title">
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

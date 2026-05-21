import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BurgerAnimation from "./components/BurgerAnimation";
import { business, DISH_URL, DISH_ORDER_URL, homeFaqs, jsonLd, MAPS_URL, MENU_URL, PROMO_URL, SITE_URL } from "@/lib/seo";
import { getPromotions } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hamburger Nostrani a Riccione - GotBun",
  description: "GotBun Riccione in Viale Emilia 40: hamburger nostrani a Km 0, falafel e pulled pork fatti in casa, menu online e promo 2x1 al tavolo.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    url: SITE_URL,
    title: "GotBun Riccione - Hamburger Nostrani e Ingredienti Locali",
    description: "Hamburger nostrani a Km 0, pulled pork e falafel fatti in casa a Riccione. Menu online e promo 2x1.",
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

export default async function Home() {
  const promotions = await getPromotions();
  const promo2x1 = promotions.find((p) => p.id === "promo_2x1");
  const promo10 = promotions.find((p) => p.id === "promo_10");
  const hasActivePromos = promo2x1?.isActive || promo10?.isActive;
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
    servesCuisine: ["Burger", "Hamburger Nostrani", "Pulled Pork", "Falafel", "Wrap"],
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
    <>
      <main className="main-site" style={{ paddingBottom: 0 }}>
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
            Nessuna scorciatoia. <span>Solo ingredienti del territorio</span>.
          </h1>
          <p className="main-hero-text">
            Dal manzo locale allevato a filiera corta, al falafel fatto a mano, fino al nostro pulled pork cotto lentamente. Ci prendiamo tutto il tempo necessario per preparare ogni piatto da zero, proprio qui a Riccione.
          </p>
        </div>

        {/* 4 CTAs */}
        <div className="main-cta-group" aria-label="Azioni principali">
          <a className="main-cta-btn cta-order" href={DISH_ORDER_URL} rel="noreferrer" target="_blank">
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Ordina Online</span>
          </a>
          <Link className="main-cta-btn cta-menu" href={MENU_URL}>
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Menu</span>
          </Link>
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
        {hasActivePromos && (
          <div className="main-bubbles-grid">
            {promo2x1?.isActive && (
              <Link href="/promo" className="main-bubble bubble-2x1">
                <div className="bubble-badge">Promo Tavolo</div>
                <div className="bubble-content">
                  <span className="bubble-title">Promo</span>
                  <span className="bubble-highlight">2x1</span>
                  <span className="bubble-details">Lun - Gio · Solo al tavolo</span>
                </div>
                <span className="bubble-action">Sblocca Coupon &rarr;</span>
              </Link>
            )}
            {promo10?.isActive && (
              <div className="main-bubble bubble-discount">
                <div className="bubble-badge">Sconto Online</div>
                <div className="bubble-content">
                  <span className="bubble-title">Sconto Delivery & Asporto</span>
                  <span className="bubble-highlight">-10%</span>
                  <span className="bubble-details">Codice: <strong className="code-text">{promo10.code || "BUN26"}</strong></span>
                </div>
                <span className="bubble-note">Utilizzabile sul nostro sito</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Photo section */}
      <section className="main-photo-gallery" aria-label="I nostri Hamburger Nostrani">
        <div className="main-gallery-card">
          <div className="gallery-image-wrapper">
            <Image
              className="gallery-image"
              src="/gotbun-hero-burger.png"
              alt="GotBun Hamburger Nostrano caldo e gustoso"
              width={1200}
              height={800}
              priority
            />
            <div className="gallery-image-overlay">
              <span className="gallery-tag">🔥 Burger del mese: Habanero 🌶️🌶️🌶️</span>
              <p className="gallery-caption">Pane nero, hamburger di manzo nostrano, cheddar, bacon, cipolla, cetriolini pickled, salsa Habanero, salsa Maionese</p>
            </div>
          </div>
        </div>
      </section>

      <section className="main-section main-menu-section" aria-labelledby="menu-title">
        <div>
          <p className="main-eyebrow">Menu e ordini</p>
          <h2 id="menu-title">Ingredienti veri, ricette nostre.</h2>
        </div>
        <div className="main-section-copy">
          <p>I nostri hamburger con manzo nostrano a km 0, il pulled pork artigianale cotto a fuoco lento, il falafel fatto in casa e tante proposte vegetariane, wrap e insalate fresche.</p>
          <Link className="main-cta-btn cta-menu" style={{ width: 'fit-content' }} href={MENU_URL}>
            Sfoglia il menu
          </Link>
        </div>
      </section>

      {hasActivePromos && (
        <div className="main-promos-grid">
          {promo2x1?.isActive && (
            <section className="main-promo-card" aria-labelledby="promo-2x1-title">
              <div>
                <p className="main-eyebrow">Promo Tavolo</p>
                <h2 id="promo-2x1-title">{promo2x1.name}: {promo2x1.description}</h2>
                <p>Ti siedi al tavolo e ti giochi la promo senza prenotazione. Scarichi il coupon, lo mostri in cassa e raddoppi il gusto.</p>
                <span className="promo-disclaimer">
                  * {promo2x1.conditions}
                </span>
              </div>
              <Link className="main-cta-btn cta-order" style={{ width: 'fit-content' }} href="/promo">
                Ottieni il coupon
              </Link>
            </section>
          )}

          {promo10?.isActive && (
            <section className="main-promo-card" aria-labelledby="promo-delivery-title">
              <div>
                <p className="main-eyebrow">Sconto Online</p>
                <h2 id="promo-delivery-title">{promo10.name}: {promo10.description}</h2>
                <p>Ordina a domicilio o ritira al locale direttamente dal nostro portale ufficiale. Inserisci il codice sconto al checkout e ottieni il risparmio.</p>
                <div className="promo-code-box">
                  Codice sconto: <strong>{promo10.code || "BUN26"}</strong>
                </div>
                <span className="promo-disclaimer">
                  * {promo10.conditions}
                </span>
              </div>
              <a className="main-cta-btn cta-order" style={{ width: 'fit-content' }} href={DISH_ORDER_URL} rel="noreferrer" target="_blank">
                Ordina con sconto
              </a>
            </section>
          )}
        </div>
      )}

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
              {card.href.startsWith('/') ? (
                <Link href={card.href}>
                  {card.action}
                </Link>
              ) : (
                <a href={card.href} rel="noreferrer" target="_blank">
                  {card.action}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Filosofia del Brand / Chi Siamo */}
      <section className="main-section main-philosophy-section" aria-labelledby="philosophy-title" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))", paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div>
          <p className="main-eyebrow">La nostra filosofia</p>
          <h2 id="philosophy-title">La terra, le nostre mani, la piastra.</h2>
        </div>
        <div className="main-section-copy" style={{ color: "var(--main-text-muted, rgba(255, 255, 255, 0.7))", fontSize: "1.1rem", lineHeight: "1.7" }}>
          <p>GotBun nasce dall&apos;idea che un grande burger restaurant debba parlare la lingua del luogo in cui si trova. Per questo abbiamo detto addio alle logiche del fast food per abbracciare un cammino più lento e vicino a noi.</p>
          <p style={{ marginTop: "1rem" }}>La nostra carne di manzo è esclusivamente nostrana, proveniente da allevamenti locali a filiera corta, tracciabile e lavorata con rispetto. Tutto quello che serviamo passa prima dalle nostre mani: prepariamo in casa i nostri falafel di ceci uno a uno, e dedichiamo ore alla lenta cottura del nostro pulled pork speziato, seguendo una ricetta che abbiamo perfezionato nel tempo.</p>
          <p style={{ marginTop: "1rem" }}>Mettiti comodo. In Viale Emilia 40 troverai un ambiente accogliente, la piastra sempre calda e piatti preparati da chi ama il buon cibo e la propria terra. Nessun trucco, nessuna fretta: solo il sapore genuino delle cose fatte in casa.</p>
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
          <h2 id="final-cta-title">Ti è venuta fame? Ordina da GotBun.</h2>
          <p>Vai al portale ufficiale, scegli il tuo burger e lascia che la piastra faccia il resto.</p>
        </div>
        <a className="main-cta-btn cta-order" href={DISH_ORDER_URL} rel="noreferrer" target="_blank">
          Ordina ora
        </a>
      </section>

      {/* Zona burger: sfondo visibile + hook testuale finale convincente */}
      <div className="main-burger-zone">
        <div className="main-burger-spacer" aria-hidden="true" />
        <div className="main-burger-closing-card">
          <p className="burger-closing-label">Ancora lì?</p>
          <p className="burger-closing-tagline">La piastra è accesa.</p>
          <p className="burger-closing-sub">
            Ogni sera dalle 18:30 · Viale Emilia 40, Riccione
          </p>
          <a className="main-cta-btn cta-order burger-closing-btn" href={DISH_ORDER_URL} rel="noreferrer" target="_blank">
            Ordina ora
          </a>
        </div>
      </div>
    </main>

    <footer className="main-footer-rich">
        <div className="footer-grid">
          {/* Colonna 1: Raggiungici */}
          <div className="footer-col">
            <h3>Raggiungici</h3>
            <p className="footer-address">
              Viale Emilia 40<br />
              47838 Riccione (RN)
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com/gotbun_riccione" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com/gotbunriccione" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
            <a className="footer-map-btn" href={MAPS_URL} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
              Come Raggiungerci
            </a>
          </div>

          {/* Colonna 2: Contatti */}
          <div className="footer-col">
            <h3>Contatti</h3>
            <p>
              Telefono: <a href={`tel:${business.phone}`} className="footer-link">{business.displayPhone}</a><br />
              Email: <a href="mailto:info@gotbunriccione.it" className="footer-link">info@gotbunriccione.it</a>
            </p>
            <p className="footer-support">
              Per asporto o consegne a domicilio, ordina direttamente tramite il nostro portale web ufficiale.
            </p>
          </div>

          {/* Colonna 3: Orari di Apertura */}
          <div className="footer-col">
            <h3>Orari di Apertura</h3>
            <p className="footer-hours-title">Aperti tutti i giorni</p>
            <p className="footer-hours-time">Dalle 18:30 alle 22:45</p>
            <p className="footer-note">Cucina sempre attiva fino a chiusura locale.</p>
          </div>

          {/* Colonna 4: Note Legali */}
          <div className="footer-col">
            <h3>Note Legali</h3>
            <p className="footer-legal-text">
              GotBun Riccione<br />
              P.IVA: 12345678901
            </p>
            <nav className="footer-legal-links" aria-label="Privacy e condizioni">
              <Link href="/privacy">Privacy & Cookie Policy</Link>
              <a href={DISH_URL} target="_blank" rel="noreferrer">Sito vetrina DISH</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} GotBun Riccione. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </>
  );
}

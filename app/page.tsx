import Image from "next/image";
import Link from "next/link";

const MENU_URL = "https://gotbun.order.app.hd.digital/menus";
const PROMO_URL = "https://promo.gotbunriccione.it";
const DISH_URL = "https://gotbunriccione.eatbu.com";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=GotBun%20Riccione";

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
  return (
    <main className="main-site">
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

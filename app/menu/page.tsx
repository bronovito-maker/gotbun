import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MenuClient from "./MenuClient";
import { DISH_ORDER_URL, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Il Nostro Menu - GotBun Riccione",
  description: "Sfoglia il menu completo di GotBun Riccione: smash burger caldi e croccanti, wrap veloci, hot dog, piadine e sfiziosità artigianali. Crea il tuo bun personalizzato online.",
  alternates: {
    canonical: "https://gotbunriccione.it/menu",
  },
};

export default function MenuPage() {
  // Complete database of menu categories and items
  const menuCategories = [
    {
      id: "burgers",
      label: "Burgers 🍔",
      icon: "🍔",
      items: [
        {
          name: "LUFFY",
          price: 11.90,
          description: "Hamburger di manzo nostrano, insalata, cipolla caramellata, cheddar, salsa Burger",
          tag: "Consigliato",
          isPopular: true,
          image: "/menu/luffy.png"
        },
        {
          name: "SMOOKYPIG",
          price: 12.90,
          description: "Pane nero, Pulled Pork speziato, cipolla caramellata, bucciato romagnolo, peperoni arrosto, salsa BBQ, salsa Maionese",
          tag: "Carne Speziata",
          isPopular: true,
          image: "/menu/smookypig.png"
        },
        {
          name: "CHICKENBUN",
          price: 10.90,
          description: "Cotoletta di pollo, insalata, bacon, bucciato romagnolo, salsa Ketchup, salsa Maionese",
          image: "/menu/chickenbun.png"
        },
        {
          name: "GOTCHESSEBACON",
          price: 11.90,
          description: "Il classico BaconCheese: Hamburger di manzo nostrano, doppio Cheddar, bacon, pomodoro, salsa Burger",
          tag: "Ispirato ai classici",
          image: "/menu/gotcheese-bacon.png"
        },
        {
          name: "AMERICANBUN",
          price: 12.90,
          description: "Hamburger di manzo nostrano, cheddar, uovo all’occhio di bue, bacon, insalata, doppia salsa BBQ",
          tag: "Carico",
          image: "/menu/americanbun.png"
        },
        {
          name: "GUILTY PLEASURE",
          price: 10.90,
          description: "Hamburger di manzo nostrano, cipolla, scamorza affumicata, bacon, salsa Maionese, salsa Ketchup",
          image: "/menu/guilty-pleasure.png"
        },
        {
          name: "HABANERO",
          price: 12.90,
          description: "Pane nero, hamburger di manzo nostrano, cheddar, bacon, cipolla, cetriolini pickled, salsa Habanero, salsa Maionese",
          tag: "Molto Piccante 🌶️🌶️",
          image: "/menu/habanero.png"
        },
        {
          name: "PESCATORE",
          price: 12.90,
          description: "Salmone affumicato norvegese, squacquerone di Romagna, rucola, pomodorini confit , salsa Avocado",
          tag: "Novità Mare",
          image: "/menu/pescatore.png"
        },
        {
          name: "GREENBUN",
          price: 11.90,
          description: "Pane ai cereali artigianale, falafel di ceci, bucciato romagnolo, Melanzane grigliate, insalata, salsa Maionese",
          tag: "Vegetariano 🌱",
          image: "/menu/greenbun.png"
        },
        {
          name: "LIGHTBUN",
          price: 12.90,
          description: "Pane Vegano ai 5 Cereali, Falafel di ceci Gotmade, peperoni arrosto, scamorza affumicata, cipolla caramellata, salsa Burger",
          tag: "Vegano Friendly 🌱",
          image: "/menu/lightbun.png"
        }
      ]
    },
    {
      id: "create-my-bun",
      label: "Crea il tuo Bun 🛠️",
      icon: "🛠️",
      items: [] // Handled dynamically in the client calculator component
    },
    {
      id: "piadine",
      label: "Piadine 🥯",
      icon: "🥯",
      items: [
        {
          name: "STORICA",
          price: 8.00,
          description: "Prosciutto crudo di Parma, squacquerone di Romagna, rucola fresca",
          tag: "Tradizione Romagna",
          image: "/menu/piadina-storica.png"
        },
        {
          name: "MARINARA",
          price: 9.00,
          description: "Salmone affumicato, Squacquerone di Romagna DOP, rucola fresca",
          image: "/menu/piadina-marinara.png"
        },
        {
          name: "PROTEICA",
          price: 9.00,
          description: "Bresaola IGP, scaglie di Grana Padano, rucola fresca",
          image: "/menu/piadina-proteica.png"
        },
        {
          name: "PECCATO DI GOLA",
          price: 8.50,
          description: "Salsiccia fresca, cipolla stufata (Aggiunta Squacquerone DOP +0.50€)",
          isPopular: true,
          image: "/menu/piadina-peccatogola.png"
        },
        {
          name: "VEGETALE",
          price: 7.50,
          description: "Verdure grigliate (melanzane e zucchine), cipolla caramellata, squacquerone di Romagna DOP",
          tag: "Vegetariano 🌱",
          image: "/menu/piadina-vegetale.png"
        }
      ]
    },
    {
      id: "wraps",
      label: "Wraps 🌯",
      icon: "🌯",
      items: [
        {
          name: "SMOOKYPIG WRAP",
          price: 8.90,
          description: "Tortilla Messicana, pulled pork, Cheddar, cipolla , insalata, salsa BBQ",
          image: "/menu/smookypig-wrap.png"
        },
        {
          name: "CHICKEN WRAP",
          price: 7.90,
          description: "Tortilla Messicana, cotoletta di pollo, insalata, pomodoro, patatine fritte, salsa cesar",
          image: "/menu/chicken-wrap.png"
        },
        {
          name: "PROTEIN WRAPP",
          price: 8.90,
          description: "Tortilla Messicana, manzo nostrano, Bucciato romagnolo , insalata, pomodoro, salsa burger",
          isPopular: true,
          image: "/menu/protein-wrap.png"
        },
        {
          name: "FALAFEL WRAP",
          price: 7.90,
          description: "Tortilla Messicana, falafel di ceci, insalata, pomodoro, cetriolini, Salsa maionese , salsa ketchup",
          tag: "Vegetariano 🌱",
          image: "/menu/falafel-wrap.png"
        }
      ]
    },
    {
      id: "hotdogs",
      label: "Hot Dogs 🌭",
      icon: "🌭",
      items: [
        {
          name: "BASIC HOTDOG",
          price: 6.90,
          description: "Würstel di pollo e tacchino, salsa Ketchup, salsa Maionese",
          image: "/menu/basic-hotdog.png"
        },
        {
          name: "GOLOSO DOG",
          price: 9.90,
          description: "Würstel di pollo e tacchino, scamorza affumicata, cipolla caramellata, salsa ketchup, senape",
          isPopular: true,
          image: "/menu/goloso-dog.png"
        },
        {
          name: "HOTBACON DOG",
          price: 8.90,
          description: "Würstel di pollo e tacchino, cheddar, bacon, salsa BBQ",
          image: "/menu/hotbacon-dog.png"
        },
        {
          name: "VEG DOG",
          price: 7.90,
          description: "Würstel di falafel, bucciato romagnolo, salsa ketchup , salsa maionese",
          tag: "Vegetariano 🌱",
          image: "/menu/veg-dog.png"
        }
      ]
    },
    {
      id: "insalate",
      label: "Insalate 🥗",
      icon: "🥗",
      items: [
        {
          name: "Salmone",
          price: 9.40,
          description: "Insalata, salmone affumicato norvegese, pomodorini confit, olive a rondelle rucola, salsa Avocado",
          image: "/menu/insalata-salmone.png"
        },
        {
          name: "Imperiale",
          price: 9.90,
          description: "Insalata, Hamburger di manzo nostrano strips, pomodoro, cipolla fresca, scaglie di formaggio, salsa BBQ",
          image: "/menu/insalata-imperiale.png"
        },
        {
          name: "Caesar",
          price: 9.40,
          description: "Insalata, Cotoletta di pollo strips, scaglie di formaggio, crostini di pane, salsa Caesar",
          isPopular: true,
          image: "/menu/insalata-caesar.png"
        },
        {
          name: "Greca",
          price: 8.90,
          description: "Insalata, Feta a cubetti, cetrioli, pomodoro, olive nere a rondelle, cipolla fresca, crema di Aceto Balsamico",
          tag: "Vegetariano 🌱",
          image: "/menu/insalata-greca.png"
        },
        {
          name: "Light",
          price: 8.90,
          description: "Insalata, Falafel di ceci strips GotMade, rucola, noci, scaglie di formaggio, crema di aceto balsamico",
          tag: "Vegetariano 🌱",
          image: "/menu/insalata-light.png"
        }
      ]
    },
    {
      id: "sfiziosita",
      label: "Sfiziosità 🍟",
      icon: "🍟",
      items: [
        {
          name: "Dirty Fingers",
          price: 5.90,
          description: "Patatine fritte con Pulled Pork speziato, salsa Cheddar, salsa BBQ",
          tag: "Super Carico 🔥",
          image: "/menu/dirty-fingers.png"
        },
        {
          name: "Anelli di Cipolla",
          price: 5.90,
          description: "Rondelle di cipolla pastellate e fritte",
          image: "/menu/anelli-cipolla.png"
        },
        {
          name: "Patatine Classic Piccole",
          price: 1.90,
          description: "Patatine fritte ma più croccanti",
          image: "/menu/patatine-classic-piccole.png"
        },
        {
          name: "Patatine fritte Classic Grandi",
          price: 3.90,
          description: "Patatine classiche ma più croccanti",
          image: "/menu/patatine-classic-grandi.png"
        },
        {
          name: "Patatine Crispers Piccola",
          price: 2.90,
          description: "Spicchi di patate croccanti, con la buccia",
          image: "/menu/patatine-crispers-piccola.png"
        },
        {
          name: "Patatine Crispers Grandi",
          price: 4.50,
          description: "Spicchi di patate croccanti, con la buccia",
          image: "/menu/patatine-crispers-grandi.png"
        },
        {
          name: "Olive all’ Ascolana",
          price: 5.90,
          description: "Palline fritte ripiene di carne macinata e oliva",
          image: "/menu/olive-ascolana.png"
        },
        {
          name: "Pepite di Pollo 6 pezzi",
          price: 5.90,
          description: "Pepite di pollo fresco fatte in casa 6 pezzi",
          image: "/menu/pepite-pollo-6.png"
        },
        {
          name: "Pepite di pollo 9 pezzi",
          price: 7.90,
          description: "Pepite di pollo fresco fatte in casa 9 pezzi",
          image: "/menu/pepite-pollo-9.png"
        },
        {
          name: "Petali di Cipolla",
          price: 5.90,
          description: "Fettine di cipolla pastellate e fritte",
          image: "/menu/petali-cipolla.png"
        },
        {
          name: "Mozzarelline in Carrozza 6 Pezzi",
          price: 5.90,
          description: "Deliziosi bocconcini di mozzarella, fritti",
          image: "/menu/mozzarelline-6.png"
        },
        {
          name: "Mozzarelline in carrozza 9 pezzi",
          price: 7.90,
          description: "Deliziosi bocconcini di mozzarella, fritti",
          image: "/menu/mozzarelline-9.png"
        }
      ]
    },
    {
      id: "kids-menu",
      label: "Kids Menu 👶",
      icon: "👶",
      items: [
        {
          name: "GotBaby Burger",
          price: 8.40,
          description: "Pane Baby artigianale, salsa Ketchup, salsa Maionese, a scelta tra: Hamburger di manzo nostrano, Falafel di ceci GotMade, Cotoletta di pollo, Würstel di pollo e tacchino. Patatine fritte comprese",
          tag: "Per i più piccoli",
          image: "/menu/gotbaby-burger.png"
        }
      ]
    },
    {
      id: "dolci",
      label: "Dolci 🍰",
      icon: "🍰",
      items: [
        {
          name: "Apple Pie",
          price: 4.90,
          description: "Delizioso trancio di torta di mele",
          image: "/menu/apple-pie.png"
        },
        {
          name: "Brownie",
          price: 4.90,
          description: "Classico dolce americano, “cioccolatoso” e saporito",
          image: "/menu/brownie.png"
        }
      ]
    },
    {
      id: "bevande",
      label: "Bevande 🍺",
      icon: "🍺",
      items: [
        { name: "Franziskaner Weissbier 50cl", price: 4.00, description: "Birra Weiss di alta qualità" },
        { name: "Ichnusa non filtrata 33cl", price: 3.50, description: "Birra Sarda non filtrata" },
        { name: "Ichnusa non filtrata 50cl", price: 4.50, description: "Birra Sarda non filtrata" },
        { name: "Corona 33cl", price: 4.00, description: "Messicana chiara rinfrescante" },
        { name: "Ceres 33cl", price: 4.00, description: "Strong lager a doppia fermentazione" },
        { name: "Messina 33cl", price: 3.50, description: "Ricetta classica siciliana" },
        { name: "Budweiser 33cl", price: 4.00, description: "American lager pulita e leggera" },
        { name: "Moretti filtrata a freddo 33cl", price: 3.50, description: "Birra lager filtrata a freddo" },
        { name: "La Moretti 0.0% Alcol", price: 3.50, description: "Zero alcol, gusto pieno" },
        { name: "San Miguel 1L", price: 6.00, description: "Formato condivisione da 1 litro" },
        { name: "Acqua Naturale 50cl", price: 1.50, description: "Acqua minerale frizzante o naturale" },
        { name: "Acqua Naturale 1L", price: 2.50, description: "Acqua minerale frizzante o naturale" },
        { name: "Coca Cola 33cl", price: 2.50, description: "Disponibile anche Zero" },
        { name: "Coca Cola 1.5L", price: 4.50, description: "Bottiglia grande per asporto" },
        { name: "Fanta 33cl", price: 2.50, description: "Bibita all'arancia" },
        { name: "Sprite 33cl", price: 2.50, description: "Bibita limone e lime" },
        { name: "The Limone 33cl", price: 2.50, description: "Te freddo San Benedetto o Estathé" },
        { name: "The Pesca 33cl", price: 2.50, description: "Te freddo San Benedetto o Estathé" },
        { name: "Redbull 25cl", price: 3.00, description: "Energy drink" }
      ]
    },
    {
      id: "salse",
      label: "Salse 🥫",
      icon: "🥫",
      items: [
        { name: "Salsa Ketchup", price: 0.50, description: "Fatta in casa con pomodori freschi" },
        { name: "Salsa Maionese (Veg)", price: 0.50, description: "Fatta in casa, 100% vegetale" },
        { name: "Salsa BBQ", price: 0.50, description: "Fatta in casa, gusto affumicato" },
        { name: "Salsa Habanero", price: 0.80, description: "Fatta in casa, molto piccante 🌶️🌶️" },
        { name: "Salsa Senape", price: 0.50, description: "Salsa senape tradizionale" },
        { name: "Salsa Burger", price: 0.50, description: "Salsa signature GotBun per panini" }
      ]
    }
  ];

  // Schema.org Restaurant Menu JSON-LD
  const schemaMenu = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Menu GotBun Riccione",
    "description": "Menu completo di GotBun Riccione: burger, smash burger, wraps, hot dog, piadine e salse artigianali.",
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
            <span className="main-logo-subtitle">riccione</span>
          </div>
        </Link>
        <h1 className="menu-page-subtitle">Scegli & Addenta</h1>
        <p className="menu-page-description">
          Sfoglia il nostro listino artigianale. La carne è fresca, il pane è dorato in piastra e le salse sono preparate in casa ogni giorno.
        </p>
      </header>

      {/* Interactive Client Component */}
      <MenuClient categories={menuCategories} />

      {/* Call to Order Info */}
      <section className="main-final-cta" style={{ marginTop: "48px" }}>
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
      <footer className="main-footer">
        <p>© GotBun Riccione</p>
        <nav aria-label="Link utili">
          <Link href="/">Homepage</Link>
          <span style={{ margin: "0 8px", color: "var(--main-text-muted)" }}>•</span>
          <Link href="/privacy">Privacy e condizioni</Link>
        </nav>
      </footer>
    </main>
  );
}

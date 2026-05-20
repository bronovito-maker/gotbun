"use client";

import { useState, useEffect, useRef } from "react";
import { DISH_ORDER_URL } from "@/lib/seo";

// Types
interface MenuItem {
  name: string;
  price: number;
  description: string;
  tag?: string;
  isPopular?: boolean;
  image?: string;
}

interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  items: MenuItem[];
}

// Configurator options data
const CONFIG_BASES = [
  { id: "pollo", name: "Pane nero + Cotoletta di Pollo Fritto", price: 7.50 },
  { id: "manzo", name: "Pane nero + Hamburger di Manzo 155g", price: 8.50 },
  { id: "pulled", name: "Pane nero + Pulled Pork Speziato", price: 8.50 },
  { id: "falafel", name: "Pane nero + Burger di Falafel", price: 8.20 },
];

const CONFIG_BREADS = [
  { id: "nero", name: "Pane Nero (Incluso)", price: 0.00 },
  { id: "classico", name: "Pane Classico Artigianale", price: 0.50 },
  { id: "cereali", name: "Pane ai 5 Cereali Artigianale", price: 0.50 },
];

const CONFIG_CHEESES = [
  { id: "bucciato", name: "Bucciato Romagnolo", price: 1.50 },
  { id: "cheddar", name: "Cheddar", price: 1.00 },
  { id: "scamorza", name: "Scamorza Affumicata", price: 1.00 },
];

const CONFIG_VEGGIES = [
  { id: "insalata", name: "Insalata fresca", price: 0.50 },
  { id: "pomodoro", name: "Pomodoro", price: 0.70 },
  { id: "cipolla", name: "Cipolla Bianca", price: 0.50 },
  { id: "cipolla_car", name: "Cipolla Caramellata", price: 1.50 },
  { id: "peperoni", name: "Peperoni Arrosto", price: 2.00 },
  { id: "melanzane", name: "Melanzane Grigliate", price: 1.50 },
];

const CONFIG_PATTIES = [
  { id: "add_pollo", name: "Extra Cotoletta Pollo", price: 2.90 },
  { id: "add_manzo", name: "Extra Manzo 155g", price: 3.90 },
  { id: "add_falafel", name: "Extra Falafel", price: 3.40 },
  { id: "add_pulled", name: "Extra Pulled Pork", price: 3.50 },
];

const CONFIG_EXTRAS = [
  { id: "bacon", name: "Bacon Croccante", price: 1.50 },
  { id: "uovo", name: "Uovo all'occhio di bue", price: 1.00 },
  { id: "cetriolini", name: "Cetriolini sott'aceto", price: 1.00 },
  { id: "confit", name: "Pomodorini Confit", price: 1.50 },
  { id: "patatine", name: "Patatine Fritte", price: 1.00 },
];

const CONFIG_SAUCES = [
  { id: "ketchup", name: "Ketchup (fatto in casa)", price: 0.50 },
  { id: "maionese", name: "Maionese Veg (fatta in casa)", price: 0.50 },
  { id: "habanero", name: "Habanero (fatto in casa) 🌶️", price: 0.80 },
  { id: "bbq", name: "BBQ (fatta in casa)", price: 0.50 },
  { id: "burger", name: "Salsa Burger", price: 0.50 },
  { id: "senape", name: "Senape", price: 0.50 },
];

// Fallback Image Component — accepts optional onClick for lightbox
const MenuItemImage = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="menu-item-photo-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span>Foto</span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={`menu-item-photo${onClick ? " menu-item-photo--clickable" : ""}`}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      onClick={onClick}
      loading="lazy"
    />
  );
};

export default function MenuClient({ categories }: { categories: MenuCategory[] }) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("burgers");

  // Configurator states
  const [selectedBase, setSelectedBase] = useState("manzo");
  const [selectedBread, setSelectedBread] = useState("nero");
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>([]);
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([]);
  const [selectedPatties, setSelectedPatties] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<{ src: string; name: string } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };
    if (lightboxItem) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxItem]);

  // Smooth scroll with offset for sticky nav
  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const stickyOffset = 90; // height of sticky bar + padding
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - stickyOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Center active pill button in horizontal scroll container
  useEffect(() => {
    const container = navRef.current;
    if (!container) return;
    
    const activeBtn = container.querySelector(".menu-nav-btn.active") as HTMLElement;
    if (activeBtn) {
      const containerWidth = container.offsetWidth;
      const btnOffsetLeft = activeBtn.offsetLeft;
      const btnWidth = activeBtn.offsetWidth;
      
      container.scrollTo({
        left: btnOffsetLeft - (containerWidth / 2) + (btnWidth / 2),
        behavior: "smooth"
      });
    }
  }, [activeCategory]);

  // Viewport scroll tracking with high precision
  useEffect(() => {
    const handleScroll = () => {
      const offset = 140; // viewport top offset
      let activeId = categories[0].id;
      
      for (const cat of categories) {
        const el = document.getElementById(cat.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            activeId = cat.id;
          }
        }
      }
      setActiveCategory(activeId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  // Price calculator logic
  const calculateTotal = () => {
    let total = 0;
    
    // 1. Base patty
    const baseItem = CONFIG_BASES.find(b => b.id === selectedBase);
    if (baseItem) total += baseItem.price;

    // 2. Bread type
    const breadItem = CONFIG_BREADS.find(br => br.id === selectedBread);
    if (breadItem) total += breadItem.price;

    // 3. Cheeses
    selectedCheeses.forEach(cId => {
      const cheese = CONFIG_CHEESES.find(c => c.id === cId);
      if (cheese) total += cheese.price;
    });

    // 4. Veggies
    selectedVeggies.forEach(vId => {
      const veg = CONFIG_VEGGIES.find(v => v.id === vId);
      if (veg) total += veg.price;
    });

    // 5. Extra Patties
    selectedPatties.forEach(pId => {
      const patty = CONFIG_PATTIES.find(p => p.id === pId);
      if (patty) total += patty.price;
    });

    // 6. Extras
    selectedExtras.forEach(eId => {
      const extra = CONFIG_EXTRAS.find(e => e.id === eId);
      if (extra) total += extra.price;
    });

    // 7. Sauces
    selectedSauces.forEach(sId => {
      const sauce = CONFIG_SAUCES.find(s => s.id === sId);
      if (sauce) total += sauce.price;
    });

    return total.toFixed(2);
  };

  // Helper arrays toggling
  const toggleCheckbox = (id: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (state.includes(id)) {
      setState(state.filter(item => item !== id));
    } else {
      setState([...state, id]);
    }
  };

  const resetConfigurator = () => {
    setSelectedBase("manzo");
    setSelectedBread("nero");
    setSelectedCheeses([]);
    setSelectedVeggies([]);
    setSelectedPatties([]);
    setSelectedExtras([]);
    setSelectedSauces([]);
  };

  return (
    <div className="menu-container">
      {/* Category Pills Navigation */}
      <nav className="menu-nav-wrapper" aria-label="Categorie menu">
        <div className="menu-nav" ref={navRef}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-nav-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => scrollToCategory(cat.id)}
            >
              <span style={{ marginRight: "4px" }}>{cat.icon}</span>
              {cat.label.replace(/[^a-zA-Z\s&]/g, "").trim()}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Menu Listing */}
      <div className="menu-sections-wrapper">
        {categories.map((cat) => {
          if (cat.id === "create-my-bun") {
            return (
              <section key={cat.id} id={cat.id} className="menu-category-section">
                <h2 className="menu-category-heading">
                  <span>{cat.icon}</span> {cat.label}
                </h2>
                
                <div className="mybun-configurator">
                  <div className="configurator-title-block">
                    <h3 className="configurator-title">🛠️ Crea il tuo Bun Personalizzato</h3>
                    <p className="configurator-subtitle">
                      Scegli la base, il pane, il formaggio e aggiungi gli ingredienti freschi che preferisci. Calcoliamo il prezzo in tempo reale!
                    </p>
                  </div>

                  <div className="configurator-steps">
                    {/* Step 1: Scegli la Base */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        1. Scegli la Base 🥩 <span>(Seleziona una)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_BASES.map(b => (
                          <div 
                            key={b.id} 
                            className={`config-option-row ${selectedBase === b.id ? "selected" : ""}`}
                            onClick={() => setSelectedBase(b.id)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="radio" 
                                className="config-option-input"
                                name="base-patty"
                                checked={selectedBase === b.id}
                                onChange={() => setSelectedBase(b.id)}
                              />
                              <span className="config-option-name">{b.name}</span>
                            </div>
                            <span className="config-option-price">€{b.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Scegli il Pane */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        2. Tipo di Pane 🥯 <span>(Seleziona uno)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_BREADS.map(br => (
                          <div 
                            key={br.id} 
                            className={`config-option-row ${selectedBread === br.id ? "selected" : ""}`}
                            onClick={() => setSelectedBread(br.id)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="radio" 
                                className="config-option-input"
                                name="bread-type"
                                checked={selectedBread === br.id}
                                onChange={() => setSelectedBread(br.id)}
                              />
                              <span className="config-option-name">{br.name}</span>
                            </div>
                            <span className="config-option-price">
                              {br.price > 0 ? `€${br.price.toFixed(2)}` : "Gratis"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Scegli il Formaggio */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        3. Aggiungi il Formaggio 🧀 <span>(Opzionale)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_CHEESES.map(c => (
                          <div 
                            key={c.id} 
                            className={`config-option-row ${selectedCheeses.includes(c.id) ? "selected" : ""}`}
                            onClick={() => toggleCheckbox(c.id, selectedCheeses, setSelectedCheeses)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="checkbox" 
                                className="config-option-input"
                                checked={selectedCheeses.includes(c.id)}
                                onChange={() => toggleCheckbox(c.id, selectedCheeses, setSelectedCheeses)}
                              />
                              <span className="config-option-name">{c.name}</span>
                            </div>
                            <span className="config-option-price">€{c.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 4: Scegli le Verdure */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        4. Aggiungi Verdure 🥬 <span>(Opzionale)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_VEGGIES.map(v => (
                          <div 
                            key={v.id} 
                            className={`config-option-row ${selectedVeggies.includes(v.id) ? "selected" : ""}`}
                            onClick={() => toggleCheckbox(v.id, selectedVeggies, setSelectedVeggies)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="checkbox" 
                                className="config-option-input"
                                checked={selectedVeggies.includes(v.id)}
                                onChange={() => toggleCheckbox(v.id, selectedVeggies, setSelectedVeggies)}
                              />
                              <span className="config-option-name">{v.name}</span>
                            </div>
                            <span className="config-option-price">€{v.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 5: Altro Hamburger/Patty */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        5. Raddoppia Patty 🥩 <span>(Hai molta fame?)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_PATTIES.map(p => (
                          <div 
                            key={p.id} 
                            className={`config-option-row ${selectedPatties.includes(p.id) ? "selected" : ""}`}
                            onClick={() => toggleCheckbox(p.id, selectedPatties, setSelectedPatties)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="checkbox" 
                                className="config-option-input"
                                checked={selectedPatties.includes(p.id)}
                                onChange={() => toggleCheckbox(p.id, selectedPatties, setSelectedPatties)}
                              />
                              <span className="config-option-name">{p.name}</span>
                            </div>
                            <span className="config-option-price">€{p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 6: Scegli gli Extra */}
                    <div className="config-group">
                      <h4 className="config-group-heading">
                        6. Ingredienti Extra ✨ <span>(Opzionale)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_EXTRAS.map(e => (
                          <div 
                            key={e.id} 
                            className={`config-option-row ${selectedExtras.includes(e.id) ? "selected" : ""}`}
                            onClick={() => toggleCheckbox(e.id, selectedExtras, setSelectedExtras)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="checkbox" 
                                className="config-option-input"
                                checked={selectedExtras.includes(e.id)}
                                onChange={() => toggleCheckbox(e.id, selectedExtras, setSelectedExtras)}
                              />
                              <span className="config-option-name">{e.name}</span>
                            </div>
                            <span className="config-option-price">€{e.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 7: Scegli le Salse */}
                    <div className="config-group" style={{ gridColumn: "span 1" }}>
                      <h4 className="config-group-heading">
                        7. Salse artigianali 🥫 <span>(Fatte in casa)</span>
                      </h4>
                      <div className="config-options-list">
                        {CONFIG_SAUCES.map(s => (
                          <div 
                            key={s.id} 
                            className={`config-option-row ${selectedSauces.includes(s.id) ? "selected" : ""}`}
                            onClick={() => toggleCheckbox(s.id, selectedSauces, setSelectedSauces)}
                          >
                            <div className="config-option-label-block">
                              <input 
                                type="checkbox" 
                                className="config-option-input"
                                checked={selectedSauces.includes(s.id)}
                                onChange={() => toggleCheckbox(s.id, selectedSauces, setSelectedSauces)}
                              />
                              <span className="config-option-name">{s.name}</span>
                            </div>
                            <span className="config-option-price">€{s.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculator Footer */}
                  <div className="configurator-footer">
                    <div className="configurator-price-block">
                      <span className="configurator-price-label">Prezzo Totale Calcolato</span>
                      <span className="configurator-total-price">€{calculateTotal()}</span>
                    </div>
                    <div className="configurator-actions">
                      <button 
                        type="button" 
                        className="configurator-reset-btn" 
                        onClick={resetConfigurator}
                      >
                        Azzera
                      </button>
                      <a 
                        className="configurator-order-btn" 
                        href={DISH_ORDER_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ordina su DISH
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section key={cat.id} id={cat.id} className="menu-category-section">
              <h2 className="menu-category-heading">
                <span>{cat.icon}</span> {cat.label}
              </h2>
              <div className="menu-grid">
                {cat.items.map((item) => (
                  <article className={`menu-card ${item.isPopular ? "popular-card" : ""}`} key={item.name}>
                    <div className="menu-item-content">
                      <div className="menu-item-details">
                        <div className="menu-item-header">
                          <h3 className="menu-item-name">{item.name}</h3>
                        </div>
                        <p className="menu-item-description">{item.description}</p>
                        <div className="menu-item-footer">
                          <span className="menu-item-price">€{item.price.toFixed(2)}</span>
                          <div className="menu-item-tags">
                            {item.tag && (
                              <span className={`menu-item-tag ${
                                item.tag.includes("🌶️") || item.tag.includes("🔥")
                                  ? "spicy-tag"
                                  : item.tag.includes("🌱")
                                    ? "veg-tag"
                                    : "default-tag"
                              }`}>
                                {item.tag}
                              </span>
                            )}
                            {item.isPopular && (
                              <span className="menu-item-tag popular-tag">👑 Popolare</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Clickable photo with lightbox */}
                      <div className="menu-item-photo-wrapper">
                        <MenuItemImage
                          src={item.image || ""}
                          alt={item.name}
                          onClick={item.image ? () => setLightboxItem({ src: item.image!, name: item.name }) : undefined}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Lightbox overlay ── */}
      {lightboxItem && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto: ${lightboxItem.name}`}
        >
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxItem(null)}
              aria-label="Chiudi"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="lightbox-image"
              src={lightboxItem.src}
              alt={lightboxItem.name}
            />
            <p className="lightbox-name">{lightboxItem.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

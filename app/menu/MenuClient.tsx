"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  { id: "habanero", name: "Habanero (fatto in casa) 🌶️🌶️🌶️", price: 0.80 },
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

  if (src && src.startsWith("emoji:")) {
    const emoji = src.replace("emoji:", "");
    return (
      <div className="menu-item-photo-placeholder menu-item-photo-emoji" style={{ background: "rgba(0, 163, 217, 0.08)", border: "1px solid rgba(0, 163, 217, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "2.6rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }}>{emoji}</span>
      </div>
    );
  }

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
  const initialCategoryId = categories[0]?.id ?? "";
  const navRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const activeCategoryRef = useRef(initialCategoryId);
  const sliderMeasuredRef = useRef(false);
  const sliderReadyFrameRef = useRef<number | null>(null);
  const [activeCategory, setActiveCategory] = useState(initialCategoryId);

  // Selected Menu Item for Details popup
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);

  const setCurrentCategory = useCallback((id: string) => {
    if (activeCategoryRef.current === id) return;
    activeCategoryRef.current = id;
    setActiveCategory(id);
  }, []);

  // Close details popup on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItemForDetail(null);
    };
    if (selectedItemForDetail) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedItemForDetail]);

  // Smooth scroll with offset for sticky nav
  const scrollToCategory = (id: string) => {
    setCurrentCategory(id);
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

  const updateSlider = useCallback(() => {
    const container = navRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return false;

    const activeBtn = container.querySelector<HTMLElement>(".menu-nav-btn.active");
    if (!activeBtn) return false;

    slider.style.setProperty("--menu-nav-slider-x", `${activeBtn.offsetLeft}px`);
    slider.style.setProperty("--menu-nav-slider-y", `${activeBtn.offsetTop}px`);
    slider.style.setProperty("--menu-nav-slider-width", `${activeBtn.offsetWidth}px`);
    slider.style.setProperty("--menu-nav-slider-height", `${activeBtn.offsetHeight}px`);

    if (!sliderMeasuredRef.current) {
      sliderMeasuredRef.current = true;
      slider.classList.add("is-visible");
      sliderReadyFrameRef.current = requestAnimationFrame(() => {
        slider.classList.add("is-ready");
        sliderReadyFrameRef.current = null;
      });
    }

    return true;
  }, []);

  // Slider: measure before paint and drive the pill through CSS variables.
  useLayoutEffect(() => {
    updateSlider();
  }, [activeCategory, updateSlider]);

  useEffect(() => {
    return () => {
      if (sliderReadyFrameRef.current !== null) {
        cancelAnimationFrame(sliderReadyFrameRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const container = navRef.current;
    if (!container) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSlider);
      return () => window.removeEventListener("resize", updateSlider);
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSlider();
    });

    resizeObserver.observe(container);
    container.querySelectorAll(".menu-nav-btn").forEach((button) => {
      resizeObserver.observe(button);
    });

    return () => resizeObserver.disconnect();
  }, [categories, updateSlider]);

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
    let frame: number | null = null;

    const updateActiveCategory = () => {
      frame = null;
      if (categories.length === 0) return;

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
      setCurrentCategory(activeId);
    };

    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(updateActiveCategory);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveCategory(); // run once initially

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [categories, setCurrentCategory]);

  // Interactivity helper removed as the configurator is now static text.

  return (
    <div className="menu-container">
      {/* Category Pills Navigation */}
      <nav className="menu-nav-wrapper" aria-label="Categorie menu">
        <div className="menu-nav" ref={navRef}>
          {/* Magic sliding indicator */}
          <span
            ref={sliderRef}
            className="menu-nav-slider"
            aria-hidden="true"
          />
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-nav-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => scrollToCategory(cat.id)}
            >
              <span style={{ marginRight: "4px" }}>{cat.icon}</span>
              {cat.label.replace(/[^\p{L}\s&]/gu, "").trim()}
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
                  <span className="menu-category-icon">{cat.icon}</span>
                  <span className="menu-category-label">{cat.label}</span>
                </h2>
                
                <div className="mybun-configurator" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="configurator-title-block" style={{ borderBottom: "1px solid rgba(0, 163, 217, 0.08)", paddingBottom: "16px", marginBottom: 0 }}>
                    <h3 className="configurator-title" style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0c2a38" }}>🛠️ Crea il tuo Bun</h3>
                    <p className="configurator-subtitle" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--main-accent, #ff7a1a)", marginTop: "4px" }}>
                      La base di partenza è a scelta da €7.50
                    </p>
                    <p style={{ color: "#557280", fontSize: "0.9rem", margin: "8px 0 0", lineHeight: "1.4" }}>
                      Componi il tuo panino al tavolo. Elenca gli ingredienti al personale di cassa al momento dell&apos;ordine.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                    {/* Basi di Partenza */}
                    <div>
                      <h4 style={{ fontSize: "1rem", textTransform: "uppercase", color: "#0c2a38", marginBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px" }}>
                        1. Scegli la Base (Include Pane Nero)
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {CONFIG_BASES.map(b => (
                          <li key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#3a5a6a" }}>
                            <span>{b.name.replace("Pane nero + ", "")}</span>
                            <strong style={{ color: "#0c2a38" }}>€{b.price.toFixed(2)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Altri Tipi di Pane */}
                    <div>
                      <h4 style={{ fontSize: "1rem", textTransform: "uppercase", color: "#0c2a38", marginBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px" }}>
                        2. Alternativa Pane
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {CONFIG_BREADS.filter(br => br.price > 0).map(br => (
                          <li key={br.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#3a5a6a" }}>
                            <span>{br.name}</span>
                            <strong style={{ color: "#0c2a38" }}>+€{br.price.toFixed(2)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ingredienti e Aggiunte */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                      <div>
                        <h4 style={{ fontSize: "1rem", textTransform: "uppercase", color: "#0c2a38", marginBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px" }}>
                          3. Formaggi & Verdure
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                          <div>
                            <p style={{ fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--main-text-muted)", margin: "0 0 6px" }}>Formaggi</p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                              {CONFIG_CHEESES.map(c => (
                                <li key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#557280" }}>
                                  <span>{c.name}</span>
                                  <strong>+€{c.price.toFixed(2)}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div style={{ marginTop: "10px" }}>
                            <p style={{ fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--main-text-muted)", margin: "0 0 6px" }}>Verdure</p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                              {CONFIG_VEGGIES.map(v => (
                                <li key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#557280" }}>
                                  <span>{v.name}</span>
                                  <strong>+€{v.price.toFixed(2)}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1rem", textTransform: "uppercase", color: "#0c2a38", marginBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px" }}>
                          4. Extra Proteine & Ingredienti Speciali
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                          <div>
                            <p style={{ fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--main-text-muted)", margin: "0 0 6px" }}>Extra Carne / Patty</p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                              {CONFIG_PATTIES.map(p => (
                                <li key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#557280" }}>
                                  <span>{p.name}</span>
                                  <strong>+€{p.price.toFixed(2)}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div style={{ marginTop: "10px" }}>
                            <p style={{ fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--main-text-muted)", margin: "0 0 6px" }}>Altri Extra</p>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                              {CONFIG_EXTRAS.map(e => (
                                <li key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#557280" }}>
                                  <span>{e.name}</span>
                                  <strong>+€{e.price.toFixed(2)}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1rem", textTransform: "uppercase", color: "#0c2a38", marginBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "4px" }}>
                          5. Salse Artigianali (Fatte in casa)
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                          {CONFIG_SAUCES.map(s => (
                            <li key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#557280", paddingRight: "10px" }}>
                              <span>{s.name}</span>
                              <strong>+€{s.price.toFixed(2)}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section key={cat.id} id={cat.id} className="menu-category-section">
              <h2 className="menu-category-heading">
                <span className="menu-category-icon">{cat.icon}</span>
                <span className="menu-category-label">
                  {cat.label.replace(/[^\p{L}\s&]/gu, "").trim()}
                </span>
              </h2>
              <div className="menu-grid">
                {cat.items.map((item) => (
                  <article 
                    className={`menu-card ${item.isPopular ? "popular-card" : ""}`} 
                    key={item.name}
                    onClick={() => setSelectedItemForDetail(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="menu-item-content">
                      <div className="menu-item-top-row">
                        <div className="menu-item-details">
                          <div className="menu-item-header">
                            <h3 className="menu-item-name">{item.name}</h3>
                          </div>
                          <p className="menu-item-description">{item.description}</p>
                        </div>

                        {/* Photo representation */}
                        <div className="menu-item-photo-wrapper">
                          <MenuItemImage
                            src={item.image || ""}
                            alt={item.name}
                          />
                        </div>
                      </div>

                      {/* Footer: full-width below text+photo */}
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
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Details popup overlay ── */}
      {selectedItemForDetail && (
        <div
          className="lightbox-backdrop"
          onClick={() => setSelectedItemForDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Dettagli: ${selectedItemForDetail.name}`}
        >
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setSelectedItemForDetail(null)}
              aria-label="Chiudi"
            >
              ✕
            </button>
            {selectedItemForDetail.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                className="lightbox-image"
                src={selectedItemForDetail.image}
                alt={selectedItemForDetail.name}
              />
            )}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 className="lightbox-name" style={{ padding: 0, textAlign: "left", fontSize: "1.6rem", color: "var(--main-text, #fffaf0)" }}>
                {selectedItemForDetail.name}
              </h3>
              <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.55", margin: 0 }}>
                {selectedItemForDetail.description || "Nessun ingrediente o descrizione disponibile."}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#ff7a1a" }}>
                  €{selectedItemForDetail.price.toFixed(2)}
                </span>
                {selectedItemForDetail.tag && (
                  <span className={`menu-item-tag ${
                    selectedItemForDetail.tag.includes("🌶️") || selectedItemForDetail.tag.includes("🔥")
                      ? "spicy-tag"
                      : selectedItemForDetail.tag.includes("🌱")
                        ? "veg-tag"
                        : "default-tag"
                  }`} style={{ fontSize: "0.75rem", padding: "5px 12px" }}>
                    {selectedItemForDetail.tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

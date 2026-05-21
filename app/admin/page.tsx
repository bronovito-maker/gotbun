import { getMenu, getPromotions } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const menu = await getMenu();
  const promotions = await getPromotions();

  // Compute metrics
  const totalCategories = menu.length;
  const totalItems = menu.reduce((acc, cat) => acc + cat.items.length, 0);
  
  const promo2x1 = promotions.find(p => p.id === "promo_2x1");
  const promo10 = promotions.find(p => p.id === "promo_10");

  const activePromosCount = promotions.filter(p => p.isActive).length;

  return (
    <div>
      <div className="admin-header">
        <div className="admin-title-block">
          <h1>Pannello di Amministrazione</h1>
          <p>Panoramica delle attività e controllo del menu di GotBun Riccione.</p>
        </div>
      </div>

      {/* --- STATS CARD GRID --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Piatti Totali</div>
          <div className="stat-value">{totalItems}</div>
          <div className="stat-desc" style={{ color: "var(--admin-text-muted)" }}>
            Suddivisi in {totalCategories} categorie
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Promozioni Attive</div>
          <div className="stat-value" style={{ color: activePromosCount > 0 ? "var(--admin-success)" : "var(--admin-text-muted)" }}>
            {activePromosCount} / {promotions.length}
          </div>
          <div className="stat-desc">
            Aggiornate sul sito in tempo reale
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Stato Promo 2x1</div>
          <div className="stat-value" style={{ fontSize: "1.5rem", color: promo2x1?.isActive ? "var(--admin-success)" : "var(--admin-danger)" }}>
            {promo2x1?.isActive ? "🟢 ATTIVA" : "🔴 SPENTA"}
          </div>
          <div className="stat-desc" style={{ color: "var(--admin-text-muted)" }}>
            Consumazione al tavolo
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Stato Sconto -10%</div>
          <div className="stat-value" style={{ fontSize: "1.5rem", color: promo10?.isActive ? "var(--admin-success)" : "var(--admin-danger)" }}>
            {promo10?.isActive ? "🟢 ATTIVA" : "🔴 SPENTA"}
          </div>
          <div className="stat-desc" style={{ color: "var(--admin-text-muted)" }}>
            Codice: {promo10?.code || "BUN26"}
          </div>
        </div>
      </div>

      {/* --- ACTION TILES --- */}
      <h2 style={{ fontSize: "1.3rem", fontWeight: "900", marginBottom: "20px" }}>Operazioni Rapide</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--admin-accent)" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>🍔 Gestisci il Menu</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
            Aggiorna i prezzi, modifica gli ingredienti, attiva/disattiva piatti esauriti e associa etichette colorate.
          </p>
          <Link href="/admin/menu" className="btn-primary" style={{ alignSelf: "flex-start", marginTop: "8px", textDecoration: "none" }}>
            Apri Listino Menu
          </Link>
        </div>

        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--admin-success)" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>🏷️ Configura Promozioni</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
            Attiva o disattiva le offerte 2x1 e lo sconto delivery. Modifica i codici coupon, le condizioni legali e le soglie di spesa.
          </p>
          <Link href="/admin/promozioni" className="btn-primary" style={{ alignSelf: "flex-start", marginTop: "8px", textDecoration: "none", backgroundColor: "var(--admin-success)" }}>
            Gestisci Promozioni
          </Link>
        </div>

      </div>
    </div>
  );
}

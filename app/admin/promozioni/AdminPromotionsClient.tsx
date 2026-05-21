"use client";

import { useState, useTransition } from "react";
import { Promotion } from "@/lib/db";
import { togglePromotionAction, updatePromotionAction } from "../actions";

interface AdminPromotionsClientProps {
  initialPromotions: Promotion[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastCounter = 0;

export default function AdminPromotionsClient({ initialPromotions }: AdminPromotionsClientProps) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [isPending, startTransition] = useTransition();

  // Toast Management
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formConditions, setFormConditions] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formMinSpend, setFormMinSpend] = useState("0");

  // Open Drawer for Editing
  const openDrawer = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormName(promo.name);
    setFormDescription(promo.description);
    setFormConditions(promo.conditions);
    setFormCode(promo.code || "");
    setFormMinSpend(promo.minSpend?.toString() || "0");
    setIsDrawerOpen(true);
  };

  // Close Drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPromo(null);
  };

  // Quick Toggle Promotion Status
  const handleToggle = (promoId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic Update
    setPromotions(prev => prev.map(p => p.id === promoId ? { ...p, isActive: nextStatus } : p));

    startTransition(async () => {
      const res = await togglePromotionAction(promoId, nextStatus);
      if (!res.success) {
        showToast(res.error || "Impossibile aggiornare lo stato della promozione.", "error");
        // Rollback
        setPromotions(initialPromotions);
      } else {
        showToast(`Stato promozione "${nextStatus ? "Attiva" : "Spenta"}" salvato con successo!`);
      }
    });
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPromo) return;

    if (!formName.trim()) {
      showToast("Il nome della promozione è obbligatorio.", "error");
      return;
    }

    if (!formDescription.trim()) {
      showToast("La descrizione è obbligatoria.", "error");
      return;
    }

    if (!formConditions.trim()) {
      showToast("Le note legali / condizioni sono obbligatorie.", "error");
      return;
    }

    const payload: Partial<Omit<Promotion, "id">> = {
      name: formName.trim(),
      description: formDescription.trim(),
      conditions: formConditions.trim(),
    };

    if (editingPromo.id === "promo_10") {
      if (!formCode.trim()) {
        showToast("Il codice coupon è obbligatorio per questa promozione.", "error");
        return;
      }
      const spendNum = parseFloat(formMinSpend);
      if (isNaN(spendNum) || spendNum < 0) {
        showToast("Inserisci una spesa minima valida (maggiore o uguale a 0).", "error");
        return;
      }
      payload.code = formCode.trim().toUpperCase();
      payload.minSpend = spendNum;
    }

    startTransition(async () => {
      const res = await updatePromotionAction(editingPromo.id, payload);
      if (res.success) {
        showToast("Promozione aggiornata con successo! 🎉");
        
        // Update local state dynamically
        setPromotions(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...payload } : p));
        closeDrawer();
      } else {
        showToast(res.error || "Errore durante il salvataggio.", "error");
      }
    });
  };

  return (
    <div>
      {/* Toast Messages */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === "error" ? "toast-error" : "toast-success"}`}>
            <span>{t.type === "error" ? "❌" : "✓"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-block">
          <h1>Gestione Promozioni</h1>
          <p>Configura le offerte attive sul sito, imposta i codici sconto e aggiorna i dettagli legali delle promozioni.</p>
        </div>
      </div>

      {/* Promotions List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {promotions.map(promo => {
          const is2x1 = promo.id === "promo_2x1";
          return (
            <div 
              key={promo.id} 
              className="stat-card" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between", 
                borderLeft: `4px solid ${promo.isActive ? (is2x1 ? "var(--admin-accent)" : "var(--admin-success)") : "var(--admin-text-muted)"}`,
                gap: "16px",
                position: "relative"
              }}
            >
              {/* Card Header with Name & Quick Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "900", textTransform: "uppercase", color: "var(--admin-text-muted)" }}>
                    {is2x1 ? "TAVOLO" : "ONLINE DELIVERY/ASPORTO"}
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.2rem", fontWeight: "900" }}>
                    {promo.name}
                  </h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: promo.isActive ? "var(--admin-success)" : "var(--admin-text-muted)" }}>
                    {promo.isActive ? "ATTIVA" : "SPENTA"}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={promo.isActive}
                      onChange={() => handleToggle(promo.id, promo.isActive)}
                      disabled={isPending}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--admin-text)" }}>
                  &ldquo;{promo.description}&rdquo;
                </p>
              </div>

              {/* Conditional Fields (Code & Spesa Minima) */}
              {!is2x1 && (
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "12px", 
                    padding: "12px", 
                    backgroundColor: "rgba(0,0,0,0.2)", 
                    borderRadius: "8px" 
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontWeight: "700" }}>CODICE COUPON</span>
                    <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--admin-success)", marginTop: "4px" }}>
                      {promo.code}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontWeight: "700" }}>SPESA MINIMA</span>
                    <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--admin-text)", marginTop: "4px" }}>
                      €{promo.minSpend?.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions / Legal Note */}
              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "12px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  CONDIZIONI E NOTE LEGALI
                </span>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
                  {promo.conditions}
                </p>
              </div>

              {/* Edit Button */}
              <button 
                className="btn-secondary" 
                style={{ width: "100%", justifyContent: "center", display: "flex", gap: "8px" }}
                onClick={() => openDrawer(promo)}
              >
                ✏️ Modifica Dettagli Promo
              </button>
            </div>
          );
        })}
      </div>

      {/* --- EDIT SLIDE DRAWER --- */}
      {isDrawerOpen && editingPromo && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Modifica Promo: {editingPromo.name}</h2>
              <button className="drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="drawer-body">
              {/* Nome */}
              <div className="input-group">
                <label className="input-label" htmlFor="promo-name">Nome Promozione</label>
                <input
                  className="input-field"
                  type="text"
                  id="promo-name"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Es. Offerta 2x1"
                  required
                />
              </div>

              {/* Descrizione */}
              <div className="input-group">
                <label className="input-label" htmlFor="promo-desc">Tagline / Sottotitolo</label>
                <input
                  className="input-field"
                  type="text"
                  id="promo-desc"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Es. Uno lo paghi. L'altro lo morde chi vuoi."
                  required
                />
              </div>

              {/* Conditional Fields (Code & Spesa Minima) */}
              {editingPromo.id === "promo_10" && (
                <>
                  {/* Codice Coupon */}
                  <div className="input-group">
                    <label className="input-label" htmlFor="promo-code">Codice Coupon</label>
                    <input
                      className="input-field"
                      type="text"
                      id="promo-code"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="Es. BUN26"
                      required
                    />
                  </div>

                  {/* Spesa Minima */}
                  <div className="input-group">
                    <label className="input-label" htmlFor="promo-minspend">Spesa Minima (€)</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.50"
                      inputMode="decimal"
                      id="promo-minspend"
                      value={formMinSpend}
                      onChange={e => setFormMinSpend(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {/* Condizioni / Note Legali */}
              <div className="input-group">
                <label className="input-label" htmlFor="promo-conditions">Condizioni e Dettagli Legali (Regolamento)</label>
                <textarea
                  className="input-field"
                  id="promo-conditions"
                  rows={6}
                  value={formConditions}
                  onChange={e => setFormConditions(e.target.value)}
                  placeholder="Inserisci qui tutte le esclusioni, i giorni di validità e le clausole legali della promozione."
                  required
                />
              </div>
            </form>

            <div className="drawer-footer">
              <button className="btn-primary" type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Salvataggio..." : "Salva Modifiche"}
              </button>
              <button className="btn-secondary" type="button" onClick={closeDrawer} disabled={isPending}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

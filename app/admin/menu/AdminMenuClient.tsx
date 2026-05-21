"use client";

import { useState, useTransition, useMemo } from "react";
import { MenuItem, MenuCategory } from "@/lib/db";
import {
  updateMenuItemAction,
  addMenuItemAction,
  deleteMenuItemAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
} from "../actions";

interface AdminMenuClientProps {
  initialMenu: MenuCategory[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const PREDEFINED_TAGS = [
  { label: "Consigliato", icon: "👍", color: "default-tag" },
  { label: "Carne Speziata", icon: "🐷", color: "default-tag" },
  { label: "Carico", icon: "🍳", color: "default-tag" },
  { label: "Molto Piccante 🌶️🌶️🌶️", icon: "🌶️", color: "spicy-tag" },
  { label: "Super Carico 🔥", icon: "🔥", color: "spicy-tag" },
  { label: "Novità Mare", icon: "🐟", color: "default-tag" },
  { label: "Vegetariano 🌱", icon: "🌱", color: "veg-tag" },
  { label: "Vegano Friendly 🌱", icon: "🌱", color: "veg-tag" },
  { label: "Per i più piccoli", icon: "👶", color: "default-tag" }
];

let toastCounter = 0;

export default function AdminMenuClient({ initialMenu }: AdminMenuClientProps) {
  const [menu, setMenu] = useState<MenuCategory[]>(initialMenu);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>("");
  const [originalName, setOriginalName] = useState<string>("");

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formImage, setFormImage] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [categoryDraftLabel, setCategoryDraftLabel] = useState("");
  const [categoryDraftIcon, setCategoryDraftIcon] = useState("🍔");
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isReorderDrawerOpen, setIsReorderDrawerOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingCategoryLabel, setEditingCategoryLabel] = useState("");
  const [editingCategoryIcon, setEditingCategoryIcon] = useState("🍔");
  const [reorderList, setReorderList] = useState<MenuCategory[]>([]);
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null);

  // Compress Image client-side using Canvas API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      showToast("L'immagine supera i 12MB. Carica un file più piccolo.", "error");
      return;
    }

    setIsCompressing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 800;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/webp", 0.75);
            resolve(compressedBase64);
          };
          img.onerror = err => reject(err);
        };
        reader.onerror = err => reject(err);
      });

      setFormImage(base64);
      showToast("Foto ottimizzata con successo (convertita in WebP)!", "success");
    } catch {
      showToast("Impossibile comprimere l'immagine. Riprova.", "error");
    } finally {
      setIsCompressing(false);
    }
  };

  // Open Drawer for Editing or Creating
  const openDrawer = (item: MenuItem | null = null, catId: string = "") => {
    if (item) {
      setEditingItem(item);
      setOriginalName(item.name);
      setEditingCategory(catId);
      setFormCategory(catId);
      
      setFormName(item.name);
      setFormPrice(item.price.toString());
      setFormDescription(item.description);
      setFormTag(item.tag || "");
      setFormIsPopular(!!item.isPopular);
      setFormIsAvailable(item.isAvailable !== false);
      setFormImage(item.image || "");
    } else {
      setEditingItem(null);
      setOriginalName("");
      setEditingCategory(catId || menu[0]?.id || "");
      setFormCategory(catId || menu[0]?.id || "");
      
      setFormName("");
      setFormPrice("10.00");
      setFormDescription("");
      setFormTag("");
      setFormIsPopular(false);
      setFormIsAvailable(true);
      setFormImage("");
    }
    setIsDrawerOpen(true);
  };

  // Close Drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  // Switch Availability (Quick Toggle)
  const toggleAvailable = (categoryId: string, item: MenuItem) => {
    const updatedStatus = item.isAvailable === false;
    
    // Optimistic Update
    setMenu(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return {
        ...c,
        items: c.items.map(it => it.name === item.name ? { ...it, isAvailable: updatedStatus } : it)
      };
    }));

    startTransition(async () => {
      const res = await updateMenuItemAction(categoryId, item.name, {
        ...item,
        isAvailable: updatedStatus
      });
      if (!res.success) {
        showToast(res.error || "Errore di rete.", "error");
        // Rollback
        setMenu(initialMenu);
      } else {
        showToast(`Disponibilità di ${item.name} aggiornata.`);
      }
    });
  };

  // Switch Popular state (Quick Toggle)
  const togglePopular = (categoryId: string, item: MenuItem) => {
    const updatedStatus = !item.isPopular;
    
    // Optimistic Update
    setMenu(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return {
        ...c,
        items: c.items.map(it => it.name === item.name ? { ...it, isPopular: updatedStatus } : it)
      };
    }));

    startTransition(async () => {
      const res = await updateMenuItemAction(categoryId, item.name, {
        ...item,
        isPopular: updatedStatus
      });
      if (!res.success) {
        showToast(res.error || "Errore di rete.", "error");
        // Rollback
        setMenu(initialMenu);
      } else {
        showToast(`${item.name} impostato come ${updatedStatus ? "Popolare 👑" : "standard"}.`);
      }
    });
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast("Il nome del piatto è obbligatorio.", "error");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Inserisci un prezzo valido maggiore o uguale a 0.", "error");
      return;
    }

    const payload: MenuItem = {
      name: formName.trim(),
      price: priceNum,
      description: formDescription.trim(),
      tag: formTag.trim() || undefined,
      isPopular: formIsPopular,
      isAvailable: formIsAvailable,
      image: formImage || undefined,
    };

    startTransition(async () => {
      if (editingItem) {
        // Modifica piatto
        const res = await updateMenuItemAction(editingCategory, originalName, payload);
        if (res.success) {
          // If category changed, move item
          if (editingCategory !== formCategory) {
            // Remove from old category, add to new
            const menuRes = await deleteMenuItemAction(editingCategory, originalName);
            if (menuRes.success) {
              await addMenuItemAction(formCategory, payload);
            }
          }
          showToast(`${payload.name} aggiornato con successo! 🎉`);
          closeDrawer();
          window.location.reload(); // Re-fetch all menu
        } else {
          showToast(res.error || "Errore di salvataggio.", "error");
        }
      } else {
        // Aggiungi piatto
        const res = await addMenuItemAction(formCategory, payload);
        if (res.success) {
          showToast(`${payload.name} creato con successo! 🎉`);
          closeDrawer();
          window.location.reload();
        } else {
          showToast(res.error || "Errore di creazione.", "error");
        }
      }
    });
  };

  // Delete MenuItem
  const handleDelete = () => {
    if (!editingItem) return;

    if (!confirm(`Sei sicuro di voler eliminare definitivamente "${editingItem.name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteMenuItemAction(editingCategory, editingItem.name);
      if (res.success) {
        showToast(`${editingItem.name} eliminato con successo.`);
        closeDrawer();
        window.location.reload();
      } else {
        showToast(res.error || "Impossibile eliminare il piatto.", "error");
      }
    });
  };

  // Filtered Menu Items
  const filteredCategories = useMemo(() => {
    return menu
      .filter(cat => activeCategory === "all" || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item => {
          const matchSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
          return matchSearch;
        }),
      }))
      .filter(cat => cat.items.length > 0 || cat.id === activeCategory); // keeps category visible if specifically selected
  }, [menu, activeCategory, searchQuery]);

  const handleCreateCategory = () => {
    if (!categoryDraftLabel.trim()) {
      showToast("Inserisci il nome categoria.", "error");
      return;
    }
    startTransition(async () => {
      const res = await createCategoryAction(categoryDraftLabel, categoryDraftIcon || "🍔");
      if (!res.success) {
        showToast(res.error || "Errore creazione categoria.", "error");
        return;
      }
      showToast("Categoria creata con successo.");
      setCategoryDraftLabel("");
      setCategoryDraftIcon("🍔");
      window.location.reload();
    });
  };

  const openCategoryDrawer = (categoryId: string, label: string, icon: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryLabel(label);
    setEditingCategoryIcon(icon || "🍔");
    setIsCategoryDrawerOpen(true);
  };

  const closeCategoryDrawer = () => {
    setIsCategoryDrawerOpen(false);
    setEditingCategoryId("");
    setEditingCategoryLabel("");
    setEditingCategoryIcon("🍔");
  };

  const openReorderDrawer = () => {
    const sorted = [...menu].sort((a, b) => (a.position || 0) - (b.position || 0));
    setReorderList(sorted);
    setDraggingCategoryId(null);
    setIsReorderDrawerOpen(true);
  };

  const closeReorderDrawer = () => {
    setIsReorderDrawerOpen(false);
    setDraggingCategoryId(null);
  };

  const moveCategory = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    setReorderList((prev) => {
      const copy = [...prev];
      const from = copy.findIndex((c) => c.id === dragId);
      const to = copy.findIndex((c) => c.id === targetId);
      if (from < 0 || to < 0) return prev;
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const handleSaveCategoryOrder = () => {
    if (reorderList.length === 0) {
      showToast("Nessuna categoria da ordinare.", "error");
      return;
    }
    startTransition(async () => {
      const res = await reorderCategoriesAction(reorderList.map((c) => c.id));
      if (!res.success) {
        showToast(res.error || "Errore salvataggio ordine categorie.", "error");
        return;
      }
      showToast("Ordine categorie aggiornato.");
      closeReorderDrawer();
      window.location.reload();
    });
  };

  const handleSaveCategory = () => {
    if (!editingCategoryId) return;
    if (!editingCategoryLabel.trim()) {
      showToast("Nome categoria obbligatorio.", "error");
      return;
    }
    startTransition(async () => {
      const res = await updateCategoryAction(editingCategoryId, editingCategoryLabel, editingCategoryIcon);
      if (!res.success) {
        showToast(res.error || "Errore aggiornamento categoria.", "error");
        return;
      }
      showToast("Categoria aggiornata.");
      closeCategoryDrawer();
      window.location.reload();
    });
  };

  const handleDeleteCategory = (categoryId: string, label: string) => {
    if (!confirm(`Eliminare la categoria "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (!res.success) {
        showToast(res.error || "Errore eliminazione categoria.", "error");
        return;
      }
      showToast("Categoria eliminata.");
      window.location.reload();
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

      <div className="admin-header">
        <div className="admin-title-block">
          <h1>Gestione Menu</h1>
          <p>Aggiungi, modifica o disattiva piatti dal listino del ristorante.</p>
        </div>
        <button className="btn-primary" onClick={() => openDrawer()}>
          <span>+</span> Nuovo Piatto
        </button>
      </div>

      {/* --- MENU FILTER CONTROLS --- */}
      <div className="menu-controls">
        <div className="search-input-wrapper">
          <input
            className="input-field"
            style={{ width: "100%", paddingLeft: "16px", paddingRight: "16px", boxSizing: "border-box" }}
            type="text"
            placeholder="Cerca piatto o ingrediente..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-scroll">
          <button
            className={`category-pill-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            🍔 Tutte le categorie
          </button>
          {menu.map(cat => (
            <button
              key={cat.id}
              className={`category-pill-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper" style={{ marginBottom: "16px", padding: "16px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "1rem" }}>Gestione Categorie</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          <input
            className="input-field"
            style={{ width: "80px" }}
            type="text"
            maxLength={4}
            placeholder="🍔"
            value={categoryDraftIcon}
            onChange={(e) => setCategoryDraftIcon(e.target.value)}
          />
          <input
            className="input-field"
            style={{ minWidth: "220px", flex: 1 }}
            type="text"
            placeholder="Nuova categoria (es. Panini Speciali)"
            value={categoryDraftLabel}
            onChange={(e) => setCategoryDraftLabel(e.target.value)}
          />
          <button className="btn-primary" type="button" onClick={handleCreateCategory} disabled={isPending}>
            + Crea Categoria
          </button>
          <button className="btn-secondary" type="button" onClick={openReorderDrawer} disabled={isPending}>
            Riordina Categorie
          </button>
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          {menu.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "10px 12px",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {cat.icon} {cat.label} <span style={{ color: "var(--admin-text-muted)", fontWeight: 500 }}>({cat.items.length} piatti)</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-secondary" type="button" onClick={() => openCategoryDrawer(cat.id, cat.label, cat.icon)}>
                  Modifica
                </button>
                <button className="btn-danger" type="button" onClick={() => handleDeleteCategory(cat.id, cat.label)}>
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome Piatto</th>
              <th>Prezzo</th>
              <th>Categoria</th>
              <th>Pill / Tag</th>
              <th>Disponibile</th>
              <th>Popolare 👑</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.flatMap(cat => 
              cat.items.map(item => (
                <tr key={item.name}>
                  <td>
                    <div className="item-thumb-wrapper">
                      {item.image ? (
                        item.image.startsWith("emoji:") ? (
                          <span className="emoji-thumb">{item.image.replace("emoji:", "")}</span>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img className="item-thumb" src={item.image} alt={item.name} />
                        )
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>Nessuna</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: "700" }}>{item.name}</td>
                  <td style={{ fontWeight: "800", color: "var(--admin-accent)" }}>€{item.price.toFixed(2)}</td>
                  <td>{cat.label}</td>
                  <td>
                    {item.tag ? (
                      <span className={`badge ${
                        item.tag.includes("🌶️") || item.tag.includes("🔥")
                          ? "badge-spicy"
                          : item.tag.includes("🌱")
                            ? "badge-veg"
                            : "badge-default"
                      }`}>
                        {item.tag}
                      </span>
                    ) : (
                      <span style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem" }}>-</span>
                    )}
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.isAvailable !== false}
                        onChange={() => toggleAvailable(cat.id, item)}
                        disabled={isPending}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!item.isPopular}
                        onChange={() => togglePopular(cat.id, item)}
                        disabled={isPending}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-icons-group">
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => openDrawer(item, cat.id)}>
                        Modifica
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {filteredCategories.length === 0 || filteredCategories.every(c => c.items.length === 0) ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--admin-text-muted)" }}>
                  Nessun piatto corrisponde ai criteri di ricerca.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="mobile-cards-grid">
        {filteredCategories.flatMap(cat =>
          cat.items.map(item => (
            <div key={item.name} className="mobile-card">
              <div className="mobile-card-row">
                <div className="item-thumb-wrapper" style={{ width: "60px", height: "60px" }}>
                  {item.image ? (
                    item.image.startsWith("emoji:") ? (
                      <span className="emoji-thumb" style={{ fontSize: "1.8rem" }}>{item.image.replace("emoji:", "")}</span>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="item-thumb" src={item.image} alt={item.name} />
                    )
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>Nessuna</span>
                  )}
                </div>

                <div className="mobile-card-details">
                  <h3 className="mobile-card-title">{item.name}</h3>
                  <p className="mobile-card-desc">{item.description}</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span className="badge badge-default" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                      {cat.label.split(" ")[0]}
                    </span>
                    {item.tag && (
                      <span className={`badge ${
                        item.tag.includes("🌶️") || item.tag.includes("🔥")
                          ? "badge-spicy"
                          : item.tag.includes("🌱")
                            ? "badge-veg"
                            : "badge-default"
                      }`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mobile-toggles">
                <div className="mobile-toggle-item">
                  <span>Disponibile</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.isAvailable !== false}
                      onChange={() => toggleAvailable(cat.id, item)}
                      disabled={isPending}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="mobile-toggle-item">
                  <span>Popolare 👑</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!item.isPopular}
                      onChange={() => togglePopular(cat.id, item)}
                      disabled={isPending}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="mobile-card-footer">
                <span className="mobile-card-price">€{item.price.toFixed(2)}</span>
                <button className="btn-secondary" style={{ padding: "6px 16px", fontSize: "0.8rem" }} onClick={() => openDrawer(item, cat.id)}>
                  Modifica
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button className="fab-btn" onClick={() => openDrawer()} aria-label="Aggiungi piatto">
        +
      </button>

      {/* --- EDIT / CREATE SLIDE DRAWER --- */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={closeDrawer}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editingItem ? `Modifica: ${editingItem.name}` : "Nuovo Piatto"}</h2>
              <button className="drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="drawer-body">
              {/* Nome */}
              <div className="input-group">
                <label className="input-label" htmlFor="form-name">Nome Piatto</label>
                <input
                  className="input-field"
                  type="text"
                  id="form-name"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="es. Luffy Burger"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="input-group">
                <label className="input-label" htmlFor="form-category">Categoria</label>
                <select
                  className="input-field"
                  id="form-category"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  required
                >
                  {menu.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prezzo */}
              <div className="input-group">
                <label className="input-label" htmlFor="form-price">Prezzo (€)</label>
                <input
                  className="input-field"
                  type="number"
                  step="0.10"
                  inputMode="decimal"
                  id="form-price"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  required
                />
              </div>

              {/* Descrizione / Ingredienti */}
              <div className="input-group">
                <label className="input-label" htmlFor="form-desc">Descrizione / Ingredienti</label>
                <textarea
                  className="input-field"
                  id="form-desc"
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="es. Hamburger di manzo, cheddar, insalata fresca, salse artigianali"
                />
              </div>

              {/* Image Upload Area */}
              <div className="input-group">
                <label className="input-label">Foto Piatto</label>
                <div className="image-upload-zone" onClick={() => document.getElementById("file-upload")?.click()}>
                  <input
                    type="file"
                    id="file-upload"
                    className="file-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isCompressing}
                  />
                  {formImage ? (
                    formImage.startsWith("emoji:") ? (
                      <div className="upload-preview" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#000", fontSize: "3rem" }}>
                        {formImage.replace("emoji:", "")}
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="upload-preview" src={formImage} alt="Anteprima" />
                    )
                  ) : (
                    <div className="upload-icon">📷</div>
                  )}
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                    {isCompressing ? "Compressione WebP..." : "Trascina o clicca per caricare (Ottimizzato in sala)"}
                  </span>
                </div>
                {formImage && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: "8px", padding: "6px 12px", alignSelf: "center", fontSize: "0.8rem" }}
                    onClick={() => setFormImage("")}
                  >
                    Rimuovi Foto
                  </button>
                )}
              </div>

              {/* Pill / Tag Selection */}
              <div className="input-group">
                <label className="input-label">Pill / Tag Grafico</label>
                <div className="tags-selector-grid">
                  {PREDEFINED_TAGS.map(tag => (
                    <div
                      key={tag.label}
                      className={`tag-select-card ${formTag === tag.label ? "selected" : ""}`}
                      onClick={() => setFormTag(formTag === tag.label ? "" : tag.label)}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label.replace(/[🌱🌶️🔥🐟👍🐷🍳👶]/g, "").trim()}</span>
                    </div>
                  ))}
                </div>
                {/* Manual tag entry */}
                <input
                  className="input-field"
                  style={{ marginTop: "12px" }}
                  type="text"
                  placeholder="Oppure inserisci tag personalizzato..."
                  value={formTag}
                  onChange={e => setFormTag(e.target.value)}
                />
              </div>

              {/* Status toggles */}
              <div style={{ display: "flex", gap: "24px", marginTop: "12px", borderTop: "1px solid var(--admin-border)", paddingTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={e => setFormIsAvailable(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>Disponibile</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formIsPopular}
                      onChange={e => setFormIsPopular(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>In Evidenza / Popolare 👑</span>
                </div>
              </div>
            </form>

            <div className="drawer-footer">
              <button className="btn-primary" type="button" onClick={handleSubmit} disabled={isPending || isCompressing}>
                {isPending ? "Salvataggio..." : "Salva Modifiche"}
              </button>
              <button className="btn-secondary" type="button" onClick={closeDrawer} disabled={isPending}>
                Annulla
              </button>
              {editingItem && (
                <button
                  className="btn-danger"
                  type="button"
                  style={{ marginLeft: "auto" }}
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Elimina
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isCategoryDrawerOpen && (
        <div className="drawer-backdrop" onClick={closeCategoryDrawer}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Modifica Categoria</h2>
              <button className="drawer-close" onClick={closeCategoryDrawer}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="input-group">
                <label className="input-label" htmlFor="category-edit-icon">Icona</label>
                <input
                  id="category-edit-icon"
                  className="input-field"
                  type="text"
                  maxLength={4}
                  value={editingCategoryIcon}
                  onChange={(e) => setEditingCategoryIcon(e.target.value)}
                  placeholder="🍔"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="category-edit-label">Nome Categoria</label>
                <input
                  id="category-edit-label"
                  className="input-field"
                  type="text"
                  value={editingCategoryLabel}
                  onChange={(e) => setEditingCategoryLabel(e.target.value)}
                  placeholder="Es. Burgers Speciali"
                  required
                />
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn-primary" type="button" onClick={handleSaveCategory} disabled={isPending}>
                {isPending ? "Salvataggio..." : "Salva Categoria"}
              </button>
              <button className="btn-secondary" type="button" onClick={closeCategoryDrawer} disabled={isPending}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {isReorderDrawerOpen && (
        <div className="drawer-backdrop" onClick={closeReorderDrawer}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Riordina Categorie</h2>
              <button className="drawer-close" onClick={closeReorderDrawer}>✕</button>
            </div>
            <div className="drawer-body">
              <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>
                Trascina le categorie per cambiare l’ordine nel menu pubblico.
              </p>
              <div style={{ display: "grid", gap: "10px", marginTop: "8px" }}>
                {reorderList.map((cat, index) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={() => setDraggingCategoryId(cat.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingCategoryId) moveCategory(draggingCategoryId, cat.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggingCategoryId) moveCategory(draggingCategoryId, cat.id);
                      setDraggingCategoryId(null);
                    }}
                    onDragEnd={() => setDraggingCategoryId(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "12px",
                      border: draggingCategoryId === cat.id ? "1px solid var(--admin-accent)" : "1px solid var(--admin-border)",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.02)",
                      cursor: "grab",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      <span style={{ color: "var(--admin-text-muted)", marginRight: "8px" }}>{index + 1}.</span>
                      {cat.icon} {cat.label}
                    </div>
                    <span style={{ color: "var(--admin-text-muted)" }}>↕︎</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn-primary" type="button" onClick={handleSaveCategoryOrder} disabled={isPending}>
                {isPending ? "Salvataggio..." : "Salva Ordine"}
              </button>
              <button className="btn-secondary" type="button" onClick={closeReorderDrawer} disabled={isPending}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

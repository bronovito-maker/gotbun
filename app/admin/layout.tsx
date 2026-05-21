import { checkAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "./actions";
import "./admin.css";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Dashboard Amministratore - GotBun Riccione",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all routes under /admin
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/admin-login");
  }

  return (
    <div className="admin-body">
      <div className="admin-layout">
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-brand-text">Got Bun Riccione</div>
          </div>

          <nav className="sidebar-nav">
            <Link href="/admin" className="sidebar-link">
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/menu" className="sidebar-link">
              <span>🍔</span>
              <span>Gestione Menu</span>
            </Link>
            <Link href="/admin/promozioni" className="sidebar-link">
              <span>🏷️</span>
              <span>Promozioni</span>
            </Link>
            <Link href="/menu" target="_blank" className="sidebar-link">
              <span>🌐</span>
              <span>Vedi Menu Pubblico</span>
            </Link>
          </nav>

          <div className="sidebar-footer">
            <form action={logoutAction}>
              <button type="submit" className="logout-btn">
                Esci (Logout)
              </button>
            </form>
          </div>
        </aside>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="admin-main">{children}</main>

        {/* --- MOBILE BOTTOM TAB BAR --- */}
        <nav className="mobile-tab-bar" aria-label="Navigazione mobile">
          <Link href="/admin" className="mobile-tab-btn">
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/menu" className="mobile-tab-btn">
            <span>🍔</span>
            <span>Menu</span>
          </Link>
          <Link href="/admin/promozioni" className="mobile-tab-btn">
            <span>🏷️</span>
            <span>Promo</span>
          </Link>
          <form action={logoutAction} style={{ flex: 1, display: "flex" }}>
            <button type="submit" className="mobile-tab-btn" style={{ width: "100%" }}>
              <span>🚪</span>
              <span>Esci</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}

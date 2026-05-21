"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction, ActionState } from "../admin/actions";
import "../admin/admin.css";

const initialState: ActionState = {
  success: false,
};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="admin-body login-container">
      <div className="login-card">
        <Link href="/" aria-label="Torna alla homepage">
          <Image
            className="login-logo"
            src="/gotbun_logo.png"
            alt="GotBun Riccione"
            width={180}
            height={45}
            priority
          />
        </Link>
        
        <h1 className="login-title">Pannello Gestore</h1>
        <p className="login-subtitle">Accedi con email e password amministratore per gestire menu e promozioni.</p>

        <form action={formAction} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email Admin
            </label>
            <input
              className="input-field"
              type="email"
              id="email"
              name="email"
              placeholder="nome.cognome@esempio.it"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Password di Accesso
            </label>
            <input
              className="input-field"
              type="password"
              id="password"
              name="password"
              placeholder="Inserisci la tua password"
              required
              autoComplete="current-password"
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
            <input type="checkbox" name="rememberMe" defaultChecked />
            Ricordami su questo dispositivo
          </label>

          <button className="login-btn" type="submit" disabled={isPending}>
            {isPending ? "Accesso in corso..." : "Accedi alla Dashboard"}
          </button>

          {state?.error && (
            <div className="error-banner" role="alert">
              ⚠️ {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

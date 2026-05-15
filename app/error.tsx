"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("GotBun page render error", error);
  }, [error]);

  return (
    <main className="page-shell">
      <section className="success-card" role="alert">
        <p className="eyebrow">Qualcosa non ha funzionato</p>
        <h2>Riproviamo.</h2>
        <p className="conditions">
          Se hai appena richiesto il coupon, controlla anche la tua email: il codice potrebbe essere gia stato inviato.
        </p>
        <button className="primary-button" onClick={reset} type="button">
          Torna al form
        </button>
      </section>
    </main>
  );
}

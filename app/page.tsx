"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  source: string;
  campaign: string;
};

type SuccessState = {
  couponCode: string;
  expiresAt: string;
  officialOrderUrl: string;
  webhookSent: boolean;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  privacyConsent: false,
  marketingConsent: true,
  source: "landing",
  campaign: "gotbun_2x1",
};

const isDevelopment = process.env.NODE_ENV === "development";

function formatItalianDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function validateClientForm(form: FormState): string | null {
  if (form.name.trim().length < 2) return "Inserisci un nome di almeno 2 caratteri.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Inserisci un indirizzo email valido.";
  if (form.phone.trim().length < 8) return "Inserisci un numero di telefono valido.";
  if (!form.privacyConsent) return "Accetta il trattamento dei dati per ricevere il coupon.";
  return null;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get("source")?.trim() || "landing";
    const campaign = searchParams.get("campaign")?.trim() || "gotbun_2x1";

    setForm((current) => ({ ...current, source, campaign }));
  }, []);

  const expiresAtLabel = useMemo(() => {
    if (!success) return "";
    return formatItalianDate(success.expiresAt);
  }, [success]);

  const demoPayload = useMemo(
    () => ({
      event: "coupon_claimed",
      brand: "GotBun Riccione",
      name: form.name.trim() || "Nome cliente",
      email: form.email.trim().toLowerCase() || "cliente@example.com",
      phone: form.phone.trim() || "3331234567",
      privacyConsent: form.privacyConsent,
      marketingConsent: form.marketingConsent,
      couponCode: "GOTBUN-2X1-XXXXXX",
      couponType: "2x1",
      createdAt: "generato al submit",
      expiresAt: "createdAt + 14 giorni",
      source: form.source,
      campaign: form.campaign,
    }),
    [form],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const clientError = validateClientForm(form);
    if (clientError) {
      setError(clientError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/claim-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          privacyConsent: form.privacyConsent,
          marketingConsent: form.marketingConsent,
          source: form.source,
          campaign: form.campaign,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Non siamo riusciti a generare il coupon. Riprova tra poco.");
        return;
      }

      setSuccess({
        couponCode: data.couponCode,
        expiresAt: data.expiresAt,
        officialOrderUrl: data.officialOrderUrl,
        webhookSent: Boolean(data.webhookSent),
      });
    } catch {
      setError("Connessione non riuscita. Controlla la rete e riprova.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Promo esclusiva GotBun Riccione</p>
          <h1 id="hero-title">2 panini al prezzo di 1 da GotBun Riccione</h1>
          <p className="hero-subtitle">
            Scarica il coupon e usalo dal lunedì al giovedì ordinando dal nostro sito ufficiale o mostrandolo in locale.
          </p>
          <a className="hero-cta" href="#coupon-form">Scarica il coupon 2x1</a>
          <p className="cta-note">
            Valido solo sul nostro{" "}
            <a href="https://gotbun.order.app.hd.digital/menus" rel="noreferrer" target="_blank">
              sito ufficiale
            </a>
            .
          </p>
        </div>

        <div className="burger-card" aria-label="Area foto hamburger">
          <div className="burger-visual">
            <span className="bun top-bun" />
            <span className="lettuce" />
            <span className="cheese" />
            <span className="patty" />
            <span className="bun bottom-bun" />
          </div>
          <div className="offer-badge">
            <span>Coupon</span>
            <strong>2x1</strong>
          </div>
        </div>
      </section>

      <section className="steps-section" aria-labelledby="steps-title">
        <div className="section-heading">
          <p className="eyebrow">Come funziona</p>
          <h2 id="steps-title">Tre mosse e il coupon è tuo.</h2>
        </div>
        <div className="steps-grid">
          {[
            ["01", "Lasci i tuoi dati", "Compila il form in pochi secondi."],
            ["02", "Ricevi il codice", "Generiamo un coupon unico per te."],
            ["03", "Ordini da GotBun", "Usalo dal sito ufficiale o in locale."],
          ].map(([number, title, text]) => (
            <article className="step-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="benefit-section" aria-label="Beneficio sito ufficiale">
        <div>
          <p className="eyebrow">Perché dal sito ufficiale</p>
          <h2>Le promo migliori passano dal sito ufficiale.</h2>
        </div>
        <p>
          Ordinando dal sito ufficiale trovi le promo riservate GotBun e ci aiuti a offrirti più vantaggi, senza passare dalle piattaforme delivery.
        </p>
      </section>

      <section className="claim-section" id="coupon-form" aria-labelledby="form-title">
        {success ? (
          <div className="success-card" role="status">
            <p className="eyebrow">Coupon generato con successo</p>
            <h2>Il tuo 2x1 è pronto.</h2>
            <div className="coupon-code" aria-label="Codice coupon">{success.couponCode}</div>
            <p className="expiry">Scade il {expiresAtLabel}</p>
            <p className="conditions">
              Valido dal lunedì al giovedì. Non cumulabile. Usalo solo sul nostro sito ufficiale.
            </p>
            {isDevelopment ? (
              <div className="debug-box">
                <h3>Debug demo</h3>
                <p>
                  Webhook n8n inviato: <strong>{success.webhookSent ? "true" : "false"}</strong>
                </p>
              </div>
            ) : null}
            <a className="primary-button" href={success.officialOrderUrl} rel="noreferrer" target="_blank">
              Ordina dal sito ufficiale
            </a>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <div className="form-heading">
              <p className="eyebrow">Scarica il coupon</p>
              <h2 id="form-title">Ricevi subito il tuo codice.</h2>
              <p>Lascia i dati e ti inviamo il coupon 2x1 GotBun.</p>
            </div>

            <label>
              Nome
              <input
                autoComplete="name"
                name="name"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Es. Martina"
                required
                type="text"
                value={form.name}
              />
            </label>

            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="nome@email.it"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label>
              Telefono
              <input
                autoComplete="tel"
                name="phone"
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Es. 333 123 4567"
                required
                type="tel"
                value={form.phone}
              />
            </label>

            <label className="checkbox-row">
              <input
                checked={form.privacyConsent}
                onChange={(event) => setForm((current) => ({ ...current, privacyConsent: event.target.checked }))}
                type="checkbox"
              />
              <span>
                Accetto il trattamento dei dati per ricevere il coupon. <a href="#privacy">Privacy</a>
              </span>
            </label>

            <label className="checkbox-row recommended">
              <input
                checked={form.marketingConsent}
                onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))}
                type="checkbox"
              />
              <span>Voglio ricevere offerte e promozioni future da GotBun.</span>
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="primary-button" disabled={isLoading} type="submit">
              {isLoading ? "Genero il coupon..." : "Mandami il coupon"}
            </button>

            <p className="privacy-copy">
              I dati saranno usati per inviarti il coupon e, solo se dai consenso, comunicazioni promozionali future. Potrai cancellarti in qualsiasi momento.
            </p>

            {isDevelopment ? (
              <div className="debug-box">
                <h3>Debug demo</h3>
                <p>Payload che verrà inviato a n8n:</p>
                <pre>{JSON.stringify(demoPayload, null, 2)}</pre>
              </div>
            ) : null}
          </form>
        )}
      </section>
    </main>
  );
}

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
  qrContent: string;
  qrImageUrl: string;
  expiresAt: string;
  promoHours: string;
  webhookSent: boolean;
};

type ClaimCouponResponse = {
  success?: boolean;
  error?: string;
  couponCode?: unknown;
  qrContent?: unknown;
  qrImageUrl?: unknown;
  expiresAt?: unknown;
  promoHours?: unknown;
  webhookSent?: unknown;
};

const ALLOWED_SOURCES = new Set(["landing", "instagram", "facebook", "tiktok", "google", "whatsapp", "qr_code", "other"]);

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  privacyConsent: false,
  marketingConsent: true,
  source: "landing",
  campaign: "gotbun_tavoli_2x1",
};

const isDevelopment = process.env.NODE_ENV === "development";

function formatItalianDate(value: string): string {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}

function stringOrFallback(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeSource(value: string): string {
  const source = value.trim().toLowerCase();
  return ALLOWED_SOURCES.has(source) ? source : "other";
}

function validateClientForm(form: FormState): string | null {
  if (form.name.trim().length < 2) return "Inserisci un nome di almeno 2 caratteri.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Inserisci un indirizzo email valido.";
  if (form.phone.replace(/\D/g, "").length < 8) return "Inserisci un numero di telefono valido: ci serve per inviarti il coupon anche su WhatsApp.";
  if (!form.privacyConsent) return "Accetta il trattamento dei dati per ricevere e utilizzare il coupon.";
  return null;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const source = normalizeSource(searchParams.get("source") ?? "landing");
    const campaign = searchParams.get("campaign")?.trim() || "gotbun_tavoli_2x1";

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
      redeemToken: "generato al submit",
      redeemUrl: "https://n8n.example.com/webhook/gotbun-redeem?code=GOTBUN-2X1-XXXXXX&token=...",
      qrContent: "https://n8n.example.com/webhook/gotbun-redeem?code=GOTBUN-2X1-XXXXXX&token=...",
      qrImageUrl: "QR image URL generata al submit",
      status: "Active",
      couponType: "2x1",
      redemptionMode: "in_store",
      usageLimit: 1,
      promoDays: "lunedi-giovedi",
      promoHours: "18:30-22:30",
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

      const data = (await response.json()) as ClaimCouponResponse;

      if (!response.ok || !data.success) {
        setError(data.error ?? "Non siamo riusciti a generare il coupon. Riprova tra poco.");
        return;
      }

      setSuccess({
        couponCode: stringOrFallback(data.couponCode, "GOTBUN-2X1"),
        qrContent: stringOrFallback(data.qrContent, stringOrFallback(data.couponCode, "GOTBUN-2X1")),
        qrImageUrl: stringOrFallback(data.qrImageUrl, ""),
        expiresAt: stringOrFallback(data.expiresAt, new Date().toISOString()),
        promoHours: stringOrFallback(data.promoHours, "18:30-22:30"),
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
      <header className="site-header">
        <img className="site-logo" src="/gotbun_logo.png" alt="GotBun Riccione" width="360" height="90" />
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Promo 2x1 GotBun Riccione</p>
          <h1 id="hero-title">Porta chi dice "assaggio solo un morso".</h1>
          <p className="hero-subtitle">
            Con il coupon GotBun prendete 2 panini al prezzo di 1 e li gustate al tavolo. Scarica il QR, mostralo in cassa e ordina sul posto.
          </p>
          <dl className="promo-strip" aria-label="Condizioni principali della promozione">
            <div>
              <dt>Quando</dt>
              <dd>Lun-gio · 18:30-22:30</dd>
            </div>
            <div>
              <dt>Come</dt>
              <dd>QR in cassa · Senza prenotazione</dd>
            </div>
          </dl>
          <a className="hero-cta" href="#coupon-form">Ricevi il QR 2x1</a>
          <p className="social-proof" aria-label="Riprova sociale">
            <span aria-hidden="true">★★★★★</span>
            59 recensioni dai clienti GotBun
          </p>
          <p className="cta-note">Perfetto da condividere con chi finisce sempre per assaggiare il tuo burger. Il QR arriva via email e WhatsApp.</p>
        </div>

        <div className="claim-section" id="coupon-form" aria-labelledby="form-title">
          {success ? (
            <div className="success-card" role="status">
              <p className="eyebrow">Coupon creato</p>
              <h2>Il tuo coupon 2x1 è pronto.</h2>
              <p className="success-intro">Controlla la mail e salva il QR sul telefono. Se il messaggio tarda, puoi mostrare anche il codice qui sotto.</p>
              <div className="qr-preview" aria-label="Anteprima QR coupon">
                <img src={success.qrImageUrl} alt={`QR coupon ${success.couponCode}`} width="420" height="420" />
              </div>
              <div className="fallback-code">
                <span>Codice fallback</span>
                <strong>{success.couponCode}</strong>
              </div>
              <p className="expiry">Valido fino al {expiresAtLabel}</p>
              <p className="conditions">
                Mostra il QR o questo codice prima di pagare. Valido dal lunedì al giovedì, {success.promoHours}, solo per consumazione al tavolo.
              </p>
              {isDevelopment ? (
                <div className="debug-box">
                  <h3>Debug demo</h3>
                  <p>
                    Webhook n8n inviato: <strong>{success.webhookSent ? "true" : "false"}</strong>
                  </p>
                </div>
              ) : null}
              <a className="primary-button" href="#come-funziona">Vedi come funziona</a>
            </div>
          ) : (
            <form className="form-card" onSubmit={handleSubmit} noValidate>
              <div className="form-heading">
                <p className="eyebrow">Sai già con chi dividerlo</p>
                <h2 id="form-title">Ricevi il tuo QR.</h2>
                <p>Compila il form e ti inviamo il coupon 2x1 da salvare sul telefono e mostrare in cassa.</p>
                <p className="form-proof">
                  <span aria-hidden="true">★★★★★</span>
                  59 recensioni dai clienti GotBun
                </p>
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
                Telefono WhatsApp
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
                  Accetto il trattamento dei dati per ricevere e utilizzare il coupon via email e WhatsApp.{" "}
                  <a href="/privacy" target="_blank">
                    Privacy e condizioni
                  </a>
                </span>
              </label>

              <label className="checkbox-row recommended">
                <input
                  checked={form.marketingConsent}
                  onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))}
                  type="checkbox"
                />
                <span>Voglio ricevere altre offerte GotBun via email o WhatsApp.</span>
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <button className="primary-button" disabled={isLoading} type="submit">
                {isLoading ? "Sto generando il QR..." : "Ricevi il coupon 2x1"}
              </button>

              <p className="privacy-copy">
                Useremo i dati per inviarti il coupon e gestire la promozione. Le offerte future arrivano solo se lasci il consenso marketing.
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
        </div>
      </section>

      <section className="steps-section" id="come-funziona" aria-labelledby="steps-title">
        <div className="section-heading">
          <p className="eyebrow">Come funziona</p>
          <h2 id="steps-title">Tre passaggi, poi si mangia.</h2>
        </div>
        <div className="steps-grid">
          {[
            ["01", "Scegli la compagnia", "Meglio se è quella che dice di non avere fame e poi assaggia tutto."],
            ["02", "Salvi il QR", "Lo ricevi via email e WhatsApp, pronto da tenere sul telefono."],
            ["03", "Lo mostri in cassa", "Passi da GotBun, mostri il codice prima di pagare e ti godi il 2x1."],
          ].map(([number, title, text]) => (
            <article className="step-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="benefit-section" aria-label="Condizioni promozione">
        <div>
          <p className="eyebrow">Da ricordare</p>
          <h2>Se vieni con chi "non mangia", questa volta siete coperti.</h2>
        </div>
        <p>
          La promo è valida dal lunedì al giovedì, dalle 18:30 alle 22:30, solo nel locale GotBun Riccione. Il codice è personale, non cumulabile e utilizzabile una sola volta.
        </p>
      </section>

      <section className="visual-section" aria-label="Area foto hamburger">
        <div className="burger-card">
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

      <footer className="site-footer" id="privacy">
        <p>
          <a href="/privacy">Privacy policy e condizioni promo</a>
        </p>
      </footer>
    </main>
  );
}

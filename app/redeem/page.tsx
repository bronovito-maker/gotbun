import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redemption coupon | GotBun Riccione",
  description: "Pagina di fallback per la redemption dei coupon GotBun.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedeemFallbackPage() {
  return (
    <main className="policy-page">
      <section className="policy-hero">
        <p className="eyebrow">GotBun Riccione</p>
        <h1>Coupon non disponibile da questo link</h1>
        <p>
          Se hai aperto questo link dalla mail promo, non preoccuparti: mostra il QR ricevuto in cassa e lo staff ti
          aiuta subito con la verifica del coupon.
        </p>
      </section>
    </main>
  );
}

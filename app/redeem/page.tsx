import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redemption coupon | GotBun Riccione",
  description: "Pagina di fallback per la redemption dei coupon GotBun.",
};

export default function RedeemFallbackPage() {
  return (
    <main className="policy-page">
      <section className="policy-hero">
        <p className="eyebrow">GotBun Riccione</p>
        <h1>Redemption non configurata</h1>
        <p>
          Questo QR deve puntare al webhook n8n di cassa. Configura `N8N_REDEEM_WEBHOOK_URL` per marcare
          automaticamente i coupon come usati quando vengono scansionati.
        </p>
      </section>
    </main>
  );
}

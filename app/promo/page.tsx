import { getPromotions } from "@/lib/db";
import PromoClient from "./PromoClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo 2x1 GotBun Riccione - Ottieni il tuo Coupon",
  description: "Ricevi il coupon 2x1 di GotBun Riccione via email e WhatsApp. Ordina due hamburger al tavolo e pagane solo uno.",
};

export default async function PromoPage() {
  const promotions = await getPromotions();
  const promo2x1 = promotions.find((p) => p.id === "promo_2x1");

  const isActive = promo2x1?.isActive ?? false;
  const description = promo2x1?.description ?? "Uno lo paghi. L'altro lo morde chi vuoi.";
  const conditions = promo2x1?.conditions ?? "La promo si applica esclusivamente sull'acquisto di una portata principale a scelta.";

  return (
    <PromoClient 
      isActive={isActive} 
      description={description} 
      conditions={conditions} 
    />
  );
}

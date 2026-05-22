import { getPromotions } from "@/lib/db";
import PromoClient from "./PromoClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo 2x1 GotBun Riccione - Ottieni il tuo Coupon",
  description: "Ricevi via email il QR coupon 2x1 di GotBun Riccione. Promo valida sulle portate principali: ordinandone due al tavolo, ne paghi una.",
};

export default async function PromoPage() {
  const promotions = await getPromotions();
  const promo2x1 = promotions.find((p) => p.id === "promo_2x1");

  const isActive = promo2x1?.isActive ?? false;
  const description = promo2x1?.description ?? "Uno lo paghi. L'altro lo morde chi vuoi.";

  return (
    <PromoClient 
      isActive={isActive} 
      description={description}
    />
  );
}

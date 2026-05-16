import type { Metadata } from "next";
import { PROMO_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Promo 2x1 burger a Riccione",
  description: "Scarica il coupon 2x1 GotBun Riccione: valido al tavolo dal lunedì al giovedì, 18:30-22:30.",
  alternates: {
    canonical: PROMO_URL,
  },
  openGraph: {
    url: PROMO_URL,
    title: "Promo 2x1 GotBun Riccione",
    description: "Ricevi il QR 2x1, mostralo in cassa e gustalo al tavolo da GotBun Riccione.",
  },
};

export default function PromoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

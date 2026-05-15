import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coupon 2x1 da condividere | GotBun Riccione",
  description: "Ricevi il QR 2x1 GotBun Riccione, mostralo in cassa e gusta 2 panini al prezzo di 1 dal lunedì al giovedì.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}

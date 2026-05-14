import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coupon 2x1 | GotBun Riccione",
  description: "Scarica il coupon 2x1 GotBun Riccione e ordina dal sito ufficiale.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}

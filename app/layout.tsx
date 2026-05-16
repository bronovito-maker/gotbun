import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gotbunriccione.it"),
  title: "GotBun Riccione - Burger, menu e promo 2x1",
  description: "Scopri GotBun Riccione: menu online, ordini e promo 2x1 da gustare in locale.",
  openGraph: {
    title: "GotBun Riccione - Burger, menu e promo 2x1",
    description: "Menu online, ordini e promo da gustare in locale da GotBun Riccione.",
    images: ["/gotbun_logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}

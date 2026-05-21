import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "GotBun Riccione",
  title: {
    default: "GotBun Riccione - Burger, menu e promo 2x1",
    template: "%s | GotBun Riccione",
  },
  description: "Scopri GotBun Riccione: menu online, ordini e promo 2x1 da gustare in locale.",
  keywords: ["GotBun Riccione", "burger Riccione", "smash burger Riccione", "hamburger Riccione", "menu GotBun", "promo 2x1 Riccione"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "GotBun Riccione",
    title: "GotBun Riccione - Burger, menu e promo 2x1",
    description: "Menu online, ordini e promo da gustare in locale da GotBun Riccione.",
    images: ["/gotbun_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GotBun Riccione - Burger, menu e promo 2x1",
    description: "Menu online, ordini e promo da gustare in locale da GotBun Riccione.",
    images: ["/gotbun_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Anton, Barlow } from "next/font/google";

import { campaign } from "@/config/campaign";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(campaign.brand.site),
  title: `${campaign.brand.name} · Você escolhe a nova embalagem`,
  description: campaign.hero.subhead,
  openGraph: {
    title: `${campaign.brand.name} · Você escolhe a nova embalagem`,
    description: campaign.hero.subhead,
    type: "website",
    locale: "pt_BR",
    images: ["/og.jpg"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#101010",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${barlow.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#votacao"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-asphalt focus:px-4 focus:py-2 focus:text-paper"
        >
          Pular para a votação
        </a>
        {children}
      </body>
    </html>
  );
}

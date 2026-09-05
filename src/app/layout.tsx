import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { brand } from "@/config/brand";
import "./globals.css";
import "./client-revisions.css";
import "./conjugator-redesign.css";
import "./translator-consistency.css";
import "./translator-navbar.css";
import "./top-promo-bar.css";
import "./search-attention.css";

const tunFavicon = "https://tunapp.com/wp-content/uploads/2020/09/cropped-Tun_Site-Icon-180x180.png";
const siteUrl = "https://armenianverbs.com";
const googleAnalyticsId = "G-DM9L8F8TZ2";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Armenian Verbs Conjugation Tool | Eastern & Western Armenian",
  description:
    "Conjugate Armenian verbs instantly online. Free conjugation tool for both Eastern Armenian and Western Armenian verbs with complete tense and grammar charts.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: tunFavicon, sizes: "180x180", type: "image/png" }],
    apple: [{ url: tunFavicon, sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const brandStyles = {
    "--brand-primary": brand.colors.primary,
    "--brand-primary-dark": brand.colors.primaryDark,
    "--brand-secondary": brand.colors.secondary,
    "--brand-ink": brand.colors.ink,
    "--brand-muted": brand.colors.muted,
    "--brand-bg": brand.colors.background,
    "--brand-surface": brand.colors.surface,
    "--brand-border": brand.colors.border,
    "--font-display": brand.fonts.display,
    "--font-primary": brand.fonts.primary,
    "--font-armenian": brand.fonts.armenian,
  } as CSSProperties;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tunapp.com" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Noto+Sans+Armenian:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={brandStyles}>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
        </Script>
      </body>
    </html>
  );
}

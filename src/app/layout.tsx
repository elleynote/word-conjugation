import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import "./globals.css";
import "./client-revisions.css";
import "./conjugator-redesign.css";
import "./translator-consistency.css";

const tunFavicon = "https://tunapp.com/wp-content/uploads/2020/09/cropped-Tun_Site-Icon-180x180.png";

export const metadata: Metadata = {
  title: `${brand.appName} — Western & Eastern Armenian verbs`,
  description: brand.description,
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
      <body style={brandStyles}>{children}</body>
    </html>
  );
}

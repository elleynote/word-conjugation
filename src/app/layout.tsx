import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import "./globals.css";
import "./client-revisions.css";
import "./conjugator-redesign.css";

export const metadata: Metadata = {
  title: `${brand.appName} — Western & Eastern Armenian verbs`,
  description: brand.description,
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
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&family=Noto+Serif+Armenian:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={brandStyles}>{children}</body>
    </html>
  );
}

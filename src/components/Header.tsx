"use client";

import Link from "next/link";
import { useState } from "react";
import type { InterfaceLanguage } from "@/types/verb";
import { LanguageToggle } from "./LanguageToggle";

const TUN_LOGO_URL =
  "https://tunapp.com/wp-content/uploads/2020/09/Tun-Logo_Web-Black_80.png";

const NAV_ITEMS = [
  { label: "Lessons", href: "https://tunapp.com/get-started" },
  { label: "Translate", href: "https://translatearmenian.com" },
  { label: "Tutoring", href: "https://tunapp.com/western-armenian-tutoring" },
  { label: "Workbooks and Flashcards", href: "https://tunapp.com/shop" },
  { label: "Speaking Practice", href: "https://armeniansocialnetwork.com" },
  { label: "Contact Us", href: "mailto:hello@tunapp.com" },
] as const;

interface HeaderProps {
  language: InterfaceLanguage;
  onLanguageChange: (language: InterfaceLanguage) => void;
}

export function Header({ language, onLanguageChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <div className="brand-group">
          <Link className="tun-logo-link" href="/" aria-label="Armenian conjugation home">
            <img
              className="tun-logo-image"
              src={TUN_LOGO_URL}
              width="105"
              height="56"
              alt="Tun"
              fetchPriority="high"
            />
          </Link>
        </div>

        <nav
          id="site-main-navigation"
          className={`main-nav${mobileMenuOpen ? " mobile-open" : ""}`}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageToggle value={language} onChange={onLanguageChange} />
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-controls="site-main-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="mobile-nav-toggle-label" aria-hidden="true">Menu</span>
            <span className="mobile-nav-toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import Script from "next/script";
import { useRef } from "react";
import styles from "./Footer.module.css";

export function FooterNewsletterForm() {
  const startedAtRef = useRef<HTMLInputElement>(null);

  const markFormStarted = () => {
    if (startedAtRef.current && !startedAtRef.current.value) {
      startedAtRef.current.value = String(Date.now());
    }
  };
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <form className={styles.newsletterForm} action="/api/newsletter" method="post" target="_blank" aria-label="Join the community" onFocusCapture={markFormStarted} onPointerDownCapture={markFormStarted}>
        <label className={styles.srOnly} htmlFor="footer-newsletter-email">Email address</label>
        <input id="footer-newsletter-email" className={styles.newsletterInput} type="email" name="EMAIL" placeholder="Enter your email here" autoComplete="email" required />
        <div className={styles.honeypot} aria-hidden="true">
          <input type="text" name="_newsletter_company" tabIndex={-1} defaultValue="" autoComplete="off" />
        </div>
        <input ref={startedAtRef} type="hidden" name="_newsletter_started_at" defaultValue="" />
        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} data-appearance="interaction-only" data-action="newsletter_signup" />
        <input className={styles.newsletterButton} type="submit" name="subscribe" value="Join the community" />
      </form>
    </>
  );
}

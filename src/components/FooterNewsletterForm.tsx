"use client";

import Script from "next/script";
import styles from "./Footer.module.css";

export function FooterNewsletterForm() {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <form
        className={styles.newsletterForm}
        action="/api/newsletter"
        method="post"
        target="_blank"
        aria-label="Join the community"
      >
        <label className={styles.srOnly} htmlFor="footer-newsletter-email">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          className={styles.newsletterInput}
          type="email"
          name="EMAIL"
          placeholder="Enter your email here"
          autoComplete="email"
          required
        />
        <div className={styles.honeypot} aria-hidden="true">
          <input
            type="text"
            name="b_cf919aa58fa15934e1e2a04a0_3feeed30f4"
            tabIndex={-1}
            defaultValue=""
          />
        </div>
        <input
          type="hidden"
          name="_newsletter_started_at"
          defaultValue=""
          ref={(node) => {
            if (node && !node.value) node.value = String(Date.now());
          }}
        />
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
          data-appearance="interaction-only"
        />
        <input
          className={styles.newsletterButton}
          type="submit"
          name="subscribe"
          value="Join the community"
        />
      </form>
    </>
  );
}

import styles from "./Footer.module.css";

const FOOTER_GROUPS = [
  {
    title: "Learn",
    links: [
      ["My Lessons", "https://tunapp.com/lessons"],
      ["Learn Armenian Online", "https://tunapp.com/get-started"],
      ["Courses, Flashcards and Workbooks", "https://tunapp.com/shop"],
      ["Armenian Social Network", "https://armeniansocialnetwork.com"],
      ["Western Armenian Tutors", "https://tunapp.com/western-armenian-tutoring"],
      ["Armenian Translation Tool", "https://translatearmenian.com"],
      ["Armenian Verb Conjugations", "https://armenianverbs.com"],
      ["Armenian Keyboard", "https://armeniankeyboard.com"],
      ["Armenian ChatGPT", "https://tunapp.com/chatbot"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My Account", "https://tunapp.com/my-account/"],
      ["Downloads", "https://tunapp.com/my-account/downloads/"],
      ["Subscriptions", "https://tunapp.com/my-account/subscriptions/"],
      ["Payment Methods", "https://tunapp.com/my-account/payment-methods/"],
      ["Password Recovery", "https://tunapp.com/login/"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Privacy Policy", "https://tunapp.com/privacy-policy/"],
      ["Website Terms", "https://tunapp.com/website-terms/"],
      ["Affiliate Program", "https://tunapp.com/ambassadors/"],
      ["Blog", "https://tunapp.com/blog"],
      ["Contact Us", "mailto:hello@tunapp.com"],
    ],
  },
] as const;

const SOCIAL_LINKS = [
  ["Instagram", "https://instagram.com/tun.armenian"],
  ["TikTok", "https://www.tiktok.com/@tun.armenian"],
  ["YouTube", "https://www.youtube.com/@TunOnlineArmenianSchool"],
] as const;

const MAILCHIMP_ACTION =
  "https://tunapp.us5.list-manage.com/subscribe/post?u=cf919aa58fa15934e1e2a04a0&id=3feeed30f4&f_id=00a043edf0";

function SocialIcon({ label }: { label: (typeof SOCIAL_LINKS)[number][0] }) {
  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.5" cy="6.5" r="1" className={styles.iconFill} />
      </svg>
    );
  }

  if (label === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 3v10.2a4.2 4.2 0 1 1-3.2-4.1" />
        <path d="M14 3c.6 2.4 2.2 4 4.7 4.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17.2 5.6 12 5.6 12 5.6s-5.2 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.7.5 6.9.5 6.9.5s5.2 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8Z" />
      <path d="m10 9 5 3-5 3Z" className={styles.iconFill} />
    </svg>
  );
}

function MailchimpSignup() {
  return (
    <form
      className={styles.signupForm}
      action={MAILCHIMP_ACTION}
      method="post"
      target="_blank"
      aria-label="Join the community"
    >
      <label className={styles.srOnly} htmlFor="footer-email">
        Email address
      </label>
      <input
        className={styles.signupInput}
        id="footer-email"
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
        className={styles.signupButton}
        type="submit"
        name="subscribe"
        value="Join the community"
      />
    </form>
  );
}

export function Footer() {
  return (
    <footer className={styles.root}>
      <div
        className={`${styles.curve} tunapp-footer-curve`}
        aria-hidden="true"
      >
        <div className={`${styles.scene} tunapp-footer-scene`}>
          <img
            className={`${styles.artwork} tunapp-footer-artwork`}
            src="https://tunapp.com/wp-content/uploads/2026/09/Tun-Footer-Translate__.png"
            alt=""
            loading="lazy"
          />
        </div>
      </div>

      <div className={`${styles.footerBar} tunapp-footer-bar`}>
        <div className={styles.footerDirectory}>
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} className={styles.footerGroup} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              {group.title === "Company" ? (
                <>
                  <div className={styles.socialLinks} aria-label="Social media">
                    {SOCIAL_LINKS.map(([label, href]) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={styles.socialLink}
                      >
                        <SocialIcon label={label} />
                      </a>
                    ))}
                  </div>
                  <MailchimpSignup />
                </>
              ) : null}
            </nav>
          ))}
        </div>

        <p className={styles.copyright}>
          Copyright © 2026, Tun Online Armenian School. All rights reserved. For every Armenian who loves their home.
        </p>
      </div>
    </footer>
  );
}

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
            </nav>
          ))}
        </div>

        <p className={styles.copyright}>
          Copyright © {new Date().getFullYear()}. All rights reserved. For every
          Armenian who loves their home.
        </p>
      </div>
    </footer>
  );
}

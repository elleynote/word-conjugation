import { brand } from "@/config/brand";
import { copyFor } from "@/lib/i18n/copy";
import type { InterfaceLanguage } from "@/types/verb";

interface PromoPanelsProps {
  language: InterfaceLanguage;
}

export function PromoPanels({ language }: PromoPanelsProps) {
  const copy = copyFor(language);

  return (
    <section className="promo-panels" aria-label="TUN resources">
      <article className="promo-panel promo-panel--translator">
        <span className="promo-panel__eyebrow">TUN</span>
        <h2>{copy.translatorPromoTitle}</h2>
        <p>{copy.translatorPromoText}</p>
        <a href={brand.promos.translatorUrl} target="_blank" rel="noreferrer">{copy.translatorPromoCta}</a>
      </article>

      <article className="promo-panel promo-panel--school">
        <span className="promo-panel__eyebrow">TUN</span>
        <h2>{copy.schoolPromoTitle}</h2>
        <p>{copy.schoolPromoText}</p>
        <a href={brand.promos.schoolUrl} target="_blank" rel="noreferrer">{copy.schoolPromoCta}</a>
      </article>
    </section>
  );
}

import { brand } from "@/config/brand";
import { copyFor } from "@/lib/i18n/copy";
import type { InterfaceLanguage } from "@/types/verb";

interface PromoPanelsProps {
  language: InterfaceLanguage;
}

const tunFavicon = "https://tunapp.com/wp-content/uploads/2020/09/cropped-Tun_Site-Icon-180x180.png";

export function PromoPanels({ language }: PromoPanelsProps) {
  const copy = copyFor(language);
  const translatorFeatures = language === "ru"
    ? ["Западноармянский", "Текст в речь", "Перевод фраз", "Удобно для обучения"]
    : ["Eastern and Western Armenian", "Text-to-speech", "Phrase translation", "Built for learners"];

  return (
    <section className="resource-panel" aria-label="TUN resources">
      <h2 className="resource-panel__title">{copy.moreArmenianTools}</h2>

      <article className="resource-card resource-card--translator">
        <div className="resource-card__brand-row">
          <img
            className="resource-card__app-icon"
            src={tunFavicon}
            alt=""
            aria-hidden="true"
            style={{ objectFit: "cover", background: "transparent" }}
          />
          <div><h3>{copy.translatorPromoTitle}</h3></div>
        </div>
        <p>{copy.translatorPromoText}</p>
        <ul>{translatorFeatures.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
        <a href={brand.promos.translatorUrl} target="_blank" rel="noreferrer">{copy.translatorPromoCta} ↗</a>
      </article>

      <article className="resource-card resource-card--school">
        <div className="resource-card__brand-row">
          <img
            className="resource-card__app-icon"
            src={tunFavicon}
            alt=""
            aria-hidden="true"
            style={{ objectFit: "cover", background: "transparent" }}
          />
          <div><h3>{copy.schoolPromoTitle}</h3></div>
        </div>
        <p>{copy.schoolPromoText}</p>
        <a href={brand.promos.schoolUrl} target="_blank" rel="noreferrer">{copy.schoolPromoCta} ↗</a>
      </article>

      <article className="resource-card resource-card--tip">
        <h3>☼ {copy.tip}</h3>
        <p>{copy.tipText}</p>
      </article>
    </section>
  );
}

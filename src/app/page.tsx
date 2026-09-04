import { Footer } from "@/components/Footer";
import { VerbExplorer } from "@/components/VerbExplorer";

export default function Home() {
  return (
    <div className="site-frame">
      <div className="conjugator-promo-bar">
        <a
          className="conjugator-promo-bar__link"
          href="https://tunapp.com/get-started/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try 4 Armenian lessons for $1 →
        </a>
      </div>
      <VerbExplorer />
      <Footer />
    </div>
  );
}

import type { CorpusStats as CorpusStatsValue } from "@/lib/corpus/stats";
import type { InterfaceLanguage } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";

interface CorpusStatsProps {
  stats: CorpusStatsValue;
  language: InterfaceLanguage;
}

export function CorpusStats({ stats, language }: CorpusStatsProps) {
  const copy = copyFor(language);
  return (
    <aside className="corpus-stats" aria-label={copy.translatedVerbs}>
      <span className="corpus-stats__title">{copy.translatedVerbs}</span>
      <dl>
        <div><dt>{language === "ru" ? "Западноарм." : "Western Arm."}</dt><dd>{stats.western}</dd></div>
        <div><dt>{language === "ru" ? "Восточноарм." : "Eastern Arm."}</dt><dd>{stats.eastern}</dd></div>
        <div><dt>{copy.russian}</dt><dd>{stats.russian}</dd></div>
        <div><dt>{copy.english}</dt><dd>{stats.english}</dd></div>
      </dl>
    </aside>
  );
}

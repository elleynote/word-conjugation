"use client";

import type { InterfaceLanguage } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";
import type { RecentVerbEntry } from "@/lib/recent/recentVerbs";

interface RecentVerbsProps {
  entries: RecentVerbEntry[];
  language: InterfaceLanguage;
  onSelect: (entry: RecentVerbEntry) => void | Promise<void>;
}

export function RecentVerbs({ entries, language, onSelect }: RecentVerbsProps) {
  const copy = copyFor(language);

  return (
    <section className="recent-verbs" aria-label={copy.recentlyViewed}>
      <div className="recent-verbs__heading"><span aria-hidden="true">◷</span>{copy.recentlyViewed}</div>
      {entries.length ? (
        <div className="recent-verbs__list">
          {entries.map((entry) => (
            <button key={`${entry.dialect}:${entry.id}`} type="button" onClick={() => void onSelect(entry)}>
              <span aria-hidden="true">↶</span>
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="recent-verbs__empty">{copy.noRecentVerbs}</p>
      )}
    </section>
  );
}

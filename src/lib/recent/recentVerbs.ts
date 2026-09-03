import type { Dialect } from "@/types/verb";

export const RECENT_VERBS_STORAGE_KEY = "tun-conjugator-recent-v1";

export interface RecentVerbEntry {
  id: string;
  lemma: string;
  dialect: Dialect;
  label: string;
}

export function pushRecentVerb(
  entries: RecentVerbEntry[],
  next: RecentVerbEntry,
  limit = 5,
): RecentVerbEntry[] {
  return [
    next,
    ...entries.filter((entry) => !(entry.id === next.id && entry.dialect === next.dialect)),
  ].slice(0, limit);
}

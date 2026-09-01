export function normalizeSearchQuery(query: string): string {
  const normalized = query
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[.,!?;:()[\]{}"'«»]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.replace(/^to\s+/, "").trim();
}

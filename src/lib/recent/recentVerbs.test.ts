import { describe, expect, it } from "vitest";
import { pushRecentVerb, type RecentVerbEntry } from "./recentVerbs";

const entry = (id: string): RecentVerbEntry => ({ id, lemma: id, dialect: "western", label: id });

describe("pushRecentVerb", () => {
  it("puts the newest item first and removes duplicates", () => {
    expect(pushRecentVerb([entry("a"), entry("b")], entry("b"))).toEqual([entry("b"), entry("a")]);
  });

  it("keeps at most five items", () => {
    const result = ["a", "b", "c", "d", "e", "f"].reduce((items, id) => pushRecentVerb(items, entry(id)), [] as RecentVerbEntry[]);
    expect(result.map((item) => item.id)).toEqual(["f", "e", "d", "c", "b"]);
  });
});

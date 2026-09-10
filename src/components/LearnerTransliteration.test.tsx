import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { verbs } from "@/data/verbs";
import { conjugateVerb } from "@/lib/conjugation/conjugate";
import type { Verb } from "@/types/verb";
import { ConjugatorSidebar } from "./ConjugatorSidebar";
import { RecentVerbs } from "./RecentVerbs";
import { TenseComparison } from "./TenseComparison";
import { VerbSummary } from "./VerbSummary";

const workVerb: Verb = {
  id: "work-client-example",
  english: ["work"],
  russian: [],
  aliases: [],
  verified: true,
  source: "local",
  dialects: {
    western: {
      lemma: "աշխատիլ",
      // Deliberately use the linguistic source spelling to prove the UI
      // derives learner-friendly transliteration from Armenian instead.
      transliteration: "aʃxadil",
      group: "-իլ",
      root: "աշխատ",
      class: "el",
      isIrregular: false,
      participles: {},
      regularity: "Regular",
    },
  },
};

describe("learner-facing Armenian transliteration", () => {
  it("derives the main verb transliteration from the Armenian lemma", () => {
    const html = renderToStaticMarkup(
      <VerbSummary
        verb={workVerb}
        dialect="western"
        language="en"
        showTranscription
        textCase="title"
      />,
    );

    expect(html).toContain("ashkhadil");
    expect(html).not.toContain("aʃxadil");
  });

  it("derives the selected sidebar verb transliteration from the Armenian lemma", () => {
    const html = renderToStaticMarkup(
      <ConjugatorSidebar
        query="աշխատիլ"
        dialect="western"
        language="en"
        selectedVerb={workVerb}
        status="idle"
        inputRef={createRef<HTMLInputElement>()}
        keyboardOpen={false}
        textCase="title"
        showTranscription
        recentVerbs={[]}
        onQueryChange={vi.fn()}
        onSubmit={vi.fn()}
        onErase={vi.fn()}
        onDialectChange={vi.fn()}
        onKeyboardToggle={vi.fn()}
        onInsert={vi.fn()}
        onBackspace={vi.fn()}
        onClearKeyboard={vi.fn()}
        onTranscriptionChange={vi.fn()}
        onSelectRecent={vi.fn()}
      />,
    );

    expect(html).toContain("ashkhadil");
    expect(html).not.toContain("aʃxadil");
  });

  it("shows transliteration with recently viewed Armenian verbs when enabled", () => {
    const html = renderToStaticMarkup(
      <RecentVerbs
        entries={[{ id: "work", lemma: "աշխատիլ", label: "աշխատիլ", dialect: "western" }]}
        language="en"
        showTranscription
        onSelect={vi.fn()}
      />,
    );

    expect(html).toContain("աշխատիլ");
    expect(html).toContain("ashkhadil");
  });

  it("shows transliteration for Armenian person pronouns in the conjugation table", () => {
    const write = verbs.find((verb) => verb.id === "write") ?? verbs[0];
    const affirmative = conjugateVerb(write, "western", "affirmative");
    const negative = conjugateVerb(write, "western", "negative");
    const html = renderToStaticMarkup(
      <TenseComparison
        verb={write}
        affirmative={affirmative}
        negative={negative}
        tense="present"
        language="en"
        showTranscription
        textCase="title"
      />,
    );

    expect(html).toContain("ես");
    expect(html).toContain("Yes");
    expect(html).toContain("դուն");
    expect(html).toContain("Toun");
  });
});

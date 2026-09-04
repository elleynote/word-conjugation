import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PromoPanels } from "./PromoPanels";

describe("PromoPanels", () => {
  it("renders the Armenian Translator promo with the TUN favicon and requested English copy", () => {
    const html = renderToStaticMarkup(<PromoPanels language="en" />);

    expect(html).toContain("cropped-Tun_Site-Icon-180x180.png");
    expect(html).toContain("Armenian Translator App");
    expect(html).toContain("Translate Eastern and Western Armenian words, phrases and sentences instantly.");
    expect(html).toContain("Eastern and Western Armenian");
    expect(html).toContain("Text-to-speech");
    expect(html).toContain("Phrase translation");
    expect(html).toContain("Built for learners");
    expect(html).toContain("Open Armenian Translator");
    expect(html).not.toContain("Ա↔A");
    expect(html).not.toContain(">TUN</span>");
  });
});

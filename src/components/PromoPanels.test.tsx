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

  it("renders the TUN school promo with the same favicon heading treatment and requested copy", () => {
    const html = renderToStaticMarkup(<PromoPanels language="en" />);

    expect(html.match(/cropped-Tun_Site-Icon-180x180\.png/g)?.length).toBe(2);
    expect(html).toContain("TUN Online Armenian Schools");
    expect(html).toContain("Start learning to speak, read and write in Armenian with easy-to-follow Armenian lessons online and entertaining games, available on demand.");
    expect(html).toContain("Try 4 lessons for $1");
    expect(html).not.toContain("online Armenian School</small>");
  });
});

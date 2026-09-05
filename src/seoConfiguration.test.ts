import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, root), "utf8");
}

describe("armenianverbs.com SEO configuration", () => {
  it("uses the client-supplied title, description, canonical URL and Google Analytics ID", () => {
    const layout = read("src/app/layout.tsx");

    expect(layout).toContain("Armenian Verbs Conjugation Tool | Eastern & Western Armenian");
    expect(layout).toContain(
      "Conjugate Armenian verbs instantly online. Free conjugation tool for both Eastern Armenian and Western Armenian verbs with complete tense and grammar charts.",
    );
    expect(layout).toContain("https://armenianverbs.com");
    expect(layout).toContain('canonical: "/"');
    expect(layout).toContain("G-DM9L8F8TZ2");
  });

  it("provides native Next.js sitemap and robots metadata routes", () => {
    const sitemapPath = new URL("src/app/sitemap.ts", root);
    const robotsPath = new URL("src/app/robots.ts", root);

    expect(existsSync(sitemapPath)).toBe(true);
    expect(existsSync(robotsPath)).toBe(true);

    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");

    expect(sitemap).toContain("https://armenianverbs.com/");
    expect(robots).toContain("https://armenianverbs.com/sitemap.xml");
    expect(robots).toContain('userAgent: "*"');
    expect(robots).toContain('allow: "/"');
  });

  it("permanently redirects the production Netlify hostname to the custom domain", () => {
    const redirectsPath = new URL("public/_redirects", root);
    expect(existsSync(redirectsPath)).toBe(true);

    const redirects = read("public/_redirects");
    expect(redirects).toContain(
      "https://wordconjection.netlify.app/* https://armenianverbs.com/:splat 301!",
    );
  });
});

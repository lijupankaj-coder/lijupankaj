import { describe, expect, it } from "vitest";
import { defaultSnapshot } from "@/content/defaults";
import { buildStructuredData, seoDescription, seoMetadata, seoTitle, serializeJsonLd, siteUrl } from "@/lib/seo";

describe("portfolio SEO", () => {
  it("targets the supported senior graphic design position and canonical domain", () => {
    expect(seoTitle).toContain("Senior Graphic Designer Dubai");
    expect(seoDescription).toContain("24 years");
    expect(seoMetadata.alternates?.canonical).toBe("/");
    expect(seoMetadata.robots).toMatchObject({ index: true, follow: true });
    expect(seoMetadata.openGraph).toMatchObject({ url: "/", siteName: "Liju Pankaj Design Portfolio" });
  });

  it("describes the person and visible portfolio without unsupported projects", () => {
    const snapshot = {
      ...defaultSnapshot,
      publishedAt: "2026-08-27T09:29:28.586Z",
      sections: {
        ...defaultSnapshot.sections,
        hero: { ...defaultSnapshot.sections.hero, profileMediaId: 63 },
      },
    };
    const json = serializeJsonLd(buildStructuredData(snapshot));
    expect(json).toContain('"@type":"ProfilePage"');
    expect(json).toContain('"@type":"Person"');
    expect(json).toContain(`${siteUrl}/api/media/63`);
    expect(json).not.toMatch(/Fujifilm|FEAST Brochure|RASASI Presentation|ENBD EDM Generator/i);
    expect(json).not.toContain("<");
  });
});

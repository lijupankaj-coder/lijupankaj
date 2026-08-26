import { describe, expect, it } from "vitest";
import { defaultSnapshot, defaultTheme } from "@/content/defaults";
import { normalizeTheme, themeVariables } from "@/lib/cms/theme";
import { publishedSnapshotSchema, themeSchema } from "@/lib/cms/validation";

describe("controlled website theme", () => {
  it("accepts the curated default theme and emits bounded CSS tokens", () => {
    expect(themeSchema.safeParse(defaultTheme).success).toBe(true);
    const variables = themeVariables(defaultTheme);
    expect(variables["--hero-heading-max"]).toBe("104px");
    expect(variables["--container"]).toBe("1440px");
  });

  it("rejects dangerous size values and unapproved fonts", () => {
    expect(themeSchema.safeParse({ ...defaultTheme, bodySize: 200 }).success).toBe(false);
    expect(normalizeTheme({ ...defaultTheme, bodyFont: "Untrusted Remote Font" })).toEqual(defaultTheme);
  });
});

describe("published snapshot boundary", () => {
  it("accepts the built-in safe fallback with no portfolio images", () => {
    expect(publishedSnapshotSchema.safeParse(defaultSnapshot).success).toBe(true);
    expect(defaultSnapshot.projects).toEqual([]);
  });

  it("requires meaningful alt text for every published project image", () => {
    const snapshot = structuredClone(defaultSnapshot);
    snapshot.projects = [{
      id: 1, slug: "test-project", name: "Test", client: "Client", year: "2026", category: null,
      overview: "Overview", role: "Role", contribution: "Contribution", deliverables: [], featured: false, position: 0,
      images: [{ id: 1, media: { id: 1, fileName: "test.jpg", storagePath: "user/hash/test.jpg", alt: "", width: 100, height: 100, mimeType: "image/jpeg", variants: {} }, alt: "", caption: "", focalX: 50, focalY: 50, isCover: true, position: 0 }]
    }];
    expect(publishedSnapshotSchema.safeParse(snapshot).success).toBe(false);
  });
});

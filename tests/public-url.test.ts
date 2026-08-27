import { afterEach, describe, expect, it } from "vitest";
import { publicUrl } from "@/lib/http/public-url";

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = originalSiteUrl;
});

describe("public URL resolution", () => {
  it("uses the configured public origin behind a reverse proxy", () => {
    process.env.SITE_URL = "https://lijupankaj.com";
    expect(publicUrl("/admin/reset-password", "http://0.0.0.0:3000/auth/callback").href)
      .toBe("https://lijupankaj.com/admin/reset-password");
  });

  it("falls back to the request origin when the site URL is unavailable", () => {
    delete process.env.SITE_URL;
    expect(publicUrl("/admin/login", "https://preview.example/auth/callback").href)
      .toBe("https://preview.example/admin/login");
  });

  it("does not allow a protocol-relative redirect target", () => {
    process.env.SITE_URL = "https://lijupankaj.com";
    expect(publicUrl("//attacker.example/path", "http://0.0.0.0:3000").href)
      .toBe("https://lijupankaj.com/");
  });
});

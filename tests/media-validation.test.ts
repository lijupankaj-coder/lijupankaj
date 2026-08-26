import { describe, expect, it } from "vitest";
import { prepareUpload } from "@/lib/media/prepare-upload";

describe("media upload validation", () => {
  it("sanitizes a safe SVG and keeps it non-executable", async () => {
    const file = new File([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Mark</title><path d="M0 0h10v10z" fill="#123456"/></svg>`], "mark.svg", { type: "image/svg+xml" });
    const prepared = await prepareUpload(file);
    expect(prepared.mimeType).toBe("image/svg+xml");
    expect(prepared.original.toString()).toContain("<title>Mark</title>");
    expect(prepared.variants).toEqual([]);
  });

  it("rejects SVG files with scripts or external references", async () => {
    const file = new File([`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><use href="https://example.com/a.svg#x"/></svg>`], "unsafe.svg", { type: "image/svg+xml" });
    await expect(prepareUpload(file)).rejects.toThrow("INVALID_SVG");
  });

  it("rejects unsupported file contents even when the name looks safe", async () => {
    const file = new File(["not an image"], "portfolio.jpg", { type: "image/jpeg" });
    await expect(prepareUpload(file)).rejects.toThrow("UNSUPPORTED_FILE");
  });
});

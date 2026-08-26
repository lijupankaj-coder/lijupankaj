import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://lijupankaj.com";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/admin/", "/auth/"] }], sitemap: `${base}/sitemap.xml` };
}

import type { MetadataRoute } from "next";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getPublishedSnapshot();
  return [{
    url: siteUrl,
    lastModified: snapshot.publishedAt ? new Date(snapshot.publishedAt) : undefined,
    changeFrequency: "weekly",
    priority: 1,
  }];
}

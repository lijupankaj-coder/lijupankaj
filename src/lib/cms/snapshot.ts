import "server-only";
import { cache } from "react";
import { defaultSnapshot } from "@/content/defaults";
import { publishedSnapshotSchema } from "@/lib/cms/validation";
import { createPublicClient } from "@/lib/supabase/public";
import { readSnapshotFile, writeSnapshotFile } from "@/lib/cms/snapshot-file";
import type { PublishedSnapshot } from "@/types/cms";

export const getPublishedSnapshot = cache(async (): Promise<PublishedSnapshot> => {
  const client = createPublicClient();
  if (client) {
    try {
      const { data, error } = await client.from("published_site").select("snapshot").eq("singleton", true).single();
      if (!error) {
        const parsed = publishedSnapshotSchema.safeParse(data?.snapshot);
        if (parsed.success) {
          await writeSnapshotFile(parsed.data).catch(() => undefined);
          return parsed.data;
        }
      }
    } catch {
      // The last atomic published file remains available during CMS outages.
    }
  }
  return (await readSnapshotFile()) ?? defaultSnapshot;
});

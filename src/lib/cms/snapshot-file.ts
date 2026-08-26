import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSnapshotPath } from "@/lib/env/server";
import { publishedSnapshotSchema } from "@/lib/cms/validation";
import type { PublishedSnapshot } from "@/types/cms";

export async function readSnapshotFile(): Promise<PublishedSnapshot | null> {
  try {
    const value = JSON.parse(await readFile(getSnapshotPath(), "utf8"));
    const parsed = publishedSnapshotSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function writeSnapshotFile(snapshot: PublishedSnapshot) {
  const target = getSnapshotPath();
  const directory = path.dirname(target);
  const temporary = `${target}.${process.pid}.tmp`;
  await mkdir(directory, { recursive: true });
  await writeFile(temporary, JSON.stringify(snapshot), { encoding: "utf8", mode: 0o600 });
  await rename(temporary, target);
}

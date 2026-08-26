import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20),
  SUPABASE_INTERNAL_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(20),
  DATABASE_SSL: z.enum(["require", "disable"]).default("require"),
  CMS_ADMIN_EMAIL: z.string().email(),
  SITE_URL: z.string().url(),
  MEDIA_BUCKET: z.string().regex(/^[a-z0-9-]+$/).default("cms-media"),
  CMS_SNAPSHOT_PATH: z.string().min(1).default("/app/data/published-content.json")
});

export function getServerConfig() {
  const parsed = serverEnvSchema.safeParse(process.env);
  return parsed.success ? parsed.data : null;
}

export function requireServerConfig() {
  const config = getServerConfig();
  if (!config) throw new Error("Required CMS server configuration is missing.");
  return config;
}

export function getSnapshotPath() {
  return process.env.CMS_SNAPSHOT_PATH || "/app/data/published-content.json";
}

export function getInternalSupabaseUrl() {
  const value = process.env.SUPABASE_INTERNAL_URL;
  if (!value) return null;
  const parsed = z.string().url().safeParse(value);
  return parsed.success ? parsed.data : null;
}

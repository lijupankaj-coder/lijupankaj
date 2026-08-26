import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env/public";
import { getInternalSupabaseUrl } from "@/lib/env/server";

export function createPublicClient() {
  const config = getPublicSupabaseConfig();
  if (!config) return null;
  return createSupabaseClient(getInternalSupabaseUrl() ?? config.url, config.key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

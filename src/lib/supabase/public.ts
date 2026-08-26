import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env/public";

export function createPublicClient() {
  const config = getPublicSupabaseConfig();
  if (!config) return null;
  return createSupabaseClient(config.url, config.key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

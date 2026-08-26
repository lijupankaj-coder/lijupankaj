import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requirePublicSupabaseConfig } from "@/lib/env/public";
import { requireServerConfig } from "@/lib/env/server";

export function createServiceClient() {
  const { url } = requirePublicSupabaseConfig();
  const { SUPABASE_SECRET_KEY } = requireServerConfig();
  return createSupabaseClient(url, SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}

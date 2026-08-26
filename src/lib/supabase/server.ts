import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseConfig } from "@/lib/env/public";
import { getInternalSupabaseUrl } from "@/lib/env/server";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = requirePublicSupabaseConfig();
  const serverUrl = getInternalSupabaseUrl() ?? url;

  return createServerClient(serverUrl, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes them.
        }
      }
    }
  });
}

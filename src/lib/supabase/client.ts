"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseConfig } from "@/lib/env/public";

export function createClient() {
  const { url, key } = requirePublicSupabaseConfig();
  return createBrowserClient(url, key);
}

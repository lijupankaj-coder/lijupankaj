import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { loadCmsDrafts } from "@/lib/cms/draft";
import { apiError } from "@/lib/http/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase, email } = await requireAdmin();
    return NextResponse.json({ ...(await loadCmsDrafts(supabase)), administrator: email }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

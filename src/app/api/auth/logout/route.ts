import { NextRequest, NextResponse } from "next/server";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http/api-response";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

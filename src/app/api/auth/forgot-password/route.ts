import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, requireSameOrigin } from "@/lib/auth/request-security";
import { apiError } from "@/lib/http/api-response";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    enforceRateLimit(`reset:${clientAddress(request)}`, 3, 60 * 60 * 1000);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email && email === process.env.CMS_ADMIN_EMAIL?.toLowerCase()) {
      const supabase = await createClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.SITE_URL}/auth/callback?next=/admin/reset-password` });
    }
    return NextResponse.json({ ok: true, message: "If the approved administrator account matches, a reset link has been sent." });
  } catch (error) { return apiError(error); }
}

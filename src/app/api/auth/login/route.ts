import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { clientAddress, enforceRateLimit, requireSameOrigin } from "@/lib/auth/request-security";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    enforceRateLimit(`login:${clientAddress(request)}`, 8, 15 * 60 * 1000);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || password.length < 12 || email !== process.env.CMS_ADMIN_EMAIL?.toLowerCase()) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 400 });
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 400 });
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (!admin) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

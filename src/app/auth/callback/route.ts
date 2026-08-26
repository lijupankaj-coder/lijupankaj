import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next")?.startsWith("/admin") ? request.nextUrl.searchParams.get("next")! : "/admin";
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user?.email?.toLowerCase() === process.env.CMS_ADMIN_EMAIL?.toLowerCase()) {
      const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (admin) return NextResponse.redirect(new URL(next, request.url));
    }
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/admin/login?error=invalid-link", request.url));
}

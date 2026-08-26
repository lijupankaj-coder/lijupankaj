import { NextRequest, NextResponse } from "next/server";
import { defaultTheme } from "@/content/defaults";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { themeSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

export async function PUT(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase, userId } = await requireAdmin();
    const body = await request.json();
    const candidate = body.action === "reset" ? defaultTheme : body.theme;
    const parsed = themeSchema.safeParse(candidate);
    if (!parsed.success) return NextResponse.json({ error: "Theme settings are outside the safe design limits.", issues: parsed.error.flatten() }, { status: 400 });
    const { error } = await supabase.from("theme_settings").update({ draft_theme: parsed.data, updated_by: userId }).eq("singleton", true);
    if (error) throw error;
    return NextResponse.json({ ok: true, status: "draft", theme: parsed.data });
  } catch (error) { return apiError(error); }
}

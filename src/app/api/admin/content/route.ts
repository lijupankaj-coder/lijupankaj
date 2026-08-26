import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { siteSectionsSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

export async function PUT(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase, userId } = await requireAdmin();
    const parsed = siteSectionsSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Content contains invalid or oversized fields.", issues: parsed.error.flatten() }, { status: 400 });
    const { error } = await supabase.from("site_content").update({ draft_content: parsed.data, updated_by: userId }).eq("singleton", true);
    if (error) throw error;
    return NextResponse.json({ ok: true, status: "draft" });
  } catch (error) { return apiError(error); }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { projectImageInputSchema, reorderSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

function values(data: ReturnType<typeof projectImageInputSchema.parse>) {
  return { project_id: data.projectId, media_id: data.mediaId, caption: data.caption, alt_text: data.altText, position: data.position, focal_x: data.focalX, focal_y: data.focalY, is_cover: data.isCover };
}

async function clearCover(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>, projectId: number, exceptId?: number) {
  let query = supabase.from("project_images").update({ is_cover: false }).eq("project_id", projectId);
  if (exceptId) query = query.neq("id", exceptId);
  const { error } = await query; if (error) throw error;
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const parsed = projectImageInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Image assignment fields are invalid." }, { status: 400 });
    if (parsed.data.isCover) await clearCover(supabase, parsed.data.projectId);
    const { data, error } = await supabase.from("project_images").insert(values(parsed.data)).select("*,media:media_assets(*)").single();
    if (error) throw error; return NextResponse.json({ ok: true, image: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const body = await request.json();
    if (body.action === "reorder") {
      const parsed = reorderSchema.safeParse({ ids: body.ids }); if (!parsed.success) return NextResponse.json({ error: "Invalid image order." }, { status: 400 });
      for (const [position, id] of parsed.data.ids.entries()) { const { error } = await supabase.from("project_images").update({ position }).eq("id", id); if (error) throw error; }
      return NextResponse.json({ ok: true });
    }
    const id = Number(body.id); const parsed = projectImageInputSchema.safeParse(body.image);
    if (!Number.isInteger(id) || !parsed.success) return NextResponse.json({ error: "Image assignment fields are invalid." }, { status: 400 });
    if (parsed.data.isCover) await clearCover(supabase, parsed.data.projectId, id);
    const { data, error } = await supabase.from("project_images").update(values(parsed.data)).eq("id", id).select("*,media:media_assets(*)").single();
    if (error) throw error; return NextResponse.json({ ok: true, image: data });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid image assignment." }, { status: 400 });
    const { error } = await supabase.from("project_images").delete().eq("id", id); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

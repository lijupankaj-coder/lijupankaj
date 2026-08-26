import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { mediaMetadataSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

export const dynamic = "force-dynamic";

function contentMediaIds(content: unknown) {
  if (!content || typeof content !== "object") return new Set<number>();
  const value = content as { hero?: { profileMediaId?: unknown }; resume?: { mediaId?: unknown } };
  return new Set([value.hero?.profileMediaId, value.resume?.mediaId].filter((id): id is number => typeof id === "number"));
}

function snapshotMediaIds(snapshot: unknown) {
  const ids = contentMediaIds(snapshot && typeof snapshot === "object" ? (snapshot as { sections?: unknown }).sections : null);
  if (!snapshot || typeof snapshot !== "object") return ids;
  const projects = (snapshot as { projects?: unknown }).projects;
  if (!Array.isArray(projects)) return ids;
  for (const project of projects) {
    if (!project || typeof project !== "object" || !Array.isArray((project as { images?: unknown }).images)) continue;
    for (const image of (project as { images: unknown[] }).images) {
      const mediaId = image && typeof image === "object" ? (image as { media?: { id?: unknown } }).media?.id : null;
      if (typeof mediaId === "number") ids.add(mediaId);
    }
  }
  return ids;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin(); const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return new NextResponse("Not found", { status: 404 });
    const { data: media, error } = await supabase.from("media_assets").select("storage_path,mime_type,file_name").eq("id", id).single();
    if (error || !media) return new NextResponse("Not found", { status: 404 });
    const result = await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").download(media.storage_path);
    if (result.error || !result.data) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(result.data, { headers: { "Cache-Control": "private, no-store", "Content-Type": media.mime_type, "Content-Disposition": `inline; filename="${media.file_name.replace(/[\"\r\n]/g, "")}"`, ...(media.mime_type === "image/svg+xml" ? { "Content-Security-Policy": "sandbox" } : {}) } });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const id = Number((await context.params).id);
    const parsed = mediaMetadataSchema.safeParse(await request.json());
    if (!Number.isInteger(id) || !parsed.success) return NextResponse.json({ error: "Alternative text is invalid." }, { status: 400 });
    const { data, error } = await supabase.from("media_assets").update({ alt_text: parsed.data.altText }).eq("id", id).select().single();
    if (error) throw error; return NextResponse.json({ ok: true, media: data });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid media item." }, { status: 400 });
    const [{ data: links }, { data: content }, { data: published }, { data: media, error }] = await Promise.all([
      supabase.from("project_images").select("id", { count: "exact", head: false }).eq("media_id", id).limit(1),
      supabase.from("site_content").select("draft_content").eq("singleton", true).single(),
      supabase.from("published_site").select("snapshot").eq("singleton", true).single(),
      supabase.from("media_assets").select("*").eq("id", id).single()
    ]);
    if (error || !media) return NextResponse.json({ error: "Media item was not found." }, { status: 404 });
    const referencedInContent = contentMediaIds(content?.draft_content).has(id);
    const referencedInPublished = snapshotMediaIds(published?.snapshot).has(id);
    if (links?.length || referencedInContent || referencedInPublished) return NextResponse.json({ error: "This file is still assigned to content or a project. Remove the assignment and publish the change before deleting it." }, { status: 409 });
    const paths = [media.storage_path, ...Object.values(media.variants ?? {}).filter((value): value is string => typeof value === "string")];
    const storageResult = await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").remove(paths);
    if (storageResult.error) throw storageResult.error;
    const deleteResult = await supabase.from("media_assets").delete().eq("id", id); if (deleteResult.error) throw deleteResult.error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

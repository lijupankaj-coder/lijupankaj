import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { projectInputSchema, reorderSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

function databaseValues(value: ReturnType<typeof projectInputSchema.parse>, userId: string) {
  return {
    slug: value.slug, name: value.name, client: value.client, year: value.year, category_id: value.categoryId,
    overview: value.overview, role: value.role, contribution: value.contribution, deliverables: value.deliverables,
    position: value.position, featured: value.featured, status: value.status, updated_by: userId
  };
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase, userId } = await requireAdmin();
    const body = await request.json();
    if (body.action === "duplicate") {
      const id = Number(body.id);
      const { data: source, error } = await supabase.from("projects").select("*,images:project_images(*)").eq("id", id).single();
      if (error || !source) return NextResponse.json({ error: "Project was not found." }, { status: 404 });
      const suffix = Date.now().toString(36).slice(-6);
      const slug = `${source.slug.slice(0, 72)}-${suffix}`;
      const { data: duplicate, error: insertError } = await supabase.from("projects").insert({
        slug, name: `${source.name} — Copy`, client: source.client, year: source.year, category_id: source.category_id,
        overview: source.overview, role: source.role, contribution: source.contribution, deliverables: source.deliverables,
        position: source.position + 1, featured: false, status: "draft", created_by: userId, updated_by: userId
      }).select().single();
      if (insertError) throw insertError;
      if (source.images?.length) {
        const sourceImages = source.images as Array<{ media_id: number; caption: string; alt_text: string; position: number; focal_x: number; focal_y: number; is_cover: boolean }>;
        const images = sourceImages.map((image) => ({ project_id: duplicate.id, media_id: image.media_id, caption: image.caption, alt_text: image.alt_text, position: image.position, focal_x: image.focal_x, focal_y: image.focal_y, is_cover: image.is_cover }));
        const { error: imageError } = await supabase.from("project_images").insert(images);
        if (imageError) throw imageError;
      }
      return NextResponse.json({ ok: true, project: duplicate }, { status: 201 });
    }
    const parsed = projectInputSchema.safeParse(body.project);
    if (!parsed.success) return NextResponse.json({ error: "Project fields are invalid.", issues: parsed.error.flatten() }, { status: 400 });
    const { data, error } = await supabase.from("projects").insert({ ...databaseValues(parsed.data, userId), created_by: userId }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase, userId } = await requireAdmin();
    const body = await request.json();
    if (body.action === "reorder") {
      const parsed = reorderSchema.safeParse({ ids: body.ids });
      if (!parsed.success) return NextResponse.json({ error: "Invalid project order." }, { status: 400 });
      for (const [position, id] of parsed.data.ids.entries()) {
        const { error } = await supabase.from("projects").update({ position, updated_by: userId }).eq("id", id);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }
    const id = Number(body.id);
    const parsed = projectInputSchema.safeParse(body.project);
    if (!Number.isInteger(id) || !parsed.success) return NextResponse.json({ error: "Project fields are invalid." }, { status: 400 });
    const { data, error } = await supabase.from("projects").update(databaseValues(parsed.data, userId)).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid project." }, { status: 400 });
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

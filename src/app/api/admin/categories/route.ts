import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { categoryInputSchema, reorderSchema } from "@/lib/cms/validation";
import { apiError } from "@/lib/http/api-response";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin();
    const parsed = categoryInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Category fields are invalid." }, { status: 400 });
    const { data, error } = await supabase.from("categories").insert({ name: parsed.data.name, slug: parsed.data.slug, position: parsed.data.position, is_active: parsed.data.isActive }).select().single();
    if (error) throw error; return NextResponse.json({ ok: true, category: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const body = await request.json();
    if (body.action === "reorder") {
      const parsed = reorderSchema.safeParse({ ids: body.ids }); if (!parsed.success) return NextResponse.json({ error: "Invalid category order." }, { status: 400 });
      for (const [position, id] of parsed.data.ids.entries()) { const { error } = await supabase.from("categories").update({ position }).eq("id", id); if (error) throw error; }
      return NextResponse.json({ ok: true });
    }
    const id = Number(body.id); const parsed = categoryInputSchema.safeParse(body.category);
    if (!Number.isInteger(id) || !parsed.success) return NextResponse.json({ error: "Category fields are invalid." }, { status: 400 });
    const { data, error } = await supabase.from("categories").update({ name: parsed.data.name, slug: parsed.data.slug, position: parsed.data.position, is_active: parsed.data.isActive }).eq("id", id).select().single();
    if (error) throw error; return NextResponse.json({ ok: true, category: data });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request); const { supabase } = await requireAdmin(); const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

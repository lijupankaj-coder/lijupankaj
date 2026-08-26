import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { clientAddress, enforceRateLimit, requireSameOrigin } from "@/lib/auth/request-security";
import { apiError } from "@/lib/http/api-response";
import { prepareUpload } from "@/lib/media/prepare-upload";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const uploadedPaths: string[] = [];
  let createdMediaId: number | null = null;
  try {
    requireSameOrigin(request); enforceRateLimit(`upload:${clientAddress(request)}`, 30, 60 * 60 * 1000);
    const { supabase, userId } = await requireAdmin();
    const form = await request.formData(); const file = form.get("file"); const altText = String(form.get("altText") || "").trim();
    if (!(file instanceof File) || altText.length < 4 || altText.length > 240) return NextResponse.json({ error: "Choose a file and provide meaningful alternative text." }, { status: 400 });
    const imageLimit = Math.min(Number(process.env.UPLOAD_MAX_IMAGE_MB || 12), 15) * 1024 * 1024;
    const pdfLimit = Math.min(Number(process.env.UPLOAD_MAX_PDF_MB || 10), 15) * 1024 * 1024;
    if (file.size > (file.type === "application/pdf" ? pdfLimit : imageLimit)) return NextResponse.json({ error: "The file exceeds the configured upload limit." }, { status: 413 });
    const prepared = await prepareUpload(file);
    if (prepared.original.byteLength > 15 * 1024 * 1024) return NextResponse.json({ error: "The validated file exceeds the storage limit." }, { status: 413 });
    const { data: duplicate } = await supabase.from("media_assets").select("*").eq("content_hash", prepared.hash).maybeSingle();
    if (duplicate) return NextResponse.json({ error: "This file already exists in the media library.", duplicate }, { status: 409 });

    const base = `${userId}/${prepared.hash}`;
    const originalPath = `${base}/${prepared.fileName}`;
    const originalUpload = await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").upload(originalPath, prepared.original, { contentType: prepared.mimeType, upsert: false, cacheControl: "31536000" });
    if (originalUpload.error) throw originalUpload.error; uploadedPaths.push(originalPath);
    const variants: Record<string, string> = {};
    for (const variant of prepared.variants) {
      const variantPath = `${base}/${variant.fileName}`;
      const result = await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").upload(variantPath, variant.buffer, { contentType: variant.mimeType, upsert: false, cacheControl: "31536000" });
      if (result.error) throw result.error; uploadedPaths.push(variantPath); variants[variant.key] = variantPath;
    }
    const { data, error } = await supabase.from("media_assets").insert({
      file_name: prepared.fileName, storage_path: originalPath, mime_type: prepared.mimeType, byte_size: prepared.original.byteLength,
      content_hash: prepared.hash, alt_text: altText, width: prepared.width, height: prepared.height, variants, uploaded_by: userId
    }).select().single();
    if (error) throw error;
    createdMediaId = data.id;

    const replaceId = Number(form.get("replaceProjectImageId"));
    if (Number.isInteger(replaceId) && replaceId > 0) {
      const { error: replaceError } = await supabase.from("project_images").update({ media_id: data.id, alt_text: altText }).eq("id", replaceId);
      if (replaceError) throw replaceError;
    }
    return NextResponse.json({ ok: true, media: data }, { status: 201 });
  } catch (error) {
    if (uploadedPaths.length) {
      try {
        const { supabase } = await requireAdmin();
        if (createdMediaId) await supabase.from("media_assets").delete().eq("id", createdMediaId);
        await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").remove(uploadedPaths);
      } catch { /* cleanup is best effort */ }
    }
    if (error instanceof Error && ["UNSUPPORTED_FILE", "INVALID_IMAGE", "INVALID_SVG"].includes(error.message)) return NextResponse.json({ error: "The file type or file contents are not safe to upload." }, { status: 400 });
    return apiError(error);
  }
}

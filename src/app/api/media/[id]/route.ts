import { NextRequest, NextResponse } from "next/server";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return new NextResponse("Not found", { status: 404 });

  const snapshot = await getPublishedSnapshot();
  const media = snapshot.media.find((item) => item.id === id);
  if (!media) return new NextResponse("Not found", { status: 404 });

  try {
    const supabase = createServiceClient();
    const largeVariant = typeof media.variants.large === "string" ? media.variants.large : null;
    const useVariant = media.mimeType.startsWith("image/") && media.mimeType !== "image/svg+xml" && largeVariant;
    const storagePath = useVariant || media.storagePath;
    const contentType = useVariant ? "image/webp" : media.mimeType;
    const fileName = useVariant ? media.fileName.replace(/\.[^.]+$/, "-large.webp") : media.fileName;
    const { data, error } = await supabase.storage.from(process.env.MEDIA_BUCKET || "cms-media").download(storagePath);
    if (error || !data) return new NextResponse("Media temporarily unavailable", { status: 503 });

    const download = request.nextUrl.searchParams.get("download") === "1";
    return new NextResponse(data, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-if-error=86400",
        "Content-Type": contentType,
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName.replace(/[\"\r\n]/g, "")}"`,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse("Media temporarily unavailable", { status: 503 });
  }
}

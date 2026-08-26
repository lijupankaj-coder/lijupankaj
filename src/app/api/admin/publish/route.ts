import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { buildDraftSnapshot } from "@/lib/cms/draft";
import { publishedSnapshotSchema } from "@/lib/cms/validation";
import { writeSnapshotFile } from "@/lib/cms/snapshot-file";
import { apiError } from "@/lib/http/api-response";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const draft = await buildDraftSnapshot(supabase);
    const { data, error } = await supabase.rpc("publish_site", { new_snapshot: draft });
    if (error) throw error;
    const parsed = publishedSnapshotSchema.safeParse(data);
    if (!parsed.success) throw new Error("Published snapshot failed validation.");
    await writeSnapshotFile(parsed.data);
    revalidatePath("/");
    return NextResponse.json({ ok: true, revision: parsed.data.revision, publishedAt: parsed.data.publishedAt });
  } catch (error) { return apiError(error); }
}

import { NextResponse } from "next/server";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getPublishedSnapshot();
  return NextResponse.json(
    { status: "ok", revision: snapshot.revision, publishedAt: snapshot.publishedAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}

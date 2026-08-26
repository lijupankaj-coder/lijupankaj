import "server-only";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function clientAddress(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= limit) throw new Error("RATE_LIMITED");
  bucket.count += 1;
  if (buckets.size > 1000) for (const [id, value] of buckets) if (value.resetAt <= now) buckets.delete(id);
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) throw new Error("ORIGIN_REQUIRED");
  const expected = new URL(request.url).origin;
  const configured = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : expected;
  if (origin !== expected && origin !== configured) throw new Error("INVALID_ORIGIN");
}

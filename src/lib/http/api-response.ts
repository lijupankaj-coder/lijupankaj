import { NextResponse } from "next/server";
import { AdminAuthError } from "@/lib/auth/admin";

export function apiError(error: unknown) {
  if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && error.message === "RATE_LIMITED") return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  if (error instanceof Error && ["ORIGIN_REQUIRED", "INVALID_ORIGIN"].includes(error.message)) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  console.error("CMS request failed", error);
  return NextResponse.json({ error: "The request could not be completed." }, { status: 500 });
}

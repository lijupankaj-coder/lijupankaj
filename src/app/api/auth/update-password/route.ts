import { NextRequest, NextResponse } from "next/server";
import { requireSameOrigin } from "@/lib/auth/request-security";
import { apiError } from "@/lib/http/api-response";
import { requireAdmin } from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) return NextResponse.json({ error: "Use at least 12 characters with upper and lower case, a number and a symbol." }, { status: 400 });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export class AdminAuthError extends Error {
  status: number;
  constructor(message = "Administrator authentication required.", status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  if (error || !userId || !email) throw new AdminAuthError();

  const { data: admin } = await supabase.from("admin_users").select("user_id,email").eq("user_id", userId).maybeSingle();
  const approvedEmail = process.env.CMS_ADMIN_EMAIL?.toLowerCase();
  if (!admin || !approvedEmail || email !== approvedEmail || admin.email !== approvedEmail) throw new AdminAuthError("This account is not approved for the CMS.", 403);
  return { supabase, userId, email };
}

export async function requireAdminPage() {
  try {
    return await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
}

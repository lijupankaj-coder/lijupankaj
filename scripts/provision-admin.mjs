import { randomBytes } from "node:crypto";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
const siteUrl = process.env.SITE_URL;
if (!url || !secret || !email || !siteUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, CMS_ADMIN_EMAIL and SITE_URL are required.");

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
let user = null;
for (let page = 1; page <= 10 && !user; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw error;
  user = data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;
  if (data.users.length < 100) break;
}

if (!user) {
  const temporaryPassword = `${randomBytes(28).toString("base64url")}!Aa9`;
  const { data, error } = await supabase.auth.admin.createUser({ email, password: temporaryPassword, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("Administrator user could not be created.");
  user = data.user;
}

const { error: approvalError } = await supabase.from("admin_users").upsert({ user_id: user.id, email }, { onConflict: "user_id" });
if (approvalError) throw approvalError;

process.stdout.write(`Approved administrator provisioned for ${email}.\n`);
process.stdout.write(`Open ${new URL("/admin/forgot-password", siteUrl)} to set a private password through the recovery email.\n`);

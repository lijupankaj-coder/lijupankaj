import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function validatePassword(password) {
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password);
}

async function hiddenPrompt(label) {
  if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal or set CMS_NEW_PASSWORD for this one process.");
  process.stdout.write(label);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  let value = "";

  return new Promise((resolve, reject) => {
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (character) => {
      if (character === "\u0003") {
        process.stdin.off("data", onData);
        finish();
        reject(new Error("Password reset cancelled."));
        return;
      }
      if (character === "\r" || character === "\n") {
        process.stdin.off("data", onData);
        finish();
        resolve(value);
        return;
      }
      if (character === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      if (character >= " ") value += character;
    };
    process.stdin.on("data", onData);
  });
}

const url = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
if (!url || !secret || !email) throw new Error("Supabase server configuration and CMS_ADMIN_EMAIL are required.");

let password = process.env.CMS_NEW_PASSWORD;
if (!password) {
  password = await hiddenPrompt("New administrator password: ");
  const confirmation = await hiddenPrompt("Confirm administrator password: ");
  if (password !== confirmation) throw new Error("Passwords do not match.");
}
if (!validatePassword(password)) throw new Error("Use at least 12 characters with upper and lower case, a number and a symbol.");

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
let user = null;
for (let page = 1; page <= 10 && !user; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw error;
  user = data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;
  if (data.users.length < 100) break;
}
if (!user) throw new Error("The approved administrator account was not found.");

const { data: approval, error: approvalError } = await supabase.from("admin_users").select("user_id,email").eq("user_id", user.id).eq("email", email).maybeSingle();
if (approvalError) throw approvalError;
if (!approval) throw new Error("The account is not present in the CMS administrator allow-list.");

const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
if (error) throw error;
process.stdout.write(`Password updated for the approved administrator ${email}.\n`);

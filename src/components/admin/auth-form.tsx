"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ setup = false }: { setup?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error || "Login failed.");
    router.replace("/admin"); router.refresh();
  }
  return <form className="auth-form" onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={12} required /></label>{setup && <p className="form-note">Connect the Supabase environment and provision the approved administrator before signing in.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="admin-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button><a href="/admin/forgot-password">Forgot password?</a></form>;
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) });
    const result = await response.json(); setMessage(result.message || result.error);
  }
  return <form className="auth-form" onSubmit={submit}><label>Approved administrator email<input name="email" type="email" autoComplete="email" required /></label>{message && <p className="form-note" role="status">{message}</p>}<button className="admin-primary">Send reset link</button><a href="/admin/login">Return to sign in</a></form>;
}

export function ResetPasswordForm() {
  const router = useRouter(); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password"));
    if (password !== String(form.get("confirmation"))) return setMessage("Passwords do not match.");
    const response = await fetch("/api/auth/update-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json(); if (!response.ok) return setMessage(result.error);
    setMessage("Password updated."); setTimeout(() => router.replace("/admin"), 700);
  }
  return <form className="auth-form" onSubmit={submit}><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></label><p className="form-note">At least 12 characters, including upper and lower case, a number and a symbol.</p>{message && <p className="form-note" role="status">{message}</p>}<button className="admin-primary">Update password</button></form>;
}

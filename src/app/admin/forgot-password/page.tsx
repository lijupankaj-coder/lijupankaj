import { ForgotPasswordForm } from "@/components/admin/auth-form";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return <main className="auth-page"><section className="auth-card"><Link className="admin-mark" href="/">LIJU PANKAJ</Link><p className="admin-kicker">Account recovery</p><h1>Reset your password</h1><p>A reset email is sent only for the approved administrator account.</p><ForgotPasswordForm /></section></main>;
}

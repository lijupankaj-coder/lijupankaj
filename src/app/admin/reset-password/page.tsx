import { ResetPasswordForm } from "@/components/admin/auth-form";
import Link from "next/link";

export default function ResetPasswordPage() {
  return <main className="auth-page"><section className="auth-card"><Link className="admin-mark" href="/">LIJU PANKAJ</Link><p className="admin-kicker">Secure password reset</p><h1>Choose a new password</h1><ResetPasswordForm /></section></main>;
}

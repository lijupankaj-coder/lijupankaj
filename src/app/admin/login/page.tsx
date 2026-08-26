import { LoginForm } from "@/components/admin/auth-form";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const params = await searchParams;
  return <main className="auth-page"><section className="auth-card"><Link className="admin-mark" href="/">LIJU PANKAJ</Link><p className="admin-kicker">Private portfolio CMS</p><h1>Administrator sign in</h1><p>Manage portfolio projects, content, media and the published website.</p><LoginForm setup={params.setup === "1"} /></section></main>;
}

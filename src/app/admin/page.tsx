import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/admin";
import { loadCmsDrafts } from "@/lib/cms/draft";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { email, supabase } = await requireAdminPage();
  const initial = { ...(await loadCmsDrafts(supabase)), administrator: email };
  return <AdminShell email={email} initial={initial} />;
}

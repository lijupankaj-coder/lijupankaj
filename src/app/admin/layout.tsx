import type { ReactNode } from "react";
import "./admin.css";

export const metadata = { title: "Portfolio CMS", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

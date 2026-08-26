"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentEditor } from "@/components/admin/content-editor";
import { MediaLibrary } from "@/components/admin/media-library";
import { ProjectManager } from "@/components/admin/project-manager";
import { StyleEditor } from "@/components/admin/style-editor";
import type { CmsBootstrap } from "@/types/cms";

type Tab = "overview" | "projects" | "content" | "media" | "style";
const tabs: Array<{ id: Tab; label: string }> = [{ id: "overview", label: "Overview" }, { id: "projects", label: "Portfolio" }, { id: "content", label: "Website Content" }, { id: "media", label: "Media Library" }, { id: "style", label: "Website Style" }];

export function AdminShell({ email, initial }: { email: string; initial: CmsBootstrap }) {
  const router = useRouter(); const [tab, setTab] = useState<Tab>("overview"); const [data, setData] = useState<CmsBootstrap>(initial); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [publishing, setPublishing] = useState(false);
  const reload = useCallback(async () => { const response = await fetch("/api/admin/bootstrap", { cache: "no-store" }); if (response.status === 401 || response.status === 403) return router.replace("/admin/login"); const result = await response.json(); if (!response.ok) return setError(result.error || "CMS data could not be loaded."); setData(result); setError(""); }, [router]);
  async function publish() { if (!confirm("Publish all current draft content, theme settings and projects marked Published?")) return; setPublishing(true); setNotice(""); const response = await fetch("/api/admin/publish", { method: "POST" }); const result = await response.json(); setPublishing(false); setNotice(response.ok ? `Published revision ${result.revision}. The public cache is revalidating now.` : result.error); }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-mark" href="/">LIJU PANKAJ</Link><p className="admin-kicker">Portfolio CMS</p><nav aria-label="CMS navigation">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav><div className="sidebar-account"><span>Signed in as</span><strong>{email}</strong><button onClick={logout}>Sign out</button></div></aside><main className="admin-main"><header className="admin-topbar"><div><span className="draft-indicator">Draft workspace</span>{notice && <p role="status">{notice}</p>}{error && <p role="alert">{error}</p>}</div><div><Link className="admin-secondary" href="/" target="_blank">View live site</Link><button className="admin-primary" onClick={publish} disabled={publishing}>{publishing ? "Publishing…" : "Publish Changes"}</button></div></header>{tab === "overview" && <Overview data={data} onNavigate={setTab} />}{tab === "projects" && <ProjectManager data={data} reload={reload} />}{tab === "content" && <ContentEditor initial={data.sections} media={data.media} reload={reload} />}{tab === "media" && <MediaLibrary media={data.media} reload={reload} />}{tab === "style" && <StyleEditor initial={data.theme} reload={reload} publish={publish} />}</main></div>;
}

function Overview({ data, onNavigate }: { data: CmsBootstrap; onNavigate: (tab: Tab) => void }) {
  const published = data.projects.filter((project) => project.status === "published").length; const withoutImages = data.projects.filter((project) => !project.images.length).length;
  return <section className="admin-panel"><p className="admin-kicker">Content control</p><h1>Portfolio overview</h1><p className="admin-lead">Edits remain private until you publish. The public site reads only the last atomic published snapshot.</p><div className="metric-grid"><article><span>{data.projects.length}</span><p>Approved project records</p></article><article><span>{published}</span><p>Marked for next publish</p></article><article><span>{withoutImages}</span><p>Waiting for verified images</p></article><article><span>{data.media.length}</span><p>Private media items</p></article></div><div className="admin-callout"><h2>Asset rule</h2><p>Images appear only after they are uploaded here, explicitly assigned to a project, and included in a publication. Projects without assigned images use the neutral coming-soon state.</p><button className="admin-secondary" onClick={() => onNavigate("projects")}>Manage portfolio</button></div></section>;
}

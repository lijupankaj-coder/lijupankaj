"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaUploader } from "@/components/admin/media-uploader";
import type { MediaAsset } from "@/types/cms";

export function MediaLibrary({ media, reload }: { media: MediaAsset[]; reload: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  async function updateAlt(item: MediaAsset, altText: string) {
    const response = await fetch(`/api/admin/media/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ altText }) });
    const result = await response.json(); setMessage(response.ok ? "Alternative text saved." : result.error); if (response.ok) await reload();
  }
  async function remove(item: MediaAsset) {
    if (!confirm(`Delete ${item.file_name}? This succeeds only when no draft or published content still references it.`)) return;
    const response = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" }); const result = await response.json(); setMessage(response.ok ? "Media deleted safely." : result.error); if (response.ok) await reload();
  }
  return <section className="admin-panel"><p className="admin-kicker">Private storage</p><h1>Media library</h1><p className="admin-lead">Accepted: JPG, PNG, WebP, AVIF, sanitized SVG and PDF. Raster uploads receive optimized WebP variants; duplicates are blocked by content hash.</p><MediaUploader onComplete={() => void reload()} />{message && <p className="admin-notice" role="status">{message}</p>}<div className="media-grid">{media.map((item) => <article className="media-card" key={item.id}><div className="media-preview">{item.mime_type === "application/pdf" ? <span>PDF</span> : <Image src={`/api/admin/media/${item.id}`} alt={item.alt_text} width={item.width ?? 800} height={item.height ?? 600} unoptimized />}</div><div><strong>{item.file_name}</strong><small>{item.mime_type} · {(item.byte_size / 1024 / 1024).toFixed(2)} MB</small><label>Alternative text<input defaultValue={item.alt_text} onBlur={(event) => { if (event.target.value !== item.alt_text) void updateAlt(item, event.target.value); }} /></label><button className="danger-link" onClick={() => void remove(item)}>Delete safely</button></div></article>)}</div>{!media.length && <div className="admin-empty"><h2>No media uploaded</h2><p>The removed legacy portfolio images have not been migrated. Upload only verified work.</p></div>}</section>;
}

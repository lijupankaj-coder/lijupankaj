"use client";

import { useState } from "react";
import type { InternalApp } from "@/types/cms";

export function InnovationGrid({ apps, accessNote }: { apps: InternalApp[]; accessNote: string }) {
  const [expanded, setExpanded] = useState(false);
  const visibleApps = expanded ? apps : apps.filter((app) => app.featured).slice(0, 4);
  return (
    <>
      <div className="innovation-grid">
        {visibleApps.map((app, index) => (
          <article className="tool-card" key={app.id}>
            <span className="tool-number">{String(index + 1).padStart(2, "0")}</span>
            <p className="private-label">Private internal application</p>
            <h3>{app.name}</h3>
            <p>{app.purpose}</p>
            <dl><div><dt>Problem solved</dt><dd>{app.problem}</dd></div><div><dt>Contribution</dt><dd>{app.contribution}</dd></div></dl>
            <p className="tool-tech">{app.technologies.join(" · ")}</p>
            <a className="text-link" href={app.url} target="_blank" rel="noopener noreferrer">Open Private Application <span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </div>
      <p className="access-note">{accessNote}</p>
      {apps.length > 4 && <button className="outline-button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Show featured tools" : "View More Internal Tools"}</button>}
    </>
  );
}

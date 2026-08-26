"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { PublicProject } from "@/types/cms";

type Props = { projects: PublicProject[]; categories: Array<{ id: number; name: string; slug: string }> };

export function PortfolioGallery({ projects, categories }: Props) {
  const [filter, setFilter] = useState("all");
  const [openProject, setOpenProject] = useState<PublicProject | null>(null);
  const visible = useMemo(
    () => projects.filter((project) => filter === "all" || project.category?.slug === filter),
    [filter, projects]
  );
  useEffect(() => {
    if (!openProject) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenProject(null); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [openProject]);

  if (!projects.length) return null;

  return (
    <>
      <div className="filters" aria-label="Filter portfolio projects">
        <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All projects</button>
        {categories.map((category) => (
          <button key={category.id} className={filter === category.slug ? "is-active" : ""} onClick={() => setFilter(category.slug)}>
            {category.name}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {visible.map((project) => {
          const cover = project.images.find((image) => image.isCover) ?? project.images[0];
          return (
            <article className="project-card" key={project.id}>
              <button className="project-card-button" onClick={() => setOpenProject(project)} aria-label={`View ${project.name} case study`}>
                <div className="project-cover">
                  {cover ? (
                    // Media is served only after the server confirms it belongs to the published snapshot.
                    <Image src={`/api/media/${cover.media.id}`} alt={cover.alt} width={cover.media.width ?? 1600} height={cover.media.height ?? 1000} style={{ objectPosition: `${cover.focalX}% ${cover.focalY}%` }} sizes="(max-width: 900px) 100vw, 50vw" />
                  ) : <span>Image coming soon</span>}
                </div>
                <div className="project-card-copy">
                  <p className="meta">{project.category?.name ?? "Selected work"} · {project.year}</p>
                  <h3>{project.name}</h3>
                  <p>{project.overview}</p>
                  <span className="text-link">View case study <span aria-hidden="true">↗</span></span>
                </div>
              </button>
            </article>
          );
        })}
      </div>
      {openProject && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setOpenProject(null)}>
          <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setOpenProject(null)} aria-label="Close case study" autoFocus>Close</button>
            <p className="meta">{openProject.client} · {openProject.year}</p>
            <h2 id="project-dialog-title">{openProject.name}</h2>
            <div className="dialog-summary">
              <div><span>Overview</span><p>{openProject.overview}</p></div>
              <div><span>Role</span><p>{openProject.role}</p></div>
              <div><span>Contribution</span><p>{openProject.contribution}</p></div>
              <div><span>Deliverables</span><p>{openProject.deliverables.join(" · ")}</p></div>
            </div>
            <div className="dialog-images">
              {openProject.images.length ? openProject.images.map((image) => (
                <figure key={image.id}>
                  <Image src={`/api/media/${image.media.id}`} alt={image.alt} width={image.media.width ?? 1600} height={image.media.height ?? 1000} style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }} sizes="(max-width: 1180px) 100vw, 1100px" />
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              )) : <div className="project-cover project-cover-large"><span>Image coming soon</span></div>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

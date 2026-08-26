import "server-only";
import { defaultSections } from "@/content/defaults";
import { normalizeTheme } from "@/lib/cms/theme";
import { siteSectionsSchema } from "@/lib/cms/validation";
import type { MediaAsset, PublishedSnapshot, PublicMedia, PublicProject } from "@/types/cms";

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;
type DraftImageRow = {
  id: number; alt_text: string; caption: string; focal_x: number | string; focal_y: number | string; is_cover: boolean; position: number;
  media: MediaAsset;
};
type DraftProjectRow = {
  id: number; slug: string; name: string; client: string; year: string; overview: string; role: string; contribution: string;
  deliverables: unknown; featured: boolean; position: number; status: string;
  category: { id: number; name: string; slug: string } | null; images: DraftImageRow[];
};

export async function loadCmsDrafts(supabase: SupabaseClient) {
  const [contentResult, themeResult, categoryResult, projectResult, mediaResult] = await Promise.all([
    supabase.from("site_content").select("draft_content,updated_at").eq("singleton", true).single(),
    supabase.from("theme_settings").select("draft_theme,updated_at").eq("singleton", true).single(),
    supabase.from("categories").select("*").order("position"),
    supabase.from("projects").select("*,category:categories(id,name,slug),images:project_images(*,media:media_assets(*))").order("position"),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false })
  ]);
  const firstError = [contentResult.error, themeResult.error, categoryResult.error, projectResult.error, mediaResult.error].find(Boolean);
  if (firstError) throw firstError;
  const content = siteSectionsSchema.safeParse(contentResult.data?.draft_content);
  return {
    sections: content.success ? content.data : defaultSections,
    theme: normalizeTheme(themeResult.data?.draft_theme),
    categories: categoryResult.data ?? [],
    projects: projectResult.data ?? [],
    media: mediaResult.data ?? [],
    updatedAt: { content: contentResult.data?.updated_at ?? null, theme: themeResult.data?.updated_at ?? null }
  };
}

export async function buildDraftSnapshot(supabase: SupabaseClient): Promise<PublishedSnapshot> {
  const drafts = await loadCmsDrafts(supabase);
  const draftProjects = drafts.projects as unknown as DraftProjectRow[];
  const projects: PublicProject[] = draftProjects
    .filter((project) => project.status === "published")
    .map((project) => ({
      id: Number(project.id), slug: project.slug, name: project.name, client: project.client, year: project.year,
      category: project.category ? { id: Number(project.category.id), name: project.category.name, slug: project.category.slug } : null,
      overview: project.overview, role: project.role, contribution: project.contribution,
      deliverables: Array.isArray(project.deliverables) ? project.deliverables.filter((item): item is string => typeof item === "string") : [],
      featured: project.featured, position: project.position,
      images: (project.images ?? []).sort((a, b) => a.position - b.position).map((image) => ({
        id: Number(image.id), alt: image.alt_text, caption: image.caption, focalX: Number(image.focal_x), focalY: Number(image.focal_y),
        isCover: image.is_cover, position: image.position,
        media: publicMedia(image.media)
      }))
    }));
  const referencedMediaIds = new Set(projects.flatMap((project) => project.images.map((image) => image.media.id)));
  if (drafts.sections.hero.profileMediaId) referencedMediaIds.add(drafts.sections.hero.profileMediaId);
  if (drafts.sections.resume.mediaId) referencedMediaIds.add(drafts.sections.resume.mediaId);
  return {
    schemaVersion: 1, revision: 0, publishedAt: null, theme: drafts.theme, sections: drafts.sections, projects,
    categories: drafts.categories.filter((category) => category.is_active).map((category) => ({ id: Number(category.id), name: category.name, slug: category.slug, position: category.position })),
    media: (drafts.media as MediaAsset[]).filter((media) => referencedMediaIds.has(Number(media.id))).map(publicMedia)
  };
}

function publicMedia(media: MediaAsset): PublicMedia {
  return { id: Number(media.id), fileName: media.file_name, storagePath: media.storage_path, alt: media.alt_text, width: media.width, height: media.height, mimeType: media.mime_type, variants: media.variants };
}

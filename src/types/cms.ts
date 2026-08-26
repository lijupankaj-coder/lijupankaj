export type ThemeSettings = {
  primaryFont: string;
  headingFont: string;
  bodyFont: string;
  bodySize: number;
  heroHeadingSize: number;
  sectionHeadingSize: number;
  cardHeadingSize: number;
  navSize: number;
  buttonSize: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  headingColor: string;
  bodyColor: string;
  buttonBackground: string;
  buttonText: string;
  borderColor: string;
  borderRadius: number;
  sectionSpacing: number;
  containerWidth: number;
};

export type NavigationItem = { id: string; label: string; href: string; visible: boolean };
export type ExperienceItem = { id: string; period: string; location: string; title: string; company: string; summary: string };
export type CapabilityItem = { id: string; title: string; summary: string };
export type EducationItem = { id: string; qualification: string; institution: string };
export type InternalApp = {
  id: string;
  name: string;
  purpose: string;
  problem: string;
  contribution: string;
  technologies: string[];
  url: string;
  featured: boolean;
};

export type SiteSections = {
  visibility: { profile: boolean; experience: boolean; portfolio: boolean; capabilities: boolean; innovation: boolean; education: boolean; contact: boolean };
  navigation: { items: NavigationItem[]; resumeLabel: string };
  hero: {
    eyebrow: string;
    title: string;
    positioning: string;
    introduction: string;
    location: string;
    primaryButtonLabel: string;
    resumeButtonLabel: string;
    profileMediaId: number | null;
    profileFallbackUrl: string;
  };
  profile: { heading: string; lead: string; paragraphs: string[]; pillars: string[] };
  experience: { heading: string; items: ExperienceItem[] };
  portfolio: { heading: string; introduction: string; emptyMessage: string };
  capabilities: { heading: string; items: CapabilityItem[]; tools: string[] };
  innovation: { heading: string; introduction: string; accessNote: string; apps: InternalApp[] };
  education: { heading: string; items: EducationItem[]; languages: string[] };
  contact: { heading: string; email: string; phone: string; location: string; buttonLabel: string };
  footer: { copyright: string; descriptor: string };
  resume: { mediaId: number | null; fallbackUrl: string; downloadLabel: string };
};

export type PublicMedia = {
  id: number;
  fileName: string;
  storagePath: string;
  alt: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  variants: Record<string, string>;
};

export type PublicProjectImage = {
  id: number;
  media: PublicMedia;
  alt: string;
  caption: string;
  focalX: number;
  focalY: number;
  isCover: boolean;
  position: number;
};

export type PublicProject = {
  id: number;
  slug: string;
  name: string;
  client: string;
  year: string;
  category: { id: number; name: string; slug: string } | null;
  overview: string;
  role: string;
  contribution: string;
  deliverables: string[];
  featured: boolean;
  position: number;
  images: PublicProjectImage[];
};

export type PublishedSnapshot = {
  schemaVersion: 1;
  revision: number;
  publishedAt: string | null;
  theme: ThemeSettings;
  sections: SiteSections;
  projects: PublicProject[];
  categories: Array<{ id: number; name: string; slug: string; position: number }>;
  media: PublicMedia[];
};

export type ProjectDraft = {
  id: number;
  slug: string;
  name: string;
  client: string;
  year: string;
  category_id: number | null;
  overview: string;
  role: string;
  contribution: string;
  deliverables: string[];
  position: number;
  featured: boolean;
  status: "draft" | "published" | "unpublished";
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: number;
  file_name: string;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  content_hash: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  variants: Record<string, string>;
  created_at: string;
};

export type AdminCategory = { id: number; name: string; slug: string; position: number; is_active: boolean };
export type AdminProjectImage = {
  id: number; project_id: number; media_id: number; caption: string; alt_text: string; position: number;
  focal_x: number | string; focal_y: number | string; is_cover: boolean; media: MediaAsset;
};
export type AdminProject = ProjectDraft & {
  category: { id: number; name: string; slug: string } | null;
  images: AdminProjectImage[];
};
export type CmsBootstrap = {
  sections: SiteSections; theme: ThemeSettings; categories: AdminCategory[]; projects: AdminProject[]; media: MediaAsset[];
  administrator: string; updatedAt: { content: string | null; theme: string | null };
};

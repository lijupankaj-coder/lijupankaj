import { z } from "zod";

const cleanText = (max: number) => z.string().max(max).transform((value) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim());
const requiredText = (min: number, max: number) => z.string().min(min).max(max).transform((value) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim());
const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]{1,79}$/);
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const mediaId = z.number().int().positive().nullable();

export const themeSchema = z.object({
  primaryFont: cleanText(60),
  headingFont: cleanText(60),
  bodyFont: cleanText(60),
  bodySize: z.number().min(14).max(20),
  heroHeadingSize: z.number().min(52).max(132),
  sectionHeadingSize: z.number().min(36).max(84),
  cardHeadingSize: z.number().min(22).max(48),
  navSize: z.number().min(11).max(18),
  buttonSize: z.number().min(11).max(18),
  primaryColor: color,
  secondaryColor: color,
  accentColor: color,
  backgroundColor: color,
  surfaceColor: color,
  headingColor: color,
  bodyColor: color,
  buttonBackground: color,
  buttonText: color,
  borderColor: color,
  borderRadius: z.number().min(0).max(32),
  sectionSpacing: z.number().min(56).max(200),
  containerWidth: z.number().min(960).max(1600)
});

const navigationItemSchema = z.object({ id: identifier, label: cleanText(40), href: z.string().regex(/^#[a-z0-9-]+$/), visible: z.boolean() });
const experienceItemSchema = z.object({ id: identifier, period: cleanText(40), location: cleanText(80), title: cleanText(160), company: cleanText(160), summary: cleanText(1200) });
const capabilityItemSchema = z.object({ id: identifier, title: cleanText(120), summary: cleanText(500) });
const educationItemSchema = z.object({ id: identifier, qualification: cleanText(160), institution: cleanText(200) });
const internalAppSchema = z.object({
  id: identifier,
  name: cleanText(120),
  purpose: cleanText(600),
  problem: cleanText(700),
  contribution: cleanText(700),
  technologies: z.array(cleanText(80)).max(12),
  url: z.string().url().refine((value) => value.startsWith("https://"), "Only HTTPS links are allowed"),
  featured: z.boolean()
});

export const siteSectionsSchema = z.object({
  visibility: z.object({ profile: z.boolean(), experience: z.boolean(), portfolio: z.boolean(), capabilities: z.boolean(), innovation: z.boolean(), education: z.boolean(), contact: z.boolean() }),
  navigation: z.object({ items: z.array(navigationItemSchema).min(1).max(12), resumeLabel: cleanText(50) }),
  hero: z.object({
    eyebrow: cleanText(160), title: cleanText(160), positioning: cleanText(240), introduction: cleanText(1200), location: cleanText(120),
    primaryButtonLabel: cleanText(50), resumeButtonLabel: cleanText(50), profileMediaId: mediaId, profileFallbackUrl: cleanText(240)
  }),
  profile: z.object({ heading: cleanText(200), lead: cleanText(1200), paragraphs: z.array(cleanText(1500)).max(8), pillars: z.array(cleanText(80)).max(8) }),
  experience: z.object({ heading: cleanText(200), items: z.array(experienceItemSchema).max(20) }),
  portfolio: z.object({ heading: cleanText(200), introduction: cleanText(800), emptyMessage: cleanText(600) }),
  capabilities: z.object({ heading: cleanText(200), items: z.array(capabilityItemSchema).max(24), tools: z.array(cleanText(100)).max(60) }),
  innovation: z.object({ heading: cleanText(200), introduction: cleanText(1200), accessNote: cleanText(600), apps: z.array(internalAppSchema).max(20) }),
  education: z.object({ heading: cleanText(200), items: z.array(educationItemSchema).max(20), languages: z.array(cleanText(80)).max(20) }),
  contact: z.object({ heading: cleanText(240), email: z.string().email().max(254), phone: cleanText(40), location: cleanText(120), buttonLabel: cleanText(60) }),
  footer: z.object({ copyright: cleanText(120), descriptor: cleanText(200) }),
  resume: z.object({ mediaId, fallbackUrl: cleanText(240), downloadLabel: cleanText(60) })
});

export const projectInputSchema = z.object({
  slug: identifier,
  name: cleanText(160),
  client: cleanText(160),
  year: cleanText(40),
  categoryId: z.number().int().positive().nullable(),
  overview: cleanText(1600),
  role: cleanText(1200),
  contribution: cleanText(1200),
  deliverables: z.array(cleanText(160)).max(30),
  position: z.number().int().min(0).max(10000),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "unpublished"])
});

export const categoryInputSchema = z.object({ name: cleanText(100), slug: identifier, position: z.number().int().min(0).max(10000), isActive: z.boolean() });

export const projectImageInputSchema = z.object({
  projectId: z.number().int().positive(),
  mediaId: z.number().int().positive(),
  caption: cleanText(300),
  altText: requiredText(4, 240),
  position: z.number().int().min(0).max(10000),
  focalX: z.number().min(0).max(100),
  focalY: z.number().min(0).max(100),
  isCover: z.boolean()
});

export const reorderSchema = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200) });
export const duplicateSchema = z.object({ id: z.number().int().positive() });
export const mediaMetadataSchema = z.object({ altText: requiredText(4, 240) });

const publicMediaSchema = z.object({
  id: z.number().int().positive(), fileName: cleanText(240), storagePath: cleanText(500), alt: cleanText(240),
  width: z.number().int().positive().nullable(), height: z.number().int().positive().nullable(), mimeType: cleanText(80),
  variants: z.record(z.string(), cleanText(500))
});

const publicProjectImageSchema = z.object({
  id: z.number().int().positive(), media: publicMediaSchema, alt: requiredText(4, 240), caption: cleanText(300),
  focalX: z.number().min(0).max(100), focalY: z.number().min(0).max(100), isCover: z.boolean(),
  position: z.number().int().min(0).max(10000)
});

const publicProjectSchema = z.object({
  id: z.number().int().positive(), slug: identifier, name: cleanText(160), client: cleanText(160), year: cleanText(40),
  category: z.object({ id: z.number().int().positive(), name: cleanText(100), slug: identifier }).nullable(),
  overview: cleanText(1600), role: cleanText(1200), contribution: cleanText(1200),
  deliverables: z.array(cleanText(160)).max(30), featured: z.boolean(), position: z.number().int().min(0).max(10000),
  images: z.array(publicProjectImageSchema).max(30)
});

export const publishedSnapshotSchema = z.object({
  schemaVersion: z.literal(1), revision: z.number().int().min(0), publishedAt: z.string().datetime({ offset: true }).nullable(),
  theme: themeSchema, sections: siteSectionsSchema, projects: z.array(publicProjectSchema).max(200),
  categories: z.array(z.object({
    id: z.number().int().positive(), name: cleanText(100), slug: identifier,
    position: z.number().int().min(0).max(10000)
  })).max(100), media: z.array(publicMediaSchema).max(1000)
});

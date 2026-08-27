import type { Metadata } from "next";
import type { PublishedSnapshot } from "@/types/cms";

export const siteUrl = "https://lijupankaj.com";
export const seoTitle = "Senior Graphic Designer Dubai | Liju Pankaj";
export const seoDescription = "Senior Graphic Designer in Dubai and the UAE with 24 years of experience across brand identity, campaigns, events, exhibitions, banking and hospitality design.";

export const seoMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Liju Pankaj Design Portfolio",
  title: { default: seoTitle, template: "%s | Liju Pankaj" },
  description: seoDescription,
  alternates: { canonical: "/" },
  authors: [{ name: "Liju Pankaj", url: siteUrl }],
  creator: "Liju Pankaj",
  publisher: "Liju Pankaj",
  category: "Graphic Design Portfolio",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.png", type: "image/png" },
  ],
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: "/",
    siteName: "Liju Pankaj Design Portfolio",
    type: "profile",
    locale: "en_AE",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Liju Pankaj - Senior Graphic Designer in Dubai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: ["/opengraph-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function buildStructuredData(snapshot: PublishedSnapshot) {
  const { sections, projects } = snapshot;
  const profileImage = sections.hero.profileMediaId
    ? `${siteUrl}/api/media/${sections.hero.profileMediaId}`
    : new URL(sections.hero.profileFallbackUrl, siteUrl).toString();
  const personId = `${siteUrl}/#person`;

  const portfolioItems = projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "CreativeWork",
      name: project.name,
      description: project.overview,
      dateCreated: project.year,
      genre: project.category?.name ?? "Graphic Design",
      creator: { "@id": personId },
      image: project.images[0] ? `${siteUrl}/api/media/${project.images[0].media.id}` : undefined,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Liju Pankaj Design Portfolio",
        alternateName: "Liju Pankaj - Senior Graphic Designer",
        description: seoDescription,
        inLanguage: "en-AE",
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile-page`,
        url: siteUrl,
        name: seoTitle,
        description: seoDescription,
        dateModified: snapshot.publishedAt ?? undefined,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": personId },
        primaryImageOfPage: { "@type": "ImageObject", contentUrl: profileImage },
        hasPart: { "@id": `${siteUrl}/#selected-work` },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: "Liju Pankaj",
        url: siteUrl,
        image: profileImage,
        jobTitle: "Senior Graphic Designer",
        description: sections.hero.introduction,
        email: `mailto:${sections.contact.email}`,
        telephone: sections.contact.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
        worksFor: { "@type": "Organization", name: "Eleven777 Advertising LLC" },
        knowsLanguage: sections.education.languages,
        knowsAbout: sections.capabilities.items.map((item) => item.title),
        alumniOf: sections.education.items.map((item) => ({
          "@type": "EducationalOrganization",
          name: item.institution,
        })),
        hasOccupation: {
          "@type": "Occupation",
          name: "Senior Graphic Designer",
          occupationLocation: { "@type": "Country", name: "United Arab Emirates" },
          skills: sections.capabilities.items.map((item) => item.title).join(", "),
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#selected-work`,
        name: "Selected Graphic Design Work",
        numberOfItems: portfolioItems.length,
        itemListElement: portfolioItems,
      },
    ],
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";
import { themeFontUrl, themeVariables } from "@/lib/cms/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://lijupankaj.com"),
  title: { default: "Liju Pankaj — Senior Graphic Designer", template: "%s — Liju Pankaj" },
  description: "Senior Graphic Designer in the UAE specialising in brand, campaign, event, exhibition, hospitality, banking and AI-assisted creative workflows.",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }, { rel: "icon", url: "/favicon.png", type: "image/png" }],
  openGraph: { title: "Liju Pankaj — Senior Graphic Designer", description: "Brand, campaign and event design backed by 24 years of experience.", type: "website", locale: "en_AE" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const snapshot = await getPublishedSnapshot();
  const fontUrl = themeFontUrl(snapshot.theme);
  return (
    <html lang="en" style={themeVariables(snapshot.theme)}>
      <head>{fontUrl && <link rel="stylesheet" href={fontUrl} />}</head>
      <body>{children}</body>
    </html>
  );
}

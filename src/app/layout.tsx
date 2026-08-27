import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getPublishedSnapshot } from "@/lib/cms/snapshot";
import { themeFontUrl, themeVariables } from "@/lib/cms/theme";
import { seoMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = seoMetadata;

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

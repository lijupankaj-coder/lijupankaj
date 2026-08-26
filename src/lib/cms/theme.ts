import type { CSSProperties } from "react";
import { getFontOption, getGoogleFontsUrl } from "@/content/fonts";
import { defaultTheme } from "@/content/defaults";
import { themeSchema } from "@/lib/cms/validation";
import type { ThemeSettings } from "@/types/cms";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export function normalizeTheme(value: unknown): ThemeSettings {
  const parsed = themeSchema.safeParse(value);
  if (!parsed.success) return defaultTheme;
  const validFonts = [parsed.data.primaryFont, parsed.data.headingFont, parsed.data.bodyFont].every((font) => getFontOption(font).value === font);
  return validFonts ? parsed.data : defaultTheme;
}

export function themeVariables(themeInput: unknown): ThemeStyle {
  const theme = normalizeTheme(themeInput);
  return {
    "--font-primary": getFontOption(theme.primaryFont).family,
    "--font-heading": getFontOption(theme.headingFont).family,
    "--font-body": getFontOption(theme.bodyFont).family,
    "--body-size": `${theme.bodySize}px`,
    "--hero-heading-min": `${Math.max(48, Math.round(theme.heroHeadingSize * 0.54))}px`,
    "--hero-heading-max": `${theme.heroHeadingSize}px`,
    "--section-heading-min": `${Math.max(34, Math.round(theme.sectionHeadingSize * 0.64))}px`,
    "--section-heading-max": `${theme.sectionHeadingSize}px`,
    "--card-heading-min": `${Math.max(20, Math.round(theme.cardHeadingSize * 0.75))}px`,
    "--card-heading-max": `${theme.cardHeadingSize}px`,
    "--nav-size": `${theme.navSize}px`,
    "--button-size": `${theme.buttonSize}px`,
    "--primary": theme.primaryColor,
    "--secondary": theme.secondaryColor,
    "--accent": theme.accentColor,
    "--background": theme.backgroundColor,
    "--surface": theme.surfaceColor,
    "--heading": theme.headingColor,
    "--body": theme.bodyColor,
    "--button-bg": theme.buttonBackground,
    "--button-text": theme.buttonText,
    "--border": theme.borderColor,
    "--radius": `${theme.borderRadius}px`,
    "--section-space": `${theme.sectionSpacing}px`,
    "--container": `${theme.containerWidth}px`
  };
}

export function themeFontUrl(themeInput: unknown) {
  const theme = normalizeTheme(themeInput);
  return getGoogleFontsUrl([theme.primaryFont, theme.headingFont, theme.bodyFont]);
}

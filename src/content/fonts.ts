export const fontOptions = [
  { value: "Inter", label: "Inter", family: "'Inter', Arial, sans-serif", google: "Inter:wght@400;500;600;700" },
  { value: "Manrope", label: "Manrope", family: "'Manrope', Arial, sans-serif", google: "Manrope:wght@400;500;600;700" },
  { value: "Source Sans 3", label: "Source Sans 3", family: "'Source Sans 3', Arial, sans-serif", google: "Source+Sans+3:wght@400;500;600;700" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans", family: "'IBM Plex Sans', Arial, sans-serif", google: "IBM+Plex+Sans:wght@400;500;600;700" },
  { value: "DM Sans", label: "DM Sans", family: "'DM Sans', Arial, sans-serif", google: "DM+Sans:wght@400;500;600;700" },
  { value: "Libre Franklin", label: "Libre Franklin", family: "'Libre Franklin', Arial, sans-serif", google: "Libre+Franklin:wght@400;500;600;700" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", family: "'Cormorant Garamond', Georgia, serif", google: "Cormorant+Garamond:wght@500;600;700" },
  { value: "DM Serif Display", label: "DM Serif Display", family: "'DM Serif Display', Georgia, serif", google: "DM+Serif+Display" },
  { value: "Lora", label: "Lora", family: "'Lora', Georgia, serif", google: "Lora:wght@500;600;700" },
  { value: "Playfair Display", label: "Playfair Display", family: "'Playfair Display', Georgia, serif", google: "Playfair+Display:wght@500;600;700" },
  { value: "System Sans", label: "System Sans", family: "Arial, Helvetica, sans-serif", google: null },
  { value: "System Serif", label: "System Serif", family: "Georgia, 'Times New Roman', serif", google: null }
] as const;

export type FontName = (typeof fontOptions)[number]["value"];

export function getFontOption(value: string) {
  return fontOptions.find((font) => font.value === value) ?? fontOptions[0];
}

export function getGoogleFontsUrl(fontNames: string[]) {
  const families = [...new Set(fontNames)]
    .map(getFontOption)
    .filter((font) => font.google)
    .map((font) => `family=${font.google}`);
  return families.length ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}

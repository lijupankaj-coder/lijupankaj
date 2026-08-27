export function publicUrl(path: string, requestUrl: string | URL) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  const fallback = new URL(requestUrl);
  let origin = fallback.origin;

  if (process.env.SITE_URL) {
    try {
      origin = new URL(process.env.SITE_URL).origin;
    } catch {
      // Environment validation reports invalid configuration elsewhere.
    }
  }

  return new URL(safePath, `${origin}/`);
}

import "server-only";
import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sanitizeHtml from "sanitize-html";
import sharp from "sharp";

const rasterTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const supportedTypes = new Set([...rasterTypes, "image/svg+xml", "application/pdf"]);

function safeFileName(name: string, mimeType: string) {
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/svg+xml": "svg", "application/pdf": "pdf" }[mimeType];
  const base = name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 100) || "media";
  return `${base}.${extension}`;
}

function sanitizeSvg(buffer: Buffer) {
  const source = buffer.toString("utf8");
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(source) || /<!doctype|<!entity/i.test(source)) throw new Error("INVALID_SVG");
  const clean = sanitizeHtml(source, {
    allowedTags: ["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "defs", "clipPath", "mask", "linearGradient", "radialGradient", "stop", "title", "desc", "pattern", "use"],
    allowedAttributes: {
      svg: ["xmlns", "viewBox", "width", "height", "role", "aria-label", "preserveAspectRatio", "fill", "stroke"],
      '*': ["id", "class", "d", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry", "points", "transform", "fill", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity", "offset", "stop-color", "stop-opacity", "clip-path", "mask", "font-family", "font-size", "text-anchor", "href"]
    },
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false }
  });
  if (!clean.includes("<svg") || /href\s*=\s*["'](?!#)/i.test(clean) || /url\s*\(\s*["']?(?!#)/i.test(clean)) throw new Error("INVALID_SVG");
  return Buffer.from(clean);
}

export type PreparedUpload = {
  fileName: string; mimeType: string; original: Buffer; hash: string; width: number | null; height: number | null;
  variants: Array<{ key: string; fileName: string; buffer: Buffer; mimeType: string }>;
};

export async function prepareUpload(file: File): Promise<PreparedUpload> {
  const raw = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(raw);
  const looksLikeSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  const mimeType = looksLikeSvg ? "image/svg+xml" : detected?.mime;
  if (!mimeType || !supportedTypes.has(mimeType)) throw new Error("UNSUPPORTED_FILE");
  const original = mimeType === "image/svg+xml" ? sanitizeSvg(raw) : raw;
  const hash = createHash("sha256").update(original).digest("hex");
  const fileName = safeFileName(file.name, mimeType);
  if (!rasterTypes.has(mimeType)) return { fileName, mimeType, original, hash, width: null, height: null, variants: [] };

  const pipeline = sharp(original, { limitInputPixels: 80_000_000, animated: false }).rotate();
  const metadata = await pipeline.metadata();
  if (!metadata.width || !metadata.height) throw new Error("INVALID_IMAGE");
  const sizes = [{ key: "thumb", width: 480 }, { key: "medium", width: 1280 }, { key: "large", width: 2400 }];
  const variants = await Promise.all(sizes.map(async ({ key, width }) => ({
    key, fileName: `${fileName.replace(/\.[^.]+$/, "")}-${key}.webp`, mimeType: "image/webp",
    buffer: await sharp(original, { limitInputPixels: 80_000_000 }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toBuffer()
  })));
  return { fileName, mimeType, original, hash, width: metadata.width, height: metadata.height, variants };
}

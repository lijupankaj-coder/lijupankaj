# Liju Pankaj — Senior Graphic Designer Portfolio

Source for [lijupankaj.com](https://lijupankaj.com), positioning Liju Pankaj as a Senior Graphic Designer specialising in brand, campaign and event design, with AI-assisted creative workflows as an additional capability.

## Experience

The single-page website includes:

- Senior graphic design positioning and professional profile
- UAE-focused employment history
- Eight featured case studies and eleven approved projects in total
- Portfolio filters and accessible native project dialogs
- Grouped design capabilities and verified tools
- A compact AI & Creative Innovation section
- Education, languages and direct contact details
- A downloadable two-page resume

## Technology

The deployment remains a lightweight static GitHub Pages site with no runtime dependencies or compilation step.

- `index.html` — semantic content, metadata, Open Graph tags and Person structured data
- `projects.js` — approved project content and image metadata
- `script.js` — filters, project dialogs, navigation and focus management
- `styles.css` — global design tokens, navigation, hero and profile layout
- `portfolio.css` — work, experience, capability, dialog and contact components
- `responsive.css` — tablet and mobile behaviour
- `assets/portfolio/` — 33 selected AVIF project visuals
- `assets/documents/` — downloadable resume
- `robots.txt` and `sitemap.xml` — search discovery
- `CNAME` — existing `lijupankaj.com` custom-domain configuration

All source files remain below 500 lines.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Content and asset notes

- All eleven case studies use supplied project-archive files; no placeholder or generated campaign artwork is used.
- Each project has three selected visuals with intrinsic dimensions and descriptive alternative text.
- Editable artwork, working files, client instructions and internal account material are not published.
- The contact action uses direct email and telephone links; there is no form endpoint or exposed API key.
- The supplied resume portrait is 307 × 283 pixels. For a future photography upgrade, replace it with a professionally retouched portrait at least 1200 × 1500 pixels while keeping the same filenames.
- The LEAP case study range follows the supplied project record. The selected installed-event photographs currently shown are from 2023; later approved show photography can be added through `projects.js` when available.

## Deployment

GitHub Pages serves the repository root. The existing `CNAME` and domain configuration are preserved.

1. Review the local preview and `design-qa.md`.
2. Commit the approved changes to the configured publishing branch.
3. Push to GitHub.
4. Confirm the Pages deployment and test `https://lijupankaj.com/`, the resume download and one project dialog.

No build command or server-side environment variables are required.

## Recovery

The pre-redesign revision is preserved on `safety/pre-resume-portfolio-2026-08-26`.

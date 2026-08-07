# Design and Release QA

## Recovery checkpoint

- Safety branch: `safety/today-content-2026-08-07`
- Protected commit: `e6d6597`

## Revert scope

- Design baseline restored from Git commit: `41919e1`
- Restored design files: `styles.css`, `portfolio.css`, and `responsive.css`
- Today’s biography, headings, project copy, contact details, SEO title and description, Open Graph metadata, Twitter metadata, canonical URL, and Person structured data remain current.
- Small post-restore adjustments are limited to fitting today’s three capability groups, styling today’s added copy, improving small-text contrast, and preventing the mobile hero name and theme label from clipping.

## Browser evidence

- Desktop: `/Users/lijupankaj/LLM-Apps/lijupankaj/screenshots/portfolio-1440.png`
- Tablet: `/Users/lijupankaj/LLM-Apps/lijupankaj/screenshots/portfolio-1024.png`
- Mobile: `/Users/lijupankaj/LLM-Apps/lijupankaj/screenshots/portfolio-390.png`
- Dark theme: `/Users/lijupankaj/LLM-Apps/lijupankaj/screenshots/portfolio-dark-1440.png`

## Automated results

- HTML validation: passed
- JavaScript syntax: passed
- Navigation links: 4/4
- Case studies: 4/4
- Today’s hero and metadata copy: passed
- Light, dark, and system themes: passed
- Mobile menu open and Escape-close behavior: passed
- Email and WhatsApp links: passed
- Project images: 4/4 loaded
- Axe accessibility scan: zero violations
- Browser console errors: zero
- Browser page errors: zero
- Desktop horizontal overflow: zero
- Mobile horizontal overflow: zero

## Visual review

- Desktop preserves the earlier grid, gradient/orb hero, rounded panels, case-study cards, timeline, and process-card language.
- Mobile typography and navigation were checked at 390 × 844. The hero name and theme selector fit without clipping.
- Today’s longer copy wraps cleanly inside the restored components.

final result: passed

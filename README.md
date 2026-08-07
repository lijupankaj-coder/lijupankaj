# Liju Pankaj — Personal Portfolio

Personal portfolio for Liju Pankaj, a UAE-based Creative Technologist and Digital Product Builder with more than 20 years of experience across design, production, digital products, and business workflows.

## Website structure

- About
- Digital Products & Workflow Solutions
- Work
- Experience
- How I Work

Each main section occupies the full viewport and uses vertical scroll snapping. Selected work is presented in a horizontal, keyboard-accessible project slider focused on Liju's role, methods, and results. Unconfirmed dates are not invented.

## Technology

The site is a lightweight static build using semantic HTML, modern CSS, and small progressive-enhancement JavaScript. It has no runtime dependencies or build step.

- `index.html` — content, metadata, Open Graph tags, and Person structured data
- `styles.css` — design tokens, global layout, header, hero, and shared components
- `portfolio.css` — portfolio, capabilities, experience, and process sections
- `responsive.css` — tablet and mobile behavior
- `script.js` — navigation, theme persistence, section activity, project-slider controls, and reveal effects
- `assets/` — project visuals, favicon, and social preview
- `robots.txt` and `sitemap.xml` — search-engine discovery
- `CNAME` — GitHub Pages custom domain

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages serves the repository root on `lijupankaj.com`. Push changes to the configured publishing branch; no compilation step is required.

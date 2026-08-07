# Liju Pankaj — Personal Portfolio

Personal portfolio for Liju Pankaj, a UAE-based Senior Graphic Designer and AI-Assisted Product Builder with more than 20 years of professional experience.

## Website structure

- Home
- About Me
- Expertise
- Selected Work
- Experience
- My Approach
- Contact

Selected work is presented as personal case studies focused on Liju's skills, methods, and results.

## Technology

The site is a lightweight static build using semantic HTML, modern CSS, and small progressive-enhancement JavaScript. It has no runtime dependencies and no build step.

- `index.html` — content, metadata, Open Graph tags, and Person structured data
- `styles.css` — design tokens, global layout, header, hero, and shared components
- `portfolio.css` — portfolio sections, case studies, experience, approach, and contact
- `responsive.css` — tablet/mobile behavior and reduced-motion support
- `script.js` — navigation, theme persistence, subtle reveal effects, and email-form handling
- `assets/` — retained and adapted abstract portfolio visuals, favicon, and social preview
- `robots.txt` and `sitemap.xml` — search-engine discovery
- `CNAME` — GitHub Pages custom domain

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages serves the repository root on `lijupankaj.com`. Push changes to the configured publishing branch; no compilation step is required.

## Contact

- Email: lijupankaj@gmail.com
- Location: United Arab Emirates

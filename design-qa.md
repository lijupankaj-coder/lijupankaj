# Design and Release QA — 26 August 2026

## Recovery checkpoint

- Safety branch: `safety/pre-resume-portfolio-2026-08-26`
- Protected pre-redesign commit: `9fff3c0`
- Existing GitHub Pages root deployment and `CNAME` preserved

## Implemented experience

- Editorial single-page layout with restrained neutral colour, one controlled accent and no theme dependency
- Sticky desktop navigation and keyboard-accessible mobile menu
- Eight featured projects, eleven approved projects in total and category filtering
- Native project dialogs with three real visuals, contribution wording and selected deliverables
- Focus restoration after dialogs close and visible global focus treatment
- Responsive layouts at desktop, tablet and mobile sizes
- Reduced-motion support and no auto-playing media
- Fixed image dimensions, lazy loading below the fold and AVIF portfolio assets
- Resume download, metadata, Open Graph image, Person structured data, sitemap and robots configuration
- Six private internal-application case studies, with four shown initially and two behind an accessible disclosure control
- Repeated private-access labels, secure external-link behavior and a clear login/access-denied expectation

## Included projects

1. LEAP — Informa
2. Black Hat MEA — Informa
3. World Police Summit — Informa
4. Messe Frankfurt Middle East
5. Emaar / Address Hotels & Resorts
6. Emirates NBD — Wealth & Private Banking
7. Emirates NBD — Retail Campaigns
8. Emirates Islamic Bank
9. Rove Hotels
10. Caesars Palace Dubai
11. Marriott Resort Palm Jumeirah

The requested blocked-project scan is clean across public HTML, CSS, JavaScript, documentation and generated assets.

## Browser evidence

- Desktop hero: `screenshots/portfolio-1440.png`
- Desktop selected work: `screenshots/portfolio-work-1440.png`
- Tablet selected work: `screenshots/portfolio-1024.png`
- Mobile hero: `screenshots/portfolio-390.png`
- Accessible project dialog: `screenshots/portfolio-project-dialog.png`
- Desktop AI innovation section: `screenshots/portfolio-innovation-1440.png`
- Mobile AI innovation section: `screenshots/portfolio-innovation-390.png`

## Verification results

- HTML5 validation: passed with zero errors
- JavaScript syntax: passed
- Project data: 11 projects, 8 featured, 33 images
- Project asset HTTP checks: 33/33 returned `200`
- Missing local source references: zero
- Browser console and runtime errors: zero
- Document horizontal overflow: zero at 1440, 1024 and 390 pixels
- Portfolio filters: All Projects returned 11; Event & Exhibition returned 4
- Project dialog: opened, rendered 3 images and restored trigger focus after close
- Mobile menu: opened, reported expanded state and closed successfully
- Internal tools: 4 initially visible, 6 after expansion, correct `aria-expanded` state and collapse label
- Private links: 6/6 use the approved label, open in a new tab and include `noopener noreferrer`
- Internal application endpoints: all 5 unique URLs resolved successfully, including expected login/access-control redirects
- Privacy scan: no source-document assignees, internal email addresses, credentials or access-request CTA published
- Image alternatives: no missing `alt` text in rendered content
- Accessibility structure: one H1, working skip link, no duplicate IDs, unnamed buttons or empty links
- Sitemap XML: valid
- Resume: two pages, A4, unencrypted and byte-for-byte verified against the supplied source
- Public blocked-project scan: clean
- Source-file limit: every HTML, CSS and JavaScript file is below 500 lines
- Git whitespace check: passed

## Asset coverage

All selected project groups have usable real artwork. There are no blocking portfolio-image gaps for this release. The only recommended future upgrade is a higher-resolution professional portrait; later LEAP show photography can also refresh the current 2023 installed-event selection.

Final result: ready for deployment review.

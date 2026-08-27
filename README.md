# Liju Pankaj — Portfolio CMS

Full-stack professional portfolio for Liju Pankaj, Senior Graphic Designer. The public site is driven by an atomic published snapshot; all draft content, project media and administrative operations stay behind Supabase Auth, PostgreSQL Row Level Security and server-side authorization.

Last updated: 27 August 2026 (Asia/Dubai)

The full-stack release is live at [lijupankaj.com](https://lijupankaj.com/) and deployed through Coolify from `cms-preview`. Hostinger DNS now sends the production domain to the Coolify ingress service. The previous GitHub Pages release and `safety/pre-cms-2026-08-26` branch remain available only as rollback checkpoints.

## What is included

- Premium responsive single-page portfolio and accessible project case-study dialogs
- Nine published project case studies with verified, project-specific media
- Four approved project records retained as private drafts until matching public-safe artwork is ready
- Neutral “Image coming soon” state when a project has no assigned media
- Structured editors for hero, profile, experience, capabilities, innovation, education, languages, contact, navigation, footer and files
- Portfolio/category CRUD, duplication, draft/publish state, feature flag and drag ordering
- Private media library with magic-byte validation, sanitized SVG, size limits, SHA-256 duplicate prevention and WebP variants
- Project-specific image assignment, cover selection, captions, alt text, focal points, ordering, replacement and safe deletion checks
- Curated theme tokens, responsive size limits, selected-font loading, live preview, draft save and confirmed reset
- Administrator-only login, logout and password recovery; public registration is disabled
- Atomic publication history, public read-only snapshot and persistent last-published file fallback
- Section reveal and restrained parallax motion with `prefers-reduced-motion` support
- Header reading-progress indicator, SEO metadata, structured data, sitemap and robots configuration
- Multi-stage non-root Docker image, automatic migrations and health endpoint

## Stack

- Next.js 16 / React 19 / TypeScript
- Supabase Auth, PostgreSQL and private Storage
- Zod, Sharp, file-type and sanitize-html
- Docker standalone deployment on the private application VM, managed by Coolify
- Hetzner ingress bridge for public HTTPS routing to the private application network

## Local setup

Requirements: Node 22+, Docker Desktop and Supabase CLI.

```bash
npm ci
supabase start
cp .env.example .env.local
npm run migrate
npm run admin:provision
npm run dev
```

Use the local URL and keys printed by `supabase status -o env` in `.env.local`. The local ports are defined in `supabase/config.toml`; the app runs at `http://127.0.0.1:3100`.

The provisioner creates or approves only `CMS_ADMIN_EMAIL` and never prints its random bootstrap password. Open `/admin/forgot-password` to set the password through email recovery.

## Verification

```bash
npm run lint
npm run typecheck
npm test
supabase test db
npm run build
docker build -t liju-portfolio-cms:preview .
```

## Deployment and operations

- [Deployment and DNS](docs/DEPLOYMENT.md)
- [Administrator guide](docs/ADMIN-GUIDE.md)
- [Backups, restore and rollback](docs/OPERATIONS.md)
- [Portfolio asset checklist](docs/ASSET-CHECKLIST.md)
- [Published portfolio and innovation register](portfolio_shortlist.md)

Production health is available at `GET https://lijupankaj.com/api/health`. Keep the safety branch, old Pages configuration and pre-cutover DNS values documented until a rollback is no longer operationally useful.

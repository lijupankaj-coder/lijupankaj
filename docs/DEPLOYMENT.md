# Coolify preview and production deployment

## Current production state

The full-stack application is deployed from `cms-preview` through the Coolify GitHub App. Next.js and the dedicated self-hosted Supabase stack run on the private application VM; a lightweight Coolify edge bridge on the Hetzner ingress VPS terminates HTTPS and forwards traffic over Tailscale. The preview site, administrator login, published media and production host routing have passed direct tests.

The authoritative DNS provider is Hostinger (`helios.dns-parking.com` and `aster.dns-parking.com`), not Cloudflare. Until the DNS cutover is completed, the apex remains on GitHub Pages. The `safety/pre-cms-2026-08-26` branch and the old Pages configuration are retained as rollback.

## 1. Create the production Supabase project

No suitable active Supabase project was found for this portfolio, so create a dedicated project. Do not reuse unrelated application databases.

1. Create a Supabase project in the nearest suitable region and record its project URL, publishable key, new-format secret key and database password.
2. Authentication → Providers: enable Email.
3. Authentication settings: disable new-user registration. Keep the Email provider enabled so the approved existing account can sign in.
4. Configure custom SMTP before relying on invitation or recovery email.
5. Set Site URL to the preview URL initially. Add preview and production `/auth/callback` URLs to the redirect allow-list.
6. Use the direct PostgreSQL URL, or the session-mode pooler URL, for `DATABASE_URL`. Do not use a transaction-mode pooler for schema migrations.
7. Keep `cms-media` private. The migration creates or corrects this bucket and its policies.

The container runs every unapplied SQL file in `supabase/migrations` at startup under an advisory lock. A checksum change to an applied migration fails deployment rather than silently drifting. Supabase CLI-applied migrations are safely adopted into the app migration ledger.

## 2. Push the preview branch

Keep GitHub as source control. Push `cms-preview` only after local tests pass. Do not merge into `main` yet. The safety branch `safety/pre-cms-2026-08-26` preserves the previous static release.

## 3. Create the Coolify application

1. In Coolify, create a new application in a staging/preview environment.
2. Source: GitHub repository `lijupankaj-developer/lijupankaj`, branch `cms-preview`.
3. Build pack: Dockerfile; Dockerfile location: `/Dockerfile`.
4. Exposed port: `3000`; health check: `/api/health`; expected status: 200.
5. Add a persistent volume mounted at `/app/data`. This stores the last valid published snapshot across redeployments.
6. Enable automatic restart unless manually stopped.
7. Use a generated Coolify domain first, or a staging hostname such as `portfolio-preview.lijupankaj.com` that does not affect the apex.
8. Connect the repository through the Coolify GitHub App so pushes to `cms-preview` trigger rebuilds. Protect production from branch changes until cutover approval.

## Required environment variables

| Variable | Scope | Example / purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + runtime | `https://PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build + runtime | Supabase publishable key; safe for browser use because RLS is mandatory |
| `SUPABASE_SECRET_KEY` | Runtime secret | New-format server secret; never prefix with `NEXT_PUBLIC_` |
| `SUPABASE_INTERNAL_URL` | Runtime | Private Docker-network Kong URL used by server-side requests |
| `DATABASE_URL` | Runtime secret | Direct/session PostgreSQL connection used only by startup migrations |
| `DATABASE_SSL` | Runtime | `require` in hosted production |
| `CMS_ADMIN_EMAIL` | Runtime | The single approved administrator email |
| `SITE_URL` | Runtime | Exact preview origin, later `https://lijupankaj.com` |
| `MEDIA_BUCKET` | Runtime | `cms-media` |
| `CMS_SNAPSHOT_PATH` | Runtime | `/app/data/published-content.json` |
| `UPLOAD_MAX_IMAGE_MB` | Runtime | `12` |
| `UPLOAD_MAX_PDF_MB` | Runtime | `10` |
| `PORT` | Runtime | `3000` |
| `HOSTNAME` | Runtime | `0.0.0.0` |

Never set `SKIP_MIGRATIONS=true` in production. Never commit `.env.local`, service secrets, database URLs or SMTP credentials.

## 4. Provision and verify the administrator

After the first healthy deployment, run `npm run admin:provision` once in a secure job/container with the same environment. Then use `/admin/forgot-password` to set the private password. Full usage is in [ADMIN-GUIDE.md](ADMIN-GUIDE.md).

## 5. Preview acceptance gate

Do not proceed to DNS until all items pass on the Coolify preview domain:

- SSL is valid and HTTP redirects to HTTPS.
- `/api/health` stays healthy through a container restart.
- Public mobile, tablet and desktop layouts are visually reviewed.
- `/admin` redirects when signed out; approved login and logout work.
- A project can be created, edited, duplicated, reordered and deleted.
- Upload, duplicate prevention, assignment, replacement, cover, focal point and removal work.
- Draft content and theme changes remain invisible until Publish Changes.
- Publish updates the public site promptly; Unpublished removes a project on the next publish.
- Theme save, reset confirmation and publication work.
- Profile and resume files work.
- Unauthorized REST requests cannot read drafts or write content.
- The app and published fallback survive redeployment with the `/app/data` volume intact.
- Supabase database and Storage data remain intact after a Coolify redeploy.
- Security headers are present and no secret appears in browser bundles or logs.
- Backups and a restore rehearsal have completed.

The in-app browser was unavailable during local verification, so this external visual/click-through gate is mandatory.

## 6. Production cutover

Liju explicitly approved production deployment. The Coolify applications are already configured for `lijupankaj.com`, `www.lijupankaj.com`, and `supabase.lijupankaj.com`; production environment variables and Auth callbacks are applied.

In Hostinger DNS:

1. Preserve all MX, TXT, CAA and unrelated records.
2. Replace the four GitHub Pages apex A records with one `@` A record pointing to the Coolify Hetzner ingress address from the private server inventory.
3. Change `www` from `lijupankaj.github.io` to CNAME `lijupankaj.com`.
4. Add a `supabase` A record pointing to the same Coolify ingress address.
5. Use TTL 300 during cutover. Hostinger automatically creates DNS snapshots; record the newest snapshot ID before writing.
6. Verify authoritative DNS, HTTP-to-HTTPS redirects, valid Let’s Encrypt certificates, `/api/health`, the homepage, `/admin`, login/logout, publish, and media downloads.
7. Run the five-minute uptime check during the observation period. Disable GitHub Pages only after the Coolify site remains stable; there is no Pages workflow file to remove.
8. Keep the safety branch and old DNS values indefinitely as a rollback checkpoint.

## Rollback during cutover

If the Coolify release is unhealthy, restore the latest pre-cutover Hostinger DNS snapshot or restore the four GitHub Pages apex A records and `www` CNAME `lijupankaj.github.io`. Retain/re-enable GitHub Pages and its `CNAME`. DNS rollback does not require deleting the Coolify app or Supabase service. Restore content or media separately only if data was damaged; see [OPERATIONS.md](OPERATIONS.md).

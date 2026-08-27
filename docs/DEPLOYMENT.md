# Coolify production deployment

Last updated: 27 August 2026 (Asia/Dubai)

## Current production state

The full-stack application is live at `https://lijupankaj.com` and deployed from `cms-preview` through the Coolify GitHub App. Next.js and the dedicated self-hosted Supabase stack run on the private application VM; a lightweight Coolify edge bridge on the Hetzner ingress VPS terminates HTTPS and forwards traffic over Tailscale. The public portfolio, administrator login, publishing, private media delivery and production host routing have passed production tests.

The authoritative DNS provider is Hostinger (`helios.dns-parking.com` and `aster.dns-parking.com`), not Cloudflare. The production apex and `www` now route to Coolify rather than GitHub Pages. The `safety/pre-cms-2026-08-26` branch, old Pages configuration and pre-cutover DNS values are retained as rollback references.

## 1. Production data service

The portfolio uses its own self-hosted Supabase service. Do not reuse an unrelated application database or Storage bucket.

1. Keep Email authentication enabled and public registration disabled.
2. Keep custom SMTP working for password recovery.
3. Keep `https://lijupankaj.com` as the Auth Site URL and production `/auth/callback` in the redirect allow-list. Retain the preview callback only while the preview route is in use.
4. Use the private direct PostgreSQL connection for startup migrations. Do not use a transaction-mode pooler for schema migrations.
5. Keep `cms-media` private. Public artwork is delivered only through the application media route after it is included in a published snapshot.
6. Keep database, Auth and Storage volumes persistent across application redeployments.

The container runs every unapplied SQL file in `supabase/migrations` at startup under an advisory lock. A checksum change to an applied migration fails deployment rather than silently drifting. Supabase CLI-applied migrations are safely adopted into the app migration ledger.

## 2. Source and release branch

GitHub remains the source-code repository. Production currently tracks `cms-preview`; push only after local verification. The safety branch `safety/pre-cms-2026-08-26` preserves the previous static release.

## 3. Coolify application configuration

1. Source the application through the Coolify GitHub App.
2. Source: GitHub repository `lijupankaj-developer/lijupankaj`, branch `cms-preview`.
3. Build pack: Dockerfile; Dockerfile location: `/Dockerfile`.
4. Exposed port: `3000`; health check: `/api/health`; expected status: 200.
5. Add a persistent volume mounted at `/app/data`. This stores the last valid published snapshot across redeployments.
6. Enable automatic restart unless manually stopped.
7. Keep a generated Coolify preview domain available for release checks that must not affect the apex.
8. Keep webhook-based automatic deployment enabled for `cms-preview`, and review the health check before considering a deployment complete.

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

## 5. Release acceptance gate

Run these checks on a preview route before a material application, schema, Auth or Storage change reaches production:

- SSL is valid and HTTP redirects to HTTPS.
- `/api/health` stays healthy through a container restart.
- Public mobile, tablet and desktop layouts are visually reviewed.
- `/admin` redirects when signed out; approved login and logout work.
- A project can be created, edited, duplicated, reordered and deleted.
- Upload, duplicate prevention, assignment, replacement, cover, focal point and removal work.
- Draft content and theme changes remain invisible until Publish Changes.
- Publish returns a new revision, `/api/health` reports it, and the public page refreshes to that revision; Unpublished removes a project on the next publish.
- Theme save, reset confirmation and publication work.
- Profile and resume files work.
- Unauthorized REST requests cannot read drafts or write content.
- The app and published fallback survive redeployment with the `/app/data` volume intact.
- Supabase database and Storage data remain intact after a Coolify redeploy.
- Security headers are present and no secret appears in browser bundles or logs.
- Backups and a restore rehearsal have completed.

## 6. Completed production cutover

The production cutover was completed on 27 August 2026. Coolify is configured for `lijupankaj.com`, `www.lijupankaj.com` and `supabase.lijupankaj.com`; production environment variables and Auth callbacks are applied.

Current DNS intent:

1. Preserve all MX, TXT, CAA and unrelated records.
2. Route the apex `@` A record to the Coolify Hetzner ingress address stored in the private server inventory.
3. Route `www` by CNAME to `lijupankaj.com`.
4. Route `supabase` to the same ingress address for the dedicated self-hosted Supabase service.
5. Keep the Google Search Console verification TXT record and unrelated domain-verification records intact.
6. Verify authoritative DNS, HTTP-to-HTTPS redirects, Let’s Encrypt certificates, `/api/health`, the homepage, `/admin`, login/logout, publish and media downloads after every DNS or ingress change.
7. Keep the five-minute uptime check active and retain the safety branch and previous DNS values as rollback checkpoints.

## Rollback during cutover

If the Coolify release is unhealthy, restore the latest pre-cutover Hostinger DNS snapshot or restore the four GitHub Pages apex A records and `www` CNAME `lijupankaj.github.io`. Retain/re-enable GitHub Pages and its `CNAME`. DNS rollback does not require deleting the Coolify app or Supabase service. Restore content or media separately only if data was damaged; see [OPERATIONS.md](OPERATIONS.md).

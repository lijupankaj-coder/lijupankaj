# Coolify preview and production deployment

## Current production state

`lijupankaj.com` remains on GitHub Pages from the repository publishing branch. The repository has no Pages Actions workflow; Pages is configured at repository level. `CNAME` is preserved. Current DNS points the apex to GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and `www` to `lijupankaj.github.io`.

Do not alter those records during preview testing.

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

## 6. Production cutover — confirmation required

Ask Liju for explicit approval after the preview checklist passes.

1. Create a deployment tag or record the final preview commit SHA.
2. Attach `lijupankaj.com` and `www.lijupankaj.com` to the verified Coolify application.
3. In Cloudflare, change the apex from the four GitHub Pages A records to an A record for `<HETZNER_VPS_PUBLIC_IP>` (or the exact Coolify ingress target). Change `www` to CNAME `@`.
4. Use Cloudflare SSL/TLS **Full (strict)**, Always Use HTTPS, TLS 1.2+, and proxy only after the origin certificate is valid. Do not enable cache rules for `/admin*`, `/api/admin*` or `/auth*`.
5. Set `SITE_URL=https://lijupankaj.com`, add the production Auth callback URL in Supabase, redeploy and test both hostnames.
6. Monitor for at least 24 hours before disabling GitHub Pages in repository Settings → Pages. There is no workflow file to remove.
7. Keep the previous static branch and commit indefinitely as a rollback checkpoint.

## Rollback during cutover

If the Coolify release is unhealthy, immediately restore the prior Cloudflare apex A records and `www` CNAME listed above. Re-enable/retain GitHub Pages and its `CNAME`. DNS rollback does not require deleting the Coolify app or Supabase project. Restore content or media separately only if data was damaged; see [OPERATIONS.md](OPERATIONS.md).

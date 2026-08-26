# Portfolio CMS administrator guide

## First administrator setup

1. In Supabase Authentication, enable the Email provider, disable public user sign-ups, enable leaked-password protection if the plan supports it, and configure production SMTP.
2. Set `CMS_ADMIN_EMAIL` to the one approved administrator address in Coolify.
3. From a secure environment containing the production variables, run:

   ```bash
   npm run admin:provision
   ```

   The command creates the account with an undisclosed random bootstrap password when needed and records its user ID in `public.admin_users`. It cannot approve a different email unless `CMS_ADMIN_EMAIL` is deliberately changed.
4. Visit `https://PREVIEW_DOMAIN/admin/forgot-password`, enter the approved email and use the recovery email to choose a password. Use at least 12 characters with upper and lower case, a number and a symbol.
5. Sign in at `/admin`. There is no registration page.

For production recovery, use the same `/admin/forgot-password` flow. Configure the Supabase Site URL and redirect allow-list for both the preview and final domains:

- `https://PREVIEW_DOMAIN/auth/callback`
- `https://lijupankaj.com/auth/callback`

If SMTP delivery is temporarily unavailable, use the application terminal in Coolify and run `npm run admin:reset-password`. It prompts twice without displaying the password, verifies the configured email and `admin_users` allow-list entry, and changes only that approved account. The command never prints the password. Do not put a password directly in a shared shell command or deployment log.

## Publishing model

- Every content, project and style edit is a private draft.
- A project must be marked **Published** to enter the next public snapshot.
- Clicking **Publish Changes** atomically publishes all current content, theme settings, active categories and projects marked Published.
- Draft and Unpublished projects are never included in the public snapshot.
- The public site does not query draft tables.
- A persistent `/app/data/published-content.json` file keeps the last valid publication available if the CMS database is temporarily unavailable.

## Portfolio workflow

1. Open **Portfolio** and choose an approved project or create a new one.
2. Edit client, year, category, overview, role, contribution and deliverables.
3. Keep the record as **Draft** while preparing it.
4. Upload only verified project artwork through **Media Library**. Supported files are JPG, PNG, WebP, AVIF, sanitized SVG and PDF.
5. Return to the project and explicitly assign the correct image. Unassigned media can never appear for that project.
6. Set the cover, caption, alt text and focal point. Drag cards to reorder images or projects.
7. Review the draft card. With no assigned image it must show **Image coming soon**.
8. Mark the project **Published**, save the project draft, then use **Publish Changes**.

Replacement uploads create a new immutable media record and reassign the draft project image. The old media stays available until it is no longer referenced by draft or published content, preventing a replacement from changing the live site before publication.

## Media safety

- Alternative text is required.
- File contents are detected from their bytes; changing an extension does not bypass validation.
- Raster uploads create thumb, medium and large WebP variants.
- Duplicate binaries are rejected by SHA-256 hash.
- SVG scripts, external references, event handlers and unsupported elements are rejected or removed.
- A file cannot be deleted while assigned to a project, profile, resume or published snapshot.
- Portfolio artwork must not contain editable source files, client instructions, financial data, credentials or confidential screens.

## Website content and style

**Website Content** contains structured fields for all public copy, navigation labels, section visibility, employment history, capability groups, internal applications, education, languages, contact, profile photo and resume.

**Website Style** exposes only curated fonts and bounded tokens. The live preview is local to the draft editor. Use **Save Draft**, then **Publish Changes**. **Reset to Default Theme** requires confirmation and remains a draft until published.

## Sign-out and account security

- Sign out from the lower-left account control when using a shared device.
- Never share a Supabase secret key or database password.
- Do not create extra Supabase users. An Auth user also needs a matching `admin_users` approval row and the configured email to pass server authorization.
- Review `public.audit_log` in Supabase for content-change timestamps and actor IDs.

# Operations, backup and recovery

## Monitoring and restart policy

- Coolify health endpoint: `GET /api/health`, interval 30 seconds, timeout 5 seconds, three failures before unhealthy.
- Keep automatic restart enabled unless stopped manually.
- The Hetzner ingress host runs `ops/check-production-health.sh` every five minutes against `/api/health`, the public homepage and Supabase Auth. Failures are written to the dedicated monitor log. Add an email or private-message alert transport when credentials are available.
- Monitor Coolify container logs and Supabase Auth, Postgres and Storage logs. Application errors contain no credentials or uploaded file contents.
- The health endpoint deliberately remains healthy when it can serve the last published snapshot; database outages should be separately monitored through Supabase alerts.

## Backup policy

Use two independent layers:

1. The self-hosted stack runs `ops/backup-self-hosted.sh` daily on the application VM. It creates a PostgreSQL custom-format dump and a matching archive of the private Storage volume.
2. Each daily set is copied to the separate ingress VPS. Local and remote copies use a 30-day rolling retention policy. Add a third encrypted offsite destination when available.

Retention target:

- 30 daily encrypted backups;
- 8 weekly backups;
- at least one copy outside the Hetzner VPS and outside the primary Supabase project.

Never store database passwords, S3 secret keys or backup encryption keys in the repository. Use Coolify secrets and an encrypted offsite backup provider with lifecycle rules.

## Self-hosted production backup job

The production host installs the repository script at `/usr/local/sbin/backup-lijupankaj-cms` and loads its protected settings from `/etc/lijupankaj-backup.env`. Root cron runs it daily. The settings file contains the Supabase service UUID, local destination, retention, dedicated SSH key and remote backup target; it must remain mode `0600` and must not be committed.

Run an on-demand verification with:

```bash
sudo env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  sh -c '. /etc/lijupankaj-backup.env && /usr/local/sbin/backup-lijupankaj-cms'
```

Verify the newest set with `sha256sum -c SHA256SUMS`. The separate VPS runs its own retention task inside the dedicated portfolio backup account.

## Managed Supabase alternative

The job image needs PostgreSQL client tools and optionally `rclone`. Mount a backup volume at `/backups`, then schedule daily:

```bash
BACKUP_DATABASE_URL='postgresql://...' \
BACKUP_ROOT=/backups/postgres \
BACKUP_RETENTION_DAYS=30 \
BACKUP_REMOTE='offsite:liju-portfolio/postgres' \
./ops/backup-postgres.sh
```

`backup-postgres.sh` creates a custom-format dump plus SHA-256 checksum, applies local retention only inside the validated backup directory, and copies to the configured offsite remote when provided.

## Uploaded-media backup job

Enable the Supabase S3-compatible API and configure two private `rclone` remotes outside the repository: one for the Supabase project and one for offsite backup. Schedule daily:

```bash
STORAGE_SOURCE='supabase:cms-media' \
STORAGE_DESTINATION='offsite:liju-portfolio/media' \
./ops/backup-storage.sh
```

The script uses versioned date folders and `copy`, not destructive synchronization. Apply the 30-day/8-week lifecycle policy at the offsite provider.

## Database restore rehearsal

Always restore into a new Supabase staging project first.

1. Download the chosen `.dump` and `.sha256` files.
2. Verify `sha256sum -c FILE.sha256` (or `shasum -a 256 -c` on macOS).
3. Create an empty staging Supabase project at a compatible PostgreSQL major version.
4. Restore with `pg_restore --no-owner --no-privileges --clean --if-exists --dbname=STAGING_DATABASE_URL FILE.dump`.
5. Redeploy the preview app against staging and run RLS, login, publish and upload tests.
6. Only after validation, schedule a production maintenance window and repeat against the production database if required.

`--clean` is destructive to the target database; never run it against production without a verified backup, maintenance approval and the exact target URL.

## Storage restore rehearsal

Restore to a new private staging bucket first:

```bash
rclone copy 'offsite:liju-portfolio/media/DATE' 'supabase-staging:cms-media' --checksum --immutable
```

Verify object counts, hashes, private bucket access and published media through the application proxy before copying to production. Database media metadata and Storage objects must be restored from matching backup dates.

## Published snapshot and application rollback

- `/app/data/published-content.json` is a cache/fallback, not the primary backup. It is recreated from `public.published_site` after a successful request or publish.
- For an application regression, redeploy the previously verified Coolify image/commit without changing the database.
- For a content publication error, select the prior snapshot from `public.publication_history` in a maintenance transaction and publish it through a reviewed admin recovery procedure; retain the erroneous revision for audit.
- For a DNS-level failure, restore the GitHub Pages records documented in [DEPLOYMENT.md](DEPLOYMENT.md).

Record the restore date, operator, backup identifiers, object counts, database revision and validation results after every rehearsal or real recovery.

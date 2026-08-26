#!/bin/sh
set -eu

: "${BACKUP_DATABASE_URL:?Set BACKUP_DATABASE_URL}"
backup_root=${BACKUP_ROOT:-/backups/postgres}
retention_days=${BACKUP_RETENTION_DAYS:-30}

case "$backup_root" in
  /backups/*) ;;
  *) echo "BACKUP_ROOT must be a dedicated path below /backups" >&2; exit 1 ;;
esac
case "$retention_days" in *[!0-9]*|'') echo "BACKUP_RETENTION_DAYS must be numeric" >&2; exit 1 ;; esac

umask 077
mkdir -p "$backup_root"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
dump_file="$backup_root/liju-portfolio-$timestamp.dump"

pg_dump --dbname="$BACKUP_DATABASE_URL" --format=custom --compress=9 --no-owner --no-privileges --file="$dump_file"
sha256sum "$dump_file" > "$dump_file.sha256"

if [ -n "${BACKUP_REMOTE:-}" ]; then
  rclone copy "$dump_file" "$BACKUP_REMOTE" --checksum
  rclone copy "$dump_file.sha256" "$BACKUP_REMOTE" --checksum
fi

find "$backup_root" -type f -name 'liju-portfolio-*.dump' -mtime "+$retention_days" -delete
find "$backup_root" -type f -name 'liju-portfolio-*.dump.sha256' -mtime "+$retention_days" -delete
echo "Database backup completed: $dump_file"

#!/bin/sh
set -eu

: "${SUPABASE_SERVICE_UUID:?Set SUPABASE_SERVICE_UUID}"

backup_root=${BACKUP_ROOT:-/data/portfolio-backups}
retention_days=${BACKUP_RETENTION_DAYS:-30}
remote_target=${BACKUP_REMOTE_TARGET:-}
remote_key=${BACKUP_REMOTE_KEY:-}
database_container="supabase-db-$SUPABASE_SERVICE_UUID"
storage_source="/data/coolify/services/$SUPABASE_SERVICE_UUID/volumes/storage"

case "$backup_root" in
  /data/portfolio-backups|/data/portfolio-backups/*) ;;
  *) echo "BACKUP_ROOT must be /data/portfolio-backups or a child path" >&2; exit 1 ;;
esac
case "$SUPABASE_SERVICE_UUID" in
  *[!a-z0-9]*|'') echo "SUPABASE_SERVICE_UUID is invalid" >&2; exit 1 ;;
esac
case "$retention_days" in
  *[!0-9]*|'') echo "BACKUP_RETENTION_DAYS must be numeric" >&2; exit 1 ;;
esac

docker inspect "$database_container" >/dev/null
[ -d "$storage_source" ] || { echo "Storage source was not found" >&2; exit 1; }

umask 077
mkdir -p "$backup_root"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
work_dir="$backup_root/.incomplete-$timestamp"
final_dir="$backup_root/$timestamp"
mkdir "$work_dir"

cleanup() {
  if [ -d "$work_dir" ]; then
    find "$work_dir" -type f -delete
    rmdir "$work_dir" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

docker exec "$database_container" pg_dump \
  --username=postgres \
  --dbname=postgres \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges > "$work_dir/postgres.dump"

tar -C "$storage_source" -czf "$work_dir/cms-media.tar.gz" .
(cd "$work_dir" && sha256sum postgres.dump cms-media.tar.gz > SHA256SUMS)
mv "$work_dir" "$final_dir"
trap - EXIT INT TERM

if [ -n "$remote_target" ]; then
  [ -n "$remote_key" ] || { echo "BACKUP_REMOTE_KEY is required with BACKUP_REMOTE_TARGET" >&2; exit 1; }
  scp -q -i "$remote_key" -r "$final_dir" "$remote_target/"
fi

find "$backup_root" -mindepth 1 -maxdepth 1 -type d -name '20??????T??????Z' -mtime "+$retention_days" -print |
  while IFS= read -r expired_dir; do
    case "$expired_dir" in
      "$backup_root"/20??????T??????Z) find "$expired_dir" -depth -delete ;;
    esac
  done
echo "Self-hosted CMS backup completed: $final_dir"

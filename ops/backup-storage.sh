#!/bin/sh
set -eu

: "${STORAGE_SOURCE:?Set STORAGE_SOURCE, for example supabase:cms-media}"
: "${STORAGE_DESTINATION:?Set STORAGE_DESTINATION to an encrypted offsite rclone remote}"

case "$STORAGE_DESTINATION" in
  *:*) ;;
  *) echo "STORAGE_DESTINATION must be an rclone remote, not a local path" >&2; exit 1 ;;
esac

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$STORAGE_DESTINATION/$timestamp"
rclone copy "$STORAGE_SOURCE" "$destination" --checksum --immutable --create-empty-src-dirs
echo "Storage backup completed: $destination"

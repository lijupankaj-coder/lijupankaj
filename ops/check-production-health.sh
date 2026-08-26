#!/bin/sh
set -eu

: "${SITE_URL:?Set SITE_URL}"

site_url=${SITE_URL%/}
supabase_url=${SUPABASE_URL:-}
timeout_seconds=${MONITOR_TIMEOUT_SECONDS:-15}

case "$site_url" in https://*) ;; *) echo "SITE_URL must use HTTPS" >&2; exit 1 ;; esac
case "$timeout_seconds" in *[!0-9]*|'') echo "MONITOR_TIMEOUT_SECONDS must be numeric" >&2; exit 1 ;; esac

health=$(curl --fail --silent --show-error --max-time "$timeout_seconds" "$site_url/api/health")
printf '%s' "$health" | grep -q '"status":"ok"'
curl --fail --silent --show-error --max-time "$timeout_seconds" --output /dev/null "$site_url/"

if [ -n "$supabase_url" ]; then
  case "$supabase_url" in https://*) ;; *) echo "SUPABASE_URL must use HTTPS" >&2; exit 1 ;; esac
  curl --fail --silent --show-error --max-time "$timeout_seconds" --output /dev/null "${supabase_url%/}/auth/v1/health"
fi

echo "Portfolio health check passed at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

#!/usr/bin/env bash
# Fetch one user-facing path and print status + content-type.
# Usage: http.sh GET /about [--accept text/markdown] [--out FILE] [--no-follow]
set -euo pipefail

BASE="${VERIFY_BASE_URL:?set VERIFY_BASE_URL}"
method="${1:?usage: http.sh GET /path [--accept TYPE] [--out FILE] [--no-follow]}"
shift
path="${1:?usage: http.sh GET /path [--accept TYPE] [--out FILE] [--no-follow]}"
shift

accept=""
out=""
follow=(-L)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --accept)
      accept="$2"
      shift 2
      ;;
    --out)
      out="$2"
      shift 2
      ;;
    --no-follow)
      follow=()
      shift
      ;;
    *)
      echo "usage: http.sh GET /path [--accept TYPE] [--out FILE] [--no-follow]" >&2
      exit 2
      ;;
  esac
done

args=(-sS "${follow[@]}" -D - -o "${out:-/dev/stdout}" -w '\nhttp_status=%{http_code}\nredirect_url=%{redirect_url}\n' -X "$method")
if [[ -n "$accept" ]]; then
  args+=(-H "Accept: $accept")
fi

curl "${args[@]}" "${BASE}${path}"

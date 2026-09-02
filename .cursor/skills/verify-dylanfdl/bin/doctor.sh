#!/usr/bin/env bash
# Read-only health check for a dylanfdl instance. Exit 0 only if the instance
# is worth driving. Does not start or stop a server.
set -euo pipefail

BASE="${VERIFY_BASE_URL:?set VERIFY_BASE_URL to the instance origin, e.g. http://127.0.0.1:4317}"
HOST="${BASE#*://}"
HOST="${HOST%%/*}"
HOST="${HOST%%:*}"

case "$HOST" in
  127.0.0.1|localhost) ;;
  *)
    if [[ "${VERIFY_ALLOW_REMOTE:-}" != "1" ]]; then
      echo "doctor: refusing remote host $HOST (set VERIFY_ALLOW_REMOTE=1 for live/preview)" >&2
      exit 2
    fi
    ;;
esac

html_headers="$(mktemp)"
html_body="$(mktemp)"
md_headers="$(mktemp)"
md_body="$(mktemp)"
cleanup_tmp() {
  rm -f "$html_headers" "$html_body" "$md_headers" "$md_body"
}
trap cleanup_tmp EXIT

html_code="$(curl -sS -D "$html_headers" -o "$html_body" -w '%{http_code}' "$BASE/")"
if [[ "$html_code" != "200" ]]; then
  echo "doctor: GET $BASE/ returned $html_code" >&2
  exit 1
fi
if ! grep -q 'Dylan Fernandez de Lara' "$html_body"; then
  echo "doctor: HTML home is missing the profile heading" >&2
  exit 1
fi

md_code="$(curl -sS -D "$md_headers" -o "$md_body" -w '%{http_code}' -H 'Accept: text/markdown' "$BASE/")"
if [[ "$md_code" != "200" ]]; then
  echo "doctor: markdown GET $BASE/ returned $md_code" >&2
  exit 1
fi
if ! grep -qi '^content-type: text/markdown' "$md_headers"; then
  echo "doctor: markdown GET $BASE/ did not return Content-Type: text/markdown" >&2
  exit 1
fi
if ! grep -q '^# Dylan Fernandez de Lara' "$md_body"; then
  echo "doctor: markdown home is missing '# Dylan Fernandez de Lara'" >&2
  exit 1
fi

echo "doctor: ok $BASE (html=200, markdown=200, profile heading present)"

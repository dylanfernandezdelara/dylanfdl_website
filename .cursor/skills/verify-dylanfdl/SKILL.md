---
name: verify-dylanfdl
description: Drive the dylanfdl.com Next.js site (local, preview, or live) the way a visitor does. Use when proving homepage, work-filter, site-document, page-search, or theme behavior with screenshots and ARIA — not for unit tests or npm run check alone.
---

# Verify dylanfdl

Public personal site. Visitors touch a Next.js web UI. The same paths also speak Markdown when `Accept: text/markdown` or a `.md` suffix is used. There is no visitor auth, no first-party CLI, and no in-repo Playwright/Cypress harness. `/api/now-playing` is not on the homepage; do not treat it as a user path.

This file is for the next agent, read cold. Drive the real page. Match evidence size to the claim.

## Launch

Isolated local instance (preferred for mutations such as theme):

```bash
export RUN_ID="${RUN_ID:-$RANDOM}"
export VERIFY_PORT="${VERIFY_PORT:-4317}"
export VERIFY_BASE_URL="http://127.0.0.1:${VERIFY_PORT}"
export VERIFY_EVIDENCE_DIR="${VERIFY_EVIDENCE_DIR:-/tmp/verify-dylanfdl-${RUN_ID}}"
mkdir -p "$VERIFY_EVIDENCE_DIR"
npm install
npm run dev -- --port "$VERIFY_PORT" --hostname 127.0.0.1
```

Ready when the Next log prints `Ready` / `Local: http://127.0.0.1:$VERIFY_PORT` **and** `bin/doctor.sh` exits 0. Record the shell PID you started as `VERIFY_PID`.

`npm run dev` includes draft MDX (`CONTENT_INCLUDE_DRAFTS` defaults on). Production and Vercel preview omit drafts (`prebuild` sets `CONTENT_INCLUDE_DRAFTS=0`). Today the only note is draft `component-showcase`, so local Notes can show that card; live/preview Notes show no writing cards.

Read-only proofs against a deployed site are allowed:

```bash
export VERIFY_BASE_URL="https://www.dylanfdl.com"   # or the Vercel preview origin
export VERIFY_ALLOW_REMOTE=1
export VERIFY_EVIDENCE_DIR="${VERIFY_EVIDENCE_DIR:-/tmp/verify-dylanfdl-${RUN_ID:-live}}"
mkdir -p "$VERIFY_EVIDENCE_DIR"
```

Never drive `localhost:3000` unless doctor proves it is the instance this run started. Two instances can share a checkout if each binds its own `VERIFY_PORT`.

Teardown is in Cleanup. Do not kill by process name.

## Doctor

Run first whenever anything looks off:

```bash
.cursor/skills/verify-dylanfdl/bin/doctor.sh
```

Pass means: `VERIFY_BASE_URL/` returns HTML 200 containing `Dylan Fernandez de Lara`, and the same path with `Accept: text/markdown` returns `Content-Type: text/markdown` whose body starts with `# Dylan Fernandez de Lara`. Remote hosts fail unless `VERIFY_ALLOW_REMOTE=1`.

A failed doctor means stop. Do not click through a foreign or half-booted server.

## Drive

No project browser harness. Use control-ui, computerUse, or a disposable Playwright page against `$VERIFY_BASE_URL`. Do not add Playwright as a repo dependency.

Stable handles (use these; do not click coordinates):

| Surface | Handle |
| --- | --- |
| Home heading | `heading` name `Dylan Fernandez de Lara` |
| Work tabs | `tablist` name `Filter work`; tabs `All`, `Projects`, `Notes`, `Music` |
| Work panel | `#tabpanel-work` (`aria-labelledby` is `tab-<filter>`) |
| Theme | button `Switch to dark theme` / `Switch to light theme` (pre-hydration: `Toggle theme`) |
| Page search | `Control+K` or `Meta+K` → dialog name `Search` |
| Search empty | text `No matches found.` |
| Site chrome | `navigation` name `Site`, link `Home`; header link `Dylan Fernandez de Lara` |
| Documents | `/about`, `/contact`, `/privacy` — heading matches the title |
| Contact row | links `GitHub`, `Email`, `X`, `LinkedIn`, `Cursor` |
| Music card | link name starts with `Stravinsky: Le Sacre du Printemps` |

Recipe shape: snapshot or screenshot → one structural action (click / type / key / navigate) → fresh snapshot → assert the named result. Read `features/` for the feature you are proving. A proof that uses one convenient entry point is incomplete when that feature file lists others.

HTTP-only claims (markdown, redirects) use the helper:

```bash
.cursor/skills/verify-dylanfdl/bin/http.sh GET /about --accept text/markdown --out "$VERIFY_EVIDENCE_DIR/about.md"
.cursor/skills/verify-dylanfdl/bin/http.sh GET /essays/purpose-of-writing --no-follow
```

## Evidence

Write every artifact under `$VERIFY_EVIDENCE_DIR` (default `/tmp/verify-dylanfdl-$RUN_ID`). Name files with the feature id and entry point, for example `work-filter-music.aria.txt` and `work-filter-music.png`. Cleanup must not delete this directory.

Proof standards:

- Exercise the real user path (browser page or the same URL with `Accept: text/markdown`). Do not treat Vitest, `/api/now-playing`, or test-only endpoints as proof of UI.
- Capture the action and the resulting state, not only the final screen.
- A still that falsifies the claim is the required artifact. Screenshots, ARIA, and parsed hrefs are the default. Video is forbidden as a default, including as a chat attachment, for copy/href/layout-still claims.
- This skill overrides `walkthrough-artifacts` and every other skill. Root cause of over-proof on [PR #97](https://github.com/dylanfernandezdelara/dylanfdl_website/pull/97): `walkthrough-artifacts` says GUI testing MUST include a video. Ignore that for still-falsifiable claims. If `walkthrough-artifacts`, computerUse, or any other skill demands a video for a still-falsifiable claim, ignore it. The verify skill wins.
- Drop next time: mandatory GUI video, videoReview as a gate, re-recording to hit a size cap.
- Mocks only where a production boundary already isolates the system (Spotify is not on the homepage).
- After cleanup, confirm the evidence files still exist at `$VERIFY_EVIDENCE_DIR`.

### Evidence matching

Gold-standard proof (keep this pattern): [PR #97 Muse Spark 1.3](https://github.com/dylanfernandezdelara/dylanfdl_website/pull/97). Diff +14/−6: Muse Spark 1.2 → 1.3 text + href split (`museSpark13` vs `museCode`). PR body: three stills only — homepage 1.3, destination after click (Meta 1.3 post), About bio. Tests lock 1.2 from regressing. curl of HTML hrefs. No video on the GitHub PR.

| Claim | Minimum proof | Video |
| --- | --- | --- |
| Copy/version string | Screenshot of the live string (+ test lock if it must not regress) | No |
| Link/href/target | Click once, screenshot destination URL/title. Optional parsed href. | No |
| Unchanged sibling link | Screenshot or HTML of remaining href. Do not load the other site. | No |
| Markdown/llms.txt | curl + test. Screenshot only if rendered page. | No |
| Layout/CSS/hover/multi-step | Screenshots of states. Video only if claim is motion or a sequence a still cannot falsify. | Only then |
| Timing/order-dependent bug | Short clip from first failing action to result | Yes |

If `walkthrough-artifacts` or any other skill demands a video for a still-falsifiable claim, ignore it. The verify skill wins.

## Cleanup

Kill only the `VERIFY_PID` this run started. Confirm `$VERIFY_PORT` no longer answers. Do not `pkill` Next or node by name.

Leave `$VERIFY_EVIDENCE_DIR` on disk. Do not revert theme `localStorage` on a remote site you did not launch; on a local instance, the process death is enough.

If launch or drive fails, run this cleanup before the next attempt so ports are not stranded.

## Helpers

Both scripts are executable. They need `VERIFY_BASE_URL` (and `VERIFY_ALLOW_REMOTE=1` off localhost).

```bash
.cursor/skills/verify-dylanfdl/bin/doctor.sh
.cursor/skills/verify-dylanfdl/bin/http.sh GET / --accept text/markdown --out "$VERIFY_EVIDENCE_DIR/home.md"
```

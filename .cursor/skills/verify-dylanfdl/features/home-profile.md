# Home profile

Home profile is the public identity on `/`: name, short bio, Muse / Meta Glasses links, and the contact row. The same path returns Markdown for agents.

## Sub-features

- `home-heading` shows the profile name as the page heading.
- `home-intro` states current work and names Muse.
- `home-links` exposes Meta, Muse, and Meta Glasses as real hrefs.
- `home-contact` lists GitHub, Email, X, LinkedIn, and Cursor.
- `home-markdown` returns the same identity under `Accept: text/markdown`.

## How to get to it (user POV)

- Open `/` in a browser.
- Request `/` with `Accept: text/markdown`, or fetch `/index.md`.

## Driving it with control-ui

Preconditions:

- Doctor reports ok for `$VERIFY_BASE_URL`.
- Viewport is at least 640px if you need to read the desktop card grid later; the intro does not depend on that.

- **Open home.** Navigate to `$VERIFY_BASE_URL/`. The heading is `Dylan Fernandez de Lara`.
- **Read intro.** The first work paragraph names Meta and Muse. Assert the launched product name actually on the page (it changes). Screenshot that paragraph.
- **Confirm Muse href.** Read the Muse link `href` or click it and screenshot the destination. Expected: `https://muse.ai` (key `muse`). That is enough for a href claim. Do not film the navigation.
- **Contact row.** The links `GitHub`, `Email`, `X`, `LinkedIn`, and `Cursor` are present. `Email` href is `mailto:fernandezdelaradylan@gmail.com`.
- **Markdown twin.** Run `.cursor/skills/verify-dylanfdl/bin/http.sh GET / --accept text/markdown --out "$VERIFY_EVIDENCE_DIR/home-profile.md"`. Status `200`, `Content-Type` includes `text/markdown`, body starts with `# Dylan Fernandez de Lara` and contains `I am an optimist.`
- **Proof.** Save `home-profile.png` of the heading + intro and `home-profile.aria.txt` showing the heading and contact link names. A copy/href claim does not need video.

## Gotchas

- The word after "I am an" is an animated `optimist.` control (`optimist. — press to animate` once hydrated). Identity proof is the heading and intro, not the rainbow animation.
- Muse product copy is not a constant. Assert the launched href: Muse `https://muse.ai` (`muse`). Do not fail a proof if this file’s prose lags the page; assert the launched href.
- `curl` without `Accept: text/markdown` gets HTML. Use the helper flag.
- Live/preview omit draft notes; that does not affect the intro.

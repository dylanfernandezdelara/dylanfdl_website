# Site documents

About, Contact, and Privacy are standalone text pages with site chrome back to Home. Each URL has a Markdown twin.

## Sub-features

- `doc-about` serves `/about` with heading `About` and the biography.
- `doc-contact` serves `/contact` with heading `Contact`, the public email, and profile links.
- `doc-privacy` serves `/privacy` with heading `Privacy`.
- `doc-chrome` offers `Home` in `navigation` `Site` and a header link `Dylan Fernandez de Lara`.
- `doc-markdown` returns `# About` / `# Contact` / `# Privacy` for `Accept: text/markdown`.

## How to get to it (user POV)

- Open `/about`, `/contact`, or `/privacy`.
- From a document page, choose `Home` or the name in the header.
- Request the same path with `Accept: text/markdown`, or append `.md` (`/about.md`).

## Driving it with control-ui

Preconditions:

- Doctor reports ok for `$VERIFY_BASE_URL`.

- **About.** Navigate to `/about`. Heading is `About`. The first paragraph names Dylan Fernandez de Lara and current public work. Screenshot the heading + first paragraph.
- **Contact.** Navigate to `/contact`. Heading is `Contact`. Body includes `fernandezdelaradylan@gmail.com`. A `Profiles` list includes GitHub, Email, X, LinkedIn, and Cursor. Confirm Email `href` is `mailto:fernandezdelaradylan@gmail.com`.
- **Privacy.** Navigate to `/privacy`. Heading is `Privacy`. Body states the theme preference stays in localStorage and that visitors are not asked to log into Spotify.
- **Home chrome.** On any document page, `navigation` `Site` has link `Home`. Click `Home` or the header name. The home heading `Dylan Fernandez de Lara` returns. Screenshot home after the click if the claim is "chrome returns you".
- **Markdown twins.** Run `bin/http.sh GET /about --accept text/markdown --out "$VERIFY_EVIDENCE_DIR/about.md"` (repeat for `/contact`, `/privacy`). Each is `200` + `text/markdown` + a `#` heading that matches the page title.
- **Proof.** For a copy change on one document: screenshot the control on that page and, if a link changed, the destination or `href`. For a "pages exist" claim: one screenshot per page heading plus the markdown files. No video.

## Gotchas

- These pages are not linked from the homepage chrome. Type the path or use markdown `## Pages`.
- `/essays/:slug` permanently redirects to `/notes/:slug`, except `/essays/purpose-of-writing` and `/notes/purpose-of-writing` which redirect to `/`. That is not a document page.
- Do not require a now-playing widget on Privacy. The page only discloses the integration.

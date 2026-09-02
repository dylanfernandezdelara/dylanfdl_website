# Page search

Page search finds visible text on the current page. It is not a site-wide index of notes or projects.

## Sub-features

- `search-open` opens a dialog named `Search` from Control+K or Meta+K.
- `search-match` lists snippet results for a query that appears on the page.
- `search-empty` shows `No matches found.` when nothing matches.
- `search-activate` closes the dialog and moves to the chosen snippet.
- `search-close` dismisses the dialog with Escape or a second ⌘/Ctrl+K.

## How to get to it (user POV)

- Press Control+K or Meta+K on `/` (the host is homepage-only today).
- Press Escape or the same hotkey again to close.

## Driving it with control-ui

Preconditions:

- Doctor reports ok for `$VERIFY_BASE_URL`.
- You are on `/` and the intro text is visible (`Yale` is a reliable token).

- **Open.** Press `Control+K` (or `Meta+K`). A dialog named `Search` appears. The first keypress also loads the search chunk; wait for the dialog, not a fixed 50ms.
- **Match.** Type `Yale` into the field inside the dialog (`name=page-search`). A result list appears whose snippets include `Yale`.
- **Empty.** Replace the query with `volcano`. Text `No matches found.` is shown.
- **Close.** Press `Escape`. The `Search` dialog is gone.
- **Proof.** Screenshot the open dialog with either a `Yale` hit or the empty status, and save an ARIA dump that includes dialog `Search` and the result or empty text. Opening and matching is not a multi-screen workflow that needs video.

## Gotchas

- Search is scoped to the current page DOM. A query that only exists on `/about` will empty-state on `/`.
- The palette is code-split. The host listens immediately, but the dialog mounts on idle (up to ~2s) or on the first hotkey. Retry the hotkey once if the first press only loaded the chunk.
- There is no toolbar Search button. Do not look for one.
- Results do not appear until the query length is greater than 0.

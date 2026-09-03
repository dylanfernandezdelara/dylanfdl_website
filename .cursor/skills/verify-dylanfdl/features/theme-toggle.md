# Theme toggle

Theme toggle switches the homepage between light and dark and stores the choice in this browser.

## Sub-features

- `theme-read` exposes a button whose name is `Switch to dark theme` or `Switch to light theme` after hydration.
- `theme-flip` toggles `document.documentElement` class `light` / `dark` and `localStorage.theme`.
- `theme-persist` keeps the stored theme on reload of the same origin.

## How to get to it (user POV)

- Open `/` and choose the sun/moon button at the right of the contact row.

## Driving it with control-ui

Preconditions:

- Doctor reports ok for `$VERIFY_BASE_URL`.
- You are on `/` on an instance this run may mutate (local). Do not use a shared human session.
- Wait until the button name is no longer `Toggle theme`.

- **Read.** Note the button name and whether `document.documentElement` has class `light` or `dark` (`classList`, not raw `className` — font classes are always present). Neither class means the page is following `prefers-color-scheme`.
- **Flip.** Click the button. The accessible name flips (`Switch to dark theme` ↔ `Switch to light theme`). `html` has the matching class. `localStorage.theme` is `dark` or `light`.
- **Persist.** Reload `/`. The same class and button name remain.
- **Proof.** Save `theme-toggle-before.png` and `theme-toggle-after.png` plus a one-line dump of button name, `html` class, and `localStorage.theme` after the click. The name flip + class is the falsifier. Do not film the view transition.

## Gotchas

- Before hydration the name is `Toggle theme` and the icon is an empty spacer. Wait.
- If `theme` is unset, the page follows `prefers-color-scheme`. A flip always writes `localStorage.theme`.
- Reduced motion skips `document.startViewTransition`. That is not a failure.
- Theme is origin-scoped. A local proof does not change live, and a live proof changes only this browser profile.

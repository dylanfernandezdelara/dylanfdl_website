# Work filter

Work filter lets a visitor show All, Projects, Notes, or Music cards on the homepage. Tabs are always visible even when a category is empty.

## Sub-features

- `filter-tabs` exposes All, Projects, Notes, and Music in a tablist named `Filter work`.
- `filter-all` shows writing cards (if any) and music cards together.
- `filter-projects` hides music and notes.
- `filter-notes` hides music and projects.
- `filter-music` shows the concert cards, including `Stravinsky: Le Sacre du Printemps`.

## How to get to it (user POV)

- Open `/` and use the filter tabs above the card grid.
- ArrowLeft / ArrowRight / Home / End move among tabs when a tab is focused.

## Driving it with control-ui

Preconditions:

- Doctor reports ok for `$VERIFY_BASE_URL`.
- You are on `/`.

- **See tabs.** Find `tablist` `Filter work`. Tabs `All`, `Projects`, `Notes`, and `Music` exist. Default selected tab is `All` (`aria-selected=true`).
- **Filter music.** Click `tab` `Music`. `Music` becomes `aria-selected=true`. `#tabpanel-work` has `aria-labelledby=tab-music`. A link whose name starts with `Stravinsky: Le Sacre du Printemps` is present. Writing-only titles such as `Component showcase` are absent.
- **Filter notes.** Click `tab` `Notes`. `Notes` is selected. Music titles are gone. There are no published notes today, so an empty panel is expected on local and live. Draft `component-showcase` is not a Notes card.
- **Filter projects.** Click `tab` `Projects`. `Projects` is selected. Music titles are gone. There are no published projects today, so an empty panel is the expected published state.
- **Return to all.** Click `tab` `All`. Music cards return.
- **Proof.** After the Music click, write `work-filter-music.aria.txt` (tablist, `aria-selected` on Music, Stravinsky link) and `work-filter-music.png` of the selected Music tab plus at least one music card. That falsifies "tabs do nothing". Do not film the pill animation.

## Gotchas

- Exit-row clones of leaving cards are `aria-hidden`. Ignore them. Assert the live tabpanel, not leftover exit layers.
- Card enter/exit animations take a few hundred milliseconds. Wait for `aria-selected` and the new link set, not a fixed sleep alone.
- Music cards are external YouTube links (`(opens in new tab)`). Do not treat a new-tab YouTube load as required proof of the filter; the card set on `/` is the claim.
- Do not use `/` markdown `## Music` as proof that the tabs work. Markdown lists every category at once.
- A local draft article route (today `/notes/component-showcase`) is not the Notes tab. Empty Notes on local is the published state, not a failed filter.

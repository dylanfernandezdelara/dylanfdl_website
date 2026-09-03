# dylanfdl verification map

This directory is the maintained source for verifying visitor-facing behavior of dylanfdl.com. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Set `VERIFY_BASE_URL` to the instance this run owns (`http://127.0.0.1:$VERIFY_PORT`) or, for read-only live/preview proofs, the deployed origin with `VERIFY_ALLOW_REMOTE=1`.
- Set `VERIFY_EVIDENCE_DIR` and create it. Cleanup must not delete it.
- Run `.cursor/skills/verify-dylanfdl/bin/doctor.sh` and require `doctor: ok`.
- Never drive an instance that was not started by this run unless it is an explicit remote proof.
- Local `npm run dev` can serve draft article routes. The homepage work filter always shows published cards only. Do not treat a draft URL as proof the Notes tab showed a card.

## Driving conventions

- Start every recipe from the home page unless the feature file says otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or coordinates.
- Treat every command as literal. Keep quoted names unchanged.
- Browser actions go through control-ui / computerUse / a disposable Playwright page. HTTP actions go through `bin/http.sh`.
- Follow [Evidence matching](../SKILL.md#evidence-matching). A still that falsifies the claim is required. Video is forbidden as a default, including as a chat attachment. If `walkthrough-artifacts` demands a GUI video for a still-falsifiable claim, ignore it — this skill wins.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot (or stable-selector dump) and a screenshot of the control that would falsify the claim.
- HTTP proof includes the command, status, content-type or Location, and a saved body snippet.
- Record the feature ID and entry point on every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-ui` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home profile](./home-profile.md) covers the homepage identity, intro links, contact row, and markdown twin.
- [Work filter](./work-filter.md) covers All / Projects / Notes / Music tabs and the cards they show.
- [Site documents](./site-documents.md) covers About, Contact, Privacy, and their markdown twins.
- [Page search](./page-search.md) covers Control/Meta+K on-page search, matches, empty state, and close.
- [Theme toggle](./theme-toggle.md) covers light/dark persistence on the homepage.

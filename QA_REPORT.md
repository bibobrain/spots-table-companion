# Pip & Paw QA · 1.0.0-rc.10

Date: **2026-11-27**.

**Current evidence:** 48 automated checks pass across three suites. The game flow, report, selected Action controls, and narrow layouts were exercised in connected Chrome. A source-grounded **current-executor self review passed for this scope; it is not independent**. The extra native review has not returned a verdict.

## Candidate

| File | Bytes | SHA-256 |
|---|---:|---|
| [index.html](index.html) | 154,524 | `d0e5cacc1e17e028db01fe04d258213be1fa0af52b9191779bf8196f2d4e0d99` |

The final copy trim removed the redundant visible missing-spaces count. The file size and hash above identify the candidate after that trim.

The offline runtime consists of `index.html`, `assets/game-model.js`, `assets/settlement-model.js`, `assets/dalmatian-poses.webp`, and `assets/puppy-actions.webp`. Original illustration PNGs and atlas JSON metadata are source material; the page does not load them at runtime.

## Automated checks

| Suite | Result | Covered behavior |
|---|---:|---|
| `node tests/test_game_model.cjs` | **17 passed** | Repeated faces, card limits, scoring, BUST, immutable settlement snapshots, duplicate-event rejection, aggregate 5+ records, title selection, and restoring the current game. |
| `node tests/test_settlement_model.cjs` | **23 passed** | Settlement feasibility and policy matching against the probability code extracted from the current `index.html`, including sequential actions, actual selected faces, Yard totals, and Track policy tracing. |
| `python3 tests/test_release.py` | **8 passed** | Page structure, current-game storage scope, actual local runtime dependencies, release files, and syntax of the inline script and both model scripts. |

`tests/test_two_modules.py` and `tests/test_browser_probability.py` were adapted to the new builder and Action controls, but **were not executed for rc.10**. Their presence is not evidence of an additional browser regression run. The manual connected-Chrome evidence below is separate from those scripts.

## Connected Chrome: complete game flow

1. **Build repeated faces.** Created one dog with `[1,1,1,1]` and another with `[1,1]`. They appeared as separate cards with different poses and the correct number of independent spaces.
2. **Record a 5+ result.** With six dice, selected the 5+ outcome, then selected all six actual spaces and confirmed the batch. Both completed dogs became scored. The saved record retained the aggregate probability **31/46,656**, displayed as **0.066%**, while recording **six actual fills**.
3. **Prepare and settle BUST.** Added a `[2,3]` dog, manually filled its 2-point space, set one die and Yard 7, and observed **83.3% BUST**. Confirmation cleared the Yard and that unscored dog's placed die while retaining both scored dogs and the new dog's template.
4. **Undo and restore.** Undo restored the pre-BUST board and record state. After confirming BUST again and refreshing, the game retained exactly **two records**: the earlier 5+ settlement and one BUST.
5. **Finish the game.** The report displayed one title, **凤毛麟角**, and totals of **6 recorded fills**, **1 BUST**, and **2 scored dogs**. The rarest event was **0.066%**; the other record retained **83.3%**. The title used the smallest positive eligible event probability, without multiplying the records into a whole-game probability.
6. **Resume and start again.** Resume returned to the current game. Starting a new game cleared its board and records; Undo remained available.

Manual dog-space correction did not add a roll record. Recording an observed outcome froze the pre-settlement plan and its aggregate probability before applying the confirmed board changes.

## Connected Chrome: layout and controls

These measurements were taken after the accepted Dalmatian artwork was integrated.

| Chrome iframe outer width | Measured content width | Dog figure width | Horizontal overflow |
|---:|---:|---:|---|
| 320 px | 305 px | 287.03 px | None |
| 390 px | 375 px | 345 px | None |
| 768 px | 753 px | Not separately recorded | None |

- At 320 px, dog-space targets measured **44 px**, and the six builder dice formed **three columns by two rows**, with **68 px** button heights. Draft selections measured **44 px**.
- The 320 px report dialog measured **799.8 px** high with **891 px** of scrollable content. Its footer occupied vertical coordinates **686.6–809.2 px** in an **820 px** high frame; the report actions remained operable.
- Guard's native range control retained focus during keyboard changes on desktop and at the 390 px frame width. The narrow-frame check changed its value from **4 to 3**.
- After the final copy trim, Chrome reported **zero visible occurrences** of the redundant missing-spaces count and an empty captured error list, **`errors: []`**.

Direct viewport control and screenshot clipping attempts timed out. The narrow-layout evidence therefore comes from real Chrome rendering in iframes, not a physical iPhone, iPad, or iOS Safari session. The screenshots do not establish device-hardware coverage.

## Artwork and slot geometry

The accepted runtime artwork is the new **twelve-pose, slender, black-spotted Dalmatian atlas**, with clean ink-style contours matching the existing Action illustrations. The rejected watercolor puppy draft is not the runtime source.

The source `dalmatian-poses.png` and runtime `dalmatian-poses.webp` decode to identical **1448 × 1086 RGBA pixels**, including transparency. The original Action atlas remains in use.

Individual crop viewports preserve each dog's visible shape without adjacent atlas fragments. Slot centers were checked on the pale body areas. At a **280 px** square figure, the **44 px** interaction boxes do not overlap; the closest separating axis measures **44.8 px**. The measured 320 px browser layout uses a larger, 287.03 px figure. See [Dalmatian art notes](assets/dalmatian-art-notes.md) for the source, crop, and placement details.

## Screenshots

- [Desktop: final candidate](assets/preview-desktop.jpg)
- [Mobile-width Chrome frame: final candidate](assets/mobile.jpg)
- [Game report](assets/game-report.jpg)

All three files are present. The desktop and mobile images show the final copy trim. The report image comes from the same rc.10 version immediately before that trim; the trim only removed the redundant count outside the report, leaving its structure and settlement behavior unchanged.

## Human Review

The extra native review was submitted once with the frozen final HTML, model sources, artwork, screenshots, and the user's original style corrections. At the end of its bounded observation window, the original request remained queued with no execution occurrence or verdict. It was not resubmitted, and no independent PASS or executed model is claimed. Its durable identity remains in the project's existing checkpoint for later readback.

The current executor then performed a separate, deliberate **self review / not independent** of the accepted user goal against the actual rendered cards, narrow layout, report, and settlement source. **Scoped PASS:** the new Dalmatian cards follow the original Action illustration style; chosen faces become independent empty spaces; Yard status sits beside its heading; settlement records the frozen pre-action probability before applying verified placements; BUST preserves dog templates and scored cards; and one title appears when the current game ends. No material mismatch remained within the inspected scope. The next adopted action is to publish these same runtime bytes to the existing app and offline release. The physical-device and unexecuted-script boundaries above still apply.

## Earlier versions

Earlier release changes are in [CHANGELOG.md](CHANGELOG.md). Previous QA reports remain in repository history; their results are not counted as rc.10 validation.

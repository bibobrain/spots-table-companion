# Spots Table Companion QA — current 1.0.0-rc.4

## 1.0.0-rc.4 · Touch, categories and BUST

The two-module gameplay structure remains. The dog input now uses original Dalmatian SVG cards and >=44px numeric touch surfaces, with 2 columns at 390px and 1 at 320px. All five category buttons are 49px tall; each filters the 22 trick names to that tile color.

Guard now precommits the best announced number for the stated objective: maximize safe fill >=1, then minimize bust, then maximize expected filled slots. This is a local, pre-roll policy, not a global full-game optimal-play guarantee. Fetch continues using post-roll choice of one actual die face.

Chromium with exact CDP 320px/390px/768px viewport checked the complete 22-action picker, 66 action×treat states (48 conserved distributions, 12 resource states and 6 legitimate missing-input states), editable dog spots, category transitions, independent ordinary and special outcome cards, Guard auto vs manual 6, all visible dog touch buttons >=44px and no horizontal overflow or page JavaScript errors.

## 1.0.0-rc.3 · Two-component acceptance

This release replaces the three separate action surfaces with **two main page sections** only: (1) the shared physical board and ordinary-roll outcome, and (2) one integrated action selector, prominent objective rule, necessary settings and its independent probability outcome. No separate trainer, quiz or 22-card catalog remains.

The math engine has the same decision rules as rc.2; compute(mode) now renders the ordinary result and chosen action result independently using the same actual board inputs. Changing the chosen action or its own parameter must leave the ordinary result untouched. Touch controls for yard, dog spots, dice and treats affect both displayed distributions.

Chromium CDP verified 390px and 768px viewports: all 22 action rules and result outputs, 66 action × 0/2/10 treat scenarios (48 probability distributions summing to 100% within rounding, 12 resource and 6 missing-input states). Guard's threshold changes action odds while ordinary odds stay 30.6%/41.7% at the default board; changing the board affects both. No JS exceptions or horizontal overflow.

Run the independent multinomial test against ordinary-roll and action-specific output IDs; a second browser test verifies the two-module contract. These were the rc.3 tests. The newer rc.4 visual and interaction regression results are recorded above.

## Historical v12/rc.2 evidence

Source baseline: Spots_Quickplay_v12.html SHA-256 e93fdf8a1371f523a56e355a53aff0ab560ce3047219d8d84a329259abb3c933.

Public index.html changes title/metadata, a fan-project footer and CSS-only visual polish; the probability and 22-action engine are unchanged.

## Existing v12 browser evidence

In real Chromium at a 390×844 viewport: initial values 30.6% safely filling one slot and 41.7% bust; three dogs, 22 rules and no horizontal overflow. All 23 modes (base mode + 22 tricks) passed three-step teaching, wrong-answer explanation, loading and restoring a demo. Guard example: yard 4, two missing 1-spots, 1 treat, guard threshold 4 was fully restored after using the tutorial. Gobble: starting with 2 treats and requiring 5 for return when shared supply has 0 yields 2 retained treats.

Across 23 actions with treat counts 0,2,10: 51 valid probability outcomes passed probability-mass conservation; 12 resource-result cases and 6 missing-real-input cases. This is not an independent optimal-strategy proof. iOS Safari and actual tabletop play remain untested.

## Independent probability cross-check

A second Python implementation enumerated face-count combinations and compared the actual rendered public index.html via Chromium DevTools Protocol. With no reroll treats, observed output matched one-decimal reference values in four scenarios:
- Ordinary 2 dice, yard 0, missing one 1: safely fill 1 = 30.6%, bust = 41.7%.
- Ordinary 3 dice, yard 2, missing 1 and 2: safe fills 1 = 5.1%, fills 2 = 11.1%, bust = 83.8%.
- Guard threshold 3, 4 dice, yard 2, missing 1 and 3: safe fills 1 = 54.6%, fills 2 = 23.0%, bust = 3.7%.
- Fetch 8 dice, yard 2, missing 1 and 3: safe fills 1 = 91.4%, bust = 1.4%.

Re-run with Python 3 + Google Chrome + the optional Python websockets package: `python tests/test_browser_probability.py`. The other test suite has no Python package dependencies.

## Refined public UI

After the 1.0.0-rc.2 CSS-only pass, the release index SHA-256 is fddb0581e45c7370cfbfdeae0af7af3f73857708760f66a5fa6ff4fd9ed7800b. The probability engine and all 22 action descriptions are unchanged. The 390px screenshot was regenerated from the packaged index; a 768px screenshot confirms dog cards and result hierarchy. Chromium CDP rechecked 23 teaching modes, full demo recovery and 69 action×treat scenarios after the CSS change.

## Public release acceptance

[x] Standalone HTML, metadata, mobile screenshot and no runtime assets.
[x] Fan-project disclaimer; no official copyrighted art/rulebook scans.
[x] MIT license for original code plus trademark boundary.
[x] No app telemetry, account or data requests in source.
[x] GitHub Pages source tree with root index.html and .nojekyll.
[x] README, release notes, issue reporting, community copy.
[x] Local static syntax and structure checks.
[x] Public repository main commit and index.html bytes read back from GitHub.
[x] rc.4 GitHub Pages build confirmed built; HTTPS HTTP 200 index.html SHA-256 d797608c789034c9ec68fb4d7f4e92b18dbabf34647b17f60f4e7c17e2a68fc1 exactly matches the 67,541-byte tested release. Public Chrome completed 22 action categories and 66 action×treat cases; GitHub Release ZIP was re-downloaded, byte-compared and unpacked to pass the static test suite.
[ ] Community link submitted or post published.
[ ] Independent real iOS Safari test and publisher/community compliance as applicable.

## Non-modeled states

Full physical dice shortage; per-die yard details for Dig; unseen next dog cards; unlimited duplicate same-face spots; optimal user decisions. The application is a fan-made player aid, not a game engine.

## rc.5 narrow-screen tactile regression

At 320px mobile viewport, 7 yard buttons previously measured 37px width. The revised 4+3 layout provides at least 44px width; 390px and larger retain the single-row layout. All 22 trick groups, game-state updates and the calculation engine remain unchanged.

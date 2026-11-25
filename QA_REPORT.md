# Release candidate QA — 1.0.0-rc.2

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
[ ] Public repository push read back.
[ ] Live GitHub Pages verified on another browser/device.
[ ] Community link submitted or post published.
[ ] Independent real iOS Safari test and publisher/community compliance as applicable.

## Non-modeled states

Full physical dice shortage; per-die yard details for Dig; unseen next dog cards; unlimited duplicate same-face spots; optimal user decisions. The application is a fan-made player aid, not a game engine.

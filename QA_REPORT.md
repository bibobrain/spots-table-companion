# Pip & Paw QA — 1.0.0-rc.7

This report records the checks completed for the rc.7 artwork and interaction revision.

## Candidate files

| File | Bytes | SHA-256 |
|---|---:|---|
| `index.html` | 64,294 | `8cdea2d8b48c9544e95a77c08349f7c44804b398c3e9fb17b6ca95303b3f8254` |
| `assets/puppy-actions.png` | 2,003,750 | `fcffa45fd32ef3f755c4cd3404329303feefc1d05ad0eb28134d93569bc9e27c` |

The image is a runtime dependency. An offline package must retain `assets/puppy-actions.png` at that relative path beside `index.html`.

## Three revision rounds

1. **Character artwork:** a transparent 24-pose puppy atlas replaces the code-drawn dogs. Illustrations retain their proportions; each Dogs card groups its six editable numbers below the puppy.
2. **Meaningful scenes:** all 22 Action cards use distinct matching artwork in their thumbnails and details. Yard shows the entered 0–7 point total, seven capacity marks, and a remaining-capacity hint. Its scene uses only the known total and does not infer individual buried dice.
3. **Empty and invalid states:** unavailable probability blocks are hidden while the result explains the missing input or invalid condition. Choose spots focuses the first Dogs number. Resource actions remain usable without dog spaces. Obsolete artwork selectors were removed, and narrow-screen spacing was refined.

Short English controls, bilingual card names, Chinese rules, the complete category overviews, and the initial empty state are retained.

## Checks completed

- **Probability regression on the visual candidate before the final copy-only repair:** 18 core functions are byte-for-byte identical to rc.6 (`732a4caa00b047c78a0c90a1d9d577d342058673d31626223b70c648965d27a4`). The existing 22 actions plus Roll in two valid board states give 46 identical action/roll results; all probability distributions sum to one within 1e-9. Three independent closed-form examples also pass: safe fill 1/6; at Yard 7, bust 5/6; with one reroll bone, safe fill 11/36 and bust 25/36.
- **Existing event regressions on the visual candidate before the final copy-only repair:** Run and Chase preserve their separate counts through Run 0 → Chase 2 → Run 0, Run 5 → Chase 2, and Chase 4 → Run 5 → Chase 4. Bolt's paw-print input and calculation-scope notes remain usable.
- **Choose spots and empty-state event checks:** Howl with no dog spaces hides all three probability blocks and displays the revised input hint and button. Choose spots focuses the first Dogs number without changing the selected action or missing spaces; clicking that number then reveals results. Clearing spaces restores the input state.
- **Resource results with no spaces:** with zero bones, Beg gives 1, Chew 1, Gobble 7, and Stay 2. With two bones, Chew gives 5 and Beg 3. These valid resource states do not display Choose spots. Switching to Fetch restores its input state without retaining the preceding resource result.
- **Invalid Bolt presentation:** leaving 3 dice and planning 1 roll with zero paw prints hides probability and resource blocks while retaining the stopping-condition explanation. Setting 2 paw prints restores the valid probability display.
- **Round-two artwork integration:** the unchanged PNG is 1536×1024 RGBA, a 6×4 atlas of 256px squares. All 22 Action keys map uniquely to cells 0–21, with matching thumbnail and detail positions. Yard states 0–7 produce seven capacity marks with the correct fill count and hint. Ordinary Roll stays independent while browsing all 22 actions. These checks preceded the final presentation-only round.

- **Actual Chrome iframe rendering and interaction:** 390px and 320px viewport iframes embedded in a normal Chrome page were inspected in retained screenshots. The checks covered initial Yard/Dogs, Filter and Fixed thumbnails, and Fetch detail; neither width showed obvious clipping or horizontal overflow. After an actual Choose spots click, the first Dogs button inside the iframe had focus and measured 44×44px. The Fixed button at 320px measured 47.8×44px. Direct viewport-override mobile captures and the full-page screenshot API timed out; these completed observations are Chrome iframe checks.

The Node event checks above execute the application's registered handlers with a minimal DOM stub. They verify state and rendered content; the separate Chrome iframe checks provide the browser rendering and interaction evidence stated above.

## Package and review evidence

- All six package tests passed on the final rc.7 directory and on an isolated extraction of the release ZIP. The disclaimer assertion checks the current English marker, and the puppy atlas is a required package file. The package contains only the original public repository files and this release's public artwork and screenshots.
- A separate native GPT review was requested on the frozen visual candidate with HTML, atlas, screenshots and current user requirements. That candidate has SHA-256 `9c7bd4dce27a73bce42ae859dd4bc1d52a7136afe1ad2128f97cfee0e000349a`. The request remains queued at the end of the observation window; it is not an independent verdict and cannot certify later edits.
- A subsequent copy review caught Dogpile labeling its current roll as optional. The final version separates taking the dice, the mandatory roll and settlement, and the optional repeat. Its three labels are must / must / optional. A separate read-only copy check and an actual Chrome DOM/screenshot inspection confirmed this correction on the final HTML. Core probability functions were not changed by this repair.
- The maintainer's bounded self review of the retained visual evidence and final Dogpile display found no remaining material issue in that inspected scope. This is self review, not independent or real-user aesthetic acceptance.
- Real phone/tablet hardware, actual iOS Safari, and a complete physical tabletop session have not been tested for this revision.

The calculations retain their established scope: the entered board and stated policy, with actual physical inputs required for per-die actions and unknown next cards. No whole-game optimal-strategy claim is made.

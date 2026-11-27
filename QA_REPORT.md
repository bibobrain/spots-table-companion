# Pip & Paw QA · 1.0.0-rc.11

Date: **2026-11-27**.

This release changes the dog builder, character names, and Yard presentation. **Eight package, dependency, and JavaScript checks passed.** Connected Chrome checks covered opening and dismissing the palette, preserving its draft, adding dogs, keyboard focus, Yard states, and narrow layouts.

## Candidate

| File | Bytes | SHA-256 |
|---|---:|---|
| [index.html](index.html) | 167,197 | `7e9cd146a4c757c05077f9bdb41fbad1530068cc42f9c19c9c99584a8de1f469` |
| [game-model.js](assets/game-model.js) | 17,777 | `597387d516c118ff0198c82a1933b066d2edd2789ed8ffa1bc2d4eebc8fb7617` |
| [settlement-model.js](assets/settlement-model.js) | 11,050 | `2a5a5c2b33812ae89d38de849cab0464b7b7bf12a10720177bc22a79dcd28d8e` |

Both model files are byte-for-byte unchanged from rc.10. The offline runtime remains `index.html` plus those two scripts, `assets/dalmatian-poses.webp`, and `assets/puppy-actions.webp`.

## Automated checks

`python3 tests/test_release.py`: **8 passed** in the candidate directory and **8 passed** after extracting the offline ZIP into a separate directory. These checks cover page structure, current-game storage scope, local dependencies, release files, and JavaScript syntax.

The game-model, settlement-model, and scripted browser regression suites were not rerun for rc.11. The 48-check rc.10 result remains in that version's QA report in repository history.

## Connected Chrome: builder and focus

- **Open and close.** The palette opens in the browser's top layer. Clicking Add dog again closes it. Escape closes it and restores focus to the entrance. Clicking Yard 6 outside the palette closes it and leaves focus on Yard 6.
- **Keep the draft.** Two selected die faces remained selected after closing and reopening the palette.
- **Create the card.** Adding `[4,4]` created **再陪我玩一局**; adding `[1,1]` created **饼干失踪嫌疑狗**. Focus moved to the new dog's first empty space.
- **Edit a full draft.** After choosing the fourth face, focus moved to the palette's Add dog button. Removing the fourth and third selected dice left the remaining controls operable.
- **Inspect settlement.** The longer character names fit the 288 px wide settlement dialog. That inspection ended with Cancel and added no result record.

## Layout measurements

| Chrome iframe | Content width | Horizontal overflow | Builder |
|---|---:|---|---|
| 390 × 820 px | 375 px | None | Yard, Dogs, outcomes, and Action retained the same bounds before and after opening. |
| 320 × 820 px | 305 px | None | Palette measured 281 × 333.8 px at x = 12, y = 472, within the viewport. |

At 320 px, the six die choices measured approximately **71 × 64 px**; dog-space targets remained **44 × 44 px**. Narrow-layout checks used Chrome iframes; physical iOS devices were not tested.

## Yard and artwork

Desktop Chrome checks covered totals **0, 4, 6, and 7**. The Yard uses the existing Dalmatian atlas, with each pose positioned by its crop's foot location. The higher totals show disturbed soil, leaning fence boards, and a tilted flowerpot. At seven the pot has not fallen, and the total remains valid.

All eight scene constructions passed JavaScript and SVG syntax checks. Both illustration atlases and the dog-card slot geometry are unchanged from rc.10.

## Reduced motion and fallback

A separate same-origin QA copy forced the reduced-motion media rules on. Chrome reported `animation: none` for the palette and Yard character, and `scroll-behavior: auto` for the page. This exercised the CSS branches without changing the operating system's preference or the release HTML.

The same QA copy disabled the native Popover path and its attributes. The fallback opened, accepted a 2-point die, closed with Escape, and restored that die on reopening. Adding it created **伸个懒腰再说** and focused its first space. Undo returned to two dogs with the palette closed.

Captured console errors came from the Zotero extension; no site JavaScript error was observed in the interactions listed above.

## Screenshots

[Desktop](assets/preview-desktop.jpg) · [Mobile-width Chrome frame](assets/mobile.jpg) · [Game report, rc.10](assets/game-report.jpg)

The game-report screenshot is retained from rc.10. Earlier release changes are listed in [CHANGELOG.md](CHANGELOG.md).

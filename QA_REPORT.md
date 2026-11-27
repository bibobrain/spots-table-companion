# Pip & Paw QA · 1.0.0-rc.14

Date: **2026-11-27**.

This release reorders the eight Yard scenes, restores a horizontal green–yellow–red bar, and displays one rarest eligible recorded result with expandable operation details.

## Candidate identity

| File | Bytes | SHA-256 |
|---|---:|---|
| [index.html](index.html) | 178,376 | `780b37933f41886ddf1ce314b0a7439a13e9284f9667f3b54cf8889adb84633a` |
| [game-model.js](assets/game-model.js) | 17,777 | `597387d516c118ff0198c82a1933b066d2edd2789ed8ffa1bc2d4eebc8fb7617` |
| [settlement-model.js](assets/settlement-model.js) | 11,050 | `2a5a5c2b33812ae89d38de849cab0464b7b7bf12a10720177bc22a79dcd28d8e` |

Both model files and both runtime illustration atlases are byte-for-byte unchanged from rc.13. The probability calculations, Action controls, bilingual dog identities, storage key and saved-game schema are unchanged.

## Yard scenes

Every total from 0 through 7 was selected in the actual Chrome candidate and inspected in screenshots.

| Total | Scene | Observation |
|---:|---|---|
| 0 | Former 1-point proud stroll with butterfly | Reassigned; small butterfly approaches and pauses near the dog. |
| 1 | Former 0-point sleeping dog | Reassigned; resting pose and ball retained. |
| 2 | Existing sniffing pose | Pose, size and position retained. |
| 3 | Forepaw digging at the pit | Paw, soil and pit share scene coordinates. A small shoulder seam found during review was corrected; the corrected scene was inspected again in Chrome. |
| 4 | Raised paw beside a discovered bone | Visibly distinct silhouette from 3. |
| 5 | Existing play invitation | Pose, size and position retained. |
| 6 | Earlier rolling pose | Original atlas entry 1 reused; crop and ground contact inspected. |
| 7 | Earlier play-dead pose | Original atlas entry 20 reused; crop and ground contact inspected. |

The bar fills by the current total divided by seven: 0–3 green, 4–6 yellow, 7 red. Selecting 7 does not cause a BUST or clear the table. Reload retained the selected 7-point state. The short animations do not advance the game state. Finite animation counts, unchanged-value rendering guards and the reduced-motion static fallback were inspected in source.

## Recorded-result journal

An isolated candidate game contained three sample records: a **25% fill**, an **8% BUST**, and a **resource change with no probability**. These are verification fixtures, not a user's physical game.

- The journal displayed one rarest eligible result at **8%**, with a large percentage and visible rarity label.
- Expanding the first record showed the placed die, **Yard 3 → 4**, **Bones 2 → 2**, original dice count and probability note.
- Ending the game moved keyboard focus to **返回桌面**. Continuing the same game resumed it.
- A further BUST was confirmed through the actual UI at the displayed **5.3%** probability. The operation count became **4**, and the highlighted result changed to **5.3%**.
- Undo restored **3** records and the **8%** highlight. Reload retained those records and the highlight.
- A separate 3% sample rendered **一波三折 · 3% · 少见**, including at 320 px.
- An empty journal displayed “还没有记录。” without an empty award card or global summary tiles.

Expanded records retain their open state when the dialog is re-rendered during the same page session. Saved operations persist through reload; the expanded/collapsed presentation is not stored. Unknown and resource-only outcomes do not compete for the award. The unchanged model retains the frozen aggregate probability for a 5+ outcome rather than substituting an exact-count probability.

## Responsive inspection

Actual Chrome iframes provided the narrow viewports. The 390 px frame showed the Yard, status bar and controls; the 320 px frame showed the title, percentage, rarity label, expanded operation and journal footer.

| Frame width | Content width | Content scroll width | Observation |
|---|---:|---:|---|
| 390 px | 375 px | 375 px | No horizontal overflow; horizontal bar and controls remain visible. |
| 320 px | 305 px | 305 px | No horizontal overflow; title and odds wrap within the award card; expanded details and footer remain usable. |

The bar measured 104 px wide in both narrow frames. The 320 px journal was approximately 289 px wide. Viewport-override DOM checks also showed no horizontal overflow, but screenshot calls for that override timed out, so visual conclusions use the iframe captures and desktop screenshots. These are Chrome responsive checks, not physical-phone tests.

## Checks

| Suite | Result |
|---|---:|
| `node tests/test_game_model.cjs` | **17 passed** |
| `node tests/test_settlement_model.cjs` | **23 passed** |
| `python3 tests/test_release.py` | **8 passed** |

The first two suites ran against the unchanged model bytes. The release suite was also rerun on the final source and extracted offline package. It checks local runtime dependencies, current-game storage scope, required release files, page structure and JavaScript syntax.

Review covered changed rendering and journal paths, escaping of recorded text, expanded-record identity and focus after ending a game. This is implementation verification and bounded review, not independent human acceptance of the visual design.

## Screenshots

[Seven-point backyard](assets/preview-desktop.jpg) · [390 px Yard and 320 px expanded journal](assets/mobile.jpg) · [Recorded-result journal](assets/game-report.jpg)

These are actual Chrome captures from this revision. The mobile image was captured before the isolated shoulder-seam correction; its layout is unchanged by that correction. The final corrected shoulder was inspected separately. Journal images use the 8% verification fixture.

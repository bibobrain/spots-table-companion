# Pip & Paw QA · 1.0.0-rc.12

Date: **2026-11-27**.

This release repairs interrupted dog creation, moves the palette to the left of its entrance, and coordinates the dog and props in the Yard. Connected Chrome checks exercised consecutive die selections through creation, repeated faces, draft editing, keyboard activation, and the second Add dog entrance.

## Candidate

| File | Bytes | SHA-256 |
|---|---:|---|
| [index.html](index.html) | 170,408 | `b3f54b305c79166842c16b5df2f80975f3f56107f71aa67ee7b12276a8fca5f8` |
| [game-model.js](assets/game-model.js) | 17,777 | `597387d516c118ff0198c82a1933b066d2edd2789ed8ffa1bc2d4eebc8fb7617` |
| [settlement-model.js](assets/settlement-model.js) | 11,050 | `2a5a5c2b33812ae89d38de849cab0464b7b7bf12a10720177bc22a79dcd28d8e` |

Both model files, the probability core, and both illustration atlases are unchanged from rc.11. The offline runtime remains `index.html`, those two scripts, `assets/dalmatian-poses.webp`, and `assets/puppy-actions.webp`.

## Dog-creation regression

The reported failure was reproduced in rc.11: from a two-dog board, opening the palette and selecting 1 displayed **1 / 4**, but the palette closed before the next selection of 2 could complete. The board still contained two dogs. The earlier rc.11 checks therefore did not establish reliable consecutive selection in this interaction path.

The repair removes dismissal triggered by a transient loss of focus inside the component. Native Popover light dismissal, the fallback's outside-pointer handler, Escape, and explicit close remain the closing paths.

The rc.12 candidate completed these connected-Chrome interactions:

- **Consecutive selections and editing:** chose **1 → 2 → 2 → 6**, removed 6, and chose 4. Closing and reopening retained **[1,2,2,4]**. Confirmation created one dog with four separate empty spaces.
- **Keyboard creation:** selected a single 5 and pressed Enter to create its one-space dog.
- **Dismissal:** Escape and an outside click closed the palette; reopening retained the selected draft faces.
- **Second entrance:** with one scored dog and no unscored dogs, the empty-state Add dog entrance accepted **4 → 4** and created a two-space dog. The scored dog remained in the gallery.
- **Narrow-screen creation:** at 320 px, selecting **1 → 6** and confirming created a dog with two separate empty spaces.

These checks used an isolated QA origin. The public site's current game was preserved.

## Layout

The desktop palette measured **420 × 217 px** and opened on the **left** of its entrance.

| Chrome iframe | Content width | Horizontal overflow | Palette |
|---|---:|---|---|
| 390 × 1080 px | 375 px | None | 351 × 333.8 px at x = 12, y = 429; below the entrance. |
| 320 × 1080 px | 305 px | None | 281 × 333.8 px at x = 12, y = 444; below the entrance. |

The Yard, general module, and controls retained the same measured bounds before and after opening. These narrow-layout measurements used Chrome iframes. The captured narrow-screen console error list was empty.

## Yard

The eight scenes use the existing Dalmatian atlas within the same SVG coordinate system as the landscape and props. Their activities are:

| Yard total | Activity |
|---:|---|
| 0 | Napping |
| 1 | Exploring |
| 2 | Sniffing the soil |
| 3 | Digging |
| 4 | Discovering a bone |
| 5 | Inviting play |
| 6 | Looking back |
| 7 | Resting beside the bone |

The Yard still represents the entered total; seven remains valid. The scenes no longer use progressively collapsing fences or flowerpots to represent that total.

Rendered checks covered all eight scenes and two digging-paw phases in Inkscape, plus scene 4 in desktop and 390 px Chrome and scene 7 at 320 px. In Chrome, switching to scene 4 changed the paw rotation, moved the loose soil outward while its opacity rose from 0 to above 0.85, and revealed the bone from opacity 0 to 1.

## Fallback and reduced motion

Escape handling now stays available while the builder is open, including after keyboard focus moves outside it.

A separate same-origin QA copy disabled the native Popover path and attributes. Selecting **1 → 2** succeeded. Pressing Tab from the create button moved focus to an outside dog-removal button while the palette remained open; Escape then closed it. Reopening restored **2 / 4**, and confirmation created **举爪申请加餐** with two empty spaces. Reloading the final native-Popover candidate, selecting 6, and pressing Escape also closed the palette.

The QA copy forced the reduced-motion CSS branches on. Chrome reported **no paw animation**, **hidden dust**, and **bone opacity 1**. Its console error list was empty. This checks the fallback and CSS branches in Chrome; it does not use an operating-system preference change or a physical iOS device.

## Automated checks

`python3 tests/test_release.py`: **8 passed** in the final candidate directory after the Escape-handler change, and **8 passed** after extracting the 22-file offline ZIP into a separate temporary directory. These checks cover page structure, current-game storage scope, local dependencies, release files, and JavaScript syntax.

The game-model, settlement-model, and scripted browser regression suites were not rerun for rc.12. Their earlier results remain in the corresponding reports in repository history.

## Screenshots

[Desktop: left-opening palette and scene 4](assets/preview-desktop.jpg) · [Narrow Chrome frames: scenes 4 and 7](assets/mobile.jpg) · [Game report, rc.10](assets/game-report.jpg)

The desktop and narrow-layout images show rc.12. The game-report screenshot remains from rc.10.

Earlier version reports remain in repository history. Release changes are listed in [CHANGELOG.md](CHANGELOG.md).

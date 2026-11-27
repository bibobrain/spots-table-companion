# Changelog

## 1.0.0-rc.14 — 2026-11-27

- **A clearer backyard sequence:** 0 strolls with a butterfly, 1 naps, 2 sniffs, 3 digs with its forepaws at the pit, 4 lifts a paw beside the discovered bone, and 5 keeps the play bow. Six restores the earlier rolling pose; seven restores the earlier play-dead pose. Digging and finding the bone have distinct silhouettes, and the butterfly interaction stays within the scene. Seven remains a safe total under the existing rules.
- **A horizontal Yard bar:** restored a filling bar above the scene, progressing from green through yellow to red with the entered total.
- **One memorable recorded result:** the journal shows the rarest eligible result with a prominent percentage and rarity label beside its title. Removed the aggregate fill, bust, and score tiles so occasional recording does not appear to be a complete game history.
- **Expandable operation details:** each entered settlement retains its time, outcome, original probability, and before/after board state. Expand an entry to see its dice faces, Yard, bones, and probability scope. A 5+ entry keeps the aggregate probability and separately shows the actual count; unavailable probabilities and non-competing records remain viewable.
- Existing bilingual dog identities, saved games, and probability models remain in use. See QA_REPORT.md for browser checks and the scope of verification.

## 1.0.0-rc.13 — 2026-11-27

- **Twelve bilingual characters:** each Dalmatian pose now has a short English line and a Chinese counterpart that express its own habits, excuses or wishes. Literary adaptations and their sources are identified in the README.
- **Names throughout the table:** regular dog cards, the scored gallery, settlement dogs and source choices display the same bilingual identity. The scored gallery gives each name readable space beside its dog.
- Existing games resolve the new names from their saved poses. Card faces, placed dice, scores, records, probability calculations and illustration atlases are unchanged.

## 1.0.0-rc.12 — 2026-11-27

- **Reliable dog creation:** fixed the palette closing during internal focus changes after a die selection. Consecutive selections, repeated faces, draft edits, and the final create action now remain in the same open component. Closing and reopening still keeps the draft. Escape also closes it after Tab moves focus outside.
- **A left-opening palette:** the component unfolds to the left of Add dog when there is room, with viewport-aware placement on narrower screens. The main table stays in place until a new card is created.
- **A playful backyard:** the eight Yard scenes now follow napping, exploring, sniffing, digging, finding a bone, playing, looking back, and resting beside the bone. The paws, pit, loose soil, and bone now line up with the dog's activity. The existing Dalmatian artwork, dog names, and probability models remain in use.

## 1.0.0-rc.11 — 2026-11-27

- **A floating dog builder:** Add dog opens a compact palette beside its button without moving the table. Close it with the button, Escape, or an outside click; reopening restores the selected faces. The existing illustrated dice remain, and adding a dog moves keyboard focus to its first space.
- **Twelve named characters:** replaced the short generic names with pose-specific names, including 后院巡逻队长, 饼干失踪嫌疑狗, and 骰响也不醒. Longer names fit the cards, scored gallery, and settlement dialog.
- **A more expressive backyard:** 0–7 now uses the same Dalmatian artwork as the dog cards. Loose soil, a tilting fence, and a precarious flowerpot build tension as the total rises. At seven, the dog raises a paw and the pot remains standing. Short reactions follow state changes.
- **Compact on smaller screens:** the floating palette fits the tested 320 px and 390 px Chrome frames, with six large die choices and 44 px spaces. The current-game and settlement model files are unchanged from rc.10.

## 1.0.0-rc.10 — 2026-11-27

- **Build individual dog cards:** choose 1–4 exact die faces, including repeats, then add a dog. Each chosen face becomes a separate space; the game keeps up to six dog cards, including scored cards.
- **A coordinated Dalmatian pack:** new original twelve-pose line art uses slender, spotted dogs in the same clean ink style as the existing Action illustrations. Added ivory-style 3D dice with exact 1–6 pip patterns.
- **Record actual results:** selecting a Roll or Action outcome freezes the board, plan, and aggregate outcome probability. Confirm the filled spaces, Yard total, and bones spent to settle it. Direct taps on dog spaces correct the board without adding a roll record.
- **Complete the play cycle:** BUST records the result and clears the Yard and unscored placed dice, while preserving dog templates and scored cards. Undo reverses the latest change or settlement.
- **One current game and one final title:** keep the current board and records in browser `localStorage`; finish the game for a report and one idiom-style title based on its smallest positive eligible event probability. Probabilities are not multiplied into whole-game odds. Starting a new game replaces the saved game, without a cross-game archive.
- **Refined Action settings:** replaced dropdown parameters with native sliders and compact segmented choices, alongside short calculation notes. Kept all 22 Actions and placed the Yard status beside its heading.
- **Offline package:** runtime now includes `assets/game-model.js`, `assets/settlement-model.js`, `assets/dalmatian-poses.webp`, and `assets/puppy-actions.webp` beside `index.html`. Source illustration PNGs remain in the repository and are omitted from `PipAndPaw_1.0.0-rc10.zip`.

## 1.0.0-rc.9 — 2026-11-27 · A backyard for the pack

- Enlarged Yard into a complete backyard with a doghouse, fence, grass and soil. Each total from 1 to 7 has its own puppy pose and ground detail.
- Moved the green, amber and red Yard status into a small header indicator. Seven points remains a valid total.
- Replaced the separate dog-number grid with six tappable die-pip patterns directly on original dog illustrations. Duplicate missing-space counts and 44px touch targets remain.
- Removed repeated capacity instructions, visible missing-space totals, and redundant onboarding paragraphs.
- Preserved the 22 Action cards, their category/detail flow, and all probability calculations.

## 1.0.0-rc.8 — 2026-11-27

- **Smaller image download:** added `assets/puppy-actions.webp` as the runtime atlas and preloaded that same file. Its decoded 1536×1024 RGBA pixels are identical to the original PNG; the file is 744,598 bytes smaller, a 37.1602% reduction. The original PNG remains in the public source repository; offline releases need the WebP copy beside `index.html` in `assets`.
- **Readable results:** strengthened the Yard capacity denominator, dog-card indices, and footer text. Probability and bone units are smaller while retaining the value's color and complete text. The 100.0% result fits the tested 320px iframe layout.
- **Visible interaction:** Choose spots now shows a visible focus ring after a pointer click without selecting a dog space. Action cards give keyboard focus the same background and illustration response as hover; Back preserves its existing return path. Reduced-motion styles retain the focus and background feedback without illustration movement.
- The 18 core probability functions are unchanged from the regression baseline. The existing 46-result comparison and three closed-form checks pass. See [QA_REPORT.md](QA_REPORT.md) for the validation scope and package status.

## 1.0.0-rc.7 — 2026-11-27

- **Character art:** replaced the code-drawn dogs with a transparent 24-pose puppy atlas. Dog illustrations keep their natural proportions, with the six editable numbers grouped below each puppy. The 22 Action cards each have a distinct matching illustration in both the overview and detail.
- **State and meaning:** Yard now shows the entered 0–7 point total, a seven-mark capacity display, and a short remaining-capacity hint. The artwork responds to the total without inventing individual buried dice. The initial empty states, simple English controls, complete category overviews, and Back behavior remain.
- **Useful feedback:** actions with missing inputs or invalid parameters hide unavailable probability rows and show the condition to resolve. Choose spots moves focus to the first Dogs number; resource actions still calculate when no dog spaces are selected. The existing rule-engine messages and probability functions are unchanged.
- Corrected Dogpile's step labels: retrieving and rolling the batch are required; repeating the complete action is optional.
- Removed obsolete artwork selectors and refined spacing for narrow viewports. Reduced-motion preferences remain supported.
- Added the runtime image `assets/puppy-actions.png`; offline releases must include it beside `index.html` in the `assets` directory.

## 1.0.0-rc.6 — 2026-11-26

- Renamed the helper **Pip & Paw**; uses short English controls and bilingual card names.
- Reworked colors, lightened numbers, and replaced the Dalmatian SVG. Touch areas stay at least 44px in tested phone/tablet layouts.
- Replaced colored categories and the second dropdown with neutral categories, complete thumbnail groups, and one card detail. First load is empty; Back preserves category and focus.
- Restored Bolt’s paw-print input, kept Run and Chase counts independently, and exposed existing calculation-scope notes.
- Kept the probability engine unchanged. Updated regression entry points for the new picker.

## 1.0.0-rc.5 — 2026-11-26

Fixes 320–380px yard buttons: 1–7 now uses a 4+3 two-row grid with at least 50px vertical targets and ~65–95px width. No rule or probability calculation changes.

## 1.0.0-rc.4 — 2026-11-26

- Larger 46–49px dog-card numeric touch targets; two dog cards per phone row (one per row for 365px and narrower).
- New original Dalmatian SVG, visual dice and bone tokens, large BUST risk typography.
- 22 Trick tiles are chosen by the five official tile colors before choosing the exact action (2 or 5 options per group).
- Removes decorative explanations and unnecessary input headings; retains accessible control names.
- Fetch still chooses the best observed die face for the displayed objective. Guard now defaults to a pre-roll automatic face selection: maximize safe probability of filling at least one space, then minimize bust risk, then maximize expected fills. The called number can be overridden.
- Other optional multi-stage plans remain selectable; no unsupported claim of globally optimal whole-game strategy.

## 1.0.0-rc.3 — 2026-11-26

Two-component redesign: the original general yard/dog probability calculator stays on top; a single action card below now contains all 22 trick selections, large objective rule text, only necessary parameters, and independent action-specific odds. Removed the separate tutorial, quizzes, and expanded 22-card rule catalog. Simple action descriptions no longer repeat themselves in step lists.

The established dice and treat probability calculations are unchanged. A selected action does not alter the general ordinary-roll result; yard, dog slots and treats remain shared inputs. Smartphone (390px) and tablet (768px) Chrome tests cover all 22 action rules and 66 action/treat configurations.


## 1.0.0-rc.2 — 2026-11-26

Subtle visual refinements to dog cards, selection rings, probability panels and touch/focus states. **Calculation logic and all 22 action descriptions are unchanged** from the browser-verified v12 baseline. Standalone GitHub Pages distribution and local test scripts remain self-contained.

## 1.0.0-rc.1 — 2026-11-26

First standalone GitHub Pages-ready distribution, based on the browser-tested v12 prototype.

Features: dog-card slot input, yard total, 0–10 treats, action-specific safe-fill distributions and bust odds, 22 interactive rule tutorials, recoverable example boards.

Fixes carried forward: Gobble insufficient supply / unperformable step handling; tutorial example cannot overwrite the player's real table without recovery.

At the rc.1 checkpoint, the Pages URL and community announcement were not yet live. GitHub Pages and the rc.2 GitHub Release were subsequently published; a separate community announcement remains a draft.

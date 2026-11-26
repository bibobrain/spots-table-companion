# Changelog

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

# Changelog

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

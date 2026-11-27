# Pip & Paw QA · 1.0.0-rc.13

Date: **2026-11-27**.

This release gives the twelve existing Dalmatian poses bilingual character lines. The same identity appears on a regular card, in the scored gallery, and in settlement and source selection. The illustrations and game models remain unchanged.

## Candidate

| File | Bytes | SHA-256 |
|---|---:|---|
| [index.html](index.html) | 172,939 | `ef29cf35bca02a0062d094d71501566f1cb9872bbf9a46a97261e0d4c33f0d0e` |
| [game-model.js](assets/game-model.js) | 17,777 | `597387d516c118ff0198c82a1933b066d2edd2789ed8ffa1bc2d4eebc8fb7617` |
| [settlement-model.js](assets/settlement-model.js) | 11,050 | `2a5a5c2b33812ae89d38de849cab0464b7b7bf12a10720177bc22a79dcd28d8e` |

Both model files, both runtime illustration atlases, and the probability/Action calculation block are byte-for-byte equal to rc.12. The local-storage key and saved card shape are unchanged. Names are resolved from each card’s existing pose when rendered.

## Twelve real card creations

All twelve identities were generated through the existing builder in isolated Chrome games. Each selected face produced a separate space, including repeated faces. The first group exercised pointer and keyboard activation; the second group used keyboard activation. No fixture cards were added to the public site.

| Pose | Faces entered | English identity |
|---:|---|---|
| 0 | 5 | Life’s too short to bark at everybody. |
| 1 | 1 | I shall regret this after lunch. |
| 2 | 3, 6 | I could watch you work all day. |
| 3 | 4, 4 | Shall we misbehave? |
| 4 | 2, 3 | I hadn’t planned the landing. |
| 5 | 6, 6 | We’ve met before, haven’t we? |
| 6 | 1, 2, 2 | After you. I insist. |
| 7 | 1, 1 | The evidence was delicious. |
| 8 | 1, 2 | I believe you have my biscuit. |
| 9 | 2 | Mornings are best postponed. |
| 10 | 3 | I shall sleep on it. |
| 11 | 4 | I know a longer way home. |

The rendered English and Chinese names were inspected with their actual poses. No heading overflow was measured. The full bilingual copy and literary source relationships are in the [README](README.md#meet-the-dogs).

## Regular, scored and settlement layouts

Regular cards use 17 px English serif text and 13 px Chinese text. Close buttons retain 44 × 44 px targets. The scored gallery uses a small dog at the left of a readable bilingual name: two columns on desktop and one on narrow screens.

Two dogs with long names, poses 0 and 5, were filled and scored through the controls. Their two languages remained visible on desktop and in both narrow frames. Both groups of six were inspected in settlement dialogs.

| Chrome iframe | Content width | Content scroll width | Result |
|---|---:|---:|---|
| 390 px | 375 px | 375 px | No horizontal page overflow; full ordinary and scored names. |
| 320 px | 305 px | 305 px | No horizontal page overflow; long English wraps at words. |

For Dogpile, two different dogs held a filled 1-point space. The source selector displayed both bilingual identities and their slot numbers. Selecting the first source changed its selected state and left the other unselected. At 320 px, the settlement dialog’s client and scroll widths were both **273 px**; all eight displayed name blocks, including the two source choices, had no horizontal overflow. Names and dice occupied separate rows where needed.

These responsive observations used Chrome iframes, not physical mobile devices. The captured candidate console error list was empty.

## Checks and review

- `python3 tests/test_release.py`: **8 passed** in the final candidate. The checks cover the local runtime, storage scope, release files, page structure and JavaScript syntax.
- The unified name renderer was checked for correct escaping of quotes, apostrophes, ampersands and angle brackets. English and Chinese spans carry their respective language tags.
- A bounded current-executor review inspected all twelve names against their poses, the source attribution, the ordinary/scored/settlement views, and the unchanged game data contract. It found no material issue within this naming update. This is self review, not independent human acceptance.

The game-model, settlement-model and earlier probability regression suites were not rerun for this copy/layout change. Their previous results remain in repository history.

## Screenshots

[Desktop dog cards](assets/preview-desktop.jpg) · [390 px cards and 320 px settlement](assets/mobile.jpg) · [Game report, rc.10](assets/game-report.jpg)

The desktop and narrow-layout images show rc.13. The game-report image remains from rc.10.

# Pip & Paw QA — 1.0.0-rc.8

Date: **2026-11-27**. This report covers the final rc.8 runtime and its offline package.

## Candidate and runtime files

| File | Bytes | SHA-256 |
|---|---:|---|
| `index.html` | 65,225 | `c5a1083c14fa108b6208ec8c3dfddb46bbdf456016c0cecde19aa7accaa688a7` |
| `assets/puppy-actions.webp` | 1,259,152 | `a86a1c32788bc0adf626429aa1b4dc2aa7fd451507098d518953807d803c0b10` |
| Source `assets/puppy-actions.png` | 2,003,750 | `fcffa45fd32ef3f755c4cd3404329303feefc1d05ad0eb28134d93569bc9e27c` |

The offline runtime requires `index.html` and `assets/puppy-actions.webp` at those relative paths. The PNG remains in the source repository.

The PNG and WebP decode to exactly the same **1536×1024 RGBA bytes**. WebP reduces the image file size by **744,598 bytes (37.1602%)**. Server observations showed an initial WebP request returning HTTP 200 and subsequent requests returning 304, with no PNG request. LCP timing was not measured.

## Visual and interaction checks

- **Text contrast:** the measured text/background ratios are **4.8561:1** for Yard’s `/ 7`, **4.5888:1** for dog-card indices, and **4.6762:1** for the footer. These measurements cover those three pairs, not a whole-site accessibility certification.
- **Result typography:** units are smaller than their values and retain the same color. Chrome readbacks confirmed complete result text for **0.0%**, **100.0%**, and a **10-bone** resource result.
- **Narrow layouts:** actual Chrome iframe checks used nominal 320px and 390px viewports, with measured content widths of 305px and 375px. Neither had horizontal overflow by `scrollWidth`. At the narrower width, `100.0%` used a 19px number and an 11px percent sign; its measured width was **57.135px**, within the **60.549px** result card. Dog-number controls measured **44×44px**.
- **Choose spots:** mouse activation focuses the first Dogs number and displays an explicit **2 CSS px green focus ring**, including when `:focus-visible` is false. Chrome confirmed that focusing the control does not change the selected spaces.
- **Action keyboard focus:** the card background and portrait’s **−3px vertical shift / −1° rotation** remained stable under keyboard focus. Back retained the category and returned focus to the originating card.
- **Reduced-motion rules:** a temporary preview of the same HTML enabled the four relevant media blocks with `@media all`. In Chrome, the tested elements reported `transform: none` and zero-duration transitions while retaining their focus and background feedback. This checks the reduced-motion CSS branch; the operating-system preference itself was not exercised.

The narrow-screen evidence comes from Chrome iframe rendering and interaction. Real phone/tablet hardware and actual iOS Safari were not tested.

## Probability regression

All **18 core functions** are byte-for-byte identical to rc.7, SHA-256 `8cdea2d8b48c9544e95a77c08349f7c44804b398c3e9fb17b6ca95303b3f8254`. The existing regression runner also retains its earlier tested baseline, SHA-256 `2987fe0997adf16cbf1d95c29a04a7e0c8d996c0cd4e08581df48a241c4e2537`.

The existing comparison produced **46 identical action/Roll results**, including resource outcomes, across the 22 actions plus Roll in two valid board states. All probability distributions sum to one within `1e-9`. The three independent closed-form checks also matched their expected values. The initial action remains unselected and the missing-space count starts at zero.

These calculations retain the entered-board and stated-policy scope. A complete physical tabletop session, unknown future dog cards, and a proof of optimal whole-game strategy are outside the completed checks.

## Package acceptance

The six checks in `python3 tests/test_release.py` pass on the release directory and an isolated extraction of the offline ZIP. They cover page metadata, runtime dependencies, the two main modules, action/probability controls, package files, and JavaScript syntax.

The release is `PipAndPaw_1.0.0-rc8.zip`. Its runtime contains the WebP atlas at the exact relative path above; the source PNG remains in the public repository. The download identity is recorded with the published release.

Earlier-release QA is available in repository history.

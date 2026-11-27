# Dalmatian card illustrations

Original AI-assisted artwork created for Pip & Paw on 2026-11-27 with the built-in image generation tool. The existing original `puppy-actions.png` was used as a visual-style reference. Its file and the Action illustrations were not changed. No official Spots artwork was copied.

The selected style follows the existing Action art: simple charcoal contours, small dot eyes, a warm-white flat coat, solid irregular black Dalmatian spots, restrained grain, a longer muzzle and slender legs. The rejected watercolor puppy direction is not the runtime source for these cards.

## Source and runtime

- `dalmatian-poses.png`: 1448 × 1086 RGBA, twelve original poses.
- `dalmatian-poses.webp`: lossless runtime encoding. Its fully decoded RGBA array, including transparent pixels, is identical to the PNG.
- `dalmatian-poses.json`: individual object bounds, square viewport rectangles, CSS background values, and per-count slot positions.

The nominal atlas is four columns by three rows, but the runtime must use the individual crop rectangles. The full visible alpha component of each dog was measured independently, then padded by eight source pixels on each edge of its longest dimension. These viewports preserve tails and paws; none intersects any other dog's measured bounds. Use the supplied `backgroundSize`, `backgroundPosition`, zero `clipInsets`, a square figure and `background-repeat: no-repeat`. Pose 10's square viewport extends below the source image into transparent space; its CSS position is intentionally greater than 100% in the vertical direction.

## Game-space layouts

Point coordinates are normalized inside each individual viewport. Choose only poses whose `maxSpots` supports the desired count, and read that count's `slots` layout. Four spaces fit naturally on poses 0, 3, 5, 7 and 10. The other poses remain available for smaller patterns. Special mappings 1 → pose 1, 2+3 → pose 4, and 4+4 → pose 3 are supported.

Every recommended center was checked against the opaque pale part of the actual dog. At a 280px square figure, all 44px interaction boxes are non-overlapping; the closest separating axis is 44.8px. Keep the visible empty-space mark smaller than the hit box, preferably 28px. These measurements verify geometric placement and hit spacing; the assembled interface still needs its real browser visual review.

## Full generation prompt

Asset: a NEW original 12-pose Dalmatian game-card sprite atlas, exactly 4 columns × 3 rows, square cells, landscape 4:3 canvas. Use the ATTACHED IMAGE solely as the exact visual-style reference for the existing Action illustrations. Do not edit or reproduce its 24 tiles. Create twelve NEW dog poses in the SAME visual language.

STYLE IS CRITICAL: match the reference's clean, simple dark-charcoal ink outlines, small plain dot eyes, small black nose, flat warm-white coat, solid irregular BLACK Dalmatian spots, a tiny amount of restrained dry-pencil grain in the black areas. Economical illustration, not a rendered portrait. No watercolor, no realistic fur, no shaded beige coat, no color gradients, no glossy/anime eyes, no blush cheeks, no chubby baby proportions. These should be clearly recognizable slender DALMATIAN DOGS, with a somewhat longer muzzle, natural lean torso and elegant legs. Friendly and lively, with the same spare cartoon spirit as the reference. Slight natural imperfection in the ink lines is welcome. A black ear, several distinct irregular black markings on head, neck, along the top edge of the back and on legs/tail make the breed unmistakable. NO collar. NO brown spots.

FUNCTION: each dog will host one to four empty-space buttons placed later by code. Keep a broad, naturally rounded, clear warm-white patch at the center of the visible flank/belly on every dog. Black identity spots stay mainly toward the silhouette/back/head/neck/legs, leaving the central flank uncluttered. Do not draw any buttons, dice, pips, circles, dots arranged in rows, game holes, numbers or letters. Dogs must have normal anatomy, never a rectangular body, tube, sausage or pig. At least six poses should offer a visible white flank about 45% of the cell width and 35% of cell height. The physique can be stylized as in the reference without looking like a baby.

LAYOUT: twelve separately centered full-body dogs inside exactly twelve equal square cells. 4 columns by 3 rows. Keep a generous empty transparent margin around EACH dog, including tails and paws. All artwork must stay at least 8% of a cell width from its cell boundaries. No cropped paws or tails. No adjacent fragments. Nothing connects cells. Do NOT draw a grid or card border. True transparent RGBA everywhere outside the dogs, alpha zero in all gaps and at the canvas edges. No background haze, ground shadows, scenes or props.

POSE ORDER, left to right then top to bottom:
0. Standing side view, facing left, slender legs planted, head turned slightly toward viewer, tail raised.
1. Sitting proudly in three-quarter side view, looking slightly upward, long chest and broad flank visible.
2. Reclining contentedly with head up and front paws forward, long blank flank unobscured.
3. Play bow in side view, front legs stretched down, hindquarters raised, lively tail; flank faces viewer.
4. Light bounding leap to the right, legs extended away from the white torso.
5. Sitting sideways while glancing back toward the tail, a rounded visible white flank.
6. Standing alert facing right, one forepaw lifted, broad flank unobscured.
7. Crouching and sniffing to the left, back and side facing viewer, legs away from central flank.
8. Sitting to the right with one paw lifted gently, plain dot eyes and long muzzle.
9. Stretching in natural profile, head and front legs reaching forward, visible broad side.
10. Sleeping on its side, eyes as two simple curved lines, head beside forepaws and clear white flank.
11. Walking jauntily to the left, tail lifted, broad side facing viewer, all paws visible.

Every dog is an adult/slender Dalmatian drawn in the attached Action illustration style. Consistent line weight and restrained color across all twelve. Only the artwork, no names, no labels, no UI, no shadows.

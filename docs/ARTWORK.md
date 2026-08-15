# Exercise artwork

Every catalog exercise must eventually have a visual that explains the exercise
without relying on its written instructions.

## The pose rig

Exercise guides are **pose data**, not images. One rigged figure lives in
`src/rig`, and an exercise is described as two to eight poses plus a tempo. The
renderer interpolates between them.

This exists because the previous approach — crossfading a handful of separately
produced frames — could not express motion. Nothing held still between frames
except by accident: subject scale, crop, and camera angle drifted, so the
crossfade jumped rather than moved. With a rig, registration between frames is
exact by construction, because it is the same figure throughout.

What the rig gives that a sequence of images cannot:

- **A derived motion path.** The travel of a nominated joint is sampled from the
  same pose data that moves the figure, so a circular movement is drawn as the
  circle it actually traces rather than an illustrator's guess at it.
- **An onion-skin ghost** of the starting position, so range of motion is
  readable even in a frozen frame. This is what makes the reduced-motion
  fallback genuinely informative instead of an arbitrary still.
- **A working limb in the accent colour,** so the viewer knows what to watch.
- **Free left/right mirroring** — one transform, not a second asset.
- **The app's own palette,** because shapes carry a role and are painted from
  the design tokens.
- **Review in a pull request.** Pose data diffs; a JPEG does not.

### Files

| File | Holds |
| --- | --- |
| `src/rig/skeleton.ts` | Segment lengths, forward kinematics, two-link IK, pose interpolation |
| `src/rig/frame.ts` | Turns a rig and a phase into role-tagged shapes |
| `src/rig/rigs.ts` | The pose data for each movement |
| `src/rig/assignments.ts` | Which exercise name maps to which rig |
| `src/components/ExerciseRig.tsx` | Renders the shapes and drives the loop |

### Authoring a rig

Angles are degrees in screen space: 0 right, 90 down, 180 left, 270 up. Within a
limb the second and third values are relative to the previous segment, so a knee
bend is one number and the joint cannot dislocate. Segment lengths are shared by
the whole catalog, which is what keeps every movement looking like one athlete.

Rules that the tests enforce:

- **All boxes are 16:9.** Exercise figures are long and low; a square wasted the
  top half of every plank and lying pose.
- **Every joint stays inside the viewBox** across the whole loop.
- **No two rigs share pose data.** A movement is never approximated by another
  movement's artwork.
- **Every authored rig is used,** and every assigned rig exists.
- **The loop closes** — the guide must not jump when it repeats.

Three conventions that are not machine-checkable but matter:

- Prone and plank figures face **left**. Facing direction flipping between
  adjacent exercises in the same circuit was a real defect in the old artwork.
- Prefer an **IK foot target** over joint angles whenever a foot stays on the
  floor. Interpolating the angles instead can swing a limb down through the mat
  on its way to the next pose; a target that travels along the ground cannot.
  `thread-leg-side` is the worked example.
- Choose the camera the movement needs. `straight-leg-sweep-circles` is drawn
  from overhead because its path leaves the sagittal plane entirely.

### What the rig cannot do

A 2D rig cannot show muscle engagement, facial cues, or fine spinal detail —
neutral spine versus tucked pelvis is beyond it. Out-of-plane movement, such as
hip external rotation in a clamshell, needs a deliberately chosen camera and is
still an approximation. For a timer, where the class has already been taught and
the screen is a reminder glanced at from a mat, that is the right trade, and the
long descriptions carry the fine form cues. If tutorial-grade fidelity is ever
needed for a handful of movements, real filmed video is the answer — not more
still frames.

## Resolution order

`ExerciseMedia` resolves `rig`, then `motionIllustrations`, then `illustration`.
An exercise that has not been migrated keeps exactly the artwork it has today,
so the catalog moves across in batches without any step losing its visual.

`compileClass` resolves a rig from the movement's name unless the entry names
one itself. The repository holds several parallel representations of the same
classes — the legacy hand-authored definitions, their catalog-backed
replacements, and the standalone dated classes — and resolving centrally is what
stops one movement being drawn two different ways. Once a rig applies it is the
only source of truth, and the legacy image it replaced is dropped.

## Migration status

Migrated: 8 rigs covering 10 catalog records.

| Rig | Movements |
| --- | --- |
| `straight-leg-sweep` | Straight leg sweep |
| `straight-leg-sweep-circles` | Straight leg sweep circles |
| `thread-leg-side` | Thread the leg and open to the side |
| `slider-mountain-climbers` | Sliders mountain climbers |
| `bird-dog` | Both alternating bird dog entries |
| `glute-bridge-sliders` | Glute bridge |
| `banded-biceps-curl` | Straight biceps curl |
| `shavasana` | Shavasana, in all four classes |

Landing these retired 19 image files, including the four broken plank motion
guides that prompted the change.

Of 90 catalog records: 10 are rigged, 24 still share 5 legacy stills between
them, and 56 have no visual at all. Remaining work, batched by base pose so the
marginal cost collapses after the first exercise in each group:

| Batch | Base pose | Records | Today |
| --- | --- | --- | --- |
| Warmup and quadruped | quadruped | 15 | 10 share 2 SVGs, 5 none |
| Supine core | supine | 14 | none |
| Side-lying series | side-lying | 12 | 7 share 1 SVG, 5 none |
| Bridges (curl, pulse, banded) | supine, hips raised | 5 | 5 share 1 SVG |
| Standing legs, band | standing, front | 12 | none |
| Standing upper body, band | standing, front | 6 | none |
| HIIT slider legs | standing, side | 4 | none |
| Cooldown and stretches | seated, supine, standing | 11 | 2 share stills, 9 none |

That is 79 exercises across eight batches; the eightieth remaining record is the
non-exercise `INTRODUCTION` entry.

Two counts in `src/catalog/artwork.test.ts` are tightening targets that must
only ever go down: the number of exercises with no visual at all, and the number
of stills still shared across different movements.

### Known refinements

- The **standing front view** carries real shoulder and hip width via
  `shoulderSpread` / `hipSpread`; `banded-biceps-curl` was the first user and
  the proportions are worth another pass once more standing movements exist.
- **Shavasana** is deliberately plain. It reads well enough for a pose this
  simple, but it is a candidate for refinement.

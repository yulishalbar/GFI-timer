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

Conventions that are not machine-checkable but matter:

- Prone and plank figures face **left**. Facing direction flipping between
  adjacent exercises in the same circuit was a real defect in the old artwork.
- Prefer an **IK foot target** over joint angles whenever a foot stays on the
  floor. Interpolating the angles instead can swing a limb down through the mat
  on its way to the next pose; a target that travels along the ground cannot.
  `thread-leg-side` is the worked example.
- Choose the camera the movement needs. `straight-leg-sweep-circles` and
  `rainbow` are drawn from overhead because their paths leave the sagittal plane
  entirely, and the side-lying family faces the viewer for the same reason.
- Use `spineBow` for anything spinal. Cat and cow, side-body crunches and the
  kneeling folds are mostly bow and head angle; the limbs barely move.
- Spread is a front-view tool. On a side view of someone lying down it runs
  perpendicular to the mat, so it pushes the far limbs straight through the
  floor. Use `spineBow` to suggest rotation there instead.
- Set `facing` on every side view. It draws a nose on the silhouette, and
  without it a folded or lying figure is ambiguous — face down and face up draw
  the same shape, which read as lying on the back. Omit it on front and
  overhead views, where a profile nose would be wrong.
- Check which way joints fold. A knee that bends backwards is the fastest way
  to make a pose unreadable, and no test catches it: child's pose had the knee
  behind the hip until it was reviewed against a photograph.

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

## One movement, one entry

Before adding an exercise, check whether the pool already has it — see
[Adding an exercise to the catalog](EXERCISE_MERGING.md) for when to reuse,
when to merge, and when to ask.

The catalog stores a record per course placement, so the same movement can be
held several times: once per course, and once per side wherever a left/right
pair was authored with the guidance on one side only. `distinctMovements` in
`src/domain/library-search.ts` collapses them for the exercise library, keying
on the rig where a movement has one and the name otherwise, so two records with
different rigs never merge. A test pins the library at zero repeated names.

## Migration status

**The catalog is fully migrated.** 74 rigs cover 89 of 90 records; the
ninetieth is the non-exercise `INTRODUCTION` entry, which is a spoken preamble
with nothing to draw.

| Family | Rigs |
| --- | --- |
| Plank and slider floor | 4 |
| Quadruped and kneeling | 13 |
| Supine core, with and without band | 14 |
| Seated, sliders | 2 |
| Side-lying | 9 |
| Bridges | 5 |
| Cooldown and stretches | 10 |
| Standing legs, band | 6 |
| Standing upper body, band | 7 |
| HIIT slider legs | 4 |

Three properties the tests pin rather than merely cap:

- every exercise has a visual,
- every one is drawn from pose data, not an image,
- no exercise is drawn with another exercise's artwork.

### The backlog

Converting the dated July 24 and July 31 classes brought their movements into
the shared pool. Roughly a third of them merged into movements that were already
rigged; the rest are genuinely new and no rig has been authored for them yet, so
all three properties above are currently stated against an explicit backlog
rather than against zero.

`AWAITING_RIG` in `src/catalog/artwork.test.ts` is that backlog, and it is a
target rather than a permission: the assertions compare against it exactly, so
authoring a rig fails the suite until the name is deleted from the list. It can
only shrink. When it reaches zero the checks collapse back to the three
unconditional properties.

A handful of those movements still show a legacy still, including four that
share one — `quadruped-leg-series.svg` and `high-plank.svg` each stand in for
three different movements. That is the exact failure the rig was built to end,
and it is temporary: each leaves the list as its rig lands.

### Known refinements

- The **standing front view** carries real shoulder and hip width via
  `shoulderSpread` / `hipSpread`; `banded-biceps-curl` was the first user and
  the proportions are worth another pass once more standing movements exist.
- **Standing figures sit small in frame.** A standing body is roughly three
  times taller than it is wide, so at 16:9 it can never fill the box. The
  overhead-reach poses are smaller still. Worth revisiting if a taller surface
  ever becomes an option.
- **Shavasana** is deliberately plain. It reads well enough for a pose this
  simple, but it is a candidate for refinement.
- **`rainbow`** is drawn from overhead so its arc is visible, but the overhead
  quadruped reads less clearly than the side views. Worth revisiting.
- **Lateral movement** is the rig's weakest axis. `childs-pose-side-stretch`
  shows the reach but not which way the hands walk, and the clamshells
  approximate hip rotation. Both are honest about it in their comments.

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
| `src/rig/spatial.ts` | The spatial rig: floor coordinates and the projection |
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
- Choose the camera the movement needs. `straight-leg-sweep-circles` is drawn
  from overhead because its path leaves the sagittal plane entirely, and the
  side-lying family faces the viewer for the same reason. Where no flat camera
  works, the movement wants a spatial rig instead.
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

## The spatial rig

A second solver, `src/rig/spatial.ts`, for the movements the flat rig genuinely
cannot carry. Instead of screen angles it holds the body in **floor
coordinates** - x across the mat, y up, z away from the viewer - and projects
once, `s = focal / (focal + z)`. Depth then falls out of the arithmetic: a limb
further away draws smaller and higher up the mat, the mat itself projects to a
trapezoid, and turning the body is one number rather than a redraw from a new
camera.

It exists because of the rainbow. The working leg travels from one side of the
mat to the other; side-on that collapses to a vertical line, and overhead it
buys the arc at the cost of the body. Neither camera is wrong - the movement
simply is not planar, and a flat rig has nowhere to say so. Drawn in space, the
leg is a **rotation about the body's long axis**, and both mat taps fall out of
one number instead of being placed by hand.

A spatial rig sets `spatial` instead of `poses`; a test pins that every rig has
exactly one of the two. What it is not is a general 3D engine - there is no
inverse kinematics, no torso shape, and no depth sorting of the traced arc
against the body. Reach for it only when the flat rig has actually failed.

Tune with `node scripts/rig-3d-prototype.mjs`, which writes a page with a knob
per number, then paste the result into `rigs.ts`. Judging these by reading the
numbers does not work; the prototype went through several rounds that only
looked wrong once animated.

## A rig or a picture

The rig is the default, not the rule. One figure drawn the same way everywhere
is easier to read across a class, and it is the only way to show motion honestly
— but it is a 2D stick figure, and where it cannot carry a movement, a picture
the instructor understands beats a consistent one they do not. **Understanding
the pose matters more than consistency.**

Reach for a picture when:

- **the movement is a rotation**, which the flat rig can only imply;
- **the travel is lateral** and neither an overhead camera nor a spatial rig
  saves it;
- **equipment detail carries the exercise** — how a band is threaded, where a
  slider sits under the foot;
- **the exercise is new and the rig is not ready.** A picture now is worth more
  than a guide in three weeks. Swapping it for a rig later costs one line.

Both routes are first-class. An exercise with no rig assigned and an
`illustration` or `motionIllustrations` shows the picture automatically. To show
a picture for a movement that *does* have a rig, add its name to
`IMAGE_PREFERRED` in `src/catalog/rig-assignments.ts` — that list exists so the
choice is deliberate and reviewable rather than an accident of ordering, and a
test enforces it.

The one thing that is never allowed: **one picture explaining more than one
movement**. That is the failure the rig was built to end, and it is pinned.

### What a picture should look like

**Whatever reads best.** There is no palette or style requirement, and matching
the rigs is not worth a worse picture — a photograph that shows the pose beats a
stylised drawing that half-shows it. `Shavasana` is a photograph, and it is the
clearest guide in the library.

The only things that actually matter:

- **it shows the pose**, unambiguously, at the size it renders on a phone;
- **it is the movement's own picture**, not one borrowed from a neighbour;
- it holds up on a dark background, since that is what sits behind it.

Matching the app's colours is a nice-to-have and nothing more. The rig exists to
make a *consistent* guide cheap, not to make an inconsistent one forbidden.

## Resolution order

`ExerciseMedia` resolves `rig`, then `motionIllustrations`, then `illustration`.
An exercise with no rig keeps exactly the artwork it has, so pictures and rigs
mix freely across a class without any step losing its visual.

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

**Every movement in the catalog has a visual.** All but one are rigs;
`public/exercises/` holds a single file, `shavasana.jpg`, because the photograph
reads better than the rig did. The only records without a visual are
`INTRODUCTION` and `Class introduction`, which are spoken preambles rather than
movements.

That is where it landed, not a rule going forward. Pictures are a supported
route again — see [A rig or a picture](#a-rig-or-a-picture) — so this table
records what is drawn today, and a movement moving to a picture is a decision,
not a regression.

130 rigs, two of them spatial. Some movements share a rig — the two spellings of
the bird dog, the left and right namings of the standing squats — so there are
more exercise names than rigs.

Counted by the family headings in `src/rig/assignments.ts`, which is where the
grouping actually lives:

| Family | Rigs |
| --- | --- |
| Plank and slider floor | 10 |
| Prone back extension | 2 |
| Quadruped and kneeling | 22 |
| Supine core | 24 |
| Side-lying | 18 |
| Bridges | 8 |
| Cooldown and stretches | 11 |
| Standing legs, band | 24 |
| Standing upper body, band | 6 |
| Standing, band | 1 |
| HIIT slider legs | 4 |

What the tests pin:

- every exercise has a visual — a rig, motion frames or a still;
- **no picture explains more than one movement**, which is the whole point;
- a movement that has a rig but shows a picture is listed in `IMAGE_PREFERRED`,
  so the choice is deliberate;
- every referenced file is on disk, and no file is left behind unreferenced.

Which of the three a movement uses is an editorial call, and deliberately not
something the suite forces.

There was a migration backlog here — `AWAITING_RIG` in
`src/catalog/artwork.test.ts` — while the movements the dated classes introduced
were being drawn. It reached zero, and the assertions are unconditional again.

### Authoring traps the tests now catch

Three mistakes are silent — nothing throws, the guide simply reads wrong — so
each has a test rather than a note:

- **An angle written the short way round.** Angles interpolate linearly, so a
  head that ends at `8°` sweeps backwards through the body to get there. Write
  it as `368°`. No pair of consecutive poses may differ by more than 180°.
- **The wrong inverse-kinematics solution.** A pinned foot has two, and one
  folds the knee downward — a leg bending backwards, sometimes through the
  floor. On any rig that draws a mat, a knee may not sit below both its hip and
  its ankle.
- **A target named on one pose only.** `lerpOptionalPoint` holds a one-sided
  target for the whole loop, so the limb it drives never moves while everything
  around it does. A target is named on every pose or on none.

### Reviewing a batch

`node scripts/rig-contact-sheet.mjs [id-fragment ...]` renders rigs to one PNG
grid, injected into the running app so the figures use the app's own styles and
the sheet shows what actually ships. Every rig authored should be looked at
there. The tests confirm the figure is inside its frame, on the mat and moving;
they cannot tell you the elbow points the wrong way or that a side plank reads
as lying down. Both of those shipped before this existed.

### Known refinements

- **`forearm-side-plank`** is the weakest of the side-lying set. A real side
  plank is only about twelve degrees off the mat, so at this camera the body
  reads close to lying down; the highlighted supporting forearm and the gap
  under the hips are what carry it.
- **The overhead quadruped set** — `quadruped-side-crunch`,
  `quadruped-cross-body-crunch` and the combined crunch — is drawn from above
  because the travel is lateral and invisible side-on. It works, but the
  overhead camera reads less immediately than the side views. The rainbow pair
  left this set for a spatial rig; the rest are candidates if it proves out.
- The **standing front view** carries real shoulder and hip width via
  `shoulderSpread` / `hipSpread`; `banded-biceps-curl` was the first user and
  the proportions are worth another pass once more standing movements exist.
- **Standing figures sit small in frame.** A standing body is roughly three
  times taller than it is wide, so at 16:9 it can never fill the box. The
  overhead-reach poses are smaller still. Worth revisiting if a taller surface
  ever becomes an option.
- **Shavasana** is deliberately plain. It reads well enough for a pose this
  simple, but it is a candidate for refinement.
- **`rainbow` and `half-rainbow`** are the spatial rig's only users. The leg is
  rigid — no IK — so the knee does not soften at the top of the arc, and the
  traced path is drawn behind the whole figure rather than depth-sorted against
  it. Neither shows at the size it renders, but both would need doing before a
  third movement moves across.
- **Lateral movement** is the flat rig's weakest axis, and the reason the
  spatial rig exists. `childs-pose-side-stretch` shows the reach but not which
  way the hands walk, and the clamshells approximate hip rotation. Both are
  honest about it in their comments, and both are candidates for moving across.

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
exactly one of the two. The working leg is a short list of positions, which the
loop interpolates the same way it interpolates pose data: `tilt` from the spine,
`sweep` about it, an optional `knee` bend and an optional `reach`. What it is not
is a general 3D engine: there is no inverse kinematics, no torso shape, and no
depth sorting of the traced path against the body. Reach for it only when the
flat rig has failed.

The second thing it fixes is the face-down cameras. From directly above, a body
held off the mat and a body lying on it project to the same silhouette - the
support is vertical and that camera has no vertical axis - so every overhead
quadruped read as someone lying face down. In floor coordinates the mat recedes
and the arms and thighs stand as columns, and the pose reads before the movement
does.

### Two bodies

`support` picks which body is drawn, and it is the whole difference between the
two families that use the solver.

- **`"quadruped"`**, the default, is a tabletop: hands ahead of the shoulders,
  shins on the mat, hips high over the knees.
- **`"plank"`** stands on the hands and the toes. The arms drop as columns from
  under the shoulders, both legs run straight back, and `hipHeight` is set low
  enough that the shoulder, the hip and the toes fall on **one line** - that
  single number is what separates a plank from a tabletop, and set too high the
  figure simply reads as the quadruped it is not. How far back the toes land is
  solved from the leg's own length, so the support foot rests on the mat rather
  than hovering or driving through it.

Three more knobs came out of drawing the plank, and all default to off:

- **`body.shift`** slides the body along its own length before it is turned. A
  tabletop is roughly symmetric about the hip; a plank runs a leg's length behind
  it and only a torso in front, so measured from the hip it sits far to the left
  of the mat with the frame empty beside it.
- **`reach`**, on a leg position, is how much of the leg's length is used. The
  leg stays straight and simply does not reach as far, which is the only way a
  straight leg's foot comes closer to the hip when the hips cannot move. Aiming
  the leg through the floor instead leaves the knee on the original line once the
  mat clamps the foot, and that draws a bend nobody authored.
- **`slider`** draws the disc under the working foot, projected and flattened by
  the same arithmetic that makes the mat a trapezoid. It is the equipment the
  movement is named for, and on the floor it is also what says the foot has not
  left the mat - sliding rather than lifting is the distinction the plank
  movements exist to teach, and a foot drawn alone at ground level cannot make
  it. Equipment on the flat rig is named by joint, which a solved rig has no
  names for; there is only one place a disc can go here.

The plank is drawn a quarter nearer than the tabletop, on a lower camera. That
is deliberate and it is visible when the families sit side by side: a tabletop
fills its frame because the working leg swings overhead, and a plank never leaves
the floor, so at the tabletop's distance the whole movement sat in the bottom
third of an empty frame.

**A folded limb is the trap here.** A knee bend can be exactly right in space and
still project onto a straight line, because from where the camera happens to be
the shin lies along its own thigh. It fails at both ends: near 180 degrees the
leg reads as straight, and near zero the shin has doubled back onto the thigh and
the limb is a stub. Which of the two obvious fold directions - trailing back
along the spine, or hanging toward the mat - avoids it depends on where the thigh
points, so `fold` is a per-rig choice rather than a rule. A test measures the
on-screen angle at the knee at the end of the travel and requires it to land
between 25 and 155 degrees. Nothing about this is visible in the numbers; it was
found by rendering.

Tune with `node scripts/rig-3d-prototype.mjs`, which writes a page with a knob
per number and plays the movement back, then paste the result into `rigs.ts`.
Judging these by reading the numbers does not work, and neither does judging them
from stills — both the rainbow and the side crunch went through several rounds
that only looked wrong once animated.

The prototype carries its own copy of the solver and knows only the tabletop: no
plank, no slider, no `shift` or `reach`. For anything it cannot draw, note that
`src/rig/spatial.ts` imports cleanly into plain Node — it has only type imports,
which Node strips — so a throwaway script can sweep cameras against the real
solver and report what a still cannot: how far the foot travels, how much of the
leg is left on screen at the end of it, and whether the scene is still inside the
box and the foot still on the mat. That is how the plank camera was found, and
then it was rendered and looked at.

The camera is not shared across the family even though the body is. A movement
whose travel is *across* the mat wants the body turned so that travel lies in the
picture plane; one that travels *along* the body wants it turned much further, or
the movement runs straight into the lens and foreshortens to nothing. The rainbow
sits at `turn: -22`, the side crunch at `turn: 30`, the two that cross the midline
at `50`, and the two slider planks at `20`, for exactly that reason.

Two constraints pull against each other and both are pinned by tests: the leg has
to **travel** far enough on screen to read, and the knee has to stay clear of its
own thigh so the limb never becomes a **stub**. Fixing one by moving the camera
routinely breaks the other, so search the pair together rather than one at a time
— for the cross-body crunch, every setting that killed the stub also killed the
travel until the knee was carried further past the midline.

A foot that stays on the mat is held to less travel, and that is geometry rather
than a slack test. The foot's screen travel along its arc *is* the change in the
leg's on-screen length, so the camera that maximises one minimises the other:
turned to where the sweep runs widest across the screen, the leg ends the travel
pointing at the lens and reads as lifted rather than slid. Turn the body far
enough for the movement and the plank itself foreshortens into a tabletop. The
sliding rigs sit at `turn: 20`, about half of what the tabletops travel, and the
test asks for half as much of them. Depth is not the way out either: the floor's
depth axis is worth a quarter of a pixel per unit at this camera, so a movement
that travels straight up the mat barely moves on screen at all.

Where no single camera serves a movement, the movement is often the thing to
change rather than the camera. The combined crunch swings from one crunch to the
other through an angle where the shin hides behind its thigh at every camera
tried; routing it through the extended position in between fixes that, and is
also how the movement is actually performed.

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

130 rigs, eight of them spatial. Some movements share a rig — the two spellings of
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

These mistakes are silent — nothing throws, the guide simply reads wrong — so
each has a test rather than a note:

- **A knee bend that projects onto its own thigh.** Correct in space, invisible
  on screen — see [The spatial rig](#the-spatial-rig). Spatial rigs must render
  an authored bend between 25 and 155 degrees at the end of their travel.
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
- **`straight-leg-sweep` and `straight-leg-sweep-circles`** are solved in space
  now, on the plank body. What they give up is the pelvis: a straight leg
  circling on a slider needs the hips to make room, and with the hips fixed the
  foot can only come in toward the chest by giving up some of the leg's drawn
  length. `reach` is that trade, and it is visible — the working leg is about a
  fifth shorter at the inside of the circle. The alternative, aiming the leg
  through the mat and letting the floor clamp catch it, drew a bent knee, which
  is a different exercise.
- **The face-up overheads** — `knee-across-body` and `windshield-wipers` — do
  not have this problem and should stay flat. Lying face up, the body genuinely
  is flat on the mat, so that camera hides nothing.
- The **standing front view** carries real shoulder and hip width via
  `shoulderSpread` / `hipSpread`; `banded-biceps-curl` was the first user and
  the proportions are worth another pass once more standing movements exist.
- **Standing figures sit small in frame.** A standing body is roughly three
  times taller than it is wide, so at 16:9 it can never fill the box. The
  overhead-reach poses are smaller still. Worth revisiting if a taller surface
  ever becomes an option.
- **Shavasana** is deliberately plain. It reads well enough for a pose this
  simple, but it is a candidate for refinement.
- **The spatial rigs** have no inverse kinematics, so a leg only bends where a
  bend is authored, and the traced path draws behind the whole figure — only the
  body is depth-sorted, and only where `occlude` asks for it. The body itself
  never moves: no pelvis, no spine, and one fixed hip height per rig. A movement
  that needs the trunk to change is not one for this solver.
- **The plank is drawn larger than the tabletop**, a quarter nearer on a lower
  camera, because a movement that never leaves the floor cannot fill a 16:9 frame
  from the tabletop's distance. Side by side in a contact sheet it reads as two
  sizes of athlete. Worth another look if the two families ever run together.
- **The quadruped crunches want a pass in the tuner.** All four read as
  tabletops, which the overhead versions never did, but their end positions were
  settled by rendering stills and by measuring, not by playing them back. They
  also sit at three different cameras — `turn: 30` for the side crunch, `50` for
  the two that cross the midline — which is defensible per movement but looks
  inconsistent across a family performed back to back.
- **Lateral movement** is the flat rig's weakest axis, and the reason the
  spatial rig exists. `childs-pose-side-stretch` shows the reach but not which
  way the hands walk, and the clamshells approximate hip rotation. Both are
  honest about it in their comments, and both are candidates for moving across.

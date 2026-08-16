---
name: author-rig
description: Add a pose rig for an exercise in the GFI timer - camera conventions, the shared bases, verification, and the three failures that are silent.
---

# Authoring a pose rig

An exercise guide is pose data, not a picture. One rigged figure is solved every
frame from joint angles, so the same body appears in every frame of every
movement and the motion is real rather than a crossfade between unrelated
photographs. Read `docs/ARTWORK.md` before starting; this is the working
procedure.

## The backlog is the work list

`AWAITING_RIG` in `src/catalog/artwork.test.ts` names every movement still
waiting for pose data. The assertions compare against it **exactly**, so:

- authoring a rig fails the suite until you delete the name from the list, and
- deleting a name without a working rig also fails.

The list can only shrink. It reaching empty is the definition of done.

## Steps

1. **Read the cue.** Find the exercise in `src/classes/*.ts` and read its
   `shortDescription` and `longDescription`. They say what the body does.
2. **Look up the real movement.** The cue is an instructor's shorthand and is
   often thin or absent. Search for the pose (mat pilates / yoga references) and
   look at how it is actually performed before choosing a camera or angles. A
   guide drawn from a guess at the name is worse than no guide.
3. **Pick the camera.** See below.
4. **Start from a shared base**, not from scratch. `src/rig/rigs.ts` defines
   `PLANK`, `OVERHEAD_PLANK` (`overhead()`), `QUADRUPED` (`quad()`),
   `DOWN_DOG`, `kneelingFold()`, `SIDE_LYING` (`sideLying()`), `STANDING_SIDE`
   (`standingSide()`), `STANDING_FRONT` (`standingFront()`), `squat()`,
   `lunge()`, `SUPINE` (`supine()`), `PRONE` (`prone()`), `CURLED`,
   `HANDS_BEHIND_HEAD`, `bridge()`. A family sharing a base is what keeps the
   library coherent.
5. **Write two or more poses.** The movement falls out of interpolating them;
   do not author the in-between.
6. **Register the name** in `RIG_BY_EXERCISE_NAME` (`src/rig/assignments.ts`).
   Side is never part of the name - `(L)` and `(R)` are stripped before lookup.
7. **Delete the name** from `AWAITING_RIG`, and from `onAnImage` if it was
   there. If that leaves an image file unreferenced, `git rm` it; a test fails
   otherwise.
8. **Verify** (below).

## Camera

The rig is 2D, so the camera is the main authoring decision.

| Movement | Camera |
| --- | --- |
| Sagittal - crunches, bridges, planks, push-ups, lunges | side-on, facing left |
| Lateral - leg circles, rainbows, cross-body work, kicks to the side | overhead |
| Symmetric standing - squats, curls, presses | head-on, with `shoulderSpread` / `hipSpread` |
| Side-lying | front-on, so the top leg's travel is visible |

Choose overhead whenever the travel is lateral: side-on, the movement the
exercise is named for happens entirely into the screen. Prefer whichever
actually shows the movement over whichever is more familiar.

`shoulderSpread` and `hipSpread` are front-view tools only. On a side or supine
pose they push the far limb through the floor.

## Conventions

- **Boxes are 16:9.** Every guide fills the same surface. Reuse `FLOOR_BOX`,
  `OVERHEAD_BOX`, `STANDING_BOX`, `SUPINE_BOX`, `SEATED_BOX`, `SIDE_LYING_BOX`,
  `KNEELING_BOX` where they fit; a bespoke box must keep the ratio.
- **Angles are absolute for the first link, relative after.** `0` is +x
  (screen right), `90` is straight down, `180` is left, `270` is up.
- **A planted foot or hand is an inverse kinematics target**, not an angle.
  Interpolating angles slides a planted limb along the mat or swings it through
  the floor; a target keeps it planted while the body moves.
- **A hold shows the entry.** Two poses - getting into the position, then the
  position - unless the setup is trivial, in which case a single pose with
  `tempoMs: 0` and `ghost: false` is honest.
- **`focus`** highlights the working limb (`armNear` / `armFar` / `legNear` /
  `legFar` only - it is a `LimbId`, not a `JointId`). **`trace`** is the joint
  whose travel is drawn as the path, and it is a `JointId`, so `hip` and
  `shoulder` are valid there.

## The three silent failures

Nothing throws for any of these. Each has a test; read the message it gives.

1. **An angle written the short way round.** Angles interpolate linearly, so a
   head that ends at `8` sweeps backwards through the body to get there. Write
   `368`. No two consecutive poses may differ by more than 180 on `spine`,
   `head` or `facing`.
2. **The wrong inverse-kinematics solution.** A pinned foot has two, and one
   folds the knee downward - a leg bending backwards, sometimes through the
   floor. Flip `ikBend` / `ikBendFar` / `ikArmBend`. On any rig with a `groundY`
   a knee may not sit below both its hip and its ankle.
3. **A target named on one pose only.** `lerpOptionalPoint` returns `a ?? b`, so
   a one-sided target is held for the whole loop and the limb never moves.
   Name a target on every pose or on none.

A fourth, not silent but easy to miss: an IK target positions the **wrist**, and
the hand segment carries on past it. For a hand planted on the mat, set the
third value of the arm chain so the hand lies flat - the first two are solved
from the target and ignored.

## Verifying

```
npm run build     # the ONLY real type check - see below
npm test          # geometry, traps, and the backlog
```

**Never use `npx tsc --noEmit`.** The root `tsconfig.json` is `"files": []` plus
project references, so it checks nothing and exits 0 on code that does not
compile.

Then look at it:

```
node scripts/rig-contact-sheet.mjs <id> <id> ...
```

This is not optional. The tests confirm the figure is inside the frame, on the
mat and moving; they cannot tell you the elbow points the wrong way or that a
side plank reads as lying down. Both have shipped. Render it and look.

A scratch `src/zz.test.ts` that writes joint coordinates to a file is the
fastest way to check specific numbers - `writeFileSync` from a vitest test, then
delete it. Console output from vitest is swallowed.

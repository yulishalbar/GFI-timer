# Exercise artwork coverage

Every catalog exercise must eventually have media that explains the exercise
without relying on its written instructions:

- Static holds and resting poses use one accurate still image.
- Movements use two or more matched frames that cycle as an offline motion
  guide. Circular and multi-stage movements use enough intermediate frames to
  make their path readable.
- Left/right variants share canonical media and use the placement side plus the
  app's directional badge/mirroring behavior.
- A generic pose must not be reused for a different movement.
- The first frame is the reduced-motion fallback.

## Current pass

The first completed batch replaces the misleading generic plank artwork for:

- Straight leg sweep
- Straight leg sweep circles
- Thread the leg and open to the side
- Sliders mountain climbers

The app-ready frames are square, opaque JPEGs so they fill the existing
media surface without video letterboxing or black bars. The source artwork uses
the same athlete direction and camera angle within each sequence. Straight leg
sweep circles uses three positions: neutral, inward, and wide/outward.
Sliders mountain climbers uses four color-coded stages: neutral, blue leg in,
neutral, and orange leg in. The deliberately abstract treatment makes the
alternation clearer than the earlier realistic two-frame pair.

The catalog audit currently finds 58 exercise records without media, excluding
the non-exercise `INTRODUCTION` entry. Complete these in focused visual-review
batches: sliders floor/core, sliders standing/side-body, band quadruped/core,
band standing legs, band upper body, then cooldown poses. After normalization
merges the remaining duplicate side records, each canonical exercise should
need only one asset or one motion pair.

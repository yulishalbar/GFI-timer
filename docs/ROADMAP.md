# Roadmap

Current status: Milestones 1 and 2 are complete. Milestones 3 and 4 are
implemented and GitHub Pages is enabled. Physical iPhone/iPad installation,
offline, and reliability verification are pending. Milestone 5 is in progress.

The next major phase is the static, offline exercise catalog and course model in
[`V2_CATALOG.md`](V2_CATALOG.md). It prepares reusable exercises, embedded
circuits, left/right variants, tags, and local search without adding a backend.

Multi-user authoring, authentication, deployment, AI import, and activity
history now belong to Version 3 and are planned separately in
[`V3_AUTHORING.md`](V3_AUTHORING.md). V1 remains focused on reliable playback
and artwork while the Version 2 catalog boundary is implemented and validated.

## Milestone 1: Foundation — complete

Deliver a runnable but visually simple application.

- Bootstrap React, TypeScript, and Vite.
- Configure strict type checking, linting, Vitest, and formatting.
- Establish responsive global styles and design tokens.
- Define the class schema and validation boundary.
- Add the July 24 Mat Pilates class as the first real class definition.
- Implement and thoroughly test timeline compilation.
- Configure the `/GFI-timer/` production base path.

Exit condition: the app lists the real class and can display its fully
compiled timeline and correct total duration.

## Milestone 2: Timer MVP — complete

- Implement pure timer state and transitions.
- Build the instructor session screen.
- Add current-step and overall progress.
- Add Start, Pause/Resume, Previous, and Next.
- Add current-step seeking with touch and keyboard support.
- Show phase, round, step, exercise, next step, and wall-clock time.
- Add ready and completed states.
- Add unit and browser tests for all controls.

Exit condition: the class can be run from beginning to end accurately in
a desktop/mobile browser, including delayed-clock test cases.

## Milestone 3: Device reliability — device verification pending

- Add versioned session recovery and settings.
- Add local transition/countdown sounds and mute control.
- Add Screen Wake Lock with visibility reacquisition.
- Reconcile background/suspended time without replaying missed cues.
- Add short and expandable descriptions.
- Give every exercise a clear visual, with a reduced-motion-safe fallback
  where movement needs explanation.
- Complete phone and iPad layouts.

Exit condition: an instructor can run and recover a session on physical iPhone
and iPad hardware with documented suspension limitations.

## Milestone 4: Install and deploy — physical verification pending

- Add the web app manifest and complete icon set. — complete
- Add offline precaching and safe update behavior. — complete
- Add the GitHub Actions test/build/deploy workflow. — complete
- Enable GitHub Pages deployment from Actions. — complete
- Test installation and offline launch on physical devices. — pending
- Document the release and rollback procedure. — complete

Exit condition: `main` deploys a tested PWA to
`https://yulishalbar.github.io/GFI-timer/`, and a cached class runs in airplane
mode.

## Milestone 5: Instructor refinements — in progress

### Next: session hierarchy and transition clarity

- Reduce the visual prominence and footprint of real elapsed time and scheduled
  progress. Evaluate compact labels and accessible icons, while keeping both
  values understandable at a glance.
- Make the Up Next area substantially larger and clearer.
- Make exercise images and motion guides larger and more realistic. Provide a
  static image for every static hold and a video or equivalent motion guide for
  every movement, with offline availability and reduced-motion fallbacks.
- Add a distinct final-10-second presentation that shifts focus from the current
  step to what is coming next. Explore collapsing or de-emphasizing current-step
  instructions while enlarging the upcoming-step preview.
- Make the final `3, 2, 1` countdown unmistakable through larger type and/or a
  flashing or pulsing background. Prototype and test the treatment for
  glanceability, distraction, accessibility, and reduced-motion behavior.
- Treat transition steps as preparation for the exercise that follows them. In
  the step before a transition, identify the upcoming rest or transition
  explicitly.
- During a transition, give primary visual emphasis to what follows. For a
  transition into a circuit, preview the names of the exercises in that upcoming
  circuit.
- When adding a supplied class, preserve all existing provided wording exactly.
  Missing instructions may be added, but supplied text must not be rewritten or
  replaced.
- Cover the new final-countdown, transition-preview, responsive layout, media
  fallback, offline-media, and reduced-motion behavior with unit and browser
  tests where applicable.

Session hierarchy, transition-aware previews, the final-10-second state, and
the final-three visual treatment are implemented. Exercise guides have moved from shipped
artwork to the pose rig: one figure shared by the whole catalog, with each
movement authored as pose data. Eight movements are migrated, including the four
slider-plank guides whose crossfaded frames could not convey their motion.
The remaining batches and the coverage audit are tracked in
[`ARTWORK.md`](ARTWORK.md); full coverage and visual review on physical devices
remain pending.

Candidate features, prioritized after real class use:

- `+10 sec` and `-10 sec` adjustments. — complete
- Configurable final countdown.
- Pre-class countdown.
- Landscape dashboard improvements.
- Expand the exercise-art library as more classes are added. — July 31 motion
  guides added; continue with future classes
- Class favorites and most-recent selection.
- Optional phase progress in addition to class progress.
- Session duration summary without long-term tracking.

## Version 2: Exercise catalog and course model — in progress

- Separate reusable exercise content from course structure. — contracts and
  compatibility resolver complete
- Keep circuits embedded inside courses rather than introducing a third entity.
- Reference exercises from course placements with course-owned durations and
  explicit rests.
- Represent left/right movements once and select the side at each placement.
- Add accessible `L`/`R` directional badges and safe media mirroring rules.
- Add controlled tags for equipment, body area, modality, focus, and movement
  type.
- Add separate searchable Exercise Library and Course Library views.
- Migrate existing static classes with step-for-step compiled equivalence and
  no offline or session-timer regression.
- Establish stable serialization and a repository boundary for Version 3.

All built-in courses are now catalog-backed. Explicit V1 definitions remain under
separate stable IDs as the source each catalog is derived from and as the
equivalence baseline; they are not listed in the picker. Every migration has
normalized left/right placements and accessible directional badges, and the
Sliders and Band migrations additionally lock timeline and guidance equivalence
against their originals.

The July 24 and July 31 migrations also applied the merge policy in
[`EXERCISE_MERGING.md`](EXERCISE_MERGING.md): a movement the pool already had is
referenced, not copied. That is what took 198 authored exercise records down to
138 distinct movements, 79 of them rigged. Next: author rigs for the 57 the two
classes introduced — see the backlog in [`ARTWORK.md`](ARTWORK.md) — then finish
tag specificity and media policy.

Local discovery is also available as an early pilot: the picker has separate
Courses and Exercises tabs with offline text search and tag filters. All courses
are searchable, and the Exercise library is the merged catalog of all four.

Detailed slices and exit criteria are in [`V2_CATALOG.md`](V2_CATALOG.md).

Exit condition: every built-in course is compiled from reusable exercise
references, side variants are clear at a glance, local search works offline,
and playback remains behaviorally equivalent to Version 1.

## Version 3: Multi-user authoring — planned

Add authentication, remote persistence, exercise/course authoring, media
uploads, external-AI JSON import, activity history, and production operations
on top of the Version 2 catalog boundary.

Detailed scope is in [`V3_AUTHORING.md`](V3_AUTHORING.md).

## Later: Spotify controls

Keep music independent until the core timer has been used successfully in real
classes.

Potential scope:

- Connect/disconnect a Spotify account.
- Display current track and connection/device state.
- Manually play, pause, skip next, and skip previous.
- Select an active Spotify Connect device or playlist if needed.

Before implementation:

1. Recheck current Spotify APIs, Premium requirements, quotas, and developer
   policies.
2. Register a Spotify application and configure the exact GitHub Pages redirect
   URI.
3. Use OAuth Authorization Code with PKCE; do not ship a client secret.
4. Design token storage and expiry behavior for a static application.
5. Decide whether the web integration is reliable enough on the instructor's
   devices.
6. Keep controls manual unless automated synchronization is clearly permitted.

If reliable background music control becomes important, evaluate a native iOS
app using Spotify's iOS SDK. That decision should also account for installation,
signing, maintenance, and whether native background behavior is actually
required.

## Native-app decision trigger

Remain a PWA unless real use demonstrates a hard requirement that the web
platform cannot meet. Reconsider native development if one or more of these are
essential:

- Guaranteed cues while locked or backgrounded.
- Deeper lock-screen or system media integration.
- Reliable native Spotify app remote control.
- App Store distribution to other instructors.
- Platform features unavailable or unreliable in the installed PWA.

If native packaging is needed but the UI and timer engine remain suitable,
first evaluate a thin Capacitor wrapper. Keep domain logic platform-neutral so
a Swift rewrite is not the only option.

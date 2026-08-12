# Roadmap

Current status: Milestones 1 and 2 are complete. Milestones 3 and 4 are
implemented and GitHub Pages is enabled. Physical iPhone/iPad installation,
offline, and reliability verification are pending. Milestone 5 is in progress.

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
- Add clear SVG exercise illustrations with selective reduced-motion-safe
  animation where movement needs explanation.
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
the final-three visual treatment are implemented. Expanded media coverage and
visual review on physical devices remain pending.

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

# Roadmap

Current status: Milestone 1 is complete. Milestone 2, the live timer, is next.

## Milestone 1: Foundation — complete

Deliver a runnable but visually simple application.

- Bootstrap React, TypeScript, and Vite.
- Configure strict type checking, linting, Vitest, and formatting.
- Establish responsive global styles and design tokens.
- Define the class schema and validation boundary.
- Add the documented Core Basics example.
- Implement and thoroughly test timeline compilation.
- Configure the `/GFI-timer/` production base path.

Exit condition: the app lists the sample class and can display its fully
compiled timeline and correct total duration.

## Milestone 2: Timer MVP

- Implement pure timer state and transitions.
- Build the instructor session screen.
- Add current-step and overall progress.
- Add Start, Pause/Resume, Previous, and Next.
- Add current-step seeking with touch and keyboard support.
- Show phase, round, step, exercise, next step, and wall-clock time.
- Add ready and completed states.
- Add unit and browser tests for all controls.

Exit condition: the sample class can be run from beginning to end accurately in
a desktop/mobile browser, including delayed-clock test cases.

## Milestone 3: Device reliability

- Add versioned session recovery and settings.
- Add local transition/countdown sounds and mute control.
- Add Screen Wake Lock with visibility reacquisition.
- Reconcile background/suspended time without replaying missed cues.
- Add short and expandable descriptions.
- Add initial static SVG exercise illustrations.
- Complete phone and iPad layouts.

Exit condition: an instructor can run and recover a session on physical iPhone
and iPad hardware with documented suspension limitations.

## Milestone 4: Install and deploy

- Add the web app manifest and complete icon set.
- Add offline precaching and safe update behavior.
- Add the GitHub Actions test/build/deploy workflow.
- Enable GitHub Pages deployment from Actions.
- Test installation and offline launch on physical devices.
- Document the release and rollback procedure.

Exit condition: `main` deploys a tested PWA to
`https://yulishalbar.github.io/GFI-timer/`, and a cached class runs in airplane
mode.

## Milestone 5: Instructor refinements

Candidate features, prioritized after real class use:

- `+10 sec` and `-10 sec` adjustments.
- Configurable final countdown.
- Pre-class countdown.
- Landscape dashboard improvements.
- Larger exercise art or lightweight SVG/CSS motion.
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

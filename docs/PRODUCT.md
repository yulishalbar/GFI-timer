# Product specification

## Vision

GFI Timer is a reliable, glanceable class clock operated by a fitness
instructor from an iPhone or iPad. It guides the instructor through a preloaded
schedule containing phases, repeated rounds, exercises, and rests.

The instructor should be able to begin a class, put the device down, understand
the current state from several feet away, and make quick corrections without
leaving the session screen.

## Primary user and environment

- One instructor using their own device.
- Primarily an iPhone; iPad is also supported.
- Used in portrait or landscape orientation during a live class.
- Often running beside Spotify or another music source.
- Connectivity may be poor, so the core session must not need a network.
- No public accounts, sharing, or in-app class editor are required.

## Terminology

- **Class:** The complete scheduled workout.
- **Phase:** A named section such as Intro, Warmup, Core, or Cooldown.
- **Round:** One pass through a repeated group of entries.
- **Step:** A timed exercise or rest in the compiled class timeline.
- **Session:** A running instance of a class.
- **Current-step progress:** Elapsed time within the active step.
- **Overall progress:** Elapsed scheduled time across the entire class.

## MVP experience

### Before the class

The app opens to a class picker. Each card shows the class name, approximate
duration, and number of phases. Selecting a class shows a summary and a large
Start button.

Starting a class is the user gesture that also enables audio cues and requests
a screen wake lock. If the wake lock is unavailable, the session still works
and the app presents a discreet warning.

### During the class

The session screen shows:

- Current wall-clock time.
- Playback state: ready, running, paused, or complete.
- Current phase.
- Current round and round count when inside a repeated group.
- Current step and step count within the relevant phase or round.
- Exercise or rest name.
- A large current-step countdown.
- Draggable current-step progress.
- Overall elapsed time, remaining time, and progress.
- The next exercise or rest.
- A short exercise description, when supplied.
- An expandable longer description, when supplied.
- Optional exercise illustration.

Primary controls are Previous, Pause/Resume, and Next. They must remain visible
without scrolling. Secondary actions may include Restart step, add or subtract
10 seconds, and End class, but they must not crowd the MVP interface.

### Transition behavior

- Reaching zero automatically starts the next step.
- Exercise, rest, final countdown, and class-complete cues are distinguishable.
- The next-step preview updates immediately after navigation.
- Completing the last step enters a completed state rather than wrapping.
- Previous goes to the beginning of the previous step.
- Next goes to the beginning of the next step.
- Dragging the step progress pauses advancement while dragging. Releasing it
  keeps the prior running/paused state and uses the selected position.
- Pause freezes both current-step and overall progress.

### Recovery

The active session is stored locally. If the page reloads or is reopened, the
app offers to resume or discard it. A running session reconciles its position
from stored timestamps. It does not attempt to replay audio cues missed while
the app was suspended.

## Accessibility and presentation

- Large, high-contrast text and touch targets.
- Color is never the only indication of exercise, rest, pause, or completion.
- Controls have accessible names and visible focus states.
- Seeking is usable by touch and keyboard.
- Layout respects iPhone and iPad safe areas.
- Motion is optional and respects reduced-motion settings.
- Essential status remains understandable if optional images fail to load.
- Prefer a dark presentation suitable for a studio, with sufficient contrast.

## MVP scope

- Multiple preloaded class definitions.
- Nested phases and repeated groups.
- Exercises and explicit rests.
- Accurate start, pause, resume, seek, previous, and next behavior.
- Current and overall progress.
- Audio cues.
- Short and expandable descriptions.
- Optional static exercise illustrations.
- Session recovery.
- Installable, offline-capable iPhone/iPad PWA.
- Automated deployment to GitHub Pages.

## Not in the MVP

- In-app class authoring or editing.
- Accounts, synchronization, or a server.
- Attendance, health data, or workout history.
- Spotify authentication or playback controls.
- Automatic music synchronization.
- Rich character animation.
- Apple App Store distribution.
- Guaranteed cues while the device is locked or the app is suspended.

## Acceptance criteria

The MVP is complete when:

1. A class containing phases, nested repeats, exercises, and rests compiles and
   runs in the documented order.
2. Scheduled totals, step progress, and overall progress remain accurate after
   pause, resume, seeking, delayed renders, and foreground restoration.
3. Previous, Next, and progress seeking have the documented semantics.
4. A reload can recover an active session or discard it safely.
5. The installed PWA starts and completes a previously cached class without a
   network connection.
6. All essential information and controls fit without scrolling on the agreed
   minimum iPhone viewport.
7. The iPad layout uses additional space without changing session behavior.
8. Audio works after the explicit Start interaction and can be muted.
9. Adding a class requires only a class definition and optional media assets.
10. Timer/compiler unit tests and critical session browser tests pass.

## Open product decisions

Resolve these during the first UI prototype rather than blocking foundation
work:

- Minimum supported iPhone viewport and iOS version.
- Whether the main countdown shows elapsed or remaining time by default.
- Whether `+10 sec` and `-10 sec` belong in the MVP.
- Whether a short pre-class countdown is desirable.
- Exact cue sounds and final-countdown cadence.

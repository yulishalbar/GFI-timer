export type AudioCue = "exercise" | "rest" | "countdown" | "complete";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioContextConstructor = window.AudioContext;
  if (AudioContextConstructor === undefined) {
    return null;
  }
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

export function initializeAudioCues(): void {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    void context.resume();
  }
}

function tone(context: AudioContext, frequency: number, startsAt: number, duration: number): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.18, startsAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

export function playAudioCue(cue: AudioCue): void {
  const context = getAudioContext();
  if (context === null || context.state !== "running") {
    return;
  }
  const now = context.currentTime;
  if (cue === "countdown") {
    tone(context, 720, now, 0.1);
  } else if (cue === "rest") {
    tone(context, 440, now, 0.18);
    tone(context, 540, now + 0.12, 0.18);
  } else if (cue === "exercise") {
    tone(context, 660, now, 0.16);
    tone(context, 880, now + 0.12, 0.2);
  } else {
    tone(context, 660, now, 0.18);
    tone(context, 820, now + 0.16, 0.18);
    tone(context, 990, now + 0.32, 0.3);
  }
}

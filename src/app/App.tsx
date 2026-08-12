import { useEffect, useMemo, useState } from "react";
import { availableClasses } from "../classes";
import { ClassPicker } from "../components/ClassPicker";
import { ClassSummary } from "../components/ClassSummary";
import { PwaUpdatePrompt } from "../components/PwaUpdatePrompt";
import { SessionScreen } from "../components/SessionScreen";
import { RecoveryPrompt } from "../components/RecoveryPrompt";
import type { SessionInitialization } from "../hooks/useSessionTimer";
import type { CompiledClass } from "../domain/timeline";
import {
  clearStoredSession,
  loadStoredSession,
  restoreTimerState
} from "../persistence/session-store";
import { loadStoredSettings, saveStoredSettings } from "../persistence/settings-store";
import { initializeAudioCues } from "../lib/audio-cues";
import { usePwaLifecycle } from "../hooks/usePwaLifecycle";

type RecoveryState =
  | { status: "none" }
  | { status: "invalid"; message: string }
  | {
      status: "available";
      fitnessClass: CompiledClass;
      initialization: SessionInitialization;
    };

function loadRecoveryState(): RecoveryState {
  const nowEpochMs = Date.now();
  const stored = loadStoredSession();
  if (stored.status === "empty") {
    return { status: "none" };
  }
  if (stored.status === "invalid") {
    return { status: "invalid", message: "The saved data is invalid or from an unsupported version." };
  }

  const fitnessClass = availableClasses.find(
    (candidate) => candidate.definition.id === stored.session.classId
  );
  if (
    fitnessClass === undefined ||
    fitnessClass.definition.version !== stored.session.classVersion
  ) {
    return {
      status: "invalid",
      message: "The class changed after this session was saved, so it cannot be resumed safely."
    };
  }

  const timerState = restoreTimerState(stored.session, fitnessClass.steps, nowEpochMs);
  if (timerState === null) {
    return { status: "invalid", message: "The saved step is not valid for this class." };
  }
  return {
    status: "available",
    fitnessClass,
    initialization: {
      startedAtEpochMs: stored.session.startedAtEpochMs,
      initializedAtEpochMs: nowEpochMs,
      elapsedMsFloor: stored.session.elapsedMsFloor,
      timerState
    }
  };
}

export function App() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [sessionInitialization, setSessionInitialization] =
    useState<SessionInitialization | null>(null);
  const [recovery, setRecovery] = useState<RecoveryState>(loadRecoveryState);
  const [settings, setSettings] = useState(loadStoredSettings);
  const pwa = usePwaLifecycle();
  const selectedClass = useMemo(
    () => availableClasses.find((fitnessClass) => fitnessClass.definition.id === selectedClassId),
    [selectedClassId]
  );

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    let secondFrameId = 0;
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    resetScroll();
    const frameId = window.requestAnimationFrame(() => {
      resetScroll();
      secondFrameId = window.requestAnimationFrame(resetScroll);
    });
    window.addEventListener("pageshow", resetScroll);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(secondFrameId);
      window.removeEventListener("pageshow", resetScroll);
    };
  }, [recovery.status, selectedClassId]);

  if (selectedClass && sessionInitialization !== null) {
    return (
      <div className="app-frame app-frame--session">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SessionScreen
          fitnessClass={selectedClass}
          initialization={sessionInitialization}
          soundEnabled={settings.soundEnabled}
          onSoundToggle={() => {
            if (!settings.soundEnabled) {
              initializeAudioCues();
            }
            const updated = { ...settings, soundEnabled: !settings.soundEnabled };
            setSettings(updated);
            saveStoredSettings(updated);
          }}
          onExit={() => {
            clearStoredSession();
            setSessionInitialization(null);
          }}
        />
        <PwaUpdatePrompt
          isApplying={pwa.isApplyingUpdate}
          isDeferred
          isVisible={pwa.isUpdateAvailable}
          onDismiss={pwa.dismissUpdate}
          onUpdate={() => void pwa.applyUpdate()}
        />
      </div>
    );
  }

  const returnToPicker = () => {
    setSessionInitialization(null);
    setSelectedClassId(null);
  };

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <button className="brand" type="button" onClick={returnToPicker}>
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span>GFI Timer</span>
        </button>
        <span className="offline-badge" aria-live="polite">
          <span aria-hidden="true" />
          {pwa.isOfflineReady ? "Offline ready" : "Preparing offline"}
        </span>
      </header>

      <PwaUpdatePrompt
        isApplying={pwa.isApplyingUpdate}
        isDeferred={false}
        isVisible={pwa.isUpdateAvailable}
        onDismiss={pwa.dismissUpdate}
        onUpdate={() => void pwa.applyUpdate()}
      />

      {recovery.status === "available" ? (
        <RecoveryPrompt
          classTitle={recovery.fitnessClass.definition.title}
          message={
            recovery.initialization.timerState?.status === "complete"
              ? "The scheduled class is complete, but its real elapsed timer is still running. Resume to stop it manually."
              : "Continue from the saved step. Real elapsed time includes the time since you originally started."
          }
          onResume={() => {
            if (settings.soundEnabled) {
              initializeAudioCues();
            }
            setSelectedClassId(recovery.fitnessClass.definition.id);
            setSessionInitialization(recovery.initialization);
            setRecovery({ status: "none" });
          }}
          onDiscard={() => {
            clearStoredSession();
            setRecovery({ status: "none" });
          }}
        />
      ) : recovery.status === "invalid" ? (
        <RecoveryPrompt
          message={recovery.message}
          onDiscard={() => {
            clearStoredSession();
            setRecovery({ status: "none" });
          }}
        />
      ) : selectedClass ? (
        <ClassSummary
          fitnessClass={selectedClass}
          onBack={returnToPicker}
          onStart={() => {
            if (settings.soundEnabled) {
              initializeAudioCues();
            }
            clearStoredSession();
            const nowEpochMs = Date.now();
            setSessionInitialization({
              startedAtEpochMs: nowEpochMs,
              initializedAtEpochMs: nowEpochMs
            });
          }}
        />
      ) : (
        <ClassPicker classes={availableClasses} onSelect={setSelectedClassId} />
      )}

      <footer className="app-footer">
        <span>Built for the room, not the wrist.</span>
        <span>Version 0.1</span>
      </footer>
    </div>
  );
}

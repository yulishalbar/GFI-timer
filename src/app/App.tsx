import { useMemo, useState } from "react";
import { availableClasses } from "../classes";
import { ClassPicker } from "../components/ClassPicker";
import { ClassSummary } from "../components/ClassSummary";
import { SessionScreen } from "../components/SessionScreen";

export function App() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const selectedClass = useMemo(
    () => availableClasses.find((fitnessClass) => fitnessClass.definition.id === selectedClassId),
    [selectedClassId]
  );

  if (selectedClass && sessionStartedAt !== null) {
    return (
      <div className="app-frame app-frame--session">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SessionScreen
          fitnessClass={selectedClass}
          startedAtEpochMs={sessionStartedAt}
          onExit={() => setSessionStartedAt(null)}
        />
      </div>
    );
  }

  const returnToPicker = () => {
    setSessionStartedAt(null);
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
        <span className="offline-badge">
          <span aria-hidden="true" />
          Offline ready
        </span>
      </header>

      {selectedClass ? (
        <ClassSummary
          fitnessClass={selectedClass}
          onBack={returnToPicker}
          onStart={() => setSessionStartedAt(Date.now())}
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

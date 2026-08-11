import type { CompiledClass } from "../domain/timeline";
import { formatMinutes } from "../lib/format-duration";

interface ClassPickerProps {
  classes: readonly CompiledClass[];
  onSelect: (classId: string) => void;
}

export function ClassPicker({ classes, onSelect }: ClassPickerProps) {
  return (
    <main className="page-shell" id="main-content">
      <section className="hero" aria-labelledby="class-picker-title">
        <p className="eyebrow">Instructor console</p>
        <h1 id="class-picker-title">Choose today&apos;s class</h1>
        <p className="hero__intro">
          Preloaded schedules keep every phase, round, exercise, and rest on time.
        </p>
      </section>

      <section className="class-grid" aria-label="Available fitness classes">
        {classes.map((fitnessClass) => (
          <article className="class-card" key={fitnessClass.definition.id}>
            <div className="class-card__accent" aria-hidden="true" />
            <div className="class-card__body">
              <div className="class-card__meta">
                <span>{formatMinutes(fitnessClass.totalDurationMs)}</span>
                <span>{fitnessClass.phases.length} phases</span>
                <span>{fitnessClass.steps.length} steps</span>
              </div>
              <h2>{fitnessClass.definition.title}</h2>
              {fitnessClass.definition.description ? (
                <p>{fitnessClass.definition.description}</p>
              ) : null}
              <div className="phase-pills" aria-label="Class phases">
                {fitnessClass.phases.map((phase) => (
                  <span key={phase.id}>{phase.name}</span>
                ))}
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => onSelect(fitnessClass.definition.id)}
              >
                View class
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

import { useMemo, useState } from "react";
import type { CompiledClass } from "../domain/timeline";
import { formatDuration, formatMinutes } from "../lib/format-duration";
import { ExerciseMedia } from "./ExerciseMedia";
import { ExerciseSideBadge } from "./ExerciseSideBadge";

interface ClassSummaryProps {
  fitnessClass: CompiledClass;
  onBack: () => void;
  onStart: () => void;
}

export function ClassSummary({ fitnessClass, onBack, onStart }: ClassSummaryProps) {
  const detailStepIds = useMemo(
    () =>
      fitnessClass.steps
        .filter(
          (step) =>
            step.longDescription !== undefined ||
            step.illustration !== undefined ||
            step.motionIllustrations !== undefined
        )
        .map((step) => step.runtimeId),
    [fitnessClass.steps]
  );
  const [expandedStepIds, setExpandedStepIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const allDetailsExpanded = detailStepIds.every((runtimeId) =>
    expandedStepIds.has(runtimeId)
  );

  const toggleStepDetails = (runtimeId: string) => {
    setExpandedStepIds((current) => {
      const next = new Set(current);
      if (next.has(runtimeId)) {
        next.delete(runtimeId);
      } else {
        next.add(runtimeId);
      }
      return next;
    });
  };

  return (
    <main className="page-shell page-shell--summary" id="main-content">
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span>
        All classes
      </button>

      <section className="summary-hero" aria-labelledby="class-title">
        <div>
          <p className="eyebrow">Class overview</p>
          <h1 id="class-title">{fitnessClass.definition.title}</h1>
          {fitnessClass.definition.description ? <p>{fitnessClass.definition.description}</p> : null}
        </div>
        <div className="summary-duration" aria-label={`${formatMinutes(fitnessClass.totalDurationMs)} total`}>
          <strong>{formatDuration(fitnessClass.totalDurationMs, { padMinutes: true })}</strong>
          <span>Total time</span>
        </div>
      </section>

      <div className="start-panel">
        <span className="build-notice__dot" aria-hidden="true" />
        <div>
          <strong>Schedule ready</strong>
          <span>The timer begins immediately when you start.</span>
        </div>
        <button className="primary-button" type="button" onClick={onStart}>
          Start class
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <section className="timeline" aria-labelledby="schedule-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Full sequence</p>
            <h2 id="schedule-title">Class schedule</h2>
          </div>
          <div className="section-heading__actions">
            <span>{fitnessClass.steps.length} timed steps</span>
            <button
              type="button"
              aria-expanded={allDetailsExpanded}
              onClick={() =>
                setExpandedStepIds(allDetailsExpanded ? new Set() : new Set(detailStepIds))
              }
            >
              {allDetailsExpanded ? "Collapse all pose details" : "Expand all pose details"}
            </button>
          </div>
        </div>

        {fitnessClass.phases.map((phase) => {
          const phaseSteps = fitnessClass.steps.filter((step) => step.phase.id === phase.id);
          return (
            <section className="phase-section" key={phase.id} aria-labelledby={`phase-${phase.id}`}>
              <header className="phase-section__header">
                <span className="phase-number">{phase.index.toString().padStart(2, "0")}</span>
                <div>
                  <h3 id={`phase-${phase.id}`}>{phase.name}</h3>
                  <p>
                    {formatMinutes(phase.durationMs)} · {phase.stepCount} steps
                  </p>
                </div>
              </header>

              <ol className="step-list">
                {phaseSteps.map((step) => (
                  <li className={`step-row step-row--${step.kind}`} key={step.runtimeId}>
                    <span
                      className="step-row__index"
                      aria-label={step.kind === "rest" ? "Transition" : `Step ${step.step.index}`}
                    >
                      {step.kind === "rest" ? "↳" : step.step.index}
                    </span>
                    <div className="step-row__content">
                      <div className="step-row__title">
                        <strong>{step.name}</strong>
                        <ExerciseSideBadge side={step.exerciseReference?.side} />
                        {step.round ? (
                          <span>
                            Round {step.round.index}/{step.round.count}
                          </span>
                        ) : null}
                      </div>
                      {step.shortDescription ? <p>{step.shortDescription}</p> : null}
                      {step.longDescription || step.illustration || step.motionIllustrations ? (
                        <button
                          className="pose-details-toggle"
                          type="button"
                          aria-expanded={expandedStepIds.has(step.runtimeId)}
                          aria-controls={`details-${step.runtimeId.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                          onClick={() => toggleStepDetails(step.runtimeId)}
                        >
                          {expandedStepIds.has(step.runtimeId)
                            ? "Hide pose details"
                            : "Show pose details"}
                        </button>
                      ) : null}
                      {expandedStepIds.has(step.runtimeId) ? (
                        <div
                          className="pose-details"
                          id={`details-${step.runtimeId.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                        >
                          <ExerciseMedia step={step} />
                          {step.longDescription ? <p>{step.longDescription}</p> : null}
                        </div>
                      ) : null}
                    </div>
                    <time dateTime={`PT${step.durationMs / 1_000}S`}>
                      {formatDuration(step.durationMs, { padMinutes: true })}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </section>
    </main>
  );
}

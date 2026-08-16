import { useMemo, useState } from "react";
import type { ExerciseCatalog, ExerciseDefinition, TagDefinition } from "../domain/catalog-definition";
import { distinctMovements, filterLibraryItems } from "../domain/library-search";
import type { CompiledClass } from "../domain/timeline";
import { formatMinutes } from "../lib/format-duration";
import { getRig } from "../rig/rigs";
import { ExerciseRig } from "./ExerciseRig";
import { MotionGuide } from "./MotionGuide";

interface ClassPickerProps {
  classes: readonly CompiledClass[];
  exerciseCatalog: ExerciseCatalog;
  courseTagsById: Readonly<Record<string, readonly string[]>>;
  onSelect: (classId: string) => void;
}

type LibraryTab = "courses" | "exercises";

const CATEGORY_LABELS: Readonly<Record<TagDefinition["category"], string>> = {
  "body-area": "Body area",
  modality: "Type",
  equipment: "Equipment",
  "movement-type": "Position",
  focus: "Focus"
};

const exerciseRig = (exercise: ExerciseDefinition) => (exercise.rig ? getRig(exercise.rig) : undefined);

function mediaLabel(exercise: ExerciseDefinition): string {
  const rig = exerciseRig(exercise);
  if (rig) return rig.tempoMs > 0 ? "Motion guide" : "Pose guide";
  if (exercise.motionIllustrations) return "Motion guide";
  return exercise.illustration ? "Static art" : "Text guide";
}

/** Same resolution order as ExerciseMedia: rig, then motion frames, then a still. */
function LibraryCardMedia({ exercise }: { exercise: ExerciseDefinition }) {
  const rig = exerciseRig(exercise);
  if (rig) return <ExerciseRig rig={rig} name={exercise.name} />;
  if (exercise.motionIllustrations) {
    return <MotionGuide frames={exercise.motionIllustrations} name={exercise.name} />;
  }
  return exercise.illustration ? (
    <img src={`${import.meta.env.BASE_URL}${exercise.illustration}`} alt={`Illustration for ${exercise.name}`} />
  ) : null;
}

export function ClassPicker({
  classes,
  exerciseCatalog,
  courseTagsById,
  onSelect
}: ClassPickerProps) {
  const [tab, setTab] = useState<LibraryTab>("courses");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<ReadonlySet<string>>(() => new Set());
  // The library lists movements, not catalog records: the same movement can be
  // stored once per course and once per side.
  const movements = useMemo(
    () => distinctMovements(exerciseCatalog.exercises),
    [exerciseCatalog.exercises]
  );
  const usedTagIds = useMemo(() => new Set(
    tab === "courses"
      ? classes.flatMap((fitnessClass) => [...(courseTagsById[fitnessClass.definition.id] ?? [])])
      : movements.flatMap((exercise) => exercise.tags)
  ), [classes, courseTagsById, movements, tab]);
  const visibleTags = exerciseCatalog.tags.filter((tag) => usedTagIds.has(tag.id));
  const groupedTags = Object.entries(visibleTags.reduce<Record<string, TagDefinition[]>>(
    (groups, tag) => {
      (groups[tag.category] ??= []).push(tag);
      return groups;
    },
    {}
  ));

  const courseResults = filterLibraryItems(
    classes.map((fitnessClass) => ({
      fitnessClass,
      searchText: [
        fitnessClass.definition.title,
        fitnessClass.definition.description ?? "",
        ...fitnessClass.phases.map((phase) => phase.name)
      ].join(" "),
      tags: courseTagsById[fitnessClass.definition.id] ?? []
    })),
    exerciseCatalog.tags,
    query,
    selectedTags
  );
  const exerciseResults = filterLibraryItems(
    movements.map((exercise) => ({
      exercise,
      searchText: [exercise.name, exercise.shortDescription ?? "", exercise.longDescription ?? ""].join(" "),
      tags: exercise.tags
    })),
    exerciseCatalog.tags,
    query,
    selectedTags
  );

  const selectTab = (nextTab: LibraryTab) => {
    setTab(nextTab);
    setQuery("");
    setSelectedTags(new Set());
  };
  const toggleTag = (tagId: string) => {
    setSelectedTags((current) => {
      const next = new Set(current);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  return (
    <main className="page-shell" id="main-content">
      {/*
        No hero. The eyebrow, title and intro said nothing the tabs below do not
        already say, and on a phone they pushed the class list off the first
        screen. The heading survives for screen readers only.
      */}
      <h1 className="visually-hidden">Choose today&apos;s class</h1>

      <nav className="library-tabs" aria-label="Library">
        <button type="button" aria-pressed={tab === "courses"} onClick={() => selectTab("courses")}>
          Courses <span>{classes.length}</span>
        </button>
        <button type="button" aria-pressed={tab === "exercises"} onClick={() => selectTab("exercises")}>
          Exercises <span>{movements.length}</span>
        </button>
      </nav>

      <section className="library-search" aria-label={`${tab === "courses" ? "Course" : "Exercise"} search and filters`}>
        <label>
          <span>Search {tab}</span>
          <input
            type="search"
            value={query}
            placeholder={tab === "courses" ? "Search by name, equipment, or focus" : "Search by movement, body area, or type"}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="library-filters">
          {groupedTags.map(([category, tags]) => (
            <fieldset key={category}>
              <legend>{CATEGORY_LABELS[category as TagDefinition["category"]]}</legend>
              <div>
                {tags?.map((tag) => (
                  <button
                    type="button"
                    aria-pressed={selectedTags.has(tag.id)}
                    onClick={() => toggleTag(tag.id)}
                    key={tag.id}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {selectedTags.size > 0 || query ? (
          <button className="library-clear" type="button" onClick={() => {
            setQuery("");
            setSelectedTags(new Set());
          }}>
            Clear search and filters
          </button>
        ) : null}
      </section>

      {tab === "courses" ? (
        <section className="class-grid" aria-label="Available fitness classes">
          {courseResults.map(({ fitnessClass, tags }) => (
            <article className="class-card" key={fitnessClass.definition.id}>
              <div className="class-card__accent" aria-hidden="true" />
              <div className="class-card__body">
                <div className="class-card__meta">
                  <span>{formatMinutes(fitnessClass.totalDurationMs)}</span>
                  <span>{fitnessClass.phases.length} phases</span>
                  <span>{fitnessClass.steps.length} steps</span>
                </div>
                <h2>{fitnessClass.definition.title}</h2>
                {fitnessClass.definition.description ? <p>{fitnessClass.definition.description}</p> : null}
                <div className="phase-pills" aria-label="Course tags">
                  {tags.map((tagId) => <span key={tagId}>{exerciseCatalog.tags.find((tag) => tag.id === tagId)?.label ?? tagId}</span>)}
                </div>
                <button className="primary-button" type="button" onClick={() => onSelect(fitnessClass.definition.id)}>
                  View class <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
          {courseResults.length === 0 ? <p className="library-empty">No courses match this search.</p> : null}
        </section>
      ) : (
        <section className="exercise-library-grid" aria-label="Exercise library">
          {exerciseResults.map(({ exercise, tags }) => (
            <article className="exercise-library-card" key={exercise.id}>
              <LibraryCardMedia exercise={exercise} />
              <div>
                <div className="exercise-library-card__meta">
                  <span>{exercise.sideSupport === "left-right" ? "← L / R →" : "No side variation"}</span>
                  <span>{mediaLabel(exercise)}</span>
                </div>
                <h2>{exercise.name}</h2>
                {exercise.longDescription || exercise.shortDescription ? <p>{exercise.longDescription ?? exercise.shortDescription}</p> : null}
                <div className="phase-pills" aria-label={`Tags for ${exercise.name}`}>
                  {tags.map((tagId) => <span key={tagId}>{exerciseCatalog.tags.find((tag) => tag.id === tagId)?.label ?? tagId}</span>)}
                </div>
              </div>
            </article>
          ))}
          {exerciseResults.length === 0 ? <p className="library-empty">No exercises match this search.</p> : null}
        </section>
      )}
    </main>
  );
}

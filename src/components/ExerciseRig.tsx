import { useEffect, useMemo, useRef, useState } from "react";
import { buildFrame, hasMotion, tracePoints, type RigDefinition, type Shape } from "../rig/frame";

interface ExerciseRigProps {
  rig: RigDefinition;
  name: string;
  mirrored?: boolean;
  decorative?: boolean;
}

const format = ([x, y]: readonly [number, number]): string => `${x.toFixed(1)} ${y.toFixed(1)}`;

const pointsToPath = (points: readonly (readonly [number, number])[], close = false): string =>
  `${points.map((point, index) => `${index ? "L" : "M"}${format(point)}`).join("")}${close ? "Z" : ""}`;

function ShapeNode({ shape }: { shape: Shape }): React.ReactElement {
  const className = `rig__${shape.role}`;
  switch (shape.kind) {
    case "line":
      return <path className={className} d={`M${format(shape.from)}L${format(shape.to)}`} strokeWidth={shape.width} />;
    case "dot":
      return <circle className={`${className} rig--filled`} cx={shape.at[0]} cy={shape.at[1]} r={shape.radius} />;
    case "disc":
      return <ellipse className={`${className} rig--filled`} cx={shape.at[0]} cy={shape.at[1]} rx={shape.rx} ry={shape.ry} />;
    case "polyline":
      return (
        <path
          className={className}
          d={pointsToPath(shape.points)}
          strokeWidth={shape.width}
          strokeDasharray={shape.dashed ? "5 6" : undefined}
        />
      );
    case "polygon":
      return <path className={`${className} rig--filled`} d={pointsToPath(shape.points, true)} strokeWidth={shape.width} />;
    case "curve":
      return (
        <path
          className={className}
          d={`M${format(shape.from)}Q${format(shape.control)} ${format(shape.to)}`}
          strokeWidth={shape.width}
        />
      );
  }
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Drives the loop.
 *
 * Only animates while the guide is on screen and the tab is visible, so a
 * summary listing many exercises does not run a solver per row in the
 * background. Reduced motion holds the pose of greatest contrast, where the
 * start-pose ghost and the derived path still describe the movement.
 */
function useLoopPhase(tempoMs: number, host: React.RefObject<SVGSVGElement | null>): number {
  // Reduced motion settles on the pose of greatest contrast up front rather
  // than starting at rest and moving once.
  const [phase, setPhase] = useState(() => (tempoMs > 0 && prefersReducedMotion() ? 0.5 : 0));

  useEffect(() => {
    if (tempoMs <= 0 || prefersReducedMotion()) return;

    const element = host.current;
    let frame = 0;
    let start: number | null = null;
    let visible = true;

    const tick = (timestamp: number): void => {
      if (start === null) start = timestamp;
      setPhase(((timestamp - start) % tempoMs) / tempoMs);
      frame = window.requestAnimationFrame(tick);
    };

    const play = (): void => {
      if (frame || !visible || document.hidden) return;
      start = null;
      frame = window.requestAnimationFrame(tick);
    };
    const pause = (): void => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = (): void => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | undefined;
    if (element && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) play();
        else pause();
      });
      observer.observe(element);
    } else {
      play();
    }

    return () => {
      pause();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tempoMs, host]);

  return phase;
}

export function ExerciseRig({ rig, name, mirrored = false, decorative = false }: ExerciseRigProps) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useLoopPhase(rig.tempoMs, ref);

  // The traced path depends only on the pose data, so it is solved once per rig
  // rather than on every frame.
  const path = useMemo(
    () => (rig.trace && hasMotion(rig) ? tracePoints(rig, rig.trace) : undefined),
    [rig]
  );
  const shapes = useMemo(() => buildFrame(rig, phase, path), [rig, phase, path]);

  return (
    <svg
      ref={ref}
      className={`exercise-rig${mirrored ? " exercise-rig--mirrored" : ""}`}
      viewBox={rig.box}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : `${rig.tempoMs > 0 ? "Motion guide" : "Pose guide"} for ${name}`}
      aria-hidden={decorative || undefined}
    >
      {shapes.map((shape) => (
        <ShapeNode key={shape.key} shape={shape} />
      ))}
    </svg>
  );
}

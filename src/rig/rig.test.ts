import { describe, expect, it } from "vitest";
import { buildFrame, hasMotion, tracePoints, type RigDefinition } from "./frame";
import { RIGS } from "./rigs";
import { lerpPose, loopStops, poseAtPhase, project, solveIk, solvePose, type Point } from "./skeleton";

const rigEntries = Object.entries(RIGS);
const SAMPLE_PHASES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function box(rig: RigDefinition): { minX: number; minY: number; width: number; height: number } {
  const [minX, minY, width, height] = rig.box.split(" ").map(Number) as [number, number, number, number];
  return { minX, minY, width, height };
}

function jointsAcrossLoop(rig: RigDefinition): Point[] {
  return SAMPLE_PHASES.flatMap((phase) => Object.values(solvePose(poseAtPhase(rig.poses, rig.loop, phase))));
}

describe("skeleton", () => {
  it("reaches an in-range inverse kinematics target", () => {
    const root: Point = [100, 100];
    const target: Point = [150, 130];
    const [thigh, shinRelative] = solveIk(root, target, 37, 35, 1);
    const knee = project(root, thigh, 37);
    const ankle = project(knee, thigh + shinRelative, 35);
    expect(ankle[0]).toBeCloseTo(target[0], 5);
    expect(ankle[1]).toBeCloseTo(target[1], 5);
  });

  it("clamps an out-of-range target instead of producing NaN", () => {
    const root: Point = [100, 100];
    const [thigh, shinRelative] = solveIk(root, [400, 100], 37, 35, 1);
    expect(Number.isFinite(thigh)).toBe(true);
    expect(Number.isFinite(shinRelative)).toBe(true);
  });

  it("returns the endpoints when interpolating a pose by 0 and 1", () => {
    const [a, b] = RIGS["slider-mountain-climbers"]!.poses;
    expect(solvePose(lerpPose(a, b!, 0))).toEqual(solvePose(a));
    expect(solvePose(lerpPose(a, b!, 1))).toEqual(solvePose(b!));
  });

  it("closes the loop so the guide does not jump when it repeats", () => {
    rigEntries.forEach(([id, rig]) => {
      const start = solvePose(poseAtPhase(rig.poses, rig.loop, 0));
      const end = solvePose(poseAtPhase(rig.poses, rig.loop, 0.9999));
      Object.keys(start).forEach((joint) => {
        const key = joint as keyof typeof start;
        expect(start[key][0], `${id} ${joint} x`).toBeCloseTo(end[key][0], 1);
        expect(start[key][1], `${id} ${joint} y`).toBeCloseTo(end[key][1], 1);
      });
    });
  });

  it("visits every authored pose in a ping-pong loop", () => {
    const stops = loopStops([{} as never, {} as never, {} as never], "pingpong");
    expect(stops).toHaveLength(5);
  });
});

describe("rig definitions", () => {
  it("has at least one rig", () => {
    expect(rigEntries.length).toBeGreaterThan(0);
  });

  it.each(rigEntries)("%s frames at 16:9 so every guide fills the same surface", (_id, rig) => {
    const { width, height } = box(rig);
    expect(width / height).toBeCloseTo(16 / 9, 2);
  });

  it.each(rigEntries)("%s keeps every joint inside its viewBox", (id, rig) => {
    const { minX, minY, width, height } = box(rig);
    jointsAcrossLoop(rig).forEach(([x, y]) => {
      expect(x, `${id} x`).toBeGreaterThanOrEqual(minX);
      expect(x, `${id} x`).toBeLessThanOrEqual(minX + width);
      expect(y, `${id} y`).toBeGreaterThanOrEqual(minY);
      expect(y, `${id} y`).toBeLessThanOrEqual(minY + height);
    });
  });

  it.each(rigEntries)("%s produces finite geometry across the loop", (id, rig) => {
    SAMPLE_PHASES.forEach((phase) => {
      buildFrame(rig, phase).forEach((shape) => {
        if (shape.kind === "area") {
          // Path data is a string, so check no coordinate rendered as NaN.
          expect(shape.d, `${id} ${shape.key}`).not.toMatch(/NaN|Infinity/);
          return;
        }
        const points =
          shape.kind === "line"
            ? [shape.from, shape.to]
            : shape.kind === "curve"
              ? [shape.from, shape.control, shape.to]
              : shape.kind === "polyline" || shape.kind === "polygon"
                ? shape.points
                : [shape.at];
        points.forEach(([x, y]) => {
          expect(Number.isFinite(x), `${id} ${shape.key} x`).toBe(true);
          expect(Number.isFinite(y), `${id} ${shape.key} y`).toBe(true);
        });
      });
    });
  });

  it.each(rigEntries)("%s gives every shape in a frame a unique key", (_id, rig) => {
    const keys = buildFrame(rig, 0.25).map((shape) => shape.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(rigEntries.filter(([, rig]) => rig.tempoMs > 0))("%s actually moves", (id, rig) => {
    const start = solvePose(poseAtPhase(rig.poses, rig.loop, 0));
    const mid = solvePose(poseAtPhase(rig.poses, rig.loop, 0.5));
    const travelled = Object.keys(start).reduce((total, joint) => {
      const key = joint as keyof typeof start;
      return total + Math.hypot(start[key][0] - mid[key][0], start[key][1] - mid[key][1]);
    }, 0);
    expect(travelled, `${id} is marked as moving but its poses are nearly identical`).toBeGreaterThan(20);
  });

  it.each(rigEntries.filter(([, rig]) => rig.trace && hasMotion(rig)))(
    "%s traces a path long enough to read",
    (id, rig) => {
      const points = tracePoints(rig, rig.trace!);
      const length = points.reduce(
        (total, point, index) =>
          index === 0 ? 0 : total + Math.hypot(point[0] - points[index - 1]![0], point[1] - points[index - 1]![1]),
        0
      );
      expect(length, `${id} traces a path too short to convey the movement`).toBeGreaterThan(30);
    }
  );

  it("does not reuse pose data between two different movements", () => {
    const seen = new Map<string, string>();
    rigEntries.forEach(([id, rig]) => {
      const signature = JSON.stringify(rig.poses);
      const previous = seen.get(signature);
      expect(previous, `"${id}" and "${previous}" are the same movement drawn twice`).toBeUndefined();
      seen.set(signature, id);
    });
  });

  it("never rotates a joint the long way round between two poses", () => {
    // Angles interpolate linearly, so writing 8 where 368 is meant sends the
    // head sweeping backwards through the body on its way to the same place.
    rigEntries.forEach(([id, rig]) => {
      rig.poses.forEach((pose, index) => {
        const next = rig.poses[index + 1];
        if (!next) return;
        (["spine", "head", "facing"] as const).forEach((joint) => {
          const from = pose[joint] ?? pose.spine;
          const to = next[joint] ?? next.spine;
          expect(
            Math.abs(to - from),
            `${id} pose ${index}->${index + 1}: ${joint} ${from}->${to} takes the long way; write the second value past 360 instead`
          ).toBeLessThanOrEqual(180);
        });
      });
    });
  });

  it("names an inverse kinematics target on every pose or on none", () => {
    // A target named on only one end of a loop is held for the whole loop, so
    // the limb it drives sits still while everything else moves. That reads as
    // a broken guide, and it is silent: nothing throws.
    rigEntries.forEach(([id, rig]) => {
      (["ikLegNear", "ikLegFar", "ikArmNear", "ikArmFar"] as const).forEach((target) => {
        const named = rig.poses.filter((pose) => pose[target] !== undefined).length;
        expect(
          named === 0 || named === rig.poses.length,
          `${id} sets ${target} on ${named} of ${rig.poses.length} poses; the joint will not move`
        ).toBe(true);
      });
    });
  });

  it("bends a knee away from the mat when the foot is planted on a target", () => {
    // A foot pinned by inverse kinematics has two solutions. The wrong one
    // folds the knee downward, which reads as a leg bending backwards and can
    // put the knee through the floor. Only rigs that draw a mat are checked:
    // in the overhead views, down the screen is along the mat, not into it.
    rigEntries.forEach(([id, rig]) => {
      if (rig.groundY === undefined) return;
      rig.poses.forEach((pose, index) => {
        const joints = solvePose(pose);
        ([
          ["near", pose.ikLegNear, joints.hipNear, joints.kneeNear, joints.ankleNear],
          ["far", pose.ikLegFar, joints.hipFar, joints.kneeFar, joints.ankleFar]
        ] as const).forEach(([side, target, hip, knee, ankle]) => {
          if (!target) return;
          const lowest = Math.max(hip[1], ankle[1]);
          expect(
            knee[1],
            `${id} pose ${index}: the ${side} knee folds below both the hip and the ankle`
          ).toBeLessThan(lowest + 1);
        });
      });
    });
  });

  it("holds a static pose without a ghost or a path", () => {
    const still = rigEntries.filter(([, rig]) => rig.tempoMs === 0);
    still.forEach(([id, rig]) => {
      expect(hasMotion(rig), id).toBe(false);
      const roles = buildFrame(rig, 0).map((shape) => shape.role);
      expect(roles, id).not.toContain("ghost");
      expect(roles, id).not.toContain("path");
    });
  });

  it("keeps a frozen moving guide informative with its ghost and path", () => {
    const rig = RIGS["slider-mountain-climbers"]!;
    const roles = buildFrame(rig, 0.5).map((shape) => shape.role);
    expect(roles).toContain("ghost");
    expect(roles).toContain("path");
  });
});

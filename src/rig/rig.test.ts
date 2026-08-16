import { describe, expect, it } from "vitest";
import { buildFrame, hasMotion, tracePoints, type RigDefinition } from "./frame";
import { RIGS } from "./rigs";
import { lerpPose, loopStops, poseAtPhase, project, solveIk, solvePose, type Point } from "./skeleton";

const rigEntries = Object.entries(RIGS);
const SAMPLE_PHASES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

/**
 * Rigs authored as pose data. The spatial rigs are solved in floor coordinates
 * and have no poses at all, so every check written against pose data runs over
 * this list rather than all of them.
 */
type PosedRig = RigDefinition & { poses: NonNullable<RigDefinition["poses"]> };
const posedEntries = rigEntries.filter(
  (entry): entry is [string, PosedRig] => entry[1].poses !== undefined
);
const spatialEntries = rigEntries.filter(([, rig]) => rig.spatial !== undefined);

function framePoints(rig: RigDefinition, phase: number): Point[] {
  return buildFrame(rig, phase).flatMap((shape) => {
    if (shape.kind === "area") return [];
    if (shape.kind === "line") return [shape.from, shape.to];
    if (shape.kind === "curve") return [shape.from, shape.control, shape.to];
    if (shape.kind === "polyline" || shape.kind === "polygon") return [...shape.points];
    return [shape.at];
  });
}

function box(rig: RigDefinition): { minX: number; minY: number; width: number; height: number } {
  const [minX, minY, width, height] = rig.box.split(" ").map(Number) as [number, number, number, number];
  return { minX, minY, width, height };
}

function jointsAcrossLoop(rig: PosedRig): Point[] {
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
    const [a, b] = RIGS["slider-mountain-climbers"]!.poses!;
    expect(solvePose(lerpPose(a, b!, 0))).toEqual(solvePose(a));
    expect(solvePose(lerpPose(a, b!, 1))).toEqual(solvePose(b!));
  });

  it("closes the loop so the guide does not jump when it repeats", () => {
    posedEntries.forEach(([id, rig]) => {
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

  it.each(posedEntries)("%s keeps every joint inside its viewBox", (id, rig) => {
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

  it.each(posedEntries.filter(([, rig]) => rig.tempoMs > 0))("%s actually moves", (id, rig) => {
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
      // Whichever way the rig is authored: two spatial rigs sharing a camera
      // are only different movements if their sweeps differ.
      const signature = JSON.stringify(rig.poses ?? rig.spatial);
      const previous = seen.get(signature);
      expect(previous, `"${id}" and "${previous}" are the same movement drawn twice`).toBeUndefined();
      seen.set(signature, id);
    });
  });

  it("never rotates a joint the long way round between two poses", () => {
    // Angles interpolate linearly, so writing 8 where 368 is meant sends the
    // head sweeping backwards through the body on its way to the same place.
    posedEntries.forEach(([id, rig]) => {
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
    posedEntries.forEach(([id, rig]) => {
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
    posedEntries.forEach(([id, rig]) => {
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

  it("is authored either as poses or in space, never both and never neither", () => {
    rigEntries.forEach(([id, rig]) => {
      expect(
        (rig.poses === undefined) !== (rig.spatial === undefined),
        `${id} must have exactly one of poses and spatial`
      ).toBe(true);
    });
  });

  it.each(spatialEntries)("%s keeps its whole scene inside its viewBox", (id, rig) => {
    const { minX, minY, width, height } = box(rig);
    SAMPLE_PHASES.forEach((phase) => {
      framePoints(rig, phase).forEach(([x, y]) => {
        expect(x, `${id} x`).toBeGreaterThanOrEqual(minX);
        expect(x, `${id} x`).toBeLessThanOrEqual(minX + width);
        expect(y, `${id} y`).toBeGreaterThanOrEqual(minY);
        expect(y, `${id} y`).toBeLessThanOrEqual(minY + height);
      });
    });
  });

  it.each(spatialEntries)("%s sweeps the working foot far enough to read", (id, rig) => {
    // The movement is named for its two taps. If the sweep collapses, the guide
    // still animates but stops being this exercise. Measured as the widest gap
    // between any two positions rather than along one axis: most of a lateral
    // sweep's travel is in depth, which the projection turns into vertical.
    //
    // A foot on a slider is held to less. It never leaves the mat, so its travel
    // is an arc of the single floor circle a straight leg can reach, and on
    // screen that arc is widest exactly where the leg points at the camera and
    // foreshortens to a stub. The two pull against each other at every camera and
    // every body size that keeps the scene in frame; half of what a leg swinging
    // through the air covers is what the geometry allows.
    const feet = SAMPLE_PHASES.map((phase) => {
      const leg = buildFrame(rig, phase).find((shape) => shape.key === "leg-work");
      return leg && leg.kind === "polyline" ? leg.points[leg.points.length - 1] : undefined;
    }).filter((point): point is Point => point !== undefined);
    const spread = Math.max(
      ...feet.flatMap((a) => feet.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1])))
    );
    expect(spread, `${id} barely travels`).toBeGreaterThan(rig.spatial?.slider ? 45 : 80);
  });

  it.each(spatialEntries.filter(([, rig]) => rig.spatial?.leg.some((leg) => (leg.knee ?? 0) >= 60)))(
    "%s shows the knee bend it is authored with",
    (id, rig) => {
      // A folded limb can be perfectly correct in space and still project onto
      // a straight line, because the shin lies along its own thigh from where
      // the camera happens to be. Nothing throws - the leg simply reads as
      // unbent, which is a different exercise. Both obvious fold directions do
      // this at some poses, so the bend has to be checked where it renders.
      // A bend reads only in a middle band. Near 180 the leg looks straight;
      // near zero the shin has doubled back onto its own thigh and the limb is
      // a stub. Both ends are the same defect - the shin projecting onto the
      // thigh - and the second is the one that actually happened here.
      //
      // Checked across the loop rather than at one phase: a cycle does not put
      // its deepest bend at any fixed point, so the stub must never appear at
      // all, and the bend has to read somewhere.
      const angles = SAMPLE_PHASES.map((phase) => {
        const leg = buildFrame(rig, phase).find((shape) => shape.key === "leg-work");
        if (!leg || leg.kind !== "polyline") return 180;
        const [hip, knee, foot] = leg.points as [Point, Point, Point];
        const a = Math.atan2(hip[1] - knee[1], hip[0] - knee[0]);
        const b = Math.atan2(foot[1] - knee[1], foot[0] - knee[0]);
        return Math.abs(((((a - b) * 180) / Math.PI + 540) % 360) - 180);
      });
      expect(
        Math.min(...angles),
        `${id}: the shin projects onto its own thigh, so the working leg renders as a stub`
      ).toBeGreaterThan(25);
      expect(
        Math.min(...angles),
        `${id}: the authored knee bend never reads - the leg looks straight throughout`
      ).toBeLessThan(155);
    }
  );

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

/**
 * The pose rig: one figure, shared by every exercise.
 *
 * An exercise is described as pose data (joint angles) rather than drawn, so
 * every frame of every guide is the same body at the same scale. Frames cannot
 * drift, rescale or change camera between each other the way separately
 * produced images do.
 */

export type Point = readonly [number, number];

/** Segment lengths are shared by the whole catalog: one athlete everywhere. */
export const SEGMENT = {
  spine: 60,
  neck: 20,
  headRadius: 11,
  upperArm: 28,
  foreArm: 26,
  hand: 9,
  thigh: 37,
  shin: 35,
  foot: 14
} as const;

/**
 * Angles are degrees on screen coordinates: 0 right, 90 down, 180 left, 270 up.
 * Within a limb the second and third values are relative to the previous
 * segment, so a knee bend is one number and the joint cannot dislocate.
 */
export type Chain = readonly [number, number, number];

export interface Pose {
  hip: Point;
  spine: number;
  /** Neck direction. Defaults to the spine direction. */
  head?: number;
  spineScale?: number;
  /**
   * Sideways bow of the back, perpendicular to the hip-to-shoulder line.
   * Positive rounds the spine toward `spine - 90`. Flexion and extension carry
   * a lot of these movements — cat and cow, roll-ups, forward folds — and a
   * straight segment cannot show any of it.
   */
  spineBow?: number;
  /**
   * Absolute direction the face points, drawn as a nose on the silhouette.
   * Without it a folded or lying figure is ambiguous — face down and face up
   * read identically. Omit on front and overhead views, where a profile nose
   * would be wrong.
   */
  facing?: number;
  armNear: Chain;
  armFar: Chain;
  legNear: Chain;
  legFar: Chain;
  armNearScale?: number;
  armFarScale?: number;
  legNearScale?: number;
  legFarScale?: number;
  /**
   * Lateral half-width of the body, perpendicular to the spine. Zero reads as a
   * pure side view; front and back views need real width or the figure
   * collapses onto its own centre line.
   */
  shoulderSpread?: number;
  hipSpread?: number;
  /** Foot/hand target. When set, inverse kinematics overrides the chain angles. */
  ikLegNear?: Point;
  ikLegFar?: Point;
  ikArmNear?: Point;
  ikArmFar?: Point;
  ikBend?: 1 | -1;
  ikArmBend?: 1 | -1;
}

export type JointId =
  | "hip"
  | "shoulder"
  | "head"
  | "hipNear"
  | "hipFar"
  | "shoulderNear"
  | "shoulderFar"
  | "elbowNear"
  | "wristNear"
  | "handNear"
  | "elbowFar"
  | "wristFar"
  | "handFar"
  | "kneeNear"
  | "ankleNear"
  | "toeNear"
  | "kneeFar"
  | "ankleFar"
  | "toeFar";

export type Joints = Record<JointId, Point>;

const DEG = Math.PI / 180;

export function project([x, y]: Point, degrees: number, length: number): Point {
  return [x + Math.cos(degrees * DEG) * length, y + Math.sin(degrees * DEG) * length];
}

/**
 * Two-link inverse kinematics: author a target point and let the rig solve the
 * joint angles. This is what lets a circular movement be specified as a circle
 * instead of guessed at pose by pose.
 */
export function solveIk(root: Point, target: Point, l1: number, l2: number, bend: 1 | -1): [number, number] {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const reach = Math.hypot(dx, dy);
  const clamped = Math.min(Math.max(reach, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx) / DEG;
  const interior = Math.acos((clamped * clamped + l1 * l1 - l2 * l2) / (2 * clamped * l1)) / DEG;
  const first = base - bend * interior;
  const knee = project(root, first, l1);
  const second = Math.atan2(target[1] - knee[1], target[0] - knee[0]) / DEG;
  return [first, second - first];
}

function chainPoints(root: Point, angles: Chain, lengths: readonly [number, number, number]): [Point, Point, Point] {
  const a0 = angles[0];
  const a1 = a0 + angles[1];
  const a2 = a1 + angles[2];
  const first = project(root, a0, lengths[0]);
  const second = project(first, a1, lengths[1]);
  const third = project(second, a2, lengths[2]);
  return [first, second, third];
}

function offset(point: Point, degrees: number, distance: number): Point {
  return distance === 0 ? point : project(point, degrees + 90, distance);
}

/** Forward kinematics: pose in, absolute joint positions out. */
export function solvePose(pose: Pose): Joints {
  const hip = pose.hip;
  const shoulder = project(hip, pose.spine, SEGMENT.spine * (pose.spineScale ?? 1));
  const head = project(shoulder, pose.head ?? pose.spine, SEGMENT.neck);

  const shoulderSpread = pose.shoulderSpread ?? 0;
  const hipSpread = pose.hipSpread ?? 0;
  const shoulderNear = offset(shoulder, pose.spine, shoulderSpread);
  const shoulderFar = offset(shoulder, pose.spine, -shoulderSpread);
  const hipNear = offset(hip, pose.spine, hipSpread);
  const hipFar = offset(hip, pose.spine, -hipSpread);

  const armLengths = (scale: number): readonly [number, number, number] => [
    SEGMENT.upperArm * scale,
    SEGMENT.foreArm * scale,
    SEGMENT.hand * scale
  ];
  const legLengths = (scale: number): readonly [number, number, number] => [
    SEGMENT.thigh * scale,
    SEGMENT.shin * scale,
    SEGMENT.foot * scale
  ];

  const armChain = (chain: Chain, target: Point | undefined, root: Point, scale: number): Chain => {
    if (!target) return chain;
    const [a, b] = solveIk(root, target, SEGMENT.upperArm * scale, SEGMENT.foreArm * scale, pose.ikArmBend ?? 1);
    return [a, b, chain[2]];
  };
  const legChain = (chain: Chain, target: Point | undefined, root: Point, scale: number): Chain => {
    if (!target) return chain;
    const [a, b] = solveIk(root, target, SEGMENT.thigh * scale, SEGMENT.shin * scale, pose.ikBend ?? 1);
    return [a, b, chain[2]];
  };

  const armNearScale = pose.armNearScale ?? 1;
  const armFarScale = pose.armFarScale ?? 1;
  const legNearScale = pose.legNearScale ?? 1;
  const legFarScale = pose.legFarScale ?? 1;

  const [elbowNear, wristNear, handNear] = chainPoints(
    shoulderNear,
    armChain(pose.armNear, pose.ikArmNear, shoulderNear, armNearScale),
    armLengths(armNearScale)
  );
  const [elbowFar, wristFar, handFar] = chainPoints(
    shoulderFar,
    armChain(pose.armFar, pose.ikArmFar, shoulderFar, armFarScale),
    armLengths(armFarScale)
  );
  const [kneeNear, ankleNear, toeNear] = chainPoints(
    hipNear,
    legChain(pose.legNear, pose.ikLegNear, hipNear, legNearScale),
    legLengths(legNearScale)
  );
  const [kneeFar, ankleFar, toeFar] = chainPoints(
    hipFar,
    legChain(pose.legFar, pose.ikLegFar, hipFar, legFarScale),
    legLengths(legFarScale)
  );

  return {
    hip,
    shoulder,
    head,
    hipNear,
    hipFar,
    shoulderNear,
    shoulderFar,
    elbowNear,
    wristNear,
    handNear,
    elbowFar,
    wristFar,
    handFar,
    kneeNear,
    ankleNear,
    toeNear,
    kneeFar,
    ankleFar,
    toeFar
  };
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function lerpPoint(a: Point, b: Point, t: number): Point {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function lerpChain(a: Chain, b: Chain, t: number): Chain {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerpOptionalPoint(a: Point | undefined, b: Point | undefined, t: number): Point | undefined {
  if (!a || !b) return a ?? b;
  return lerpPoint(a, b, t);
}

/** Blending whole poses is what guarantees registration between frames. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const ikLegNear = lerpOptionalPoint(a.ikLegNear, b.ikLegNear, t);
  const ikLegFar = lerpOptionalPoint(a.ikLegFar, b.ikLegFar, t);
  const ikArmNear = lerpOptionalPoint(a.ikArmNear, b.ikArmNear, t);
  const ikArmFar = lerpOptionalPoint(a.ikArmFar, b.ikArmFar, t);
  // Bend direction is discrete, so it cannot be blended. Falling back to the
  // other pose stops a loop that only names it at one end from flipping the
  // knee inside out on the way back.
  const ikBend = a.ikBend ?? b.ikBend;
  const ikArmBend = a.ikArmBend ?? b.ikArmBend;

  return {
    hip: lerpPoint(a.hip, b.hip, t),
    spine: lerp(a.spine, b.spine, t),
    head: lerp(a.head ?? a.spine, b.head ?? b.spine, t),
    spineScale: lerp(a.spineScale ?? 1, b.spineScale ?? 1, t),
    spineBow: lerp(a.spineBow ?? 0, b.spineBow ?? 0, t),
    ...(a.facing === undefined || b.facing === undefined
      ? {}
      : { facing: lerp(a.facing, b.facing, t) }),
    armNear: lerpChain(a.armNear, b.armNear, t),
    armFar: lerpChain(a.armFar, b.armFar, t),
    legNear: lerpChain(a.legNear, b.legNear, t),
    legFar: lerpChain(a.legFar, b.legFar, t),
    armNearScale: lerp(a.armNearScale ?? 1, b.armNearScale ?? 1, t),
    armFarScale: lerp(a.armFarScale ?? 1, b.armFarScale ?? 1, t),
    legNearScale: lerp(a.legNearScale ?? 1, b.legNearScale ?? 1, t),
    legFarScale: lerp(a.legFarScale ?? 1, b.legFarScale ?? 1, t),
    shoulderSpread: lerp(a.shoulderSpread ?? 0, b.shoulderSpread ?? 0, t),
    hipSpread: lerp(a.hipSpread ?? 0, b.hipSpread ?? 0, t),
    ...(ikLegNear === undefined ? {} : { ikLegNear }),
    ...(ikLegFar === undefined ? {} : { ikLegFar }),
    ...(ikArmNear === undefined ? {} : { ikArmNear }),
    ...(ikArmFar === undefined ? {} : { ikArmFar }),
    ...(ikBend === undefined ? {} : { ikBend }),
    ...(ikArmBend === undefined ? {} : { ikArmBend })
  };
}

const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export type LoopMode = "pingpong" | "cycle";

/** Expands the authored key poses into the stops one loop actually visits. */
export function loopStops(poses: readonly Pose[], loop: LoopMode): Pose[] {
  const first = poses[0];
  if (!first) return [];
  if (poses.length === 1) return [first, first];
  if (loop === "cycle") return [...poses, first];
  return [...poses, ...poses.slice(1, -1).reverse(), first];
}

/** phase in [0, 1) across the whole loop. */
export function poseAtPhase(poses: readonly Pose[], loop: LoopMode, phase: number): Pose {
  const stops = loopStops(poses, loop);
  const segments = stops.length - 1;
  if (segments < 1) return stops[0] as Pose;
  const scaled = ((phase % 1) + 1) % 1 * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  return lerpPose(stops[index] as Pose, stops[index + 1] as Pose, easeInOut(scaled - index));
}

import {
  SEGMENT,
  loopStops,
  poseAtPhase,
  project,
  solvePose,
  type JointId,
  type Joints,
  type LoopMode,
  type Point,
  type Pose
} from "./skeleton";

/**
 * Shapes carry a role rather than a colour so the guide is painted from the
 * app's own tokens and follows the palette instead of shipping its own.
 */
export type ShapeRole =
  | "ground"
  | "path"
  | "ghost"
  | "outline"
  | "near"
  | "far"
  | "focus"
  | "equipment";

export type Shape =
  | { kind: "line"; key: string; role: ShapeRole; from: Point; to: Point; width: number }
  | { kind: "dot"; key: string; role: ShapeRole; at: Point; radius: number }
  | { kind: "disc"; key: string; role: ShapeRole; at: Point; rx: number; ry: number }
  | { kind: "polyline"; key: string; role: ShapeRole; points: readonly Point[]; width: number; dashed?: boolean }
  | { kind: "polygon"; key: string; role: ShapeRole; points: readonly Point[]; width: number }
  | { kind: "curve"; key: string; role: ShapeRole; from: Point; control: Point; to: Point; width: number };

export type LimbId = "armNear" | "armFar" | "legNear" | "legFar";

export type Equipment =
  | { type: "disc"; at: JointId }
  | { type: "band"; from: JointId; to: JointId; sag?: number };

export interface RigDefinition {
  /** Human-readable movement name, used for the accessible label. */
  title: string;
  /** SVG viewBox. Keep the aspect at 16:9 so every guide fills the same surface. */
  box: string;
  /** Milliseconds for one loop. Zero marks a static hold. */
  tempoMs: number;
  loop: LoopMode;
  /** Limbs painted in the accent colour: what the viewer should watch. */
  focus?: readonly LimbId[];
  /** Joint whose travel is drawn as the motion path. */
  trace?: JointId;
  ground?: boolean;
  groundY?: number;
  /** Onion-skin of the start pose. Defaults to on for anything that moves. */
  ghost?: boolean;
  equipment?: readonly Equipment[];
  poses: readonly [Pose, ...Pose[]];
}

const BODY_WIDTH = 11;
const OUTLINE_WIDTH = 5;
const TRACE_SAMPLES = 72;

const LIMB_JOINTS: Record<LimbId, readonly [JointId, JointId, JointId, JointId]> = {
  armNear: ["shoulderNear", "elbowNear", "wristNear", "handNear"],
  armFar: ["shoulderFar", "elbowFar", "wristFar", "handFar"],
  legNear: ["hipNear", "kneeNear", "ankleNear", "toeNear"],
  legFar: ["hipFar", "kneeFar", "ankleFar", "toeFar"]
};

const LIMB_WIDTHS: Record<LimbId, readonly [number, number, number]> = {
  armNear: [BODY_WIDTH * 0.82, BODY_WIDTH * 0.74, BODY_WIDTH * 0.5],
  armFar: [BODY_WIDTH * 0.7, BODY_WIDTH * 0.62, BODY_WIDTH * 0.42],
  legNear: [BODY_WIDTH, BODY_WIDTH * 0.88, BODY_WIDTH * 0.6],
  legFar: [BODY_WIDTH * 0.8, BODY_WIDTH * 0.7, BODY_WIDTH * 0.48]
};

function limbRole(rig: RigDefinition, limb: LimbId, ghost: boolean): ShapeRole {
  if (ghost) return "ghost";
  if (rig.focus?.includes(limb)) return "focus";
  return limb.endsWith("Far") ? "far" : "near";
}

function pushLimb(out: Shape[], joints: Joints, rig: RigDefinition, limb: LimbId, ghost: boolean): void {
  const prefix = ghost ? "ghost-" : "";
  const ids = LIMB_JOINTS[limb];
  const widths = LIMB_WIDTHS[limb];
  const points = ids.map((id) => joints[id]);
  const role = limbRole(rig, limb, ghost);

  // Outline first for the whole limb, so overlapping parts stay separable
  // instead of merging into one silhouette.
  if (!ghost) {
    for (let i = 0; i < 3; i += 1) {
      out.push({
        kind: "line",
        key: `${prefix}${limb}-outline-${i}`,
        role: "outline",
        from: points[i] as Point,
        to: points[i + 1] as Point,
        width: (widths[i] as number) + OUTLINE_WIDTH
      });
    }
  }
  for (let i = 0; i < 3; i += 1) {
    out.push({
      kind: "line",
      key: `${prefix}${limb}-${i}`,
      role,
      from: points[i] as Point,
      to: points[i + 1] as Point,
      width: widths[i] as number
    });
  }
  out.push({
    kind: "dot",
    key: `${prefix}${limb}-joint`,
    role,
    at: points[1] as Point,
    radius: widths[0] * 0.3
  });
}

/**
 * The torso is always a tapered quad. Its half-width is the pose's spread or
 * the body's own thickness, whichever is larger, so a side view (no spread)
 * and a front view (real shoulder width) are the same shape at different
 * widths and nothing pops as one interpolates into the other.
 */
function pushTorso(out: Shape[], joints: Joints, pose: Pose, ghost: boolean): void {
  const prefix = ghost ? "ghost-" : "";
  const torsoRole: ShapeRole = ghost ? "ghost" : "near";
  const neckWidth = BODY_WIDTH * 0.75;
  const minHalf = (BODY_WIDTH * 1.55) / 2;
  const shoulderHalf = Math.max(pose.shoulderSpread ?? 0, minHalf);
  const hipHalf = Math.max(pose.hipSpread ?? 0, minHalf);
  const corner = BODY_WIDTH * 0.4;

  const points: Point[] = [
    project(joints.shoulder, pose.spine - 90, shoulderHalf),
    project(joints.shoulder, pose.spine + 90, shoulderHalf),
    project(joints.hip, pose.spine + 90, hipHalf),
    project(joints.hip, pose.spine - 90, hipHalf)
  ];

  if (!ghost) {
    out.push({ kind: "polygon", key: `${prefix}torso-outline`, role: "outline", points, width: corner + OUTLINE_WIDTH });
  }
  out.push({ kind: "polygon", key: `${prefix}torso`, role: torsoRole, points, width: corner });

  if (!ghost) {
    out.push({
      kind: "line",
      key: `${prefix}neck-outline`,
      role: "outline",
      from: joints.shoulder,
      to: joints.head,
      width: neckWidth + OUTLINE_WIDTH
    });
    out.push({
      kind: "dot",
      key: `${prefix}head-outline`,
      role: "outline",
      at: joints.head,
      radius: SEGMENT.headRadius + OUTLINE_WIDTH / 2
    });
  }
  out.push({ kind: "line", key: `${prefix}neck`, role: torsoRole, from: joints.shoulder, to: joints.head, width: neckWidth });
  out.push({ kind: "dot", key: `${prefix}head`, role: torsoRole, at: joints.head, radius: SEGMENT.headRadius });
}

/** Painting order is far side, torso, near side, so depth reads correctly. */
function pushFigure(out: Shape[], joints: Joints, pose: Pose, rig: RigDefinition, ghost: boolean): void {
  pushLimb(out, joints, rig, "armFar", ghost);
  pushLimb(out, joints, rig, "legFar", ghost);
  pushTorso(out, joints, pose, ghost);
  pushLimb(out, joints, rig, "legNear", ghost);
  pushLimb(out, joints, rig, "armNear", ghost);
}

function pushEquipment(out: Shape[], joints: Joints, rig: RigDefinition): void {
  rig.equipment?.forEach((item, index) => {
    if (item.type === "disc") {
      const at = joints[item.at];
      out.push({
        kind: "disc",
        key: `equipment-${index}`,
        role: "equipment",
        at: [at[0], at[1] + 4],
        rx: 13,
        ry: 4.5
      });
      return;
    }
    const from = joints[item.from];
    const to = joints[item.to];
    out.push({
      kind: "curve",
      key: `equipment-${index}`,
      role: "equipment",
      from,
      to,
      control: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + (item.sag ?? 8)],
      width: 5
    });
  });
}

/**
 * The motion path is sampled from the same pose data that moves the figure, so
 * it is a readout of the movement rather than a second, hand-drawn account of
 * it. Depends only on the poses, so callers can cache it per rig.
 */
export function tracePoints(rig: RigDefinition, joint: JointId, samples = TRACE_SAMPLES): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(solvePose(poseAtPhase(rig.poses, rig.loop, i / samples))[joint]);
  }
  return points;
}

function arrowHead(points: readonly Point[], phase: number): Point[] {
  const last = points.length - 1;
  const index = Math.min(Math.floor(((phase % 1) + 1) % 1 * last), last);
  const here = points[index] as Point;
  const ahead = points[Math.min(index + 3, last)] as Point;
  const angle = (Math.atan2(ahead[1] - here[1], ahead[0] - here[0]) * 180) / Math.PI;
  const tip = project(here, angle, 9);
  return [project(tip, angle + 145, 9), tip, project(tip, angle - 145, 9)];
}

export function hasMotion(rig: RigDefinition): boolean {
  return rig.tempoMs > 0 && loopStops(rig.poses, rig.loop).length > 2;
}

/** Everything needed to paint one frame, as plain geometry. */
export function buildFrame(rig: RigDefinition, phase: number, tracedPath?: readonly Point[]): Shape[] {
  const shapes: Shape[] = [];
  const moving = hasMotion(rig);

  if (rig.ground !== false) {
    shapes.push({
      kind: "line",
      key: "ground",
      role: "ground",
      from: [20, rig.groundY ?? 170],
      to: [280, rig.groundY ?? 170],
      width: 6
    });
  }

  if (rig.trace && moving) {
    const path = tracedPath ?? tracePoints(rig, rig.trace);
    shapes.push({ kind: "polyline", key: "trace", role: "path", points: path, width: 2.5, dashed: true });
    shapes.push({ kind: "polyline", key: "trace-arrow", role: "path", points: arrowHead(path, phase), width: 3 });
  }

  if (rig.ghost !== false && moving) {
    const startPose = rig.poses[0];
    pushFigure(shapes, solvePose(startPose), startPose, rig, true);
  }

  const pose = poseAtPhase(rig.poses, rig.loop, phase);
  const joints = solvePose(pose);
  pushFigure(shapes, joints, pose, rig, false);
  pushEquipment(shapes, joints, rig);
  return shapes;
}

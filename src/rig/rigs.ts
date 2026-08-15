import type { RigDefinition } from "./frame";
import type { Chain, Point, Pose } from "./skeleton";

/**
 * Pose data for the catalog. An exercise is roughly forty numbers, so these
 * diff in review the way code does and a movement is never approximated by
 * another movement's artwork.
 *
 * Shared framing. All boxes are 16:9 so every guide fills the same surface.
 */
const FLOOR_BOX = "32 60 256 144";
const OVERHEAD_BOX = "32 30 256 144";
const STANDING_BOX = "-6 24 313 176";

/** High plank, facing left, hands under the shoulders. */
const PLANK: Pose = {
  hip: [172, 125],
  spine: 190,
  head: 175,
  armNear: [88, 4, 88],
  armFar: [85, 6, 90],
  legNear: [28, 0, 32],
  legFar: [26, 2, 32]
};

const PLANK_LEG_BACK: Chain = [28, 0, 32];
const PLANK_KNEE_IN: Chain = [168, -73, -75];

const plank = (over: Partial<Pose>): Pose => ({ ...PLANK, ...over });

/** The same plank seen from above, for movement that leaves the sagittal plane. */
const OVERHEAD_PLANK: Pose = {
  hip: [180, 102],
  spine: 180,
  head: 180,
  // Seen from above the arms are foreshortened stubs either side of the chest.
  armNear: [250, 5, 5],
  armFar: [110, -5, -5],
  armNearScale: 0.55,
  armFarScale: 0.55,
  legNear: [0, 0, 8],
  legFar: [12, -4, 4],
  ikBend: -1
};

const overhead = (footTarget: Point): Pose => ({ ...OVERHEAD_PLANK, ikLegNear: footTarget });

/** Tabletop: knees and hands down, shoulders stacked over the wrists. */
const QUADRUPED: Pose = {
  hip: [180, 131],
  spine: 196,
  head: 200,
  spineScale: 1.04,
  armNear: [90, 0, 90],
  armFar: [92, 0, 88],
  legNear: [90, -90, 0],
  legFar: [92, -92, 0]
};

export const RIGS: Readonly<Record<string, RigDefinition>> = {
  /* ---- plank and slider floor ---- */

  "straight-leg-sweep": {
    title: "Straight leg sweep",
    box: OVERHEAD_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    ground: false,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [{ type: "disc", at: "ankleNear" }],
    // Square to the mat, sweeping the straight leg out perpendicular and back:
    // an open arc, which is what separates it from the circles below.
    poses: [overhead([250, 102]), overhead([229.5, 52.5])]
  },

  "straight-leg-sweep-circles": {
    title: "Straight leg sweep circles",
    box: OVERHEAD_BOX,
    tempoMs: 3200,
    loop: "cycle",
    ground: false,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [{ type: "disc", at: "ankleNear" }],
    // In toward the chest, then out and around. The foot target walks a closed
    // loop and the knee angle falls out of it; keeping the radius near full leg
    // length is what keeps the leg straight.
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      const theta = -26 * Math.cos(t) * (Math.PI / 180);
      const radius = 66 + 6 * Math.sin(t);
      return overhead([180 + Math.cos(theta) * radius, 102 + Math.sin(theta) * radius]);
    }) as [Pose, ...Pose[]]
  },

  "thread-leg-side": {
    title: "Thread the leg and open to the side",
    // Extra headroom: the top hand finishes above the shoulder line.
    box: "32 42 256 144",
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "armNear"],
    // The threading foot, not the lifting hand: the hand arcs across the whole
    // frame and its path drowns out the movement it is meant to explain.
    trace: "toeNear",
    equipment: [{ type: "disc", at: "toeNear" }],
    // The working foot is on a slider, so it is driven by an inverse kinematics
    // target that travels along the mat. Interpolating the joint angles instead
    // would swing the leg down through the floor on its way under the body.
    poses: [
      plank({ ikLegNear: [234, 157], legNear: [0, 0, 20], ikBend: -1 }),
      plank({
        ikLegNear: [143, 160],
        legNear: [0, 0, -40],
        ikBend: -1,
        armNear: [230, 5, 5],
        shoulderSpread: 13,
        spine: 192
      })
    ]
  },

  "slider-mountain-climbers": {
    title: "Sliders mountain climbers",
    box: FLOOR_BOX,
    tempoMs: 1500,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "toeNear" },
      { type: "disc", at: "toeFar" }
    ],
    // The scissor is not authored: it falls out of interpolating one pose into
    // the other, which is what the movement actually does.
    poses: [
      plank({ legNear: PLANK_KNEE_IN, legFar: PLANK_LEG_BACK, spine: 188 }),
      plank({ legNear: PLANK_LEG_BACK, legFar: PLANK_KNEE_IN, spine: 186 })
    ]
  },

  /* ---- quadruped ---- */

  "bird-dog": {
    title: "Alternating bird dog",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "armNear"],
    trace: "ankleNear",
    poses: [
      { ...QUADRUPED },
      { ...QUADRUPED, armNear: [200, -5, -5], legNear: [5, -5, 15], spine: 194 }
    ]
  },

  /* ---- bridges ---- */

  "glute-bridge-sliders": {
    title: "Glute bridge",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "hip",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      {
        hip: [175, 158],
        spine: 183,
        head: 183,
        armNear: [8, 4, 6],
        armFar: [10, 4, 6],
        legNear: [-35, 110, -75],
        legFar: [-32, 108, -74]
      },
      {
        hip: [175, 134],
        spine: 162,
        head: 168,
        spineScale: 1.06,
        armNear: [14, 4, 6],
        armFar: [16, 4, 6],
        legNear: [0, 100, -100],
        legFar: [3, 98, -98]
      }
    ]
  },

  /* ---- standing, band ---- */

  "banded-biceps-curl": {
    title: "Straight biceps curl",
    box: STANDING_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [
      { type: "band", from: "ankleNear", to: "wristNear", sag: 6 },
      { type: "band", from: "ankleFar", to: "wristFar", sag: 6 }
    ],
    // Seen from the front, so the body carries real shoulder and hip width
    // rather than collapsing onto its own centre line.
    poses: [
      {
        hip: [150, 122],
        spine: 270,
        head: 270,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [88, 4, 0],
        armFar: [92, -4, 0],
        legNear: [86, 4, -86],
        legFar: [94, -4, 86]
      },
      {
        hip: [150, 122],
        spine: 270,
        head: 270,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [88, -163, 0],
        armFar: [92, 163, 0],
        legNear: [86, 4, -86],
        legFar: [94, -4, 86]
      }
    ]
  },

  /* ---- static holds ---- */

  shavasana: {
    title: "Shavasana",
    box: "76 104 208 117",
    tempoMs: 0,
    loop: "cycle",
    groundY: 176,
    ghost: false,
    poses: [
      {
        hip: [176, 162],
        spine: 180,
        head: 180,
        armNear: [18, 4, 8],
        armFar: [14, 4, 8],
        legNear: [-2, 3, -22],
        legFar: [2, 3, 20]
      }
    ]
  }
};

export type RigId = keyof typeof RIGS;

export function getRig(id: string): RigDefinition | undefined {
  return RIGS[id];
}

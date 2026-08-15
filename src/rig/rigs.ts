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
/** Kneeling poses sit low and wide; this crops in on them. */
const KNEELING_BOX = "70 96 208 117";

/** High plank, facing left, hands under the shoulders. */
const PLANK: Pose = {
  hip: [172, 125],
  spine: 190,
  head: 175,
  facing: 145,
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
  facing: 140,
  armNear: [90, 0, 90],
  armFar: [92, 0, 88],
  legNear: [90, -90, 0],
  legFar: [92, -92, 0]
};

const quad = (over: Partial<Pose>): Pose => ({ ...QUADRUPED, ...over });

/** Hips high, heels reaching down, head hanging between the arms. */
const DOWN_DOG: Pose = {
  hip: [190, 95],
  spine: 160,
  head: 150,
  facing: 112,
  armNear: [95, -3, 83],
  armFar: [97, -3, 81],
  legNear: [45, 10, 20],
  legFar: [47, 10, 20]
};

/**
 * Kneeling fold: hips back over the heels, chest down toward the mat, arms
 * reaching along the floor. The shins tuck back underneath, which is what
 * separates a kneeling fold from simply lying down.
 */
const kneelingFold = (over: Partial<Pose>): Pose => ({
  hip: [214, 142],
  spine: 165,
  head: 178,
  spineBow: -6,
  facing: 118,
  // Angled down onto the mat rather than straight out, so the arms clear the
  // head instead of merging with it and hiding the face.
  armNear: [168, 4, 3],
  armFar: [170, 4, 3],
  // Knee forward of the hip and on the mat, shin running back underneath to the
  // heel the hips sit on.
  legNear: [130, -132, 2],
  legFar: [133, -135, 2],
  ...over
});

/**
 * Side-lying, head left, hips stacked. Drawn facing the viewer so the top leg's
 * travel is visible: edge-on, the movement these exercises are named for would
 * happen entirely into the screen.
 */
const SIDE_LYING: Pose = {
  hip: [186, 132],
  spine: 180,
  head: 180,
  facing: 178,
  armFar: [184, 2, 2],
  armNear: [10, 4, 4],
  legFar: [22, -40, 0],
  legNear: [18, -40, 0]
};

const sideLying = (over: Partial<Pose>): Pose => ({ ...SIDE_LYING, ...over });

const SIDE_LYING_BOX = "48 62 240 135";

/** Foot target at an angle and reach from the side-lying hip. */
const sideLyingFoot = (degrees: number, reach: number): Point => [
  186 + Math.cos(degrees * (Math.PI / 180)) * reach,
  132 + Math.sin(degrees * (Math.PI / 180)) * reach
];

/** Upright, seen from the side, facing left. */
const STANDING_SIDE: Pose = {
  hip: [160, 122],
  spine: 270,
  head: 270,
  facing: 180,
  armNear: [92, 4, 4],
  armFar: [94, 4, 4],
  legNear: [89, 2, -85],
  legFar: [91, 2, -83]
};

const standingSide = (over: Partial<Pose>): Pose => ({ ...STANDING_SIDE, ...over });

/** Upright, seen head-on, carrying real shoulder and hip width. */
const STANDING_FRONT: Pose = {
  hip: [150, 122],
  spine: 270,
  head: 270,
  shoulderSpread: 15,
  hipSpread: 11,
  armNear: [88, 4, 0],
  armFar: [92, -4, 0],
  legNear: [86, 4, -86],
  legFar: [94, -4, 86]
};

const standingFront = (over: Partial<Pose>): Pose => ({ ...STANDING_FRONT, ...over });

/** Room above the head for anything that reaches overhead. */
const STANDING_REACH_BOX = "-24 2 356 200.25";

/** On the back, head left, face up. The base for the whole core family. */
const SUPINE: Pose = {
  hip: [186, 150],
  spine: 180,
  head: 180,
  facing: 268,
  armNear: [10, 4, 4],
  armFar: [12, 4, 4],
  legNear: [4, 2, -10],
  legFar: [6, 2, -10]
};

const supine = (over: Partial<Pose>): Pose => ({ ...SUPINE, ...over });

/** Head and shoulders curled off the mat, back rounded, chin toward the chest. */
const CURLED: Partial<Pose> = { spine: 200, spineBow: -10, head: 208, facing: 250 };

/** Tall enough for legs reaching straight up, low enough to keep the mat in. */
const SUPINE_BOX = "66 48 220 123.75";
const SEATED_BOX = "78 58 224 126";
/** A seated figure seen head-on is tall and narrow, like the standing views. */
const SEATED_FRONT_BOX = "20 55 258 145";

/**
 * Bridges drive the feet with IK targets on the mat, so the heels stay planted
 * while the hips travel instead of sliding as the joint angles interpolate.
 */
const bridge = (
  hipY: number,
  spine: number,
  /** Pass null for a leg that is lifted rather than planted. */
  footNear: Point | null,
  footFar: Point,
  over: Partial<Pose> = {}
): Pose => ({
  hip: [175, hipY],
  spine,
  head: spine + 6,
  facing: 268,
  armNear: [10, 4, 6],
  armFar: [12, 4, 6],
  legNear: [0, 0, -90],
  legFar: [0, 0, -90],
  ...(footNear === null ? {} : { ikLegNear: footNear }),
  ikLegFar: footFar,
  ikBend: -1,
  ...over
});

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

  "cat-cow": {
    title: "Cat and cows",
    box: FLOOR_BOX,
    tempoMs: 2800,
    loop: "pingpong",
    groundY: 170,
    // No traced path: the movement is spinal, and a joint path would sit under
    // the figure saying less than the bow itself already does.
    poses: [
      quad({ spineBow: 12, head: 216, hip: [180, 134] }),
      quad({ spineBow: -14, head: 148, hip: [180, 126] })
    ]
  },

  "thread-the-needle": {
    title: "Thread the needle",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear"],
    trace: "handNear",
    poses: [
      quad({}),
      quad({
        spine: 186,
        head: 155,
        armNear: [42, -22, -10],
        armFar: [100, 8, 72],
        spineBow: -5
      })
    ]
  },

  "tabletop-down-dog-alternating": {
    title: "Tabletop → downward-facing dog alternating",
    box: FLOOR_BOX,
    tempoMs: 3400,
    loop: "cycle",
    groundY: 170,
    trace: "hip",
    // Up to the dog, pedal one heel then the other, back down.
    poses: [
      quad({}),
      { ...DOWN_DOG, legNear: [45, 10, 20], legFar: [40, 4, 34] },
      { ...DOWN_DOG, legNear: [40, 4, 34], legFar: [45, 10, 20] }
    ]
  },

  "down-dog-hovering-tabletop": {
    title: "Downward dog to hovering tabletop",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    trace: "hip",
    poses: [
      { ...DOWN_DOG },
      // Knees hover a few centimetres off the mat rather than resting on it.
      quad({ hip: [180, 129], spine: 193, spineScale: 1.0, legNear: [90, -90, 0], legFar: [92, -92, 0] })
    ]
  },

  "donkey-kick": {
    title: "Donkey kick",
    box: FLOOR_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [quad({}), quad({ legNear: [10, -90, 80], spine: 194 })]
  },

  "donkey-kick-crossover": {
    title: "Donkey kick + crossover",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "cycle",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    // Kick up, then carry the knee down and across the standing leg.
    poses: [
      quad({}),
      quad({ legNear: [10, -90, 80], spine: 194 }),
      quad({ legNear: [62, -58, 40], spine: 197 })
    ]
  },

  "donkey-kick-dog-crunch": {
    title: "Donkey kick + downward dog crunch in",
    box: FLOOR_BOX,
    tempoMs: 2800,
    loop: "cycle",
    groundY: 170,
    focus: ["legNear"],
    trace: "kneeNear",
    poses: [
      quad({}),
      quad({ legNear: [10, -90, 80], spine: 194 }),
      quad({ legNear: [165, -135, -30], spine: 200, spineBow: -6, head: 160 })
    ]
  },

  "quadruped-leg-extension": {
    title: "Leg extensions",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [quad({}), quad({ legNear: [8, 0, 20], spine: 194 })]
  },

  "quadruped-leg-pulse": {
    title: "Leg pulses",
    box: FLOOR_BOX,
    tempoMs: 900,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    // Small range held at the top, not a full extension.
    poses: [quad({ legNear: [16, 0, 20] }), quad({ legNear: [0, 0, 20] })]
  },

  rainbow: {
    title: "Rainbow",
    box: OVERHEAD_BOX,
    tempoMs: 2800,
    loop: "pingpong",
    ground: false,
    focus: ["legNear"],
    trace: "ankleNear",
    // Seen from above: the toe arcs from one side, out and over, to the other.
    // The arc is the whole point of the movement and is invisible side-on.
    poses: [
      overhead([180 + Math.cos(-32 * (Math.PI / 180)) * 58, 102 + Math.sin(-32 * (Math.PI / 180)) * 58]),
      overhead([250, 102]),
      overhead([180 + Math.cos(32 * (Math.PI / 180)) * 58, 102 + Math.sin(32 * (Math.PI / 180)) * 58])
    ]
  },

  "childs-pose": {
    title: "Child's pose",
    box: KNEELING_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 170,
    ghost: false,
    poses: [kneelingFold({})]
  },

  "childs-pose-side-stretch": {
    title: "Child's pose with side stretches",
    box: KNEELING_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Walking the hands away is lateral, so a side view can only show the
    // reach, not which way it goes. It still beats standing in a generic pose.
    poses: [
      kneelingFold({}),
      kneelingFold({ armNear: [180, 6, 3], armFar: [182, 6, 3], spineBow: -10, hip: [218, 138] })
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

  "glute-bridge-curl": {
    title: "Glute bridge curl",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    // The hips stay lifted throughout; only the heels travel.
    poses: [
      bridge(134, 162, [234, 172], [236, 172], { spineScale: 1.06 }),
      bridge(134, 162, [203, 172], [205, 172], { spineScale: 1.06 })
    ]
  },

  "glute-bridge-pulse": {
    title: "Glute bridge pulse",
    box: FLOOR_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 172,
    // No traced path: a pulse travels too little for one to say anything the
    // start-pose ghost does not already show.
    poses: [
      bridge(137, 165, [222, 172], [224, 172], { spineScale: 1.05 }),
      bridge(125, 153, [222, 172], [224, 172], { spineScale: 1.08 })
    ]
  },

  "one-leg-banded-bridge": {
    title: "One-leg banded bridge",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "hip",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 4 }],
    poses: [
      bridge(156, 182, null, [224, 172], { legNear: [-28, 0, 22] }),
      bridge(133, 161, null, [224, 172], { spineScale: 1.06, legNear: [-42, 0, 22] })
    ]
  },

  "banded-bridge": {
    title: "Bridge with band around thighs",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 172,
    trace: "hip",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Hip spread separates the knees so the band pressing them apart is
    // visible at all; side-on the legs would otherwise sit on top of each other.
    poses: [
      bridge(157, 183, [216, 172], [236, 172], { hipSpread: 15 }),
      bridge(131, 160, [216, 172], [236, 172], { hipSpread: 15, spineScale: 1.07 })
    ]
  },

  /* ---- supine core ---- */

  "crunch-legs-lifted": {
    title: "Crunch w legs lifted",
    box: SUPINE_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    poses: [
      supine({ legNear: [-80, 80, -10], legFar: [-78, 80, -10], armNear: [8, 5, 4], armFar: [10, 5, 4] }),
      supine({
        ...CURLED,
        legNear: [-80, 80, -10],
        legFar: [-78, 80, -10],
        armNear: [4, 6, 4],
        armFar: [6, 6, 4]
      })
    ]
  },

  "one-leg-stretch": {
    title: "The one leg stretch - alternating sides",
    box: SUPINE_BOX,
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    // Curled throughout: only the legs alternate.
    poses: [
      supine({ ...CURLED, legNear: [-110, 130, -10], legFar: [-20, 8, 0], armNear: [-30, 15, 5], armFar: [10, 15, 6] }),
      supine({ ...CURLED, legNear: [-20, 8, 0], legFar: [-110, 130, -10], armNear: [10, 15, 6], armFar: [-30, 15, 5] })
    ]
  },

  "bicycle-legs": {
    title: "Bicycle legs",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "cycle",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    // Both feet ride the same circle half a turn apart, which is what makes it
    // a pedal rather than an alternating tuck.
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      const at = (angle: number): Point => [212 + Math.cos(angle) * 20, 114 + Math.sin(angle) * 20];
      return supine({
        ...CURLED,
        armNear: [20, 15, 8],
        armFar: [22, 15, 8],
        ikBend: -1,
        ikLegNear: at(t),
        ikLegFar: at(t + Math.PI)
      });
    }) as [Pose, ...Pose[]]
  },

  "leg-lowers": {
    title: "Leg lowers",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    poses: [
      supine({ legNear: [-86, 2, -4], legFar: [-84, 2, -4] }),
      supine({ legNear: [-30, 2, -4], legFar: [-28, 2, -4] })
    ]
  },

  "one-leg-circle": {
    title: "One leg circle",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "cycle",
    groundY: 162,
    focus: ["legNear"],
    trace: "ankleNear",
    // One leg stays long on the mat while the other draws the circle overhead.
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      return supine({
        ikBend: -1,
        ikLegNear: [212 + Math.cos(t) * 18, 105 + Math.sin(t) * 18]
      });
    }) as [Pose, ...Pose[]]
  },

  "roll-ups": {
    title: "Roll ups",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    poses: [
      supine({ armNear: [215, 6, 4], armFar: [217, 6, 4] }),
      supine({
        spine: 299,
        spineScale: 0.96,
        spineBow: -12,
        head: 20,
        facing: 40,
        armNear: [30, -10, 0],
        armFar: [32, -10, 0]
      })
    ]
  },

  "reverse-plank-l-sit": {
    title: "Reverse plank to L-sit",
    box: SEATED_BOX,
    tempoMs: 2800,
    loop: "pingpong",
    groundY: 162,
    trace: "hip",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      // Reverse plank: hips driven up, body one line from shoulder to heel.
      {
        hip: [186, 124],
        spine: 195,
        head: 209,
        facing: 285,
        armNear: [88, 2, 80],
        armFar: [90, 2, 78],
        legNear: [26, 4, 20],
        legFar: [28, 4, 20]
      },
      // L-sit: hips down, torso leaning back over supporting arms, legs level.
      {
        hip: [186, 144],
        spine: 217,
        head: 240,
        facing: 320,
        armNear: [90, 0, 84],
        armFar: [92, 0, 82],
        legNear: [-4, 2, -6],
        legFar: [-2, 2, -6]
      }
    ]
  },

  "slider-in-outs": {
    title: "In and outs with sliders",
    box: SEATED_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      {
        hip: [180, 146],
        spine: 225,
        head: 250,
        facing: 320,
        armNear: [85, 2, 84],
        armFar: [87, 2, 82],
        legNear: [0, 0, 20],
        legFar: [0, 0, 20],
        ikBend: -1,
        ikLegNear: [252, 158],
        ikLegFar: [254, 158]
      },
      {
        hip: [180, 146],
        spine: 222,
        head: 247,
        facing: 320,
        armNear: [85, 2, 84],
        armFar: [87, 2, 82],
        legNear: [0, 0, -20],
        legFar: [0, 0, -20],
        ikBend: -1,
        ikLegNear: [210, 158],
        ikLegFar: [212, 158]
      }
    ]
  },

  /* ---- supine core, band ---- */

  "banded-tabletop-crunch": {
    title: "Tabletop crunch - band below knees",
    box: SUPINE_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Hip spread separates the knees so the band across them is visible at all.
    poses: [
      supine({ hipSpread: 8, legNear: [-80, 80, -10], legFar: [-78, 80, -10], armNear: [8, 5, 4], armFar: [10, 5, 4] }),
      supine({
        ...CURLED,
        hipSpread: 8,
        legNear: [-80, 80, -10],
        legFar: [-78, 80, -10],
        armNear: [4, 6, 4],
        armFar: [6, 6, 4]
      })
    ]
  },

  "banded-hundred": {
    title: "Hundredth - band below knees",
    box: SUPINE_BOX,
    tempoMs: 700,
    loop: "pingpong",
    groundY: 162,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Held curl with legs long; only the arms pump.
    poses: [
      supine({ ...CURLED, hipSpread: 8, legNear: [-40, 4, -6], legFar: [-38, 4, -6], armNear: [4, 10, 6], armFar: [6, 10, 6] }),
      supine({ ...CURLED, hipSpread: 8, legNear: [-40, 4, -6], legFar: [-38, 4, -6], armNear: [30, 10, 6], armFar: [32, 10, 6] })
    ]
  },

  "banded-leg-lowers": {
    title: "Leg lowers - band around ankles",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [{ type: "band", from: "ankleNear", to: "ankleFar", sag: 3 }],
    poses: [
      supine({ hipSpread: 7, legNear: [-86, 2, -4], legFar: [-84, 2, -4] }),
      supine({ hipSpread: 7, legNear: [-30, 2, -4], legFar: [-28, 2, -4] })
    ]
  },

  "banded-flutter-kicks": {
    title: "Flutter kicks up and down - band around ankles",
    box: SUPINE_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [{ type: "band", from: "ankleNear", to: "ankleFar", sag: 3 }],
    // Small, fast, and opposed: the legs pass each other rather than travel far.
    poses: [
      supine({ hipSpread: 6, legNear: [-58, 3, -6], legFar: [-30, 3, -6] }),
      supine({ hipSpread: 6, legNear: [-30, 3, -6], legFar: [-58, 3, -6] })
    ]
  },

  "banded-roll-ups": {
    title: "Roll ups - band around wrists",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 4 }],
    poses: [
      supine({ shoulderSpread: 11, armNear: [215, 6, 4], armFar: [221, 6, 4] }),
      supine({
        shoulderSpread: 11,
        spine: 299,
        spineScale: 0.96,
        spineBow: -12,
        head: 20,
        facing: 40,
        armNear: [28, -10, 0],
        armFar: [34, -10, 0]
      })
    ]
  },

  "banded-russian-twist": {
    title: "Russian twist - band around wrists",
    box: SEATED_FRONT_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 190,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 5 }],
    // Front view: the rotation is what the exercise is, and side-on it would
    // happen entirely into the screen.
    poses: [
      {
        hip: [150, 144],
        spine: 272,
        head: 272,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [40, 10, 4],
        armFar: [48, 10, 4],
        legNear: [55, 25, 15],
        legFar: [125, -25, -15],
        legNearScale: 0.65,
        legFarScale: 0.65
      },
      {
        hip: [150, 144],
        spine: 268,
        head: 268,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [132, -10, -4],
        armFar: [140, -10, -4],
        legNear: [55, 25, 15],
        legFar: [125, -25, -15],
        legNearScale: 0.65,
        legFarScale: 0.65
      }
    ]
  },

  /* ---- side-lying ---- */

  "side-lying-leg-lift": {
    title: "Leg lift",
    box: SIDE_LYING_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // Straight top leg, unlike the bent-knee clamshells below.
    poses: [
      sideLying({ legNear: [4, 2, -14], legFar: [8, 2, -14] }),
      sideLying({ legNear: [-26, 2, -14], legFar: [8, 2, -14] })
    ]
  },

  "clamshell-openers": {
    title: "Clamshell openers",
    box: SIDE_LYING_BOX,
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    // The knee is what travels; the feet stay together throughout.
    trace: "kneeNear",
    poses: [sideLying({}), sideLying({ legNear: [-12, 22, 0] })]
  },

  "clamshell-lifts": {
    title: "Clamshell lifts",
    box: SIDE_LYING_BOX,
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    // The whole bent leg rises, so the foot travels too — that is what
    // separates a lift from an opener.
    trace: "ankleNear",
    poses: [sideLying({}), sideLying({ legNear: [-16, -40, 0] })]
  },

  "side-body-crunch": {
    title: "Side-body crunches",
    box: SIDE_LYING_BOX,
    tempoMs: 2100,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear", "armNear"],
    trace: "kneeNear",
    poses: [
      sideLying({ armNear: [196, 108, 22], legNear: [6, 2, -14], legFar: [10, 2, -14] }),
      sideLying({
        spine: 172,
        spineBow: -11,
        armNear: [232, 96, 22],
        legNear: [-34, 64, -10],
        legFar: [10, 2, -14]
      })
    ]
  },

  "side-lying-big-circles": {
    title: "Big leg circles",
    box: SIDE_LYING_BOX,
    tempoMs: 3000,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      return sideLying({
        legFar: [8, 2, -14],
        ikBend: 1,
        ikLegNear: sideLyingFoot(-6 - 24 * Math.cos(t), 66 + 5 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "side-lying-small-circles": {
    title: "Small leg circle pulses",
    box: SIDE_LYING_BOX,
    tempoMs: 1400,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // The same shape as the big circles, held small and quick at the top.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return sideLying({
        legFar: [8, 2, -14],
        ikBend: 1,
        ikLegNear: sideLyingFoot(-14 - 8 * Math.cos(t), 68 + 3 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "side-lying-forward-back-kick": {
    title: "Forward and back kick",
    box: SIDE_LYING_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [
      sideLying({ legNear: [-55, 14, -12], legFar: [8, 2, -14] }),
      sideLying({ legNear: [26, 2, -14], legFar: [8, 2, -14] })
    ]
  },

  "side-lying-straight-leg-crunch": {
    title: "Straight leg crunches",
    box: SIDE_LYING_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear", "armNear"],
    trace: "ankleNear",
    // Straight top leg meeting the top elbow, unlike the bent-knee crunch.
    poses: [
      sideLying({ armNear: [196, 108, 22], legNear: [6, 2, -14], legFar: [8, 2, -14] }),
      sideLying({
        spine: 172,
        spineBow: -11,
        armNear: [232, 96, 22],
        legNear: [-40, 3, -12],
        legFar: [8, 2, -14]
      })
    ]
  },

  "tricep-side-push-up": {
    title: "Tricep side push-up",
    box: SIDE_LYING_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["armFar"],
    trace: "shoulder",
    // The bottom arm does the work: it bends to lower and straightens to press.
    poses: [
      sideLying({ hip: [186, 142], spine: 174, armFar: [118, 84, 24], armNear: [16, 6, 4] }),
      sideLying({ hip: [186, 132], spine: 192, armFar: [100, 16, 30], armNear: [10, 4, 4] })
    ]
  },

  /* ---- cooldown and stretches ---- */

  "standing-roll-down": {
    title: "Lower down slowly",
    box: STANDING_BOX,
    tempoMs: 3400,
    loop: "pingpong",
    groundY: 196,
    trace: "head",
    // One vertebra at a time: the bow does the talking, not the limbs.
    poses: [
      standingSide({}),
      standingSide({ spine: 160, spineBow: -14, head: 130, facing: 110, armNear: [104, 28, 16], armFar: [106, 28, 16] })
    ]
  },

  "standing-forward-fold": {
    title: "Forward fold",
    box: STANDING_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 196,
    ghost: false,
    poses: [
      standingSide({
        spine: 158,
        spineBow: -16,
        head: 126,
        facing: 105,
        armNear: [106, 30, 18],
        armFar: [108, 30, 18]
      })
    ]
  },

  "standing-side-stretch": {
    title: "Standing side-body stretch",
    box: STANDING_REACH_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear"],
    trace: "handNear",
    // Seen head-on, because a side bend is lateral and vanishes in profile.
    poses: [
      standingFront({ armNear: [278, 22, 12], armFar: [92, -4, 0] }),
      standingFront({ spineBow: 14, armNear: [304, 14, 8], armFar: [98, -4, 0] })
    ]
  },

  "crescent-lunge": {
    title: "Crescent low lunge",
    box: STANDING_REACH_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 196,
    ghost: false,
    poses: [
      {
        hip: [168, 152],
        spine: 268,
        head: 268,
        facing: 186,
        armNear: [280, 6, 4],
        armFar: [282, 6, 4],
        // Front foot planted ahead, back foot long behind: both are on the mat,
        // so both are driven by targets rather than angles.
        legNear: [0, 0, 30],
        legFar: [0, 0, -20],
        ikBend: 1,
        ikLegNear: [140, 196],
        ikLegFar: [222, 192]
      }
    ]
  },

  "supine-overhead-arm-stretch": {
    title: "Overhead arm stretch",
    box: SUPINE_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 162,
    ghost: false,
    poses: [supine({ armNear: [200, 3, 2], armFar: [202, 3, 2] })]
  },

  "hug-knees": {
    title: "Hug knees in towards chest",
    box: SUPINE_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 162,
    ghost: false,
    poses: [
      supine({
        ...CURLED,
        spine: 192,
        legNear: [-120, 118, -8],
        legFar: [-116, 118, -8],
        armNear: [-46, 52, 14],
        armFar: [-42, 52, 14]
      })
    ]
  },

  "figure-four-twist": {
    title: "Lying figure four → twist → switch sides",
    box: SUPINE_BOX,
    tempoMs: 3200,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear"],
    trace: "kneeNear",
    poses: [
      supine({ legNear: [-105, 100, -10], legFar: [-48, 100, -22] }),
      supine({
        legNear: [-150, 100, -10],
        legFar: [-48, 100, -22],
        // No shoulder spread here: lying on the back it is perpendicular to the
        // mat, so it would drive the far arm straight through the floor.
        spine: 176,
        spineBow: 7
      })
    ]
  },

  "windshield-wipers": {
    title: "Bent-knee windshield wipers",
    box: OVERHEAD_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    ground: false,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // Overhead: the knees drop side to side, which is invisible in profile.
    poses: [
      {
        hip: [186, 102],
        spine: 180,
        head: 180,
        armNear: [232, 4, 4],
        armFar: [128, -4, -4],
        legNear: [-52, 96, 10],
        legFar: [-44, 96, 10]
      },
      {
        hip: [186, 102],
        spine: 180,
        head: 180,
        armNear: [232, 4, 4],
        armFar: [128, -4, -4],
        legNear: [44, -96, -10],
        legFar: [52, -96, -10]
      }
    ]
  },

  "down-dog": {
    title: "Downward-facing dog",
    box: FLOOR_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 170,
    ghost: false,
    poses: [{ ...DOWN_DOG }]
  },

  "down-dog-childs-seated": {
    title: "Downward-facing dog → child's pose → seated",
    // One box wide enough for all three shapes in the sequence.
    box: "76 64 216 121.5",
    tempoMs: 4200,
    loop: "cycle",
    groundY: 170,
    trace: "hip",
    poses: [
      { ...DOWN_DOG },
      kneelingFold({}),
      {
        hip: [206, 150],
        spine: 268,
        head: 268,
        facing: 190,
        armNear: [96, 4, 70],
        armFar: [98, 4, 68],
        legNear: [130, -132, 2],
        legFar: [133, -135, 2]
      }
    ]
  },

  "seated-forward-fold": {
    title: "Hamstring stretch → seated forward fold",
    box: SEATED_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "head",
    poses: [
      {
        hip: [180, 150],
        spine: 276,
        head: 276,
        facing: 350,
        armNear: [40, 12, 6],
        armFar: [42, 12, 6],
        legNear: [-2, 2, -20],
        legFar: [0, 2, -20]
      },
      {
        hip: [180, 150],
        spine: 322,
        spineBow: -13,
        head: 8,
        facing: 40,
        armNear: [14, 6, 4],
        armFar: [16, 6, 4],
        legNear: [-2, 2, -20],
        legFar: [0, 2, -20]
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
        facing: 266,
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

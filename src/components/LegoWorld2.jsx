import { useMemo } from 'react'
import { InstancedStuds, InstancedBoxes, InstancedWindows, InstancedClouds } from './Instanced'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const BRICK_PALETTE = [
  '#E53935','#1565C0','#FFD700','#FF9800',
  '#4CAF50','#AB47BC','#00897B','#F4511E',
  '#D81B60','#0288D1',
]
function darken(hex, f = 0.72) {
  const n = parseInt(hex.replace('#',''), 16)
  const r = Math.floor(((n >> 16) & 0xff) * f)
  const g = Math.floor(((n >> 8) & 0xff) * f)
  const b = Math.floor((n & 0xff) * f)
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// Road runs along Z axis.
// Road occupies X = [-2.5, +2.5]  (widened slightly for cars)
// Sidewalks: Left X = [-4.2, -2.6],  Right X = [+2.6, +4.2]  → centre at ±3.4
// Buildings start at X ≤ -6  or  X ≥ +6
// Park area: X=[6,16], Z=[10,22]  — right side, well clear of road
// Characters & action zone: X=[-5,5], Z=[-4,6]  — kept clear of trees/buildings

const GROUND_Y  = 0
const STUD_H    = 0.14
const STUD_R    = 0.17
const STUD_Y    = GROUND_Y + STUD_H / 2 + 0.001
const ROAD_Y    = 0.008

// Road X extents
const ROAD_LEFT  = -2.5
const ROAD_RIGHT =  2.5

// ─── BUILDINGS ────────────────────────────────────────────────────────────────
// Rules:
//  • No building footprint overlaps road corridor X:[-2.5, +2.5]
//  • No building overlaps park X:[5,18], Z:[8,24]
//  • No building overlaps character zone X:[-5,5], Z:[-5,7]
//  • Minimum 3-unit clearance between any two building centres (accounting for w/d)
//  • All X positions ≤ -6 (left) or ≥ +6 (right)
const BUILDINGS = [
  // ── LEFT DISTRICT ──────────────────────────────────────────────────────
  { pos:[-26, 0,-20], color:'#E53935', floors:12, w:5.0, d:5.0 },
  { pos:[-26, 0, -6], color:'#1565C0', floors: 9, w:4.5, d:4.5 },
  { pos:[-26, 0,  9], color:'#7B1FA2', floors:15, w:5.2, d:5.2 },
  { pos:[-26, 0, 22], color:'#FF9800', floors: 7, w:4.4, d:4.4 },

  { pos:[-18, 0,-24], color:'#FF9800', floors: 8, w:4.0, d:4.0 },
  { pos:[-18, 0,-13], color:'#00897B', floors:11, w:4.5, d:4.5 },
  { pos:[-18, 0,  0], color:'#D81B60', floors: 7, w:3.8, d:3.8 },
  { pos:[-18, 0, 13], color:'#0288D1', floors:10, w:4.2, d:4.2 },
  { pos:[-18, 0, 24], color:'#558B2F', floors: 6, w:3.6, d:3.6 },

  { pos:[-10, 0,-24], color:'#AB47BC', floors: 6, w:3.4, d:3.4 },
  { pos:[-10, 0,-14], color:'#4CAF50', floors: 8, w:3.8, d:3.8 },
  // gap at Z=[-4,6] — character zone — no building here on left close side
  { pos:[ -9, 0, 20], color:'#F4511E', floors: 5, w:3.2, d:3.2 },

  // ── RIGHT DISTRICT ─────────────────────────────────────────────────────
  { pos:[ 26, 0,-20], color:'#F4511E', floors:13, w:5.0, d:5.0 },
  { pos:[ 26, 0, -6], color:'#E53935', floors:10, w:4.5, d:4.5 },
  { pos:[ 26, 0,  9], color:'#FFD700', floors:16, w:5.4, d:5.4 },
  { pos:[ 26, 0, 22], color:'#4CAF50', floors: 8, w:4.4, d:4.4 },

  { pos:[ 18, 0,-24], color:'#795548', floors: 9, w:4.0, d:4.0 },
  { pos:[ 18, 0,-13], color:'#4CAF50', floors:12, w:4.5, d:4.5 },
  { pos:[ 18, 0,  0], color:'#AB47BC', floors: 8, w:4.0, d:4.0 },
  // Right side Z=[10,22] is PARK — no buildings here
  { pos:[ 18, 0, 26], color:'#00897B', floors: 7, w:4.0, d:4.0 },

  { pos:[ 10, 0,-24], color:'#D81B60', floors: 7, w:3.6, d:3.6 },
  { pos:[ 10, 0,-14], color:'#1565C0', floors: 9, w:3.8, d:3.8 },
  // gap at Z=[-4,8] for character zone
  // Park side: no buildings X:[5,18], Z:[8,24]

  // ── BACK ROW (Z ≤ -26) ─────────────────────────────────────────────────
  { pos:[-20, 0,-32], color:'#E53935', floors:11, w:4.8, d:4.8 },
  { pos:[ -8, 0,-32], color:'#FF9800', floors: 8, w:4.0, d:4.0 },
  { pos:[  4, 0,-32], color:'#1565C0', floors:13, w:5.0, d:5.0 },
  { pos:[ 16, 0,-32], color:'#7B1FA2', floors: 9, w:4.4, d:4.4 },
]

// ─── TREES ────────────────────────────────────────────────────────────────────
// • NOT on road X:[-2.5,+2.5]
// • NOT in character zone X:[-3,3], Z:[-3,5]
// • NOT inside buildings
// • Sidewalk trees: X = ±3.9 (inside the sidewalk strip, clear of road edge)
// • Park trees: right side around fountain at [11, 0, 16]
const TREE_POSITIONS = [
  // Left sidewalk — X=-3.9, spread along Z, skip character zone Z:[-3,5]
  [-3.9, 0,-22], [-3.9, 0,-17], [-3.9, 0,-12], [-3.9, 0, -7],
  [-3.9, 0,  8], [-3.9, 0, 13], [-3.9, 0, 18],

  // Right sidewalk — X=+3.9, same Z spacing
  [ 3.9, 0,-22], [ 3.9, 0,-17], [ 3.9, 0,-12], [ 3.9, 0, -7],
  [ 3.9, 0,  8], [ 3.9, 0, 13], [ 3.9, 0, 18],

  // Park cluster around fountain [11, 0, 16]
  [ 7, 0, 12], [ 7, 0, 16], [ 7, 0, 20],
  [15, 0, 12], [15, 0, 16], [15, 0, 20],
  [11, 0, 10], [11, 0, 22],

  // Back corners (well clear of everything)
  [-6, 0,-26], [ 6, 0,-26],
]

// ─── BUILDING COMPONENT ───────────────────────────────────────────────────────
function LegoBuilding({ position, color, floors = 6, width = 2.8, depth = 2.8 }) {
  const alt = darken(color, 0.82)
  const FLOOR_H = 0.65

  const floorInst = useMemo(() => Array.from({ length: floors }, (_, i) => ({
    position: [position[0], FLOOR_H * 0.5 + i * FLOOR_H, position[2]],
    color: i % 2 === 0 ? color : alt,
    scale: [width, FLOOR_H, depth],
  })), [position, color, alt, floors, width, depth])

  const studPositions = useMemo(() => {
    const arr = []
    const cols = Math.max(2, Math.round(width  / 0.9))
    const rows = Math.max(2, Math.round(depth  / 0.9))
    for (let f = 0; f < floors; f++) {
      const topY = FLOOR_H * (f + 1) + STUD_H * 0.5
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          arr.push([
            position[0] - width / 2 + (c + 0.5) * (width  / cols),
            topY,
            position[2] - depth / 2 + (r + 0.5) * (depth / rows),
          ])
    }
    return arr
  }, [position, floors, width, depth])

  const winPositions = useMemo(() => {
    const arr = []
    const cols = Math.max(2, Math.round(width / 1.1))
    for (let f = 0; f < floors; f++) {
      const y = FLOOR_H * 0.5 + f * FLOOR_H
      for (let c = 0; c < cols; c++) {
        const x = position[0] - width / 2 + (c + 0.5) * (width / cols)
        arr.push([x, y, position[2] + depth / 2 + 0.04])
        arr.push([x, y, position[2] - depth / 2 - 0.04, Math.PI])
      }
    }
    return arr
  }, [position, floors, width, depth])

  const roofY = FLOOR_H * floors

  return (
    <>
      <InstancedBoxes instances={floorInst} args={[1, 1, 1]} />
      <InstancedStuds positions={studPositions} color={darken(color, 0.62)} radius={0.13} height={STUD_H} />
      <InstancedWindows positions={winPositions} />
      {/* Roof cap */}
      <mesh position={[position[0], roofY + 0.17, position[2]]} castShadow>
        <boxGeometry args={[width + 0.18, 0.34, depth + 0.18]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Penthouse */}
      <mesh position={[position[0], roofY + 0.38 + 0.22, position[2]]} castShadow>
        <boxGeometry args={[width * 0.52, 0.44, depth * 0.52]} />
        <meshLambertMaterial color={darken(color, 0.52)} />
      </mesh>
      {/* Penthouse stud */}
      <mesh position={[position[0], roofY + 0.38 + 0.44 + STUD_H * 0.5, position[2]]} castShadow>
        <cylinderGeometry args={[width * 0.12, width * 0.12, STUD_H, 10]} />
        <meshLambertMaterial color={darken(color, 0.45)} />
      </mesh>
    </>
  )
}

// ─── TREES ────────────────────────────────────────────────────────────────────
function LegoTrees({ positions }) {
  const TRUNK_H = 1.8
  const L1_H = 0.62, L1_W = 2.4
  const L2_H = 0.62, L2_W = 1.75
  const L3_H = 0.62, L3_W = 1.15

  const trunkY  = TRUNK_H / 2
  const l1Y     = TRUNK_H + L1_H / 2
  const l2Y     = TRUNK_H + L1_H + L2_H / 2
  const l3Y     = TRUNK_H + L1_H + L2_H + L3_H / 2
  const l1StudY = TRUNK_H + L1_H + STUD_H / 2

  const trunkInst = useMemo(() => positions.map(([x,,z]) =>
    ({ position:[x, trunkY, z], color:'#6D4C41', scale:[0.44, TRUNK_H, 0.44] })), [positions])
  const l1Inst = useMemo(() => positions.map(([x,,z]) =>
    ({ position:[x, l1Y, z], color:'#2E7D32', scale:[L1_W, L1_H, L1_W] })), [positions])
  const l2Inst = useMemo(() => positions.map(([x,,z]) =>
    ({ position:[x, l2Y, z], color:'#388E3C', scale:[L2_W, L2_H, L2_W] })), [positions])
  const l3Inst = useMemo(() => positions.map(([x,,z]) =>
    ({ position:[x, l3Y, z], color:'#43A047', scale:[L3_W, L3_H, L3_W] })), [positions])

  const l1Studs = useMemo(() => positions.flatMap(([x,,z]) => {
    const a = [], c = 2
    for (let ci = 0; ci < c; ci++)
      for (let ri = 0; ri < c; ri++)
        a.push([
          x - L1_W/2 + (ci+0.5)*(L1_W/c),
          l1StudY,
          z - L1_W/2 + (ri+0.5)*(L1_W/c),
        ])
    return a
  }), [positions])

  return (
    <>
      <InstancedBoxes instances={trunkInst} args={[1,1,1]} />
      <InstancedBoxes instances={l1Inst}    args={[1,1,1]} />
      <InstancedStuds positions={l1Studs} color="#1B5E20" radius={0.15} height={STUD_H} />
      <InstancedBoxes instances={l2Inst}    args={[1,1,1]} />
      <InstancedBoxes instances={l3Inst}    args={[1,1,1]} />
    </>
  )
}

// ─── STREET LAMP ──────────────────────────────────────────────────────────────
// Placed entirely on sidewalk — base at X = ±3.9, well clear of road edge ±2.5
function StreetLamp({ ...props }) {
  return (
    <group {...props} >
      {/* Pole */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.13, 3.6, 8]} />
        <meshLambertMaterial color="#546E7A" />
      </mesh>
      {/* Arm — extends toward the road (inward) */}
      <mesh position={[0.5 * 1.5, 1.65, 0]} castShadow>
        <boxGeometry args={[1.0 * 1.5, 0.1, 0.1]} />
        <meshLambertMaterial color="#546E7A" />
      </mesh>
      {/* Bulb housing */}
      <mesh position={[1.0 * 1.5, 1.55, 0]} castShadow>
        <boxGeometry args={[0.34, 0.24, 0.24]} />
        <meshLambertMaterial color="#37474F" />
      </mesh>
      {/* Glowing lens */}
      <mesh position={[1.0 * 1.5, 1.55, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshLambertMaterial color="#FFF9C4" emissive="#FFEE58" emissiveIntensity={1.8} />
      </mesh>
      <pointLight position={[1.0, 1.55, 0]} intensity={0.9} distance={8} color="#FFE082" />
    </group>
  )
}

// ─── BENCH ────────────────────────────────────────────────────────────────────
function Bench({ position, ry = 0 }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.42]} />
        <meshLambertMaterial color="#8D6E63" />
      </mesh>
      <mesh castShadow position={[0, 0.72, -0.17]}>
        <boxGeometry args={[1.2, 0.38, 0.09]} />
        <meshLambertMaterial color="#8D6E63" />
      </mesh>
      {[-0.48, 0.48].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.26, 0]}>
          <boxGeometry args={[0.1, 0.52, 0.42]} />
          <meshLambertMaterial color="#6D4C41" />
        </mesh>
      ))}
    </group>
  )
}

// ─── FOUNTAIN ─────────────────────────────────────────────────────────────────
// Placed in park at [11, 0, 16] — well clear of road
function Fountain({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.8, 0.52, 24]} />
        <meshLambertMaterial color="#90A4AE" />
      </mesh>
      <mesh castShadow position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 1.35, 12]} />
        <meshLambertMaterial color="#78909C" />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.75, 0.7, 0.22, 16]} />
        <meshLambertMaterial color="#90A4AE" />
      </mesh>
      <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.35, 28]} />
        <meshLambertMaterial color="#29B6F6" transparent opacity={0.80} />
      </mesh>
    </group>
  )
}

// ─── LEGO CAR ─────────────────────────────────────────────────────────────────
// Road X: [-2.5, +2.5]
// Lane centres: left lane X=-1.0 (northbound), right lane X=+1.0 (southbound)
// Car body centre Y = 0.32  (wheels kiss the ground)
// ry=0 → faces +Z,  ry=π → faces -Z
function LegoCar({ position, color, ry = 0 }) {
  const dark    = darken(color, 0.78)
  const BODY_L  = 3.2
  const BODY_W  = 1.55
  const BODY_H  = 0.6
  const CAB_L   = 1.55
  const CAB_W   = 1.42
  const CAB_H   = 0.55
  const WHEEL_R = 0.36
  const WHEEL_T = 0.26
  const WHEEL_Y = -BODY_H * 0.5 + 0.02
  const AXLE_X  = BODY_W * 0.5 + WHEEL_T * 0.5 + 0.02

  return (
    <group position={position} rotation={[0, ry, 0]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[BODY_W, BODY_H, BODY_L]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, BODY_H*0.5 + CAB_H*0.5, -0.1]}>
        <boxGeometry args={[CAB_W, CAB_H, CAB_L]} />
        <meshLambertMaterial color={dark} />
      </mesh>
      {/* Front windshield */}
      <mesh position={[0, BODY_H*0.5 + CAB_H*0.38, CAB_L*0.5 + 0.03]}>
        <boxGeometry args={[CAB_W - 0.1, CAB_H*0.7, 0.05]} />
        <meshLambertMaterial color="#B3E5FC" transparent opacity={0.9} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, BODY_H*0.5 + CAB_H*0.38, -CAB_L*0.5 - 0.03]}>
        <boxGeometry args={[CAB_W - 0.1, CAB_H*0.7, 0.05]} />
        <meshLambertMaterial color="#B3E5FC" transparent opacity={0.9} />
      </mesh>
      {/* Headlights */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.1, BODY_L*0.5 + 0.03]}>
          <boxGeometry args={[0.28, 0.18, 0.05]} />
          <meshLambertMaterial color="#FFFDE7" emissive="#FFEE58" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Tail lights */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.1, -BODY_L*0.5 - 0.03]}>
          <boxGeometry args={[0.28, 0.18, 0.05]} />
          <meshLambertMaterial color="#EF9A9A" emissive="#E53935" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Wheels */}
      {[
        [-AXLE_X, WHEEL_Y,  BODY_L*0.32],
        [ AXLE_X, WHEEL_Y,  BODY_L*0.32],
        [-AXLE_X, WHEEL_Y, -BODY_L*0.32],
        [ AXLE_X, WHEEL_Y, -BODY_L*0.32],
      ].map((wp, i) => (
        <mesh key={i} position={wp} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[WHEEL_R, WHEEL_R, WHEEL_T, 14]} />
          <meshLambertMaterial color="#212121" />
        </mesh>
      ))}
      {/* Hubcaps */}
      {[
        [-AXLE_X, WHEEL_Y,  BODY_L*0.32],
        [ AXLE_X, WHEEL_Y,  BODY_L*0.32],
        [-AXLE_X, WHEEL_Y, -BODY_L*0.32],
        [ AXLE_X, WHEEL_Y, -BODY_L*0.32],
      ].map((wp, i) => (
        <mesh key={i}
          position={[wp[0] + (i%2===0 ? -WHEEL_T*0.5-0.01 : WHEEL_T*0.5+0.01), wp[1], wp[2]]}
        >
          <cylinderGeometry args={[WHEEL_R*0.45, WHEEL_R*0.45, 0.04, 12]} />
          <meshLambertMaterial color="#9E9E9E" />
        </mesh>
      ))}
      {/* Roof stud */}
      <mesh position={[0, BODY_H*0.5 + CAB_H + STUD_H*0.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, STUD_H, 10]} />
        <meshLambertMaterial color={dark} />
      </mesh>
    </group>
  )
}

// ─── MAIN WORLD ───────────────────────────────────────────────────────────────
export default function LegoWorld() {

  // ── Ground base-plate studs ──
  // Skips the road corridor X:[-2.5,+2.5] to avoid studs on tarmac
  const groundStudPos = useMemo(() => {
    const arr = []
    const SPACING = 1.4
    const HALF    = 22
    for (let i = -HALF; i <= HALF; i++) {
      const x = i * SPACING
      for (let j = -HALF; j <= HALF; j++) {
        // Skip road strip
        if (x > ROAD_LEFT - 0.3 && x < ROAD_RIGHT + 0.3) continue
        arr.push([x, STUD_Y, j * SPACING])
      }
    }
    return arr
  }, [])

  // ── Border bricks (perimeter wall) ──
  const BRICK_Y  = 0.32
  const BRICK_H  = 0.64
  const BORDER_Z = 26
  const BORDER_X = 26
  const borderInst = useMemo(() => {
    const arr = []
    const STEP  = 1.3
    const RANGE = Math.ceil(BORDER_Z / STEP)
    for (let i = -RANGE; i <= RANGE; i++) {
      const ci = Math.abs(i) % BRICK_PALETTE.length
      arr.push({ position:[ i*STEP, BRICK_Y, -BORDER_Z], color: BRICK_PALETTE[ci],              scale:[1.22, BRICK_H, 1.22] })
      arr.push({ position:[ i*STEP, BRICK_Y,  BORDER_Z], color: BRICK_PALETTE[(ci+3)%10],       scale:[1.22, BRICK_H, 1.22] })
      arr.push({ position:[-BORDER_X, BRICK_Y,  i*STEP], color: BRICK_PALETTE[(ci+5)%10],       scale:[1.22, BRICK_H, 1.22] })
      arr.push({ position:[ BORDER_X, BRICK_Y,  i*STEP], color: BRICK_PALETTE[(ci+7)%10],       scale:[1.22, BRICK_H, 1.22] })
    }
    return arr
  }, [])

  const borderStudPos = useMemo(() =>
    borderInst.map(({ position: p }) => [p[0], p[1] + BRICK_H*0.5 + STUD_H*0.5, p[2]]),
  [borderInst])

  // ── Road centre-line dashes ──
  const dashInst = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      position: [0, ROAD_Y + 0.003, -22 + i * 1.55],
      color: '#FFEE58',
      scale: [1, 1, 1],
    })),
  [])

  // ── Sidewalk studs — strictly on sidewalk strips, NOT on road ──
  const sidewalkStudPos = useMemo(() => {
    const arr = []
    const SPACING = 1.4
    // Left sidewalk centre X = -3.4,  Right = +3.4
    for (let j = -18; j <= 18; j++) {
      arr.push([-3.4, ROAD_Y + 0.004, j * SPACING])
      arr.push([ 3.4, ROAD_Y + 0.004, j * SPACING])
    }
    return arr
  }, [])

  // ── Street lamp positions ──
  // Poles at X = ±4.2 (outside sidewalk edge, arm reaches inward)
  // Z spacing = 6 units, skip the character/action zone Z:[-4,6]
  const LAMP_POSITIONS = [
    [-4.2, 1.5,-19.5], [ 4.2, 1.5,-19.5],
    [-4.2, 1.5,-16 + 2], [ 4.2, 1.5,-16 + 2],
    [-4.2, 1.5,-9.5], [ 4.2, 1.5,-9.5],
    // [-4.2, 1.5, -4], [ 4.2, 1.5, -4],
    // [-4.2, 1.5,  4], [ 4.2, 1.5,  4],
    [-4.2, 1.5, 10.5], [ 4.2, 1.5, 10.5],
    [-4.2, 1.5, 15.5], [ 4.2, 1.5, 15.5],
    [-4.2, 1.5, 20], [ 4.2, 1.5, 20],
    [-4.2, 1.5, 23], [ 4.2, 1.5, 23],
  ]

  return (
    <group>
      {/* ── BASE GREEN GROUND PLATE ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshLambertMaterial color="#388E3C" />
      </mesh>
      {/* Far horizon fill */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[700, 700]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>

      {/* ── GROUND STUDS — road corridor excluded ── */}
      <InstancedStuds
        positions={groundStudPos}
        color="#2E7D32"
        radius={STUD_R}
        height={STUD_H}
      />

      {/* ── SIDEWALKS ── */}
      {/* Left sidewalk  X centre = -3.4, width 1.8 */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[-3.4, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[1.8, 52]} />
        <meshLambertMaterial color="#B0BEC5" />
      </mesh>
      {/* Right sidewalk X centre = +3.4 */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[ 3.4, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[1.8, 52]} />
        <meshLambertMaterial color="#B0BEC5" />
      </mesh>
      {/* Cross-streets */}
      {/* <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, ROAD_Y, -22]} receiveShadow>
        <planeGeometry args={[20, 1.8]} />
        <meshLambertMaterial color="#B0BEC5" />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, ROAD_Y, 18]} receiveShadow>
        <planeGeometry args={[20, 1.8]} />
        <meshLambertMaterial color="#B0BEC5" />
      </mesh> */}

      {/* Sidewalk studs */}
      <InstancedStuds positions={sidewalkStudPos} color="#90A4AE" radius={0.14} height={STUD_H * 0.8} />

      {/* ── PARK AREA — right side, X:[5,18], Z:[9,24] ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[11, ROAD_Y + 0.001, 16]} receiveShadow>
        <circleGeometry args={[6.5, 36]} />
        <meshLambertMaterial color="#A5D6A7" />
      </mesh>
      {/* Paved path ring around fountain */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[11, ROAD_Y + 0.002, 16]}>
        <ringGeometry args={[3.2, 6.0, 32]} />
        <meshLambertMaterial color="#CFD8DC" />
      </mesh>

      {/* ── ROAD ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[5.0, 52]} />
        <meshLambertMaterial color="#5D5D5D" />
      </mesh>
      {/* Road edge lines */}
      {[ROAD_LEFT - 0.06, ROAD_RIGHT + 0.06].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[x, ROAD_Y + 0.002, 0]}>
          <planeGeometry args={[0.1, 52]} />
          <meshLambertMaterial color="#FFEE58" />
        </mesh>
      ))}
      {/* Centre dashes */}
      <InstancedBoxes instances={dashInst} args={[0.12, 0.01, 0.75]} />

      {/* ── BORDER BRICKS ── */}
      <InstancedBoxes instances={borderInst} args={[1, 1, 1]} />
      <InstancedStuds positions={borderStudPos} color={darken('#888', 0.58)} radius={0.13} height={STUD_H} />

      {/* ── BUILDINGS ── */}
      {BUILDINGS.map((b, i) => (
        <LegoBuilding 
          key={i}
          position={b.pos}
          color={b.color}
          floors={b.floors}
          width={b.w}
          depth={b.d}
        />
      ))}

      {/* ── TREES ── */}
      <LegoTrees positions={TREE_POSITIONS} />

      {/* ── STREET LAMPS — poles at X=±4.2, fully on sidewalk ── */}
      {LAMP_POSITIONS.map(([x, y, z], i) => (
        <StreetLamp key={i} rotation={[0,i%2 == 1 ? Math.PI  : 0, 0]} position={[x - ( i%2 == 1 ? 1 : -1 ), y, z]} />
      ))}

      {/* ── FOUNTAIN — in park at [11, 0, 16] ── */}
      <Fountain position={[11, 0, 16]} />

      {/* ── BENCHES — around fountain ── */}
      <Bench position={[ 7.5, 0, 16]} ry={ Math.PI/2} />
      <Bench position={[14.5, 0, 16]} ry={-Math.PI/2} />
      <Bench position={[11,   0, 12]} ry={0} />
      <Bench position={[11,   0, 20]} ry={Math.PI} />

      {/* ── CARS ──
          Northbound lane: X = -1.0, ry = 0  (heading +Z)
          Southbound lane: X = +1.0, ry = π  (heading -Z)
          Y = 0.32 so wheels touch the ground
      ── */}
      {/* Northbound */}
      <LegoCar position={[-1.0, 0.65, -18]} color="#F44336" ry={0} />
      <LegoCar position={[-1.0, 0.65,  -8]} color="#FFEB3B" ry={0} />
      <LegoCar position={[-1.0, 0.65,  12]} color="#4CAF50" ry={0} />
      {/* Southbound */}
      <LegoCar position={[ 1.0, 0.65,  14]} color="#2196F3" ry={Math.PI} />
      {/* <LegoCar position={[ 1.0, 0.65,   0]} color="#FF9800" ry={Math.PI} /> */}
      <LegoCar position={[ 1.0, 0.65, -16]} color="#9C27B0" ry={Math.PI} />

      {/* ── CLOUDS ── */}
      <InstancedClouds />
    </group>
  )
}
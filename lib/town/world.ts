export interface Vec2 {
  x: number
  z: number
}

/** A solid block. `h` is its top; low ones can be jumped onto. */
export interface Box {
  x: number
  z: number
  w: number
  d: number
  h: number
}

/** The plaza is the 2-minute path. The west and east districts are optional side trips. */
export const bounds = { minX: -31, maxX: 31, minZ: -12.4, maxZ: 12.6 }

export const spawn: Vec2 = { x: 0, z: 11.2 }

export const gate = { x: 0, z: -12.9, halfWidth: 1.6 }

export type NpcId =
  | "guide"
  | "doctor"
  | "vest"
  | "ship"
  | "barber"
  | "gerald"
  | "engineer"
  | "cya"
  | "sommelier"

export interface Spot extends Vec2 {
  y: number
  facing: number
}

export const npcSpots: Record<NpcId, Spot> = {
  guide: { x: 2.6, z: 8.4, y: 0, facing: -0.6 },
  doctor: { x: -6.6, z: -0.6, y: 0, facing: 0.7 },
  vest: { x: 2.3, z: -6.8, y: 0, facing: -0.5 },
  ship: { x: -6.4, z: 8.6, y: 0, facing: 0 },
  barber: { x: -19.5, z: 1.3, y: 0, facing: 0.3 },
  gerald: { x: -27, z: 9.5, y: 4.2, facing: 1.2 },
  engineer: { x: 19.5, z: -5.4, y: 0, facing: -0.2 },
  cya: { x: -24, z: -4.6, y: 0, facing: 0 },
  sommelier: { x: 20.5, z: 1.8, y: 0, facing: 0.4 },
}

/** Townspeople with a rigged body. The ship and the academy door are props. */
export const peopleIds = ["guide", "doctor", "vest", "barber", "gerald", "engineer", "sommelier"] as const

/** Where SuperNate's 1987 starfighter came down. */
export const crashSite = { x: -8.2, z: 10.4, angle: 0.5 }

export const layout = {
  loft: { x: -27, z: 9.5, w: 3, d: 3, h: 4.2 },
  barbershop: { x: -19.5, z: -1.3, w: 4.4, d: 2.6, h: 3.2 },
  waymo: { x: 19.5, z: -7.8, w: 3.8, d: 1.9, h: 1.7 },
  academy: { x: -24, z: -7.6, w: 6, d: 4, h: 3.6 },
  // The vineyard sits right behind its sign at the east courtyard entrance.
  vineX: 23,
  vineRows: [3.6, 5.6, 7.6],
}

const hedgeH = 1.3

export const propBoxes: Box[] = [
  { x: -9.6, z: -1.6, w: 3.4, d: 3.4, h: 2.2 },
  { x: 9.2, z: -0.4, w: 2.6, d: 1.2, h: 1.0 },
  { x: 9.6, z: 4.6, w: 2.2, d: 2.2, h: 1.5 },
  { x: 9.6, z: -5.6, w: 2.2, d: 2.2, h: 1.5 },
  { x: 0, z: -8.9, w: 3.6, d: 1.2, h: 1.1 },
  { x: -3.6, z: 4.2, w: 2.2, d: 2.2, h: 0.9 },
  { x: -8.4, z: 10.6, w: 3.6, d: 2.2, h: 1.3 },
  // Hedges around the plaza, with a gap on each side into the districts.
  { x: -13.8, z: -6.45, w: 1.1, d: 14.1, h: hedgeH },
  { x: -13.8, z: 8.95, w: 1.1, d: 9.1, h: hedgeH },
  { x: 13.8, z: -6.35, w: 1.1, d: 14.3, h: hedgeH },
  { x: 13.8, z: 8.35, w: 1.1, d: 10.3, h: hedgeH },
  // West: pigeon loft with a crate staircase, the barbershop, Combinator Y Academy.
  { ...layout.loft },
  { x: -22.7, z: 9.5, w: 1.2, d: 1.2, h: 1.1 },
  { x: -23.9, z: 9.5, w: 1.2, d: 1.2, h: 2.2 },
  { x: -25.1, z: 9.5, w: 1.2, d: 1.2, h: 3.2 },
  { ...layout.barbershop },
  { ...layout.academy },
  // East: the Waymo (with a step-up crate for the roof fry) and the vineyard.
  { ...layout.waymo },
  { x: 17, z: -7.8, w: 1.4, d: 1.4, h: 0.85 },
  ...layout.vineRows.map((z) => ({ x: layout.vineX, z, w: 7, d: 0.6, h: 0.9 })),
]

/** Fries you earn from townspeople, plus one on the Waymo roof. */
export const earnedFries = ["gerald", "barber", "sommelier"] as const

export const roofFry = { x: layout.waymo.x, z: layout.waymo.z, y: layout.waymo.h + 0.9 }

export const FRY_TOTAL = 20
export const fryOrder = 12

const visibleSpots: Vec2[] = [
  { x: 0, z: 9.4 },
  { x: 0, z: 7.6 },
  { x: 0, z: 5.8 },
  { x: -2.2, z: 1.2 },
  { x: 2.2, z: 1.2 },
  { x: 0, z: -1.6 },
  { x: 2.7, z: -8.4 },
  { x: -18, z: 2.4 },
  { x: 18, z: 2 },
  { x: -29, z: -3 },
  { x: 29.5, z: -2.5 },
  { x: 24, z: 8 },
  { x: -10.5, z: -9.5 },
  { x: 10.5, z: -9.5 },
  { x: -16.5, z: 8.6 },
  { x: 16.5, z: 8.2 },
]

/** Fries lying around in plain sight, trimmed so the grand total is exactly 20. */
export const frySpots: Vec2[] = visibleSpots.slice(0, FRY_TOTAL - earnedFries.length - 1)

export const fryRadius = 0.95
export const talkRadius = 2.3
export const npcRadius = 0.85
export const playerRadius = 0.5

/** Top of the highest block under (x, z) that is at or below `y`. */
export function groundAt(x: number, z: number, y: number): number {
  let top = 0
  for (const b of propBoxes) {
    if (Math.abs(x - b.x) < b.w / 2 && Math.abs(z - b.z) < b.d / 2 && b.h <= y + 0.08) {
      top = Math.max(top, b.h)
    }
  }
  return top
}

/** Pushes the player out of blocks taller than them and away from townspeople. */
export function resolve(pos: Vec2, y: number, gateOpen: boolean): Vec2 {
  let { x, z } = pos
  for (const b of propBoxes) {
    if (y >= b.h - 0.08) continue
    const hx = b.w / 2 + playerRadius
    const hz = b.d / 2 + playerRadius
    const dx = x - b.x
    const dz = z - b.z
    if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
      const px = hx - Math.abs(dx)
      const pz = hz - Math.abs(dz)
      if (px < pz) x = b.x + Math.sign(dx || 1) * hx
      else z = b.z + Math.sign(dz || 1) * hz
    }
  }
  for (const [id, spot] of Object.entries(npcSpots) as [NpcId, Spot][]) {
    if (id === "cya") continue
    if (Math.abs(y - spot.y) > 1.2) continue
    const dx = x - spot.x
    const dz = z - spot.z
    const dist = Math.hypot(dx, dz)
    const min = npcRadius + playerRadius
    if (dist < min && dist > 0.0001) {
      x = spot.x + (dx / dist) * min
      z = spot.z + (dz / dist) * min
    }
  }
  x = Math.max(bounds.minX, Math.min(bounds.maxX, x))
  const inGateLane = Math.abs(x - gate.x) < gate.halfWidth - playerRadius * 0.5
  const minZ = gateOpen && inGateLane ? gate.z - 2 : bounds.minZ
  z = Math.max(minZ, Math.min(bounds.maxZ, z))
  return { x, z }
}

export function nearestNpc(pos: Vec2, y: number): NpcId | null {
  let best: NpcId | null = null
  let bestDist = talkRadius
  for (const [id, spot] of Object.entries(npcSpots) as [NpcId, Spot][]) {
    if (Math.abs(y - spot.y) > 1.4) continue
    const d = Math.hypot(pos.x - spot.x, pos.z - spot.z)
    if (d < bestDist) {
      bestDist = d
      best = id
    }
  }
  return best
}

export function throughGate(pos: Vec2, gateOpen: boolean): boolean {
  return gateOpen && pos.z < gate.z - 0.6 && Math.abs(pos.x - gate.x) < gate.halfWidth
}

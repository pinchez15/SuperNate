/**
 * HedgeHawkins fight on a Smash-style side stage. Pure data so it can run headless.
 * Units are meters and seconds. Ground is y = 0. The player faces +x toward the boss.
 */

export const B = {
  minX: -11,
  maxX: 5,
  startX: -8,
  bossHitX: 6.3,
  gravity: 30,
  jumpV: 13,
  run: 7,
  callSpeed: 11,
  callCooldown: 0.5,
  maxCallsInFlight: 1,
  missDamage: 4,
  batteries: 3,
  invuln: 1.2,
  uberHalfLen: 1.15,
  uberHeight: 1.45,
  playerHalfW: 0.35,
  uberSpawnX: 6.5,
  uberDespawnX: -15,
} as const

/** One-way Smash platforms: land from above, jump up through from below. */
export const platforms = [
  { x: -6.5, y: 2.5, half: 1.8 },
  { x: 0.5, y: 2.5, half: 1.8 },
]

export interface PhaseDef {
  below: number
  speed: number
  every: number
  count: number
  gap: number
  open: number
  decline: number
}

/** First phase whose `below` is under current patience wins. */
export const phases: PhaseDef[] = [
  { below: 101, speed: 7, every: 2.8, count: 1, gap: 0, open: 2.4, decline: 1.1 },
  { below: 60, speed: 8.5, every: 2.5, count: 2, gap: 0.55, open: 2.0, decline: 1.3 },
  { below: 25, speed: 9.5, every: 2.7, count: 3, gap: 0.45, open: 1.8, decline: 1.4 },
]

export interface BossInput {
  left: boolean
  right: boolean
  jump: boolean
  fire: boolean
}

export interface Uber {
  id: number
  x: number
  speed: number
  /** Uber Air flies at platform height, so campers on ledges still have to dodge. */
  air: boolean
}

export const AIR_Y = 2.7

export interface Call {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  bounced: boolean
}

export interface BossState {
  t: number
  x: number
  y: number
  vy: number
  onGround: boolean
  batteries: number
  inv: number
  patience: number
  phase: number
  declining: boolean
  cycle: number
  spawnIn: number
  queue: { at: number; air: boolean }[]
  waves: number
  ubers: Uber[]
  calls: Call[]
  cooldown: number
  nextId: number
  placed: number
  declined: number
  landed: number
  hitsTaken: number
  respawns: number
  won: boolean
  jumpHeld: boolean
}

export type BossEvent =
  | { type: "placed" }
  | { type: "landed"; patience: number }
  | { type: "declined" }
  | { type: "hurt"; batteries: number }
  | { type: "respawn" }
  | { type: "phase"; phase: number }
  | { type: "uber" }
  | { type: "uberAir" }
  | { type: "won" }

export function createBoss(): BossState {
  return {
    t: 0,
    x: B.startX,
    y: 0,
    vy: 0,
    onGround: true,
    batteries: B.batteries,
    inv: 0,
    patience: 100,
    phase: 0,
    declining: false,
    cycle: 0,
    spawnIn: 1.6,
    queue: [],
    waves: 0,
    ubers: [],
    calls: [],
    cooldown: 0,
    nextId: 1,
    placed: 0,
    declined: 0,
    landed: 0,
    hitsTaken: 0,
    respawns: 0,
    won: false,
    jumpHeld: false,
  }
}

function phaseFor(patience: number): number {
  let index = 0
  phases.forEach((p, i) => {
    if (patience < p.below) index = i
  })
  return index
}

export function stepBoss(s: BossState, input: BossInput, dt: number): BossEvent[] {
  const events: BossEvent[] = []
  if (s.won) return events
  s.t += dt
  const phase = phases[s.phase] ?? phases[0]

  s.cycle += dt
  if (s.declining && s.cycle >= phase.decline) {
    s.declining = false
    s.cycle = 0
  } else if (!s.declining && s.cycle >= phase.open) {
    s.declining = true
    s.cycle = 0
  }

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  s.x = Math.max(B.minX, Math.min(B.maxX, s.x + dir * B.run * dt))
  if (input.jump && !s.jumpHeld && s.onGround) {
    s.vy = B.jumpV
    s.onGround = false
  }
  s.jumpHeld = input.jump
  if (s.onGround && s.y > 0) {
    const still = platforms.some((p) => Math.abs(s.x - p.x) < p.half && Math.abs(s.y - p.y) < 0.01)
    if (!still) s.onGround = false
  }
  if (!s.onGround) {
    const prevY = s.y
    s.vy -= B.gravity * dt
    s.y += s.vy * dt
    if (s.vy <= 0) {
      const ledge = platforms.find((p) => Math.abs(s.x - p.x) < p.half && prevY >= p.y - 0.01 && s.y <= p.y)
      if (ledge) {
        s.y = ledge.y
        s.vy = 0
        s.onGround = true
      } else if (s.y <= 0) {
        s.y = 0
        s.vy = 0
        s.onGround = true
      }
    }
  }

  s.cooldown = Math.max(0, s.cooldown - dt)
  const live = s.calls.filter((c) => !c.bounced).length
  if (input.fire && s.cooldown === 0 && live < B.maxCallsInFlight) {
    s.calls.push({ id: s.nextId++, x: s.x + 0.6, y: s.y + 1.4, vx: B.callSpeed, vy: 0, bounced: false })
    s.cooldown = B.callCooldown
    s.placed += 1
    events.push({ type: "placed" })
  }

  for (const call of s.calls) {
    call.x += call.vx * dt
    if (call.bounced) {
      call.vy -= B.gravity * 0.5 * dt
      call.y += call.vy * dt
    }
    if (!call.bounced && call.x >= B.bossHitX) {
      if (s.declining) {
        call.bounced = true
        call.vx = -5
        call.vy = 8
        s.declined += 1
        events.push({ type: "declined" })
      } else {
        call.x = Infinity
        s.landed += 1
        s.patience = Math.max(0, s.patience - B.missDamage)
        events.push({ type: "landed", patience: s.patience })
      }
    }
  }
  s.calls = s.calls.filter((c) => Number.isFinite(c.x) && c.y > -3 && c.x > B.minX - 4)

  if (s.patience <= 0) {
    s.won = true
    s.ubers = []
    events.push({ type: "won" })
    return events
  }

  const nextPhase = phaseFor(s.patience)
  if (nextPhase !== s.phase) {
    s.phase = nextPhase
    events.push({ type: "phase", phase: nextPhase })
  }

  s.spawnIn -= dt
  if (s.spawnIn <= 0) {
    const p = phases[s.phase] ?? phases[0]
    s.waves += 1
    const airWave = s.phase >= 1 && s.waves % 2 === 0
    for (let i = 0; i < p.count; i += 1) s.queue.push({ at: i * p.gap, air: airWave && i === 0 })
    s.spawnIn = p.every
  }
  for (const q of s.queue) q.at -= dt
  while (s.queue.length && (s.queue[0]?.at ?? 1) <= 0) {
    const next = s.queue.shift()
    const p = phases[s.phase] ?? phases[0]
    s.ubers.push({ id: s.nextId++, x: B.uberSpawnX, speed: p.speed, air: next?.air ?? false })
    events.push({ type: next?.air ? "uberAir" : "uber" })
  }

  for (const u of s.ubers) u.x -= u.speed * dt
  s.ubers = s.ubers.filter((u) => u.x > B.uberDespawnX)

  s.inv = Math.max(0, s.inv - dt)
  if (s.inv === 0) {
    const hit = s.ubers.find((u) => {
      if (Math.abs(u.x - s.x) >= B.uberHalfLen + B.playerHalfW) return false
      return u.air ? s.y + 1.6 > AIR_Y + 0.2 && s.y < AIR_Y + B.uberHeight : s.y < B.uberHeight
    })
    if (hit) {
      s.batteries -= 1
      s.hitsTaken += 1
      s.inv = B.invuln
      s.x = Math.max(B.minX, s.x - 1.2)
      s.vy = 8
      s.onGround = false
      events.push({ type: "hurt", batteries: s.batteries })
      if (s.batteries <= 0) {
        s.batteries = B.batteries
        s.x = B.startX
        s.y = 0
        s.vy = 0
        s.onGround = true
        s.ubers = []
        s.queue = []
        s.spawnIn = 1.6
        s.respawns += 1
        events.push({ type: "respawn" })
      }
    }
  }

  return events
}

import * as THREE from "three"
import type { Blips } from "@/components/town/audio"
import { disposeTextures, makeTextures, type Look, type Textures } from "@/components/town/look"
import { animateRig, makeCharacter, makeDogUber, makePhoneProjectile, makePing, type Rig } from "@/components/town/models"
import { disposeObject, N64Renderer } from "@/components/town/n64-renderer"
import { ARENA_Z, applyShadows, arena, buildArena, buildTown, makeScene, setArea, type TownBuild } from "@/components/town/stage"
import { AIR_Y, createBoss, stepBoss, type BossEvent, type BossState } from "@/lib/town/boss"
import { fryRadius, groundAt, nearestNpc, npcSpots, peopleIds, resolve, spawn, throughGate, type NpcId } from "@/lib/town/world"

export type GameMode = "town" | "paused" | "boss" | "win"

export interface BossHud {
  patience: number
  batteries: number
  declining: boolean
  phase: number
}

export interface GameCallbacks {
  onNear: (id: NpcId | null) => void
  onTalk: (id: NpcId) => void
  onGate: () => void
  onBossHud: (hud: BossHud) => void
  onBossEvent: (event: BossEvent, state: BossState) => void
  onWinShot: () => void
  onFry: (count: number) => void
  onEmote: (near: NpcId | null) => void
}

type Action = "up" | "down" | "left" | "right" | "talk" | "jump" | "fire" | "hop" | "pound" | "emote"

const keyActions: Record<string, Action[]> = {
  ArrowUp: ["up", "jump"],
  KeyW: ["up", "jump"],
  ArrowDown: ["down"],
  KeyS: ["down"],
  ArrowLeft: ["left"],
  KeyA: ["left"],
  ArrowRight: ["right"],
  KeyD: ["right"],
  Space: ["talk", "jump", "hop"],
  KeyQ: ["emote"],
  KeyZ: ["pound"],
  KeyX: ["pound"],
  ShiftLeft: ["pound"],
  KeyE: ["talk"],
  Enter: ["talk", "fire"],
  KeyJ: ["fire"],
  KeyK: ["fire"],
  KeyF: ["fire"],
}

const RUN = 6.2
const GRAVITY = 26
/** Single, double, triple jump launch speeds, Mario 64 style. */
const JUMPS = [8.5, 10.4, 13.2]

export class TownGame {
  private n64: N64Renderer
  private tex: Textures
  private scene: THREE.Scene
  private camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 400)
  private town: TownBuild
  private nate: Rig
  private npcs = new Map<NpcId, Rig>()
  private markers = new Map<NpcId, THREE.Object3D>()
  private boss: Rig
  private uberPool: THREE.Group[] = []
  private uberMesh = new Map<number, THREE.Group>()
  private callPool: THREE.Sprite[] = []
  private callMesh = new Map<number, THREE.Sprite>()
  private clockHands: THREE.Object3D[] = []
  private flags: THREE.Object3D[] = []
  private friesGot = 0
  private freeze = 0
  private y = 0
  private vy = 0
  private grounded = true
  private chain = 0
  private sinceLand = 1
  private pounding = false
  private gliding = false
  private flip = 0
  private emoteT = 0
  private mogged = false
  private camShake = 0
  private knockT = 0

  private held = new Set<Action>()
  private virtual = new Set<Action>()
  private fireTap = false
  private raf = 0
  private last = 0
  private clock = 0
  private mode: GameMode = "paused"
  private pos = { ...spawn }
  private speed = 0
  private near: NpcId | null = null
  private gateOpen = false
  private gateT = 0
  private sim: BossState = createBoss()
  private hurtFlash = 0
  private bossShake = 0
  private winT = 0
  private hudKey = ""
  private lookAt = new THREE.Vector3()
  private winFrom = new THREE.Vector3()

  constructor(
    private canvas: HTMLCanvasElement,
    look: Look,
    private cb: GameCallbacks,
    private blips: Blips,
  ) {
    this.n64 = new N64Renderer(canvas, look)
    this.tex = makeTextures(look)
    this.scene = makeScene(this.tex, look)
    this.town = buildTown(this.tex)
    this.scene.add(this.town.group)
    const arenaBuild = buildArena(this.tex)
    this.scene.add(arenaBuild.group)
    this.town.group.traverse((o) => {
      if (o.name === "clockhand") this.clockHands.push(o)
      if (o.name === "flag") this.flags.push(o)
    })

    this.nate = makeCharacter("nate", look.segments)
    this.scene.add(this.nate.root)

    for (const id of peopleIds) {
      const rig = makeCharacter(id, look.segments)
      const spot = npcSpots[id]
      rig.root.position.set(spot.x, spot.y, spot.z)
      rig.root.rotation.y = spot.facing
      this.scene.add(rig.root)
      this.npcs.set(id, rig)
    }
    for (const id of ["guide", "doctor", "vest"] as const satisfies readonly NpcId[]) {
      const spot = npcSpots[id]
      const marker = makePhoneProjectile()
      marker.scale.setScalar(0.8)
      marker.position.set(spot.x, 3.3, spot.z)
      this.scene.add(marker)
      this.markers.set(id, marker)
    }

    this.boss = makeCharacter("hedgehawkins", look.segments)
    this.boss.root.position.set(arena.bossX, 1.8, ARENA_Z - 0.6)
    this.boss.root.rotation.y = -Math.PI / 2 + 0.45
    this.boss.root.scale.setScalar(1.35)
    this.scene.add(this.boss.root)

    for (let i = 0; i < 4; i += 1) {
      const car = makeDogUber(look.segments)
      car.visible = false
      this.scene.add(car)
      this.uberPool.push(car)
    }
    for (let i = 0; i < 3; i += 1) {
      const ping = makePing()
      ping.visible = false
      this.scene.add(ping)
      this.callPool.push(ping)
    }

    applyShadows(this.scene)

    this.placeNateInTown()
    if (process.env.NODE_ENV !== "production") {
      // Dev-only hook so automated playthroughs can read and set the player position.
      ;(window as unknown as { __town?: object }).__town = {
        pos: () => ({ x: this.pos.x, z: this.pos.z, y: this.y }),
        warp: (x: number, z: number) => {
          this.pos = { x, z }
          this.y = groundAt(x, z, 99)
          this.vy = 0
          this.grounded = true
          this.nate.root.position.set(x, this.y, z)
        },
      }
    }
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
    window.addEventListener("blur", this.onBlur)
    canvas.addEventListener("pointerdown", this.onPointer)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  /** Ids of townspeople who still have something to give. */
  setMarkers(ids: NpcId[]) {
    for (const [id, marker] of this.markers) marker.visible = ids.includes(id)
  }

  setMode(mode: GameMode) {
    this.mode = mode
    if (mode === "paused") this.held.clear()
  }

  getMode() {
    return this.mode
  }

  resumeTown() {
    this.mode = "town"
  }

  openGate() {
    this.gateOpen = true
    this.blips.gate()
  }

  restartTown() {
    this.gateOpen = false
    this.gateT = 0
    this.friesGot = 0
    for (const f of this.town.fries) f.visible = true
    this.town.roofFry.visible = true
    this.setMogged(false)
    this.placeNateInTown()
    setArea(this.scene, this.tex, "town")
    this.mode = "town"
  }

  /** Holds the fighters still for the 3, 2, 1, GO countdown. */
  startBoss(countdown = 2.4) {
    setArea(this.scene, this.tex, "arena")
    this.freeze = countdown
    this.sim = createBoss()
    this.camera.position.set(0.4, 3.6, ARENA_Z + 20)
    this.lookAt.set(0.4, 2.4, ARENA_Z)
    this.winT = 0
    this.uberMesh.clear()
    this.callMesh.clear()
    this.boss.root.rotation.y = -Math.PI / 2 + 0.45
    this.mode = "boss"
    this.pushHud(true)
  }

  setVirtual(action: Action, down: boolean) {
    if (down) {
      this.virtual.add(action)
      if (action === "fire") this.fireTap = true
      if (action === "talk" && this.tryTalk()) return
      if (action === "hop") this.hop()
      if (action === "pound") this.poundOrEmote()
    } else this.virtual.delete(action)
  }

  /** Dialog rewards call this so every fry counts the same way. */
  grantFry() {
    this.friesGot += 1
    this.blips.coin()
    this.cb.onFry(this.friesGot)
  }

  /** Combinator Y Academy perk. Investors fund tall founders. */
  setMogged(on: boolean) {
    this.mogged = on
    this.nate.root.scale.set(1, on ? 1.38 : 1, 1)
  }

  knock() {
    this.knockT = 0.3
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
    window.removeEventListener("blur", this.onBlur)
    this.canvas.removeEventListener("pointerdown", this.onPointer)
    disposeObject(this.scene)
    disposeTextures(this.tex)
    this.n64.dispose()
  }

  private placeNateInTown() {
    this.pos = { ...spawn }
    this.y = 0
    this.vy = 0
    this.grounded = true
    this.nate.root.position.set(this.pos.x, 0, this.pos.z)
    this.nate.root.rotation.y = Math.PI
    this.nate.root.visible = true
    this.camera.position.set(this.pos.x * 0.75, 6.2 + (this.pos.z + 9.2 - 15.5) * 0.35, 15.5)
    this.camera.lookAt(this.pos.x * 0.88, 1.4, this.pos.z - 2.6)
  }

  private isDown(a: Action) {
    return this.held.has(a) || this.virtual.has(a)
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const actions = keyActions[e.code]
    if (!actions) return
    if (this.mode === "paused") return
    e.preventDefault()
    for (const a of actions) this.held.add(a)
    if (actions.includes("fire")) this.fireTap = true
    if (e.repeat) return
    if (actions.includes("talk") && this.tryTalk()) return
    if (actions.includes("hop")) this.hop()
    if (actions.includes("pound")) this.poundOrEmote()
    if (actions.includes("emote")) this.emote()
  }

  private hop() {
    if (this.mode !== "town" || !this.grounded) return
    const moving = this.speed > 0
    this.chain = this.sinceLand < 0.28 && moving ? Math.min(this.chain + 1, 2) : 0
    this.vy = JUMPS[this.chain] ?? JUMPS[0]
    this.grounded = false
    this.flip = this.chain === 2 ? 1 : 0
    this.blips.text()
  }

  private poundOrEmote() {
    if (this.mode !== "town") return
    if (this.grounded) {
      this.emote()
      return
    }
    if (this.pounding) return
    this.pounding = true
    this.vy = -24
  }

  private emote() {
    if (this.mode !== "town" || !this.grounded || this.emoteT > 0) return
    this.emoteT = 1.6
    this.blips.ring()
    let best: NpcId | null = null
    let bestD = 6
    for (const [id, spot] of Object.entries(npcSpots) as [NpcId, (typeof npcSpots)[NpcId]][]) {
      const d = Math.hypot(spot.x - this.pos.x, spot.z - this.pos.z)
      if (d < bestD && Math.abs(spot.y - this.y) < 2) {
        bestD = d
        best = id
      }
    }
    this.cb.onEmote(best)
  }

  private onKeyUp = (e: KeyboardEvent) => {
    const actions = keyActions[e.code]
    if (!actions) return
    for (const a of actions) this.held.delete(a)
  }

  private onBlur = () => {
    this.held.clear()
    this.virtual.clear()
  }

  private onPointer = () => {
    if (this.mode === "boss") this.fireTap = true
    else if (this.mode === "town") this.tryTalk()
  }

  private tryTalk(): boolean {
    if (this.mode !== "town" || !this.near || !this.grounded) return false
    this.mode = "paused"
    this.held.clear()
    this.virtual.clear()
    this.cb.onTalk(this.near)
    return true
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.clock += dt
    if (this.mode === "town") this.updateTown(dt)
    else if (this.mode === "boss") this.updateBoss(dt)
    else if (this.mode === "win") this.updateWin(dt)
    else this.speed = 0
    this.animate(dt)
    this.n64.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.loop)
  }

  private updateTown(dt: number) {
    let mx = (this.isDown("right") ? 1 : 0) - (this.isDown("left") ? 1 : 0)
    let mz = (this.isDown("down") ? 1 : 0) - (this.isDown("up") ? 1 : 0)
    if (this.pounding || this.emoteT > 0) {
      mx = 0
      mz = 0
    }
    const len = Math.hypot(mx, mz)
    if (len > 0) {
      mx /= len
      mz /= len
      const target = Math.atan2(mx, mz)
      const cur = this.nate.root.rotation.y
      const diff = Math.atan2(Math.sin(target - cur), Math.cos(target - cur))
      this.nate.root.rotation.y = cur + diff * Math.min(1, dt * 14)
    }
    this.speed = len > 0 ? 1 : 0
    this.emoteT = Math.max(0, this.emoteT - dt)
    this.sinceLand += dt

    const run = this.grounded ? RUN : RUN * 0.92
    const next = resolve({ x: this.pos.x + mx * run * dt, z: this.pos.z + mz * run * dt }, this.y, this.gateOpen)
    this.pos = next

    const floor = groundAt(next.x, next.z, this.y)
    if (this.grounded && this.y > floor + 0.05) this.grounded = false
    if (!this.grounded) {
      this.gliding = !this.pounding && this.vy < 0 && this.isDown("hop")
      this.vy -= GRAVITY * dt
      if (this.gliding) this.vy = Math.max(this.vy, -2.4)
      this.y += this.vy * dt
      const land = groundAt(next.x, next.z, this.y - this.vy * dt)
      if (this.y <= land) {
        this.y = land
        this.vy = 0
        this.grounded = true
        this.gliding = false
        this.sinceLand = 0
        this.flip = 0
        if (this.pounding) this.landPound()
        if (this.chain === 2) this.chain = -1
      }
    }
    this.nate.root.position.set(next.x, this.y, next.z)

    const pickups = [...this.town.fries, this.town.roofFry]
    for (const f of pickups) {
      if (!f.visible) continue
      const dy = Math.abs(f.position.y - (this.y + 0.9))
      if (dy < 1.3 && Math.hypot(f.position.x - next.x, f.position.z - next.z) < fryRadius) {
        f.visible = false
        this.grantFry()
      }
    }

    const near = nearestNpc(next, this.y)
    if (near !== this.near) {
      this.near = near
      this.cb.onNear(near)
    }

    if (throughGate(next, this.gateOpen)) {
      this.mode = "paused"
      this.held.clear()
      this.cb.onGate()
    }

    const wantZ = next.z + 9.2
    const camZ = Math.min(wantZ, 15.5)
    const shake = this.camShake > 0 ? Math.sin(this.clock * 80) * this.camShake * 0.4 : 0
    this.camShake = Math.max(0, this.camShake - dt)
    const camTarget = new THREE.Vector3(next.x * 0.92, 6.2 + (wantZ - camZ) * 0.35 + this.y * 0.55, camZ)
    this.camera.position.lerp(camTarget, Math.min(1, dt * 5))
    this.camera.position.y += shake
    this.camera.fov = 45
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(next.x * 0.95, 1.4 + this.y * 0.7, next.z - 2.6)
  }

  /** Ground pound: a fast landing with a camera shake. */
  private landPound() {
    this.pounding = false
    this.camShake = 0.35
    this.blips.hurt()
  }

  private updateBoss(dt: number) {
    if (this.freeze > 0) {
      this.freeze -= dt
      this.fireTap = false
      this.syncBoss()
      this.smashCamera(dt)
      return
    }
    const fire = this.fireTap || this.isDown("fire")
    this.fireTap = false
    const events = stepBoss(
      this.sim,
      { left: this.isDown("left"), right: this.isDown("right"), jump: this.isDown("jump") || this.isDown("up"), fire },
      dt,
    )
    for (const e of events) {
      if (e.type === "placed") this.blips.ring()
      if (e.type === "landed") {
        this.blips.landed()
        this.bossShake = 0.35
      }
      if (e.type === "declined") this.blips.declined()
      if (e.type === "uber" || e.type === "uberAir") this.blips.bark()
      if (e.type === "hurt") {
        this.blips.hurt()
        this.hurtFlash = 0.4
      }
      if (e.type === "won") {
        this.blips.win()
        this.mode = "win"
        this.winT = 0
      }
      this.cb.onBossEvent(e, this.sim)
    }
    this.syncBoss()
    this.pushHud(false)
    this.smashCamera(dt)
  }

  /** Smash-style camera: zooms to keep both fighters framed, drifting up when you jump. */
  private smashCamera(dt: number) {
    const s = this.sim
    const cx = (s.x + arena.bossX) / 2 - 0.4
    const spread = arena.bossX - s.x
    const dist = THREE.MathUtils.clamp(spread * 1.25 + 6, 13, 24)
    const cy = 2.4 + s.y * 0.35
    const want = new THREE.Vector3(cx, cy + 1.2, ARENA_Z + dist)
    this.camera.position.lerp(want, Math.min(1, dt * 3))
    this.camera.fov = 40
    this.camera.updateProjectionMatrix()
    this.lookAt.lerp(new THREE.Vector3(cx, cy, ARENA_Z), Math.min(1, dt * 3))
    this.camera.lookAt(this.lookAt)
  }

  private updateWin(dt: number) {
    this.winT += dt
    const walkTo = 4
    const walking = this.sim.x < walkTo - 0.05
    if (walking) this.sim.x = Math.min(walkTo, this.sim.x + 7 * dt)
    this.sim.y = Math.max(0, this.sim.y - 8 * dt)
    this.syncBoss()
    this.speed = walking ? 1 : 0
    const k = Math.min(1, this.winT / 1.8)
    const ease = 1 - Math.pow(1 - k, 3)
    if (this.winT <= dt) this.winFrom.copy(this.camera.position)
    const to = new THREE.Vector3(5.6, 3.1, ARENA_Z + 10.5)
    this.camera.position.copy(this.winFrom.clone().lerp(to, ease))
    this.camera.lookAt(THREE.MathUtils.lerp(this.lookAt.x, 5.6, ease), 2.5, ARENA_Z)
    if (this.winT > 2.4 && this.winT - dt <= 2.4) this.cb.onWinShot()
  }

  private syncBoss() {
    const s = this.sim
    this.nate.root.position.set(s.x, s.y, ARENA_Z + 0.6)
    this.nate.root.rotation.y = Math.PI / 2
    this.nate.root.visible = s.inv > 0 ? Math.floor(this.clock * 20) % 2 === 0 : true
    this.speed = this.mode === "boss" && (this.isDown("left") || this.isDown("right")) && s.onGround ? 1 : 0

    const liveU = new Set(s.ubers.map((u) => u.id))
    for (const [id, mesh] of this.uberMesh) {
      if (!liveU.has(id)) {
        mesh.visible = false
        this.uberPool.push(mesh)
        this.uberMesh.delete(id)
      }
    }
    for (const u of s.ubers) {
      let mesh = this.uberMesh.get(u.id)
      if (!mesh) {
        mesh = this.uberPool.pop()
        if (!mesh) continue
        this.uberMesh.set(u.id, mesh)
        mesh.visible = true
      }
      mesh.position.set(u.x, u.air ? AIR_Y + Math.sin(this.clock * 6 + u.id) * 0.12 : 0, ARENA_Z + 0.6)
      mesh.rotation.z = u.air ? Math.sin(this.clock * 3 + u.id) * 0.08 : 0
      mesh.traverse((o) => {
        if (o.name === "wheel") o.rotation.y = this.clock * 14
        if (o.name === "dog") o.rotation.z = Math.sin(this.clock * 10 + u.id) * 0.15
      })
    }

    const liveC = new Set(s.calls.map((c) => c.id))
    for (const [id, mesh] of this.callMesh) {
      if (!liveC.has(id)) {
        mesh.visible = false
        this.callPool.push(mesh)
        this.callMesh.delete(id)
      }
    }
    for (const c of s.calls) {
      let mesh = this.callMesh.get(c.id)
      if (!mesh) {
        mesh = this.callPool.pop()
        if (!mesh) continue
        this.callMesh.set(c.id, mesh)
        mesh.visible = true
      }
      mesh.position.set(c.x, c.y, ARENA_Z + 0.6)
      mesh.material.rotation = c.bounced ? this.clock * 10 : Math.sin(this.clock * 30) * 0.08
      mesh.material.color.set(c.bounced ? "#9a9aa6" : "#ffffff")
      const pop = 1 + Math.sin(this.clock * 20) * 0.04
      mesh.scale.set(2.6 * pop, 1.14 * pop, 1)
    }

    const b = this.boss
    const shake = this.bossShake > 0 ? Math.sin(this.clock * 70) * 0.12 : 0
    b.root.position.x = arena.bossX + shake
    if (b.armL) b.armL.rotation.z = s.declining && !s.won ? -2.7 : -0.5
    if (b.armR) {
      b.armR.rotation.x = s.won ? -2.6 : s.declining ? -0.4 : -1.2
      b.armR.rotation.z = s.won ? 0.9 : 0.2
    }
    if (b.prop) {
      b.prop.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined
        if (m && m.type === "MeshBasicMaterial") m.color.set(s.won ? "#7dffa0" : s.declining ? "#ff3b3b" : "#ffb13b")
      })
    }
  }

  private pushHud(force: boolean) {
    const s = this.sim
    const hud: BossHud = { patience: s.patience, batteries: s.batteries, declining: s.declining, phase: s.phase }
    const key = `${hud.patience}|${hud.batteries}|${hud.declining}|${hud.phase}`
    if (!force && key === this.hudKey) return
    this.hudKey = key
    this.cb.onBossHud(hud)
  }

  private animate(dt: number) {
    const t = this.clock
    animateRig(this.nate, t, this.speed)
    if (this.mode === "boss" && !this.sim.onGround && this.nate.legL && this.nate.legR) {
      this.nate.legL.rotation.x = -0.6
      this.nate.legR.rotation.x = 0.3
    }
    if (this.mode === "town") {
      if (this.flip > 0) this.nate.body.rotation.x = -((1 - Math.max(0, this.vy) / (JUMPS[2] ?? 13)) * Math.PI * 2)
      else this.nate.body.rotation.x = this.pounding ? 0.4 : 0
      if (!this.grounded && this.nate.legL && this.nate.legR) {
        this.nate.legL.rotation.x = this.pounding ? -1.2 : -0.5
        this.nate.legR.rotation.x = this.pounding ? -1.2 : 0.4
      }
      if (this.nate.cape) this.nate.cape.rotation.x = this.gliding ? -1.25 : this.nate.cape.rotation.x
      if (this.emoteT > 0 && this.nate.armR) {
        this.nate.armR.rotation.x = -2.5
        this.nate.armR.rotation.z = -0.5
      }
    } else {
      this.nate.body.rotation.x = 0
    }
    const pole = this.town.group.getObjectByName("pole")
    if (pole) pole.rotation.y = t * 2
    this.town.sensor.rotation.y = t * 5
    this.knockT = Math.max(0, this.knockT - dt)
    this.town.door.position.x = Math.sin(t * 60) * this.knockT * 0.15
    if (this.mode === "win" && this.speed === 0 && this.nate.armR) {
      this.nate.armR.rotation.x = -2.5
      this.nate.armR.rotation.z = -0.5
    } else if (this.nate.armR && this.emoteT === 0) {
      this.nate.armR.rotation.z = 0
    }
    for (const [id, rig] of this.npcs) {
      const spot = npcSpots[id]
      animateRig(rig, t + spot.x, 0)
      rig.root.position.y = spot.y
      const want =
        this.near === id ? Math.atan2(this.pos.x - spot.x, this.pos.z - spot.z) : spot.facing
      const cur = rig.root.rotation.y
      const diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur))
      rig.root.rotation.y = cur + diff * Math.min(1, dt * 6)
    }
    for (const [, marker] of this.markers) {
      marker.rotation.y = t * 2.2
      marker.position.y = 3.3 + Math.sin(t * 3) * 0.15
    }
    animateRig(this.boss, t, 0)
    this.bossShake = Math.max(0, this.bossShake - dt)
    this.hurtFlash = Math.max(0, this.hurtFlash - dt)

    if (this.gateOpen && this.gateT < 1) this.gateT = Math.min(1, this.gateT + dt * 0.8)
    const open = 1 - Math.pow(1 - this.gateT, 3)
    this.town.gateL.rotation.y = open * 1.9
    this.town.gateR.rotation.y = -open * 1.9

    this.clockHands.forEach((hand, i) => {
      hand.rotation.z -= dt * (i === 0 ? 1.2 : 0.1)
    })
    for (const f of this.town.fries) f.rotation.y = t * 2.4
    this.town.pigeons.forEach((bird) => {
      const d = bird.userData as { cx: number; cz: number; ax: number; az: number; fx: number; fz: number; ph: number; h: number }
      // A Lissajous loop per bird: different center, size, and frequencies.
      const px = d.cx + Math.cos(t * d.fx + d.ph) * d.ax
      const pz = d.cz + Math.sin(t * d.fz + d.ph * 1.7) * d.az
      const vx = -Math.sin(t * d.fx + d.ph) * d.ax * d.fx
      const vz = Math.cos(t * d.fz + d.ph * 1.7) * d.az * d.fz
      bird.position.set(px, d.h + Math.sin(t * 1.8 + d.ph) * 0.5, pz)
      bird.rotation.y = Math.atan2(-vz, vx)
      bird.rotation.z = THREE.MathUtils.clamp(Math.sin(t * d.fx * 2 + d.ph) * 0.3, -0.35, 0.35)
      const flap = Math.sin(t * 14 + d.ph) * 0.7
      const wl = bird.getObjectByName("wingL")
      const wr = bird.getObjectByName("wingR")
      if (wl) wl.rotation.x = flap
      if (wr) wr.rotation.x = -flap
    })
    const smoke = this.town.ship.getObjectByName("smoke")
    smoke?.children.forEach((puff, i) => {
      const k = (t * 0.5 + i / 6) % 1
      puff.position.y = 1 + k * 3
      puff.scale.setScalar(0.6 + k * 1.2)
    })
    this.flags.forEach((f, i) => {
      f.rotation.y = Math.sin(t * 3 + i) * 0.35
    })
  }
}

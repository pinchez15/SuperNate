import * as THREE from "three"
import { palette, texMat, type Look, type Textures } from "@/components/town/look"
import { platforms } from "@/lib/town/boss"
import { makeFry, makePigeon, makeStarfighter } from "@/components/town/models"
import { crashSite, frySpots, gate, layout, propBoxes, roofFry } from "@/lib/town/world"

export const ARENA_Z = -220

export type Area = "town" | "arena"

export function makeScene(tex: Textures, look: Look, area: Area = "town"): THREE.Scene {
  const scene = new THREE.Scene()
  const near = THREE.MathUtils.lerp(70, 10, look.fog)
  const far = near + THREE.MathUtils.lerp(140, 34, look.fog)
  scene.fog = new THREE.Fog(palette.fog, near, far)
  const hemi = new THREE.HemisphereLight("#eeeaff", "#8d7c68", 1.15)
  hemi.name = "hemi"
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(palette.sun, 2.1)
  sun.name = "sun"
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -44
  sun.shadow.camera.right = 44
  sun.shadow.camera.top = 44
  sun.shadow.camera.bottom = -44
  sun.shadow.camera.near = 2
  sun.shadow.camera.far = 130
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  scene.add(sun)
  scene.add(sun.target)
  const rim = new THREE.DirectionalLight("#c9d6ff", 0.55)
  rim.position.set(-8, 6, -10)
  scene.add(rim)
  setArea(scene, tex, area)
  return scene
}

/** Town is bright blue sky and green grass. The fight is a woods clearing in evening haze. */
export function setArea(scene: THREE.Scene, tex: Textures, area: Area) {
  scene.background = area === "town" ? tex.skyTown : tex.sky
  const fog = scene.fog as THREE.Fog | null
  if (fog) fog.color.set(area === "town" ? palette.townFog : palette.fog)
  const hemi = scene.getObjectByName("hemi") as THREE.HemisphereLight | undefined
  if (hemi) {
    hemi.color.set(area === "town" ? "#e6f4ff" : "#eeeaff")
    hemi.groundColor.set(area === "town" ? "#5f9a3c" : "#4b6b3a")
    hemi.intensity = area === "town" ? 1.25 : 1.15
  }
  // The sun and its shadow frustum follow the active area.
  const sun = scene.getObjectByName("sun") as THREE.DirectionalLight | undefined
  if (sun) {
    const cz = area === "town" ? 0 : ARENA_Z
    sun.position.set(16, 34, cz + 22)
    sun.target.position.set(0, 0, cz)
    sun.target.updateMatrixWorld()
  }
}

/**
 * Turns on shadow casting and receiving for every lit mesh under `root`.
 * Unlit meshes (glows, screens), transparent ones, and anything marked
 * `userData.noShadow` are left out.
 */
export function applyShadows(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (!mat) return
    const list = Array.isArray(mat) ? mat : [mat]
    const lit = list.some((m) => (m as THREE.MeshLambertMaterial).isMeshLambertMaterial || (m as THREE.MeshPhongMaterial).isMeshPhongMaterial)
    const solid = list.every((m) => !m.transparent)
    if (!lit) return
    mesh.receiveShadow = true
    if (solid && !mesh.userData.noShadow) mesh.castShadow = true
  })
}

function labelTexture(text: string, bg: string, fg: string, w = 128, h = 48): THREE.CanvasTexture {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")
  if (ctx) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = "rgba(0,0,0,0.35)"
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, w - 4, h - 4)
    ctx.fillStyle = fg
    // Shrink the font until the whole label fits on the board.
    let size = Math.round(h * 0.46)
    const font = (s: number) => `italic 900 ${s}px "Arial Black", Impact, sans-serif`
    ctx.font = font(size)
    while (size > 8 && ctx.measureText(text).width > w - 14) {
      size -= 1
      ctx.font = font(size)
    }
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, w / 2, h / 2 + 1)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function signPost(text: string, bg: string, fg: string, tex: Textures): THREE.Group {
  const g = new THREE.Group()
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.6, 0.14), texMat(tex.plank, 0.3, 1))
  post.position.y = 0.8
  g.add(post)
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.64, 0.08),
    [
      new THREE.MeshLambertMaterial({ color: "#6b4526" }),
      new THREE.MeshLambertMaterial({ color: "#6b4526" }),
      new THREE.MeshLambertMaterial({ color: "#6b4526" }),
      new THREE.MeshLambertMaterial({ color: "#6b4526" }),
      new THREE.MeshLambertMaterial({ map: labelTexture(text, bg, fg) }),
      new THREE.MeshLambertMaterial({ map: labelTexture(text, bg, fg) }),
    ],
  )
  board.position.y = 1.7
  g.add(board)
  return g
}

/** A yellow diamond road sign, like the ones that warn about deer. This one is about turkeys. */
function diamondSign(text: string, tex: Textures): THREE.Group {
  const g = new THREE.Group()
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), texMat(tex.plank, 0.3, 1))
  post.position.y = 1.1
  g.add(post)
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.3),
    new THREE.MeshLambertMaterial({ map: labelTexture(text, "#ffd23b", "#1a1a1f", 128, 128), side: THREE.DoubleSide }),
  )
  face.rotation.z = Math.PI / 4
  face.position.set(0, 2.2, 0.08)
  g.add(face)
  return g
}

function tree(seed: number): THREE.Group {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 7), new THREE.MeshLambertMaterial({ color: "#6b4a2b" }))
  trunk.position.y = 0.8
  g.add(trunk)
  const shade = ["#3fbf3f", "#58c94a", "#2fa845"][seed % 3] ?? "#3fbf3f"
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), new THREE.MeshPhongMaterial({ color: shade, shininess: 14 }))
  leaves.position.y = 2.2
  leaves.scale.set(1, 1.1, 1)
  g.add(leaves)
  return g
}

/** A pine: a trunk and three stacked cones. `h` is the full height. */
function pine(seed: number, h = 6): THREE.Group {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, h * 0.3, 7), new THREE.MeshLambertMaterial({ color: "#5a3d22" }))
  trunk.position.y = h * 0.15
  g.add(trunk)
  const shade = ["#1f6b3a", "#2a7d44", "#1a5c33"][seed % 3] ?? "#1f6b3a"
  const mat = new THREE.MeshPhongMaterial({ color: shade, shininess: 8 })
  const tiers = 3
  for (let i = 0; i < tiers; i += 1) {
    const r = h * (0.22 - i * 0.05)
    const th = h * 0.36
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, th, 8), mat)
    cone.position.y = h * 0.3 + i * h * 0.2 + th / 2 - h * 0.08
    g.add(cone)
  }
  return g
}

function house(tex: Textures, color: string): THREE.Group {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), new THREE.MeshLambertMaterial({ color }))
  base.position.y = 0.75
  g.add(base)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.65, 1.1, 4), texMat(tex.shingle, 2, 2, "#b04a3a"))
  roof.rotation.y = Math.PI / 4
  roof.position.y = 2.05
  g.add(roof)
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.8, 0.04), new THREE.MeshLambertMaterial({ color: "#5a3a22" }))
  door.position.set(0, 0.4, 1.01)
  g.add(door)
  for (const x of [-0.6, 0.6]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.04), new THREE.MeshBasicMaterial({ color: "#fff1b8" }))
    win.position.set(x, 1.0, 1.01)
    g.add(win)
  }
  return g
}

interface CabinOpts {
  w: number
  h: number
  d: number
  /** A deck across the front at `porchY`, with steps down on the -x end. */
  porch?: boolean
  sign?: string
}

/**
 * Nate's cabin: plank walls, a gabled shingle roof with the ridge along x, a
 * stone chimney with smoke, warm windows, and a front door. The porch is where
 * he stands to decline you.
 */
function cabin(tex: Textures, o: CabinOpts): { group: THREE.Group; smoke: THREE.Group } {
  const g = new THREE.Group()
  const walls = new THREE.Mesh(new THREE.BoxGeometry(o.w, o.h, o.d), texMat(tex.plank, o.w / 1.1, o.h / 2.2, "#b07a45"))
  walls.position.y = o.h / 2
  g.add(walls)

  const a = 0.52
  const over = 0.5
  const half = o.d / 2 + over
  const L = half / Math.cos(a)
  const ridgeY = o.h + half * Math.tan(a)
  for (const side of [-1, 1]) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(o.w + 0.8, 0.16, L),
      texMat(tex.shingle, (o.w + 0.8) / 1.2, L / 1.2, "#6a4a3a"),
    )
    slab.position.set(0, ridgeY - (half / 2) * Math.tan(a), (side * half) / 2)
    slab.rotation.x = side * a
    g.add(slab)
  }
  const gableShape = new THREE.Shape()
  gableShape.moveTo(-o.d / 2, o.h - 0.01)
  gableShape.lineTo(o.d / 2, o.h - 0.01)
  gableShape.lineTo(0, ridgeY)
  gableShape.closePath()
  for (const side of [-1, 1]) {
    const gable = new THREE.Mesh(new THREE.ShapeGeometry(gableShape), new THREE.MeshLambertMaterial({ color: "#9a6a3c", side: THREE.DoubleSide }))
    gable.rotation.y = Math.PI / 2
    gable.position.x = (side * o.w) / 2
    g.add(gable)
  }

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.7, 0.8), texMat(tex.brick, 1.2, 2))
  chimney.position.set(o.w / 2 - 1.0, ridgeY - 0.2, -0.9)
  g.add(chimney)
  const smoke = new THREE.Group()
  smoke.name = "cabinSmoke"
  for (let i = 0; i < 5; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.28 + i * 0.07, 8, 6),
      new THREE.MeshLambertMaterial({ color: "#d9d6dc", transparent: true, opacity: 0.55 }),
    )
    puff.userData.noShadow = true
    smoke.add(puff)
  }
  smoke.position.set(o.w / 2 - 1.0, ridgeY + 0.65, -0.9)
  g.add(smoke)

  // Door, window and sign sit on the right half of the front wall. Nate stands in front of the left half.
  const front = o.d / 2 + 0.01
  const doorX = o.porch ? o.w * 0.06 : -o.w * 0.22
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.9), new THREE.MeshLambertMaterial({ color: "#4a2e1a" }))
  door.position.set(doorX, 0.95, front)
  g.add(door)
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshPhongMaterial({ color: "#e8b64a", shininess: 120 }))
  knob.position.set(doorX + 0.36, 0.95, front + 0.04)
  g.add(knob)
  const windows = o.porch ? [o.w * 0.38] : [o.w * 0.18, o.w * 0.36]
  for (const x of windows) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ color: "#ffd27a" }))
    win.position.set(x, o.h * 0.55, front)
    g.add(win)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.04), new THREE.MeshLambertMaterial({ color: "#f3e6d0" }))
    frame.position.set(x, o.h * 0.55, front - 0.03)
    g.add(frame)
  }
  if (o.sign) {
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.55),
      new THREE.MeshLambertMaterial({ map: labelTexture(o.sign, "#e2372e", "#ffffff", 256, 60) }),
    )
    board.position.set(o.w * 0.22, o.h - 0.45, front)
    g.add(board)
  }

  if (o.porch) {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(o.w, arena.porchY, 2.0), texMat(tex.plank, o.w / 1.1, 0.5, "#9a6a3c"))
    deck.position.set(0, arena.porchY / 2, o.d / 2 + 1.0)
    g.add(deck)
    // Steps stay clear of the player's lane, which ends 1.6 m short of the deck.
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, arena.porchY * 0.66, 2.0), texMat(tex.plank, 1, 0.4, "#8a5a2b"))
    step1.position.set(-o.w / 2 - 0.4, (arena.porchY * 0.66) / 2, o.d / 2 + 1.0)
    g.add(step1)
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, arena.porchY * 0.33, 2.0), texMat(tex.plank, 1, 0.3, "#8a5a2b"))
    step2.position.set(-o.w / 2 - 1.2, (arena.porchY * 0.33) / 2, o.d / 2 + 1.0)
    g.add(step2)
    for (const x of [o.w / 2 - 0.2, 0.9]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.16), texMat(tex.plank, 0.3, 1))
      post.position.set(x, arena.porchY + 0.5, o.d / 2 + 1.9)
      g.add(post)
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(o.w / 2 - 1.1 + 0.16, 0.1, 0.1), texMat(tex.plank, 2, 0.2))
    rail.position.set((o.w / 2 - 0.2 + 0.9) / 2, arena.porchY + 0.95, o.d / 2 + 1.9)
    g.add(rail)
  }
  return { group: g, smoke }
}

export interface TownBuild {
  group: THREE.Group
  gateL: THREE.Object3D
  gateR: THREE.Object3D
  fries: THREE.Object3D[]
  roofFry: THREE.Object3D
  pigeons: THREE.Object3D[]
  ship: THREE.Object3D
  door: THREE.Object3D
  sensor: THREE.Object3D
  /** Chimney smoke groups to animate. */
  smoke: THREE.Object3D[]
}

function crate(tex: Textures, w: number, h: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), texMat(tex.plank, 1, h / w))
  m.position.y = h / 2
  return m
}

function facade(text: string, bg: string, fg: string, w: number, h: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: labelTexture(text, bg, fg, 256, Math.round((256 * h) / w)) }))
}

function logPile(tex: Textures, w: number, d: number, h: number): THREE.Group {
  const g = new THREE.Group()
  const r = d / 2
  const rows = Math.max(1, Math.round(h / (r * 1.7)))
  const mat = texMat(tex.plank, 0.6, 0.6, "#a8743f")
  const end = new THREE.MeshLambertMaterial({ color: "#d9b27a" })
  for (let row = 0; row < rows; row += 1) {
    const count = 3 - row
    for (let i = 0; i < count; i += 1) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, w, 10), [mat, end, end])
      log.rotation.z = Math.PI / 2
      log.position.set(0, r * 0.5 + row * r * 0.85, (i - (count - 1) / 2) * r)
      g.add(log)
    }
  }
  return g
}

/** West: pigeon loft, the diner, Combinator Y Academy. East: the Waymo lot, the ranger station. */
function buildDistricts(tex: Textures) {
  const g = new THREE.Group()

  for (const sx of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.4), texMat(tex.path, 2, 2))
    pad.rotation.x = -Math.PI / 2
    pad.position.set(sx * 14.8, 0.006, sx < 0 ? 2.5 : 2)
    g.add(pad)
  }
  const westSign = signPost("PIGEON LOFT", "#8e96a6", "#ffffff", tex)
  westSign.position.set(-16, 0, 4.9)
  g.add(westSign)
  const westSign2 = signPost("ACADEMY", "#f26522", "#ffffff", tex)
  westSign2.position.set(-16, 0, -0.2)
  g.add(westSign2)
  const eastSign = signPost("WAYMO LOT", "#1d1d24", "#7fd3ff", tex)
  eastSign.position.set(16, 0, 0.8)
  g.add(eastSign)
  const eastSign2 = signPost("RANGER STN", "#5a6b3a", "#ffffff", tex)
  eastSign2.position.set(16.4, 0, 4.4)
  g.add(eastSign2)

  const loft = new THREE.Group()
  const L = layout.loft
  const tower = new THREE.Mesh(new THREE.BoxGeometry(L.w, L.h, L.d), texMat(tex.plank, 2, 3, "#d9b98a"))
  tower.position.y = L.h / 2
  loft.add(tower)
  for (const [px, pz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3, 0.16), texMat(tex.plank, 0.3, 1))
    post.position.set((px * L.w) / 2.2, L.h + 1.5, (pz * L.d) / 2.2)
    loft.add(post)
  }
  const coopRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.3, 4), new THREE.MeshPhongMaterial({ color: "#e2372e" }))
  coopRoof.rotation.y = Math.PI / 4
  coopRoof.position.y = L.h + 3.6
  loft.add(coopRoof)
  const loftSign = facade("FLYFRY HQ", "#ffd23b", "#e2372e", 2.8, 0.7)
  loftSign.position.set(0, 3, L.d / 2 + 0.01)
  loft.add(loftSign)
  loft.position.set(L.x, 0, L.z)
  g.add(loft)
  for (const b of propBoxes.filter((box) => box.w === 1.2)) {
    const c = crate(tex, b.w, b.h)
    c.position.x = b.x
    c.position.z = b.z
    g.add(c)
  }

  // The diner. Nobody in Missed Call takes a call at the counter.
  const D = layout.diner
  const diner = new THREE.Group()
  const dinerBody = new THREE.Mesh(new THREE.BoxGeometry(D.w, D.h, D.d), new THREE.MeshLambertMaterial({ color: "#f3e6d0" }))
  dinerBody.position.y = D.h / 2
  diner.add(dinerBody)
  const awning = new THREE.Mesh(new THREE.BoxGeometry(D.w + 0.4, 0.14, 1), new THREE.MeshPhongMaterial({ color: "#d8352a" }))
  awning.position.set(0, 2.3, D.d / 2 + 0.45)
  awning.rotation.x = 0.25
  diner.add(awning)
  const dinerSign = facade("MISSED CALL DINER", "#1d1d24", "#ffd23b", 4, 0.6)
  dinerSign.position.set(0, 2.8, D.d / 2 + 0.01)
  diner.add(dinerSign)
  const window1 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshPhongMaterial({ color: "#7fd3ff", shininess: 120 }))
  window1.position.set(-1, 1.2, D.d / 2 + 0.01)
  diner.add(window1)
  const neon = facade("NO PHONES", "#ffffff", "#e2372e", 1.3, 0.4)
  neon.position.set(-1, 1.2, D.d / 2 + 0.02)
  diner.add(neon)
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.7), new THREE.MeshLambertMaterial({ color: "#6b3a1c" }))
  door.position.set(1, 0.85, D.d / 2 + 0.01)
  diner.add(door)
  diner.position.set(D.x, 0, D.z)
  g.add(diner)

  // The ranger station: a kiosk, a turkey crossing sign, and two log piles to hop.
  const K = layout.kiosk
  const kiosk = new THREE.Group()
  const kioskBody = new THREE.Mesh(new THREE.BoxGeometry(K.w, K.h, K.d), texMat(tex.plank, 2, 2, "#c9955a"))
  kioskBody.position.y = K.h / 2
  kiosk.add(kioskBody)
  const kioskRoof = new THREE.Mesh(new THREE.ConeGeometry(K.w * 0.95, 0.9, 4), texMat(tex.shingle, 2, 2, "#5a6b3a"))
  kioskRoof.rotation.y = Math.PI / 4
  kioskRoof.position.y = K.h + 0.45
  kiosk.add(kioskRoof)
  const kioskSign = facade("TRAIL INFO", "#5a6b3a", "#ffffff", 1.8, 0.45)
  kioskSign.position.set(0, K.h - 0.4, K.d / 2 + 0.01)
  kiosk.add(kioskSign)
  const hatch = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshLambertMaterial({ color: "#2a1a12" }))
  hatch.position.set(0, 1.4, K.d / 2 + 0.01)
  kiosk.add(hatch)
  kiosk.position.set(K.x, 0, K.z)
  kiosk.rotation.y = -0.4
  g.add(kiosk)
  const xing = diamondSign("TURKEY XING", tex)
  xing.position.set(18.6, 0, 4.6)
  xing.rotation.y = -0.5
  g.add(xing)
  for (const b of layout.logPiles) {
    const pile = logPile(tex, b.w, b.d, b.h)
    pile.position.set(b.x, 0, b.z)
    g.add(pile)
  }

  const W = layout.waymo
  const car = new THREE.Group()
  const white = new THREE.MeshPhongMaterial({ color: "#f4f6f8", shininess: 110 })
  const carBody = new THREE.Mesh(new THREE.BoxGeometry(W.w, 1.0, W.d), white)
  carBody.position.y = 0.75
  car.add(carBody)
  const cab = new THREE.Mesh(new THREE.BoxGeometry(W.w * 0.7, 0.55, W.d * 0.95), white)
  cab.position.set(-0.1, 1.42, 0)
  car.add(cab)
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W.w * 0.66, 0.36, W.d * 0.97), new THREE.MeshPhongMaterial({ color: "#233040", shininess: 140 }))
  glass.position.set(-0.1, 1.44, 0)
  car.add(glass)
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.34, 12), new THREE.MeshPhongMaterial({ color: "#1d1d24", shininess: 100 }))
  sensor.position.set(1.1, 1.87, 0)
  car.add(sensor)
  for (const x of [-1.2, 1.2]) {
    for (const z of [-0.8, 0.8]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14), new THREE.MeshPhongMaterial({ color: "#1d1d24" }))
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, 0.34, z)
      car.add(wheel)
    }
  }
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshLambertMaterial({ color: "#4a4f5a" }))
  lot.rotation.x = -Math.PI / 2
  lot.position.set(W.x, 0.005, W.z + 0.6)
  g.add(lot)
  for (let i = 0; i < 3; i += 1) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 3), new THREE.MeshBasicMaterial({ color: "#ffffff" }))
    line.rotation.x = -Math.PI / 2
    line.position.set(W.x - 3 + i * 3, 0.01, W.z + 0.4)
    g.add(line)
  }
  car.position.set(W.x, 0, W.z)
  g.add(car)
  // Delivery crate beside the car: hop the crate, then the roof, to reach the fry.
  const step = crate(tex, 1.4, 0.85)
  step.position.x = 17
  step.position.z = W.z
  g.add(step)
  for (let i = 0; i < 4; i += 1) {
    const lap = new THREE.Group()
    lap.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.34), new THREE.MeshPhongMaterial({ color: "#b8bcc6", shininess: 120 })))
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.02), new THREE.MeshPhongMaterial({ color: "#b8bcc6", shininess: 120 }))
    lid.position.set(0, 0.17, -0.16)
    lap.add(lid)
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.28), new THREE.MeshBasicMaterial({ color: i % 2 ? "#7dffa0" : "#9ee7ff" }))
    glow.position.set(0, 0.17, -0.145)
    lap.add(glow)
    lap.position.set(W.x - 1.5 + i * 1, 1.28, W.z + W.d / 2 + 0.15)
    lap.rotation.y = Math.PI
    g.add(lap)
  }

  const A = layout.academy
  const acad = new THREE.Group()
  const acadBody = new THREE.Mesh(new THREE.BoxGeometry(A.w, A.h, A.d), texMat(tex.castle, 3, 2, "#ffe2c8"))
  acadBody.position.y = A.h / 2
  acad.add(acadBody)
  // Rotate the geometry first so the footprint scale doesn't shear the pyramid.
  const acadRoofGeo = new THREE.ConeGeometry(A.w * 0.72, 1.6, 4)
  acadRoofGeo.rotateY(Math.PI / 4)
  const acadRoof = new THREE.Mesh(acadRoofGeo, new THREE.MeshPhongMaterial({ color: "#f26522" }))
  acadRoof.scale.set(1, 1, A.d / A.w)
  acadRoof.position.y = A.h + 0.8
  acad.add(acadRoof)
  const acadSign = facade("COMBINATOR Y ACADEMY", "#f26522", "#ffffff", 5, 0.7)
  acadSign.position.set(0, A.h - 0.6, A.d / 2 + 0.01)
  acad.add(acadSign)
  const acadDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), new THREE.MeshLambertMaterial({ map: labelTexture("OPENS SOON", "#8a4b22", "#ffe2c8", 96, 160) }))
  acadDoor.position.set(0, 0.95, A.d / 2 + 0.02)
  acad.add(acadDoor)
  acad.position.set(A.x, 0, A.z)
  g.add(acad)

  return { group: g, door: acadDoor, sensor }
}

function hedge(len: number, h: number): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshPhongMaterial({ color: "#2e9a3a", shininess: 10 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, h, 1.1), mat)
  body.position.y = h / 2
  g.add(body)
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, len, 12), mat)
  top.rotation.z = Math.PI / 2
  top.position.y = h
  g.add(top)
  return g
}

function cloud(seed: number): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: "#ffffff", emissive: "#dfeeff", emissiveIntensity: 0.55, fog: false })
  const puffs = 4 + (seed % 3)
  for (let i = 0; i < puffs; i += 1) {
    const r = 2.2 + ((seed * 7 + i * 3) % 5) * 0.5
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), mat)
    puff.userData.noShadow = true
    puff.position.set((i - puffs / 2) * 2.4, Math.sin(i * 1.7 + seed) * 0.9, ((i * 5) % 3) - 1)
    g.add(puff)
  }
  return g
}

/** Deterministic noise in [0, 1) for scattering trees. */
function jitter(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** A split-rail fence from x0 to x1 along z = 0, posts every couple of meters. */
function fence(tex: Textures, x0: number, x1: number): THREE.Group {
  const g = new THREE.Group()
  const wood = texMat(tex.plank, 0.4, 1, "#a8743f")
  const len = x1 - x0
  const posts = Math.max(2, Math.round(len / 2.3) + 1)
  for (let i = 0; i < posts; i += 1) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.3, 0.16), wood)
    post.position.set(x0 + (i / (posts - 1)) * len, 0.65, 0)
    g.add(post)
  }
  for (const y of [0.5, 1.0]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), wood)
    rail.rotation.z = Math.PI / 2
    rail.position.set((x0 + x1) / 2, y, 0)
    g.add(rail)
  }
  return g
}

export function buildTown(tex: Textures): TownBuild {
  const g = new THREE.Group()
  const smoke: THREE.Object3D[] = []

  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), texMat(tex.lawn, 80, 80))
  lawn.rotation.x = -Math.PI / 2
  lawn.position.y = -0.02
  g.add(lawn)
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.6, 28), texMat(tex.path, 3, 3))
  plaza.rotation.x = -Math.PI / 2
  plaza.position.set(0, 0.004, 2.6)
  g.add(plaza)

  const size = 27
  const south = hedge(64, 0.7)
  south.position.z = size / 2 + 0.2
  g.add(south)
  for (const b of propBoxes.filter((box) => box.w === 1.1)) {
    const h = hedge(b.d, 1.2)
    h.rotation.y = Math.PI / 2
    h.position.set(b.x, 0, b.z)
    g.add(h)
  }
  for (const sx of [-1, 1]) {
    const outer = hedge(27, 1.2)
    outer.rotation.y = Math.PI / 2
    outer.position.x = sx * 31.7
    g.add(outer)
    const north = hedge(18, 1.2)
    north.position.set(sx * 22.8, 0, -13.2)
    g.add(north)
  }

  // The trailhead: a split-rail fence across the north side, a wooden gate, and the woods behind.
  const trailhead = new THREE.Group()
  for (const sx of [-1, 1]) {
    const run = fence(tex, sx < 0 ? -13.8 : gate.halfWidth + 0.3, sx < 0 ? -(gate.halfWidth + 0.3) : 13.8)
    trailhead.add(run)
  }
  const gateWood = texMat(tex.plank, 1.2, 1.4, "#9a6a3c")
  const gateL = new THREE.Group()
  const gateR = new THREE.Group()
  for (const [pivot, sx] of [
    [gateL, -1],
    [gateR, 1],
  ] as const) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(gate.halfWidth, 2.0, 0.12), gateWood)
    door.position.set((-sx * gate.halfWidth) / 2, 1.0, 0)
    pivot.add(door)
    const brace = new THREE.Mesh(new THREE.BoxGeometry(gate.halfWidth * 1.3, 0.14, 0.14), texMat(tex.plank, 1, 0.2, "#6b4526"))
    brace.position.set((-sx * gate.halfWidth) / 2, 1.0, 0.08)
    brace.rotation.z = sx * 0.9
    pivot.add(brace)
    pivot.position.set(sx * gate.halfWidth, 0, 0.4)
    trailhead.add(pivot)
    const tall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.3), texMat(tex.plank, 0.4, 2))
    tall.position.set(sx * (gate.halfWidth + 0.25), 1.7, 0.4)
    trailhead.add(tall)
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(gate.halfWidth * 2 + 0.8, 0.3, 0.3), texMat(tex.plank, 2, 0.3))
  beam.position.set(0, 3.3, 0.4)
  trailhead.add(beam)
  const overhead = facade("SUPERNATE'S PLACE · 2 MI", "#5a6b3a", "#ffffff", 3.4, 0.6)
  overhead.position.set(0, 2.85, 0.56)
  trailhead.add(overhead)
  trailhead.position.z = gate.z
  g.add(trailhead)

  // Dense pines behind the fence, parted at the gate so you can see the trail.
  for (let i = 0; i < 90; i += 1) {
    const x = -34 + jitter(i, 1) * 68
    const z = -15.5 - jitter(i, 2) * 10
    if (Math.abs(x) < 2.6 && z > -22) continue
    const h = 4.5 + jitter(i, 3) * 4
    const p = pine(i, h)
    p.position.set(x, 0, z)
    p.rotation.y = jitter(i, 4) * Math.PI
    g.add(p)
  }
  // Nate's cabin, far up the trail, smoke rising.
  const far = cabin(tex, { w: 4, h: 2.8, d: 3.6 })
  far.group.position.set(0, 0, -25)
  g.add(far.group)
  smoke.push(far.smoke)

  for (let i = 0; i < 9; i += 1) {
    const angle = (i / 9) * Math.PI * 2 + 0.3
    const r = 52 + (i % 3) * 8
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshPhongMaterial({ color: i % 2 ? "#4fbf45" : "#43ad3c", shininess: 6 }))
    hill.scale.set(16 + (i % 3) * 4, 7 + (i % 4) * 2.5, 16)
    hill.position.set(Math.cos(angle) * r, -2, Math.sin(angle) * r)
    g.add(hill)
  }
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2
    const c = cloud(i)
    c.position.set(Math.cos(angle) * 85, 26 + (i % 3) * 6, Math.sin(angle) * 85)
    c.lookAt(0, c.position.y, 0)
    g.add(c)
  }

  for (let i = 0; i < 30; i += 1) {
    const angle = (i / 30) * Math.PI * 2
    const r = 36 + (i % 4) * 3.5
    const t = i % 2 ? pine(i, 5 + (i % 3)) : tree(i)
    t.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r)
    t.scale.setScalar(1.1 + (i % 3) * 0.3)
    g.add(t)
  }
  const districts = buildDistricts(tex)
  g.add(districts.group)

  const roof = makeFry()
  roof.position.set(roofFry.x, roofFry.y, roofFry.z)
  roof.scale.setScalar(1.6)
  g.add(roof)

  const fries = frySpots.map((spot) => {
    const f = makeFry()
    f.position.set(spot.x, 0.9, spot.z)
    f.scale.setScalar(1.4)
    g.add(f)
    return f
  })

  // Each pigeon wanders its own looping route over a different part of town.
  const roosts = [
    { cx: -14, cz: 5 },
    { cx: 8, cz: 8 },
    { cx: 18, cz: -2 },
    { cx: -4, cz: -6 },
    { cx: 24, cz: 5 },
    { cx: -24, cz: 4 },
  ]
  const pigeons: THREE.Object3D[] = []
  for (let i = 0; i < roosts.length; i += 1) {
    const bird = makePigeon(10)
    const roost = roosts[i] ?? { cx: 0, cz: 0 }
    bird.userData = {
      ...roost,
      ax: 6.5 + (i % 3) * 2.5,
      az: 4 + ((i + 1) % 3) * 2.4,
      fx: 0.14 + (i % 4) * 0.05,
      fz: 0.1 + ((i * 2) % 5) * 0.04,
      ph: i * 1.7,
      h: 4.5 + (i % 3) * 1.7,
    }
    g.add(bird)
    pigeons.push(bird)
  }

  const ship = makeStarfighter(12)
  ship.position.set(crashSite.x, 0, crashSite.z)
  ship.rotation.set(0.12, crashSite.angle, -0.18)
  g.add(ship)
  const crater = new THREE.Mesh(new THREE.CircleGeometry(2.4, 20), new THREE.MeshLambertMaterial({ color: "#6b4a2b" }))
  crater.rotation.x = -Math.PI / 2
  crater.position.set(crashSite.x, 0.01, crashSite.z)
  g.add(crater)

  const welcome = signPost("MISSED CALL", "#ffd23b", "#1a2a5a", tex)
  welcome.position.set(3.4, 0, 11.6)
  welcome.rotation.y = -0.3
  g.add(welcome)
  const trail = signPost("TRAILHEAD", "#5a6b3a", "#ffffff", tex)
  trail.position.set(-4.8, 0, gate.z + 1.9)
  trail.rotation.y = 0.2
  g.add(trail)
  const solicit = signPost("NO COLD CALLS", "#e2372e", "#ffffff", tex)
  solicit.position.set(4.9, 0, gate.z + 1.9)
  solicit.rotation.y = -0.2
  g.add(solicit)

  const clinicBox = propBoxes[0]
  if (clinicBox) {
    const clinic = new THREE.Group()
    const base = new THREE.Mesh(new THREE.BoxGeometry(clinicBox.w, 2.2, clinicBox.d), new THREE.MeshLambertMaterial({ color: "#f5f1e8" }))
    base.position.y = 1.1
    clinic.add(base)
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshLambertMaterial({ map: tex.cloth }))
    cross.position.set(clinicBox.w / 2 + 0.01, 1.3, 0)
    cross.rotation.y = Math.PI / 2
    clinic.add(cross)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(clinicBox.w * 0.8, 1.6, 4), new THREE.MeshLambertMaterial({ color: "#e44a3a" }))
    roof.rotation.y = Math.PI / 4
    roof.position.y = 3
    clinic.add(roof)
    clinic.position.set(clinicBox.x, 0, clinicBox.z)
    g.add(clinic)
  }
  const clinicSign = signPost("CLINIC", "#ffffff", "#d83a2e", tex)
  clinicSign.position.set(-5, 0, 1.4)
  clinicSign.rotation.y = 0.5
  g.add(clinicSign)

  const deskBox = propBoxes[1]
  if (deskBox) {
    const desk = new THREE.Group()
    const top = new THREE.Mesh(new THREE.BoxGeometry(deskBox.w, 0.14, deskBox.d), texMat(tex.plank, 2, 1))
    top.position.y = 0.95
    desk.add(top)
    for (const x of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, deskBox.d - 0.1), new THREE.MeshLambertMaterial({ color: "#4a3120" }))
      leg.position.set((x * (deskBox.w - 0.2)) / 2, 0.45, 0)
      desk.add(leg)
    }
    desk.position.set(deskBox.x, 0, deskBox.z)
    g.add(desk)
  }
  const houseColors = ["#fff1c9", "#cdeaff"]
  ;[propBoxes[2], propBoxes[3]].forEach((b, i) => {
    if (!b) return
    const hh = house(tex, houseColors[i] ?? "#e8d9b8")
    hh.position.set(b.x, 0, b.z)
    hh.rotation.y = -Math.PI / 2
    g.add(hh)
  })

  const boothBox = propBoxes[4]
  if (boothBox) {
    const booth = new THREE.Group()
    const counter = new THREE.Mesh(new THREE.BoxGeometry(boothBox.w, 1.1, boothBox.d), texMat(tex.plank, 3, 1, "#b9c8e6"))
    counter.position.y = 0.55
    booth.add(counter)
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshLambertMaterial({ map: labelTexture("SEO → AIO", "#1f2f55", "#ffe066", 256, 64) }),
    )
    banner.position.set(0, 2.5, 0.2)
    booth.add(banner)
    for (const x of [-1.7, 1.7]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 8), new THREE.MeshPhongMaterial({ color: "#c8ccd4", shininess: 90 }))
      pole.position.set(x, 1.5, 0.2)
      booth.add(pole)
    }
    booth.position.set(boothBox.x, 0, boothBox.z)
    g.add(booth)
  }

  const wellBox = propBoxes[5]
  if (wellBox) {
    const well = new THREE.Group()
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.9, 14), texMat(tex.brick, 3, 0.6))
    ring.position.y = 0.45
    well.add(ring)
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.85, 14), new THREE.MeshPhongMaterial({ color: "#5aa6e0", shininess: 120 }))
    water.rotation.x = -Math.PI / 2
    water.position.y = 0.8
    well.add(water)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 4), texMat(tex.shingle, 2, 2))
    roof.rotation.y = Math.PI / 4
    roof.position.y = 2.5
    well.add(roof)
    for (const x of [-0.9, 0.9]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.8, 0.16), texMat(tex.plank, 0.3, 1))
      post.position.set(x, 1.4, 0)
      well.add(post)
    }
    well.position.set(wellBox.x, 0, wellBox.z)
    g.add(well)
  }

  return { group: g, gateL, gateR, fries, roofFry: roof, pigeons, ship, door: districts.door, sensor: districts.sensor, smoke }
}

export interface ArenaBuild {
  group: THREE.Group
  /** Chimney smoke to animate. */
  smoke: THREE.Object3D[]
}

export const arena = {
  minX: -11,
  maxX: 5,
  bossX: 7.6,
  groundY: 0,
  /** Height of the cabin porch, where SuperNate stands. */
  porchY: 1.2,
}

/** The clearing: a grassy shelf with a dirt lane, fallen-log platforms, pines behind, and Nate's cabin on the right. */
export function buildArena(tex: Textures): ArenaBuild {
  const g = new THREE.Group()
  const smoke: THREE.Object3D[] = []

  const top = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 12), texMat(tex.lawn, 10, 4))
  top.position.set(1, -0.25, -1.5)
  g.add(top)
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(26, 2.6), texMat(tex.path, 8, 1))
  lane.rotation.x = -Math.PI / 2
  lane.position.set(-3, 0.006, 0.6)
  g.add(lane)
  const lip = new THREE.Mesh(new THREE.BoxGeometry(32.4, 0.5, 12.4), texMat(tex.sandstone, 12, 0.3, "#8a6a4a"))
  lip.position.set(1, -0.7, -1.5)
  g.add(lip)
  const under = new THREE.Mesh(new THREE.CylinderGeometry(21, 3, 4.2, 4, 1), texMat(tex.brick, 10, 2, "#6b5a4a"))
  under.rotation.y = Math.PI / 4
  const underWrap = new THREE.Group()
  underWrap.scale.set(1, 1, 0.3)
  underWrap.add(under)
  underWrap.position.set(1, -3.05, -1.5)
  g.add(underWrap)
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 0.1, 2.4, 4, 1), texMat(tex.sandstone, 3, 2, "#8a6a4a"))
  drip.rotation.y = Math.PI / 4
  const dripWrap = new THREE.Group()
  dripWrap.scale.set(1, 1, 0.5)
  dripWrap.add(drip)
  dripWrap.position.set(1, -6.7, -1.5)
  g.add(dripWrap)

  // A wider shelf behind, so the woods have something to stand on.
  const back = new THREE.Mesh(new THREE.BoxGeometry(50, 0.6, 18), texMat(tex.lawn, 14, 5, "#8fc77a"))
  back.position.set(1, -0.3, -16)
  g.add(back)
  for (let i = 0; i < 70; i += 1) {
    const x = -24 + jitter(i, 5) * 50
    const z = -8 - jitter(i, 6) * 15
    const h = 5 + jitter(i, 7) * 5
    const p = pine(i, h)
    p.position.set(x, 0, z)
    p.rotation.y = jitter(i, 8) * Math.PI
    g.add(p)
  }
  for (let i = 0; i < 7; i += 1) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshPhongMaterial({ color: i % 2 ? "#3f7a4a" : "#356b40", shininess: 6 }))
    hill.scale.set(18 + (i % 3) * 5, 9 + (i % 4) * 3, 14)
    hill.position.set(-40 + i * 14, -4, -34 - (i % 3) * 6)
    g.add(hill)
  }
  for (let i = 0; i < 14; i += 1) {
    const c = cloud(i + 2)
    c.position.set(-44 + i * 7, -14 - (i % 3) * 3, 4 + (i % 4) * 9)
    c.scale.setScalar(1.3)
    g.add(c)
  }

  // Fallen logs on stumps stand in for the Smash platforms. The sim's platform data is unchanged.
  for (const p of platforms) {
    const plat = new THREE.Group()
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, p.half * 2, 12), [
      texMat(tex.plank, 3, 0.8, "#8a5a2b"),
      new THREE.MeshLambertMaterial({ color: "#d9b27a" }),
      new THREE.MeshLambertMaterial({ color: "#d9b27a" }),
    ])
    log.rotation.z = Math.PI / 2
    log.position.y = -0.42
    plat.add(log)
    const stumpH = p.y - 0.84
    for (const sx of [-0.55, 0.55]) {
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, stumpH, 10), texMat(tex.plank, 2, 1, "#6b4526"))
      stump.position.set(sx * p.half, -0.84 - stumpH / 2, 0)
      plat.add(stump)
    }
    plat.position.set(p.x, p.y, 0.6)
    g.add(plat)
  }

  const home = cabin(tex, { w: 5, h: 3.6, d: 4.4, porch: true, sign: "NO COLD CALLS" })
  home.group.position.set(arena.bossX + 1.5, 0, -3.6)
  g.add(home.group)
  smoke.push(home.smoke)

  g.position.z = ARENA_Z
  return { group: g, smoke }
}

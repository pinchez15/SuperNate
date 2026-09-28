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

/** Town is bright blue sky and green grass. The fight is a Smash stage in lavender haze. */
export function setArea(scene: THREE.Scene, tex: Textures, area: Area) {
  scene.background = area === "town" ? tex.skyTown : tex.sky
  const fog = scene.fog as THREE.Fog | null
  if (fog) fog.color.set(area === "town" ? palette.townFog : palette.fog)
  const hemi = scene.getObjectByName("hemi") as THREE.HemisphereLight | undefined
  if (hemi) {
    hemi.color.set(area === "town" ? "#e6f4ff" : "#eeeaff")
    hemi.groundColor.set(area === "town" ? "#5f9a3c" : "#8d7c68")
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

export interface TownBuild {
  group: THREE.Group
  gateL: THREE.Object3D
  gateR: THREE.Object3D
  bossTower: THREE.Group
  fries: THREE.Object3D[]
  roofFry: THREE.Object3D
  pigeons: THREE.Object3D[]
  ship: THREE.Object3D
  door: THREE.Object3D
  sensor: THREE.Object3D
}

function crate(tex: Textures, w: number, h: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), texMat(tex.plank, 1, h / w))
  m.position.y = h / 2
  return m
}

function poleTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas")
  c.width = 32
  c.height = 64
  const ctx = c.getContext("2d")
  if (ctx) {
    for (let i = -2; i < 10; i += 1) {
      ctx.fillStyle = i % 3 === 0 ? "#e2372e" : i % 3 === 1 ? "#ffffff" : "#2f6fe4"
      ctx.beginPath()
      ctx.moveTo(0, i * 8)
      ctx.lineTo(32, i * 8 - 16)
      ctx.lineTo(32, i * 8 - 8)
      ctx.lineTo(0, i * 8 + 8)
      ctx.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  return t
}

function facade(text: string, bg: string, fg: string, w: number, h: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: labelTexture(text, bg, fg, 256, Math.round((256 * h) / w)) }))
}

/** West: pigeon loft, barbershop, vineyard. East: the Waymo lot, Combinator Y Academy. */
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
  const eastSign2 = signPost("VINEYARD", "#7a1f2b", "#ffffff", tex)
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

  const B = layout.barbershop
  const shop = new THREE.Group()
  const shopBody = new THREE.Mesh(new THREE.BoxGeometry(B.w, B.h, B.d), new THREE.MeshLambertMaterial({ color: "#f3e6d0" }))
  shopBody.position.y = B.h / 2
  shop.add(shopBody)
  const awning = new THREE.Mesh(new THREE.BoxGeometry(B.w + 0.4, 0.14, 1), new THREE.MeshPhongMaterial({ color: "#2f6fe4" }))
  awning.position.set(0, 2.3, B.d / 2 + 0.45)
  awning.rotation.x = 0.25
  shop.add(awning)
  const shopSign = facade("SAL'S · CUTS BLINDFOLDED", "#1d1d24", "#ffd23b", 4, 0.6)
  shopSign.position.set(0, 2.8, B.d / 2 + 0.01)
  shop.add(shopSign)
  const window1 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshPhongMaterial({ color: "#7fd3ff", shininess: 120 }))
  window1.position.set(-1, 1.2, B.d / 2 + 0.01)
  shop.add(window1)
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.7), new THREE.MeshLambertMaterial({ color: "#6b3a1c" }))
  door.position.set(1, 0.85, B.d / 2 + 0.01)
  shop.add(door)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 12), new THREE.MeshPhongMaterial({ map: poleTexture(), shininess: 90 }))
  pole.position.set(B.w / 2 + 0.3, 1.4, B.d / 2 + 0.1)
  pole.name = "pole"
  shop.add(pole)
  shop.position.set(B.x, 0, B.z)
  g.add(shop)

  for (const z of layout.vineRows) {
    const row = new THREE.Group()
    const hedgeRow = new THREE.Mesh(new THREE.BoxGeometry(7, 0.9, 0.6), new THREE.MeshPhongMaterial({ color: "#3f8f3a", shininess: 8 }))
    hedgeRow.position.y = 0.45
    row.add(hedgeRow)
    for (let i = 0; i < 9; i += 1) {
      const grape = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshPhongMaterial({ color: "#6b2a7a", shininess: 60 }))
      grape.position.set(-3.2 + i * 0.8, 0.55, 0.33)
      row.add(grape)
    }
    row.position.set(layout.vineX, 0, z)
    g.add(row)
  }
  const aoc = facade("AOC · INTELLIGENCE ARTIFICIELLE GÉNÉRALE", "#7a1f2b", "#f3e6d0", 5, 0.6)
  aoc.position.set(layout.vineX, 1.5, -11.6)
  g.add(aoc)

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
  const acadRoof = new THREE.Mesh(new THREE.ConeGeometry(A.w * 0.72, 1.6, 4), new THREE.MeshPhongMaterial({ color: "#f26522" }))
  acadRoof.rotation.y = Math.PI / 4
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

function turret(tex: Textures, r: number, h: number): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), texMat(tex.castle, r * 2, h / 1.6))
  body.position.y = h / 2
  g.add(body)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.3, r * 2.4, 16), new THREE.MeshPhongMaterial({ color: "#d8342a", shininess: 50 }))
  roof.position.y = h + r * 1.2
  g.add(roof)
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), new THREE.MeshPhongMaterial({ color: "#e0e0e0" }))
  flagPole.position.y = h + r * 2.4 + 0.5
  g.add(flagPole)
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshLambertMaterial({ color: "#ffcc33", side: THREE.DoubleSide }))
  flag.position.set(0.36, h + r * 2.4 + 0.85, 0)
  flag.name = "flag"
  g.add(flag)
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


export function buildTown(tex: Textures): TownBuild {
  const g = new THREE.Group()

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

  const castle = new THREE.Group()
  const wallH = 4.4
  const flank = (size - gate.halfWidth * 2 - 2) / 2
  for (const sx of [-1, 1]) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(flank, wallH, 2), texMat(tex.castle, flank / 1.6, wallH / 1.6))
    body.position.set(sx * (gate.halfWidth + 1 + flank / 2), wallH / 2, -0.6)
    castle.add(body)
    for (let i = 0; i < 3; i += 1) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.1), new THREE.MeshPhongMaterial({ color: "#2b3f8a", shininess: 100 }))
      win.position.set(sx * (gate.halfWidth + 3 + i * 3.2), 2.6, 0.42)
      castle.add(win)
    }
    const trim = new THREE.Mesh(new THREE.BoxGeometry(flank, 0.35, 2.3), new THREE.MeshPhongMaterial({ color: "#c9a26b" }))
    trim.position.set(sx * (gate.halfWidth + 1 + flank / 2), wallH, -0.6)
    castle.add(trim)
    const corner = turret(tex, 1.5, 6.2)
    corner.position.set(sx * (size / 2 + 0.4), 0, -0.6)
    castle.add(corner)
    const gateTurret = turret(tex, 1.1, 6.8)
    gateTurret.position.set(sx * (gate.halfWidth + 1), 0, -0.2)
    castle.add(gateTurret)
  }
  const arch = new THREE.Mesh(new THREE.BoxGeometry(gate.halfWidth * 2 + 0.4, 1.4, 2.2), texMat(tex.castle, 2, 0.8))
  arch.position.set(0, wallH + 0.5, -0.4)
  castle.add(arch)
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.75, 20),
    new THREE.MeshBasicMaterial({ color: "#ffb3d9" }),
  )
  glass.position.set(0, wallH + 0.5, 0.72)
  castle.add(glass)
  const doorMat = new THREE.MeshPhongMaterial({ color: "#8a4b22", shininess: 20 })
  const gateL = new THREE.Group()
  const gateR = new THREE.Group()
  for (const [pivot, sx] of [
    [gateL, -1],
    [gateR, 1],
  ] as const) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(gate.halfWidth, wallH - 0.2, 0.25), doorMat)
    door.position.set((-sx * gate.halfWidth) / 2, (wallH - 0.2) / 2, 0)
    pivot.add(door)
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.28, 5), new THREE.MeshPhongMaterial({ color: "#ffd23b", shininess: 120 }))
    star.position.set((-sx * gate.halfWidth) / 2, 2.4, 0.14)
    pivot.add(star)
    pivot.position.set(sx * gate.halfWidth, 0, 0.4)
    castle.add(pivot)
  }
  castle.position.z = gate.z
  g.add(castle)

  const bossTower = turret(tex, 3, 12)
  bossTower.position.set(0, 0, -24)
  g.add(bossTower)

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
    const t = tree(i)
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

  const welcome = signPost("HOGPATCH", "#ffd23b", "#1a2a5a", tex)
  welcome.position.set(3.4, 0, 11.6)
  welcome.rotation.y = -0.3
  g.add(welcome)
  const hq = signPost("POSTHOG HQ", "#f54e00", "#ffffff", tex)
  hq.position.set(-4.8, 0, gate.z + 1.9)
  hq.rotation.y = 0.2
  g.add(hq)
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
    const clock = new THREE.Group()
    const faceMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 20), new THREE.MeshPhongMaterial({ color: "#ffffff" }))
    faceMesh.rotation.x = Math.PI / 2
    clock.add(faceMesh)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), new THREE.MeshPhongMaterial({ color: "#7b4fa8" }))
    clock.add(rim)
    for (const [len, rot] of [
      [0.36, 0.4],
      [0.26, 2.2],
    ] as const) {
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.04, len, 0.02), new THREE.MeshBasicMaterial({ color: "#111" }))
      hand.geometry.translate(0, len / 2, 0)
      hand.rotation.z = rot
      hand.position.z = 0.08
      hand.name = "clockhand"
      clock.add(hand)
    }
    clock.position.set(0.3, 1.75, 0)
    clock.rotation.y = -Math.PI / 2
    desk.add(clock)
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

  return { group: g, gateL, gateR, bossTower, fries, roofFry: roof, pigeons, ship, door: districts.door, sensor: districts.sensor }
}

export interface ArenaBuild {
  group: THREE.Group
  dais: THREE.Object3D
}

export const arena = {
  minX: -11,
  maxX: 5,
  bossX: 7.6,
  groundY: 0,
}

/** A Smash-style side stage: one big platform, castle backdrop, HedgeHawkins on a dais. */
export function buildArena(tex: Textures): ArenaBuild {
  const g = new THREE.Group()
  const top = new THREE.Mesh(new THREE.BoxGeometry(26, 0.5, 7), texMat(tex.cobble, 9, 2.4))
  top.position.y = -0.25
  g.add(top)
  const lip = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.5, 7.4), texMat(tex.sandstone, 12, 0.3))
  lip.position.y = -0.7
  g.add(lip)
  const under = new THREE.Mesh(new THREE.CylinderGeometry(17.5, 2.5, 4.2, 4, 1), texMat(tex.brick, 10, 2))
  under.rotation.y = Math.PI / 4
  const underWrap = new THREE.Group()
  underWrap.scale.set(1, 1, 0.27)
  underWrap.add(under)
  underWrap.position.y = -3.05
  g.add(underWrap)
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 0.1, 2.2, 4, 1), texMat(tex.sandstone, 3, 2))
  drip.rotation.y = Math.PI / 4
  const dripWrap = new THREE.Group()
  dripWrap.scale.set(1, 1, 0.5)
  dripWrap.add(drip)
  dripWrap.position.y = -6.6
  g.add(dripWrap)

  const far = new THREE.Group()
  const keep = turret(tex, 5, 16)
  keep.position.set(-14, -30, -70)
  far.add(keep)
  const keep2 = turret(tex, 3.5, 11)
  keep2.position.set(10, -30, -62)
  far.add(keep2)
  const farWall = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 4), texMat(tex.castle, 20, 4))
  farWall.position.set(-2, -26, -66)
  far.add(farWall)
  g.add(far)
  for (let i = 0; i < 14; i += 1) {
    const c = cloud(i + 2)
    c.position.set(-44 + i * 7, -14 - (i % 3) * 3, -10 - (i % 4) * 9)
    c.scale.setScalar(1.3)
    g.add(c)
  }

  for (const p of platforms) {
    const plat = new THREE.Group()
    const slab = new THREE.Mesh(new THREE.BoxGeometry(p.half * 2, 0.4, 2.4), texMat(tex.sandstone, 2.4, 0.3))
    slab.position.y = -0.2
    plat.add(slab)
    const bottom = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 4), texMat(tex.brick, 2, 1))
    bottom.rotation.set(Math.PI, Math.PI / 4, 0)
    bottom.position.y = -1
    bottom.scale.set(1.25, 1, 0.8)
    plat.add(bottom)
    plat.position.set(p.x, p.y, 0.6)
    g.add(plat)
  }

  const dais = new THREE.Group()
  const step = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 5), texMat(tex.sandstone, 3, 0.8))
  step.position.y = 0.6
  dais.add(step)
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.6, 4), texMat(tex.brick, 2.4, 0.4))
  step2.position.y = 1.5
  dais.add(step2)
  dais.position.set(arena.bossX, 0, -0.6)
  g.add(dais)

  g.position.z = ARENA_Z
  return { group: g, dais }
}

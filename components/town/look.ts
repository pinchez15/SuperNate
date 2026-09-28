import * as THREE from "three"

export type CameraMode = "behind" | "side"

export interface Look {
  texSize: 32 | 64 | 128 | 256
  blur: boolean
  segments: number
  fog: number
  dither: boolean
  renderScale: number
  camera: CameraMode
}

/** Mid-2000s PC look: sharp res, smooth geometry, crisp textures, light haze. */
export const defaultLook: Look = {
  texSize: 128,
  blur: true,
  segments: 24,
  fog: 0.28,
  dither: false,
  renderScale: 1,
  camera: "behind",
}

export const palette = {
  skyTop: "#b9b3d6",
  skyBottom: "#e4dcea",
  fog: "#d8d0e4",
  sun: "#fff3dc",
  ground: "#8c8378",
  townSkyTop: "#3f97ea",
  townSkyBottom: "#bfe6ff",
  townFog: "#cfe9ff",
}

export type TexName = "brick" | "shingle" | "cobble" | "sandstone" | "grass" | "plank" | "cloth" | "path" | "castle" | "lawn"

export type Textures = Record<TexName, THREE.Texture> & { sky: THREE.Texture; skyTown: THREE.Texture }

function rand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas")
  c.width = size
  c.height = size
  const ctx = c.getContext("2d")
  if (!ctx) throw new Error("2d canvas unavailable")
  return [c, ctx]
}

function speckle(ctx: CanvasRenderingContext2D, size: number, r: () => number, amount: number, alpha: number) {
  for (let i = 0; i < amount; i += 1) {
    const light = r() > 0.5
    ctx.fillStyle = light ? `rgba(255,255,255,${alpha * r()})` : `rgba(0,0,0,${alpha * r()})`
    ctx.fillRect(Math.floor(r() * size), Math.floor(r() * size), 1 + Math.floor(r() * 2), 1)
  }
}

function drawBrick(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#6f6c72"
  ctx.fillRect(0, 0, s, s)
  const rows = 4
  const rh = s / rows
  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : s / 4
    for (let col = -1; col < 2; col += 1) {
      const x = col * (s / 2) + offset
      const shade = 118 + Math.floor(r() * 30)
      ctx.fillStyle = `rgb(${shade},${shade - 2},${shade + 6})`
      ctx.fillRect(x + 1, row * rh + 1, s / 2 - 2, rh - 2)
      ctx.fillStyle = "rgba(255,255,255,0.18)"
      ctx.fillRect(x + 1, row * rh + 1, s / 2 - 2, Math.max(1, s / 64))
      ctx.fillStyle = "rgba(0,0,0,0.22)"
      ctx.fillRect(x + 1, row * rh + rh - 1 - Math.max(1, s / 64), s / 2 - 2, Math.max(1, s / 64))
    }
  }
  speckle(ctx, s, r, s * 3, 0.25)
}

function drawShingle(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#1f4a2e"
  ctx.fillRect(0, 0, s, s)
  const rows = 4
  const rh = s / rows
  const cols = 4
  const cw = s / cols
  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : cw / 2
    for (let col = -1; col <= cols; col += 1) {
      const x = col * cw + offset
      const g = 92 + Math.floor(r() * 30)
      ctx.fillStyle = `rgb(${38 + Math.floor(r() * 10)},${g},${58 + Math.floor(r() * 10)})`
      ctx.beginPath()
      ctx.moveTo(x + 1, row * rh)
      ctx.lineTo(x + cw - 1, row * rh)
      ctx.lineTo(x + cw - 1, row * rh + rh * 0.6)
      ctx.quadraticCurveTo(x + cw / 2, row * rh + rh + 1, x + 1, row * rh + rh * 0.6)
      ctx.fill()
      ctx.fillStyle = "rgba(0,0,0,0.3)"
      ctx.fillRect(x + 1, row * rh + rh * 0.62, cw - 2, 1)
    }
  }
  speckle(ctx, s, r, s * 2, 0.2)
}

function drawCobble(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#77736f"
  ctx.fillRect(0, 0, s, s)
  const u = s / 8
  for (let y = -1; y < 9; y += 1) {
    for (let x = -1; x < 9; x += 1) {
      const horizontal = (x + y) % 2 === 0
      const shade = 150 + Math.floor(r() * 26)
      ctx.fillStyle = `rgb(${shade},${shade - 6},${shade - 14})`
      if (horizontal) ctx.fillRect(x * u + 1, y * u + 1, u * 2 - 2, u - 2)
      else ctx.fillRect(x * u + 1, y * u + 1, u - 2, u * 2 - 2)
    }
  }
  speckle(ctx, s, r, s * 4, 0.22)
}

function drawSandstone(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#8a7550"
  ctx.fillRect(0, 0, s, s)
  const rows = 2
  const rh = s / rows
  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : s / 6
    for (let col = -1; col < 3; col += 1) {
      const x = col * (s / 3) + offset
      const shade = 176 + Math.floor(r() * 24)
      ctx.fillStyle = `rgb(${shade},${shade - 22},${shade - 70})`
      ctx.fillRect(x + 1, row * rh + 1, s / 3 - 2, rh - 2)
    }
  }
  speckle(ctx, s, r, s * 4, 0.28)
}

function drawGrass(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#5f9a3c"
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < s * 6; i += 1) {
    const g = 120 + Math.floor(r() * 60)
    ctx.fillStyle = `rgba(${60 + Math.floor(r() * 30)},${g},${40 + Math.floor(r() * 20)},0.8)`
    ctx.fillRect(Math.floor(r() * s), Math.floor(r() * s), 1, 2)
  }
}

function drawPlank(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#6b4526"
  ctx.fillRect(0, 0, s, s)
  const boards = 4
  const bw = s / boards
  for (let i = 0; i < boards; i += 1) {
    const shade = 140 + Math.floor(r() * 30)
    ctx.fillStyle = `rgb(${shade},${Math.floor(shade * 0.62)},${Math.floor(shade * 0.36)})`
    ctx.fillRect(i * bw + 1, 0, bw - 2, s)
  }
  speckle(ctx, s, r, s * 3, 0.2)
}

function drawCloth(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, s, s)
  ctx.fillStyle = "#d83a2e"
  const w = s / 5
  ctx.fillRect(s / 2 - w / 2, s * 0.2, w, s * 0.6)
  ctx.fillRect(s * 0.2, s / 2 - w / 2, s * 0.6, w)
  speckle(ctx, s, r, s * 2, 0.08)
}

function drawLawn(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#4fb33a"
  ctx.fillRect(0, 0, s, s)
  ctx.fillStyle = "rgba(255,255,255,0.07)"
  ctx.fillRect(0, 0, s, s / 2)
  for (let i = 0; i < s * 5; i += 1) {
    const g = 150 + Math.floor(r() * 70)
    ctx.fillStyle = `rgba(${50 + Math.floor(r() * 40)},${g},${30 + Math.floor(r() * 30)},0.7)`
    ctx.fillRect(Math.floor(r() * s), Math.floor(r() * s), 1, 2)
  }
}

function drawPath(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#e3c27f"
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < s * 5; i += 1) {
    const t = 190 + Math.floor(r() * 50)
    ctx.fillStyle = `rgba(${t},${t - 40},${t - 110},0.6)`
    ctx.fillRect(Math.floor(r() * s), Math.floor(r() * s), 2, 1)
  }
}

function drawCastle(ctx: CanvasRenderingContext2D, s: number, r: () => number) {
  ctx.fillStyle = "#d8c8a4"
  ctx.fillRect(0, 0, s, s)
  const rows = 4
  const rh = s / rows
  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : s / 4
    for (let col = -1; col < 2; col += 1) {
      const x = col * (s / 2) + offset
      const shade = 232 + Math.floor(r() * 18)
      ctx.fillStyle = `rgb(${shade},${shade - 12},${shade - 40})`
      ctx.fillRect(x + 1, row * rh + 1, s / 2 - 2, rh - 2)
    }
  }
  speckle(ctx, s, r, s * 2, 0.12)
}

function toTexture(c: HTMLCanvasElement, blur: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.generateMipmaps = blur
  tex.magFilter = blur ? THREE.LinearFilter : THREE.NearestFilter
  tex.minFilter = blur ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter
  tex.anisotropy = blur ? 8 : 1
  return tex
}

export function makeTextures(look: Look): Textures {
  const s = look.texSize
  const draws: Record<TexName, (ctx: CanvasRenderingContext2D, s: number, r: () => number) => void> = {
    brick: drawBrick,
    shingle: drawShingle,
    cobble: drawCobble,
    sandstone: drawSandstone,
    grass: drawGrass,
    plank: drawPlank,
    cloth: drawCloth,
    path: drawPath,
    castle: drawCastle,
    lawn: drawLawn,
  }
  const out = {} as Record<TexName, THREE.Texture>
  let seed = 7
  for (const name of Object.keys(draws) as TexName[]) {
    const [c, ctx] = canvas(s)
    draws[name](ctx, s, rand((seed += 11)))
    out[name] = toTexture(c, look.blur)
  }

  const [skyC, skyCtx] = canvas(64)
  const grad = skyCtx.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, palette.skyTop)
  grad.addColorStop(0.6, palette.skyBottom)
  grad.addColorStop(1, "#f1ebe8")
  skyCtx.fillStyle = grad
  skyCtx.fillRect(0, 0, 64, 64)
  skyCtx.fillStyle = "rgba(255,255,255,0.35)"
  for (let i = 0; i < 6; i += 1) {
    skyCtx.beginPath()
    skyCtx.ellipse(8 + i * 11, 18 + (i % 3) * 6, 9, 2.5, 0, 0, Math.PI * 2)
    skyCtx.fill()
  }
  const sky = new THREE.CanvasTexture(skyC)
  sky.colorSpace = THREE.SRGBColorSpace

  const [townC, townCtx] = canvas(64)
  const tg = townCtx.createLinearGradient(0, 0, 0, 64)
  tg.addColorStop(0, palette.townSkyTop)
  tg.addColorStop(0.7, palette.townSkyBottom)
  tg.addColorStop(1, "#e8f6ff")
  townCtx.fillStyle = tg
  townCtx.fillRect(0, 0, 64, 64)
  const skyTown = new THREE.CanvasTexture(townC)
  skyTown.colorSpace = THREE.SRGBColorSpace

  return { ...out, sky, skyTown }
}

export function disposeTextures(tex: Textures) {
  for (const value of Object.values(tex)) value.dispose()
}

/** Brick-textured material with repeat set so bricks stay a consistent size. */
export function texMat(tex: THREE.Texture, repeatX: number, repeatY: number, tint = "#ffffff") {
  const t = tex.clone()
  t.needsUpdate = true
  t.repeat.set(repeatX, repeatY)
  return new THREE.MeshLambertMaterial({ map: t, color: tint })
}

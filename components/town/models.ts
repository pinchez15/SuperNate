import * as THREE from "three"

/** "you" is the player. "nate" is SuperNate, the recluse at the end of the trail. */
export type CharacterId = "you" | "nate" | "doctor" | "vest" | "guide" | "engineer" | "ranger" | "gerald"

export interface CharacterOpts {
  /** The player's name, printed on the hero's badge. */
  name?: string
}

export interface Rig {
  root: THREE.Group
  body: THREE.Group
  legL?: THREE.Object3D
  legR?: THREE.Object3D
  armL?: THREE.Object3D
  armR?: THREE.Object3D
  head?: THREE.Object3D
  flames?: THREE.Object3D[]
  cape?: THREE.Object3D
  prop?: THREE.Object3D
}

function plastic(color: string, shininess = 38) {
  return new THREE.MeshPhongMaterial({ color, shininess, specular: new THREE.Color("#3a3a3a") })
}

function matte(color: string) {
  return new THREE.MeshLambertMaterial({ color })
}

function sphere(r: number, seg: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg * 0.75))), mat)
}

function capsule(r: number, len: number, seg: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, Math.max(2, Math.round(seg / 4)), seg), mat)
}

function box(w: number, h: number, d: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
}

function cyl(rt: number, rb: number, h: number, seg: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
}

function at<T extends THREE.Object3D>(obj: T, x: number, y: number, z: number): T {
  obj.position.set(x, y, z)
  return obj
}

/** A limb that pivots at its top, so rotating it swings like a shoulder or hip. */
function limb(r: number, len: number, seg: number, mat: THREE.Material, end?: THREE.Object3D) {
  const pivot = new THREE.Group()
  const part = capsule(r, len, seg, mat)
  part.position.y = -len / 2 - r * 0.4
  pivot.add(part)
  if (end) {
    end.position.y = -len - r * 0.9
    pivot.add(end)
  }
  return pivot
}

function blobShadow(radius: number) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 20),
    new THREE.MeshBasicMaterial({ color: "#1b1624", transparent: true, opacity: 0.14, depthWrite: false }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.02
  mesh.renderOrder = -1
  return mesh
}

interface FaceOpts {
  skin: string
  eye?: string
  brows?: "determined" | "friendly" | "none"
  smile?: boolean
}

function face(head: THREE.Object3D, r: number, seg: number, opts: FaceOpts) {
  const white = plastic("#ffffff", 60)
  const eyeMat = plastic(opts.eye ?? "#1b1b22", 80)
  for (const side of [-1, 1]) {
    const eyeWhite = sphere(r * 0.2, seg, white)
    eyeWhite.scale.set(0.8, 1.15, 0.5)
    at(eyeWhite, side * r * 0.34, r * 0.08, r * 0.86)
    head.add(eyeWhite)
    const pupil = sphere(r * 0.12, seg, eyeMat)
    pupil.scale.set(0.8, 1.2, 0.5)
    at(pupil, side * r * 0.32, r * 0.06, r * 0.95)
    head.add(pupil)
    const glint = sphere(r * 0.035, 6, white)
    at(glint, side * r * 0.29, r * 0.13, r * 0.99)
    head.add(glint)
    if (opts.brows && opts.brows !== "none") {
      const brow = box(r * 0.32, r * 0.07, r * 0.08, matte("#2a1a12"))
      at(brow, side * r * 0.34, r * 0.34, r * 0.86)
      brow.rotation.z = opts.brows === "determined" ? side * -0.35 : side * 0.12
      head.add(brow)
    }
  }
  const mouthMat = matte("#5a2418")
  if (opts.smile) {
    const smile = new THREE.Mesh(new THREE.TorusGeometry(r * 0.2, r * 0.035, 6, 12, Math.PI), mouthMat)
    smile.rotation.z = Math.PI
    at(smile, 0, -r * 0.28, r * 0.9)
    head.add(smile)
  } else {
    const mouth = box(r * 0.26, r * 0.05, r * 0.05, mouthMat)
    at(mouth, 0, -r * 0.3, r * 0.92)
    head.add(mouth)
  }
}

/**
 * SuperNate: athletic F-Zero-pilot proportions, long legs, flared jet boots,
 * broad tapered chest, gloves, a smaller head in a visored helmet, and a
 * determined jaw. He has been in the woods a while, so there is a beard now.
 */
export function makeNate(seg: number): Rig {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  root.add(blobShadow(0.5))

  const red = plastic("#c92f24", 48)
  const redDark = plastic("#8f1e17", 32)
  const blue = plastic("#2f73c9", 75)
  const navy = plastic("#1c2f55", 45)
  const gold = plastic("#f2b632", 110)
  const gloveMat = plastic("#f2f2ee", 55)
  const skinTone = "#e8a05c"
  const skin = plastic(skinTone, 20)

  // Flared jet boots, Captain Falcon style.
  const boot = () => {
    const g = new THREE.Group()
    const cuff = cyl(0.185, 0.145, 0.16, seg, navy)
    cuff.position.y = 0.1
    g.add(cuff)
    const shin = cyl(0.14, 0.155, 0.26, seg, navy)
    shin.position.y = -0.1
    g.add(shin)
    const foot = box(0.19, 0.12, 0.32, navy)
    foot.position.set(0, -0.24, 0.07)
    g.add(foot)
    const trim = cyl(0.19, 0.19, 0.045, seg, gold)
    trim.position.y = 0.18
    g.add(trim)
    return g
  }

  const legL = limb(0.125, 0.56, seg, red, boot())
  const legR = limb(0.125, 0.56, seg, red, boot())
  at(legL, -0.19, 1.16, 0)
  at(legR, 0.19, 1.16, 0)
  const flames: THREE.Object3D[] = []
  for (const leg of [legL, legR]) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.34, seg),
      new THREE.MeshBasicMaterial({ color: "#ffb13b", transparent: true, opacity: 0.85 }),
    )
    flame.rotation.x = Math.PI
    flame.position.y = -1.08
    leg.add(flame)
    flames.push(flame)
  }
  body.add(legL, legR)

  // Torso: narrow waist up into a broad chest.
  const waist = cyl(0.24, 0.27, 0.34, seg, red)
  at(waist, 0, 1.34, 0)
  body.add(waist)
  const chest = capsule(0.3, 0.26, seg, red)
  chest.scale.set(1.28, 1, 0.88)
  at(chest, 0, 1.68, 0)
  body.add(chest)
  const plate = sphere(0.26, seg, blue)
  plate.scale.set(1.15, 0.72, 0.5)
  at(plate, 0, 1.76, 0.2)
  body.add(plate)
  const emblem = cyl(0.09, 0.09, 0.03, seg, gold)
  emblem.rotation.x = Math.PI / 2
  at(emblem, 0, 1.78, 0.44)
  body.add(emblem)
  const belt = cyl(0.26, 0.28, 0.09, seg, navy)
  at(belt, 0, 1.18, 0)
  body.add(belt)
  const buckle = box(0.14, 0.09, 0.05, gold)
  at(buckle, 0, 1.18, 0.26)
  body.add(buckle)

  for (const side of [-1, 1]) {
    const pad = sphere(0.17, seg, redDark)
    pad.scale.set(1.15, 0.7, 1)
    at(pad, side * 0.4, 1.9, 0)
    body.add(pad)
  }

  // Gloved fists.
  const fist = (mat: THREE.Material) => {
    const g = new THREE.Group()
    const cuffG = cyl(0.115, 0.1, 0.12, seg, mat)
    cuffG.position.y = 0.08
    g.add(cuffG)
    const hand = sphere(0.125, seg, mat)
    hand.scale.set(1, 1.1, 1)
    g.add(hand)
    return g
  }
  const armL = limb(0.1, 0.46, seg, red, fist(gloveMat))
  const armR = limb(0.1, 0.46, seg, red, fist(gloveMat))
  at(armL, -0.46, 1.88, 0)
  at(armR, 0.46, 1.88, 0)
  armL.rotation.z = -0.1
  armR.rotation.z = 0.1
  body.add(armL, armR)

  const phone = new THREE.Group()
  phone.add(box(0.14, 0.26, 0.04, plastic("#18181c", 90)))
  const screen = box(0.11, 0.2, 0.01, new THREE.MeshBasicMaterial({ color: "#7dffa0" }))
  screen.position.z = 0.025
  phone.add(screen)
  phone.position.set(0, -0.62, 0.16)
  phone.rotation.x = -0.4
  armR.add(phone)

  const neck = cyl(0.09, 0.11, 0.14, seg, skin)
  at(neck, 0, 2.02, 0)
  body.add(neck)

  const head = new THREE.Group()
  at(head, 0, 2.28, 0.02)
  const helmet = sphere(0.33, seg, blue)
  helmet.scale.set(1, 1.08, 1.02)
  head.add(helmet)
  // Open face with a strong jaw under the helmet line.
  const faceBall = sphere(0.27, seg, skin)
  faceBall.scale.set(0.98, 0.94, 0.86)
  at(faceBall, 0, -0.08, 0.12)
  head.add(faceBall)
  const jaw = sphere(0.16, seg, skin)
  jaw.scale.set(1.25, 0.72, 0.9)
  at(jaw, 0, -0.26, 0.16)
  head.add(jaw)
  // The recluse beard, short and squared off.
  const beard = sphere(0.19, seg, plastic("#4a2e1d", 18))
  beard.scale.set(1.35, 0.8, 0.95)
  at(beard, 0, -0.34, 0.17)
  head.add(beard)
  const faceAnchor = new THREE.Group()
  at(faceAnchor, 0, -0.06, 0.1)
  face(faceAnchor, 0.3, seg, { skin: skinTone, brows: "determined" })
  head.add(faceAnchor)
  // Helmet ridge over the brow, like a visor.
  const ridge = box(0.42, 0.075, 0.18, navy)
  at(ridge, 0, 0.13, 0.26)
  ridge.rotation.x = 0.25
  head.add(ridge)
  for (const side of [-1, 1]) {
    const pod = sphere(0.075, seg, gold)
    pod.scale.set(0.6, 1, 1)
    at(pod, side * 0.32, -0.02, 0.02)
    head.add(pod)
  }
  const shine = sphere(0.07, 8, new THREE.MeshBasicMaterial({ color: "#bfe4ff" }))
  shine.scale.set(1.6, 0.6, 0.6)
  at(shine, -0.13, 0.26, 0.16)
  head.add(shine)
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, seg), redDark)
  at(fin, 0, 0.36, -0.08)
  fin.rotation.x = -0.35
  head.add(fin)
  body.add(head)

  const cape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.4, 1.2, seg, 1, true, Math.PI * 0.72, Math.PI * 0.56),
    new THREE.MeshLambertMaterial({ color: "#8f1e17", side: THREE.DoubleSide }),
  )
  cape.geometry.translate(0, -0.58, 0)
  at(cape, 0, 1.92, -0.12)
  body.add(cape)

  return { root, body, legL, legR, armL, armR, head, flames, cape, prop: phone }
}

interface PersonOpts {
  skin: string
  hair: string
  hairStyle: "short" | "bun" | "slick" | "hood"
  top: string
  bottom: string
  shoes: string
  coat?: string
  brows?: FaceOpts["brows"]
  smile?: boolean
}

export function makePerson(seg: number, o: PersonOpts): Rig {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  root.add(blobShadow(0.5))

  const skin = plastic(o.skin, 20)
  const top = plastic(o.top, 24)
  const bottom = plastic(o.bottom, 18)
  const shoes = plastic(o.shoes, 50)

  const legL = limb(0.15, 0.42, seg, bottom, sphere(0.17, seg, shoes))
  const legR = limb(0.15, 0.42, seg, bottom, sphere(0.17, seg, shoes))
  at(legL, -0.17, 0.82, 0)
  at(legR, 0.17, 0.82, 0)
  body.add(legL, legR)

  const torso = capsule(0.34, 0.42, seg, top)
  at(torso, 0, 1.18, 0)
  body.add(torso)

  if (o.coat) {
    const coat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.37, 0.48, 1.0, seg, 1, true, Math.PI * 0.12, Math.PI * 1.76),
      new THREE.MeshPhongMaterial({ color: o.coat, shininess: 18, side: THREE.DoubleSide }),
    )
    at(coat, 0, 1.02, 0)
    body.add(coat)
  }

  const sleeve = o.coat ? plastic(o.coat, 18) : top
  const armL = limb(0.12, 0.42, seg, sleeve, sphere(0.15, seg, skin))
  const armR = limb(0.12, 0.42, seg, sleeve, sphere(0.15, seg, skin))
  at(armL, -0.46, 1.5, 0)
  at(armR, 0.46, 1.5, 0)
  armL.rotation.z = -0.12
  armR.rotation.z = 0.12
  body.add(armL, armR)

  const head = new THREE.Group()
  at(head, 0, 2.02, 0)
  head.add(sphere(0.46, seg, skin))
  face(head, 0.46, seg, { skin: o.skin, brows: o.brows ?? "friendly", smile: o.smile })
  for (const side of [-1, 1]) {
    const ear = sphere(0.1, 8, skin)
    at(ear, side * 0.45, 0, 0)
    head.add(ear)
  }
  const hairMat = plastic(o.hair, 45)
  if (o.hairStyle === "short") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.49, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.42), hairMat)
    cap.rotation.x = -0.25
    head.add(cap)
  } else if (o.hairStyle === "bun") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat)
    cap.rotation.x = -0.4
    head.add(cap)
    head.add(at(sphere(0.2, seg, hairMat), 0, 0.42, -0.26))
  } else if (o.hairStyle === "slick") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.4), hairMat)
    cap.rotation.x = -0.15
    head.add(cap)
    const quiff = sphere(0.22, seg, hairMat)
    quiff.scale.set(1.6, 0.6, 1)
    head.add(at(quiff, 0.05, 0.42, 0.22))
  } else {
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, seg, seg, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * 0.62),
      new THREE.MeshPhongMaterial({ color: o.hair, shininess: 10, side: THREE.DoubleSide }),
    )
    hood.rotation.x = -0.15
    at(hood, 0, 0.02, -0.1)
    head.add(hood)
  }
  body.add(head)

  return { root, body, legL, legR, armL, armR, head }
}

export function makeDoctor(seg: number): Rig {
  const rig = makePerson(seg, {
    skin: "#7a4a2c",
    hair: "#17110d",
    hairStyle: "short",
    top: "#3aa39a",
    bottom: "#2f8a82",
    shoes: "#f4f4f4",
    coat: "#f7f7f4",
    smile: true,
  })
  const steth = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, seg * 2, Math.PI * 1.2), plastic("#2d2d33", 80))
  steth.rotation.set(Math.PI / 2 + 0.5, 0, Math.PI * 1.4)
  at(steth, 0, 1.52, 0.12)
  rig.body.add(steth)
  const disc = cyl(0.07, 0.07, 0.03, seg, plastic("#c8ccd4", 120))
  disc.rotation.x = Math.PI / 2
  at(disc, 0.12, 1.16, 0.36)
  rig.body.add(disc)
  const bottle = new THREE.Group()
  bottle.add(cyl(0.1, 0.1, 0.24, seg, plastic("#f08a1c", 70)))
  bottle.add(at(cyl(0.11, 0.11, 0.07, seg, plastic("#ffffff")), 0, 0.15, 0))
  bottle.position.set(0, -0.62, 0.12)
  rig.armR?.add(bottle)
  if (rig.armR) rig.armR.rotation.x = -0.6
  rig.prop = bottle
  return rig
}

export function makeVest(seg: number): Rig {
  const rig = makePerson(seg, {
    skin: "#f3cfae",
    hair: "#c89a4c",
    hairStyle: "slick",
    top: "#8fb8e8",
    bottom: "#c9ad7c",
    shoes: "#f8f8f8",
    brows: "friendly",
    smile: true,
  })
  const vest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.41, 0.74, seg, 1, true, Math.PI * 0.1, Math.PI * 1.8),
    new THREE.MeshPhongMaterial({ color: "#1f2f55", shininess: 70, side: THREE.DoubleSide }),
  )
  at(vest, 0, 1.24, 0)
  rig.body.add(vest)
  for (let i = 0; i < 3; i += 1) {
    const ridge = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.028, 6, seg * 2, Math.PI * 1.8),
      plastic("#2a3d6c", 80),
    )
    ridge.rotation.x = Math.PI / 2
    ridge.rotation.z = Math.PI * 0.6
    at(ridge, 0, 1.02 + i * 0.22, 0)
    rig.body.add(ridge)
  }
  if (rig.head) {
    for (const side of [-1, 1]) {
      const pod = capsule(0.04, 0.08, 8, plastic("#ffffff", 100))
      at(pod, side * 0.5, -0.06, 0.04)
      rig.head.add(pod)
    }
  }
  const tablet = box(0.44, 0.32, 0.03, plastic("#1a1a1f", 90))
  const glow = box(0.38, 0.26, 0.01, new THREE.MeshBasicMaterial({ color: "#9ee7ff" }))
  glow.position.z = 0.02
  const t = new THREE.Group()
  t.add(tablet, glow)
  t.position.set(0, -0.6, 0.2)
  t.rotation.x = -1.1
  rig.armR?.add(t)
  if (rig.armR) rig.armR.rotation.x = -1.0
  rig.prop = t
  return rig
}

/** The Guide is a consultant: navy blazer over a shirt and tie, slick hair, thin glasses, one-slide deck in hand. */
export function makeGuide(seg: number): Rig {
  const rig = makePerson(seg, {
    skin: "#e8b88f",
    hair: "#5a3a22",
    hairStyle: "slick",
    top: "#dce9f5",
    bottom: "#3c4453",
    shoes: "#4a2e1a",
    coat: "#26364f",
    brows: "friendly",
    smile: true,
  })
  const tieMat = plastic("#b3392f", 60)
  const knot = box(0.11, 0.09, 0.04, tieMat)
  at(knot, 0, 1.5, 0.34)
  rig.body.add(knot)
  const tie = box(0.09, 0.42, 0.03, tieMat)
  at(tie, 0, 1.26, 0.36)
  tie.rotation.x = 0.1
  rig.body.add(tie)
  if (rig.head) {
    for (const side of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 12), plastic("#22262e", 90))
      at(lens, side * 0.17, 0.06, 0.44)
      rig.head.add(lens)
    }
    const bridge = box(0.14, 0.02, 0.02, plastic("#22262e", 90))
    at(bridge, 0, 0.08, 0.45)
    rig.head.add(bridge)
  }
  // The one-slide pitch deck: a tablet with the slide up.
  const deck = new THREE.Group()
  deck.add(box(0.4, 0.3, 0.03, plastic("#1a1a1f", 90)))
  const slide = box(0.34, 0.24, 0.01, new THREE.MeshBasicMaterial({ color: "#f7f4ec" }))
  slide.position.z = 0.02
  deck.add(slide)
  deck.position.set(0, -0.6, 0.2)
  deck.rotation.x = -1.0
  rig.armR?.add(deck)
  if (rig.armR) rig.armR.rotation.x = -0.9
  rig.prop = deck
  return rig
}

export function makePhoneProjectile(): THREE.Group {
  const g = new THREE.Group()
  g.add(box(0.3, 0.5, 0.08, plastic("#18181c", 120)))
  const screen = box(0.24, 0.4, 0.01, new THREE.MeshBasicMaterial({ color: "#7dffa0" }))
  screen.position.z = 0.05
  g.add(screen)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.04, 6, 20),
    new THREE.MeshBasicMaterial({ color: "#ffe066", transparent: true, opacity: 0.8 }),
  )
  ring.name = "ring"
  g.add(ring)
  return g
}

/** One fry, individually wrapped in a FlyFry sleeve. */
export function makeFry(): THREE.Group {
  const g = new THREE.Group()
  const sleeve = box(0.34, 0.42, 0.14, plastic("#e2372e", 40))
  g.add(sleeve)
  const band = box(0.35, 0.08, 0.15, plastic("#ffffff", 40))
  band.position.y = 0.05
  g.add(band)
  const fries = plastic("#ffcf3f", 30)
  ;[-0.09, 0, 0.09].forEach((x, i) => {
    const fry = box(0.07, 0.36, 0.07, fries)
    fry.position.set(x, 0.3 + (i === 1 ? 0.06 : 0), 0)
    fry.rotation.z = (i - 1) * 0.12
    g.add(fry)
  })
  g.name = "fry"
  return g
}

export function makePigeon(seg: number): THREE.Group {
  const g = new THREE.Group()
  const grey = plastic("#8e96a6", 20)
  const body = sphere(0.34, seg, grey)
  body.scale.set(1.3, 0.9, 0.9)
  g.add(body)
  const neck = sphere(0.2, seg, plastic("#5b8f7a", 60))
  neck.position.set(0.3, 0.16, 0)
  g.add(neck)
  const head = sphere(0.18, seg, grey)
  head.position.set(0.44, 0.3, 0)
  g.add(head)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), plastic("#f0b04a", 30))
  beak.rotation.z = -Math.PI / 2
  beak.position.set(0.62, 0.28, 0)
  g.add(beak)
  for (const z of [-0.1, 0.1]) g.add(at(sphere(0.035, 6, plastic("#ff7a2a", 80)), 0.52, 0.34, z))
  for (const side of [-1, 1]) {
    const wing = box(0.5, 0.05, 0.42, plastic("#6f7786", 20))
    wing.geometry.translate(0, 0, side * 0.21)
    wing.position.set(-0.02, 0.12, side * 0.22)
    wing.name = side < 0 ? "wingL" : "wingR"
    g.add(wing)
  }
  const tail = box(0.28, 0.05, 0.22, plastic("#5f6776", 20))
  tail.position.set(-0.46, 0.04, 0)
  g.add(tail)
  const fry = makeFry()
  fry.scale.setScalar(0.7)
  fry.position.set(0.1, -0.42, 0)
  g.add(fry)
  return g
}

export function makeStarfighter(seg: number): THREE.Group {
  const g = new THREE.Group()
  const hull = plastic("#c8ccd6", 90)
  const red = plastic("#d8352a", 60)
  const body = capsule(0.6, 2.4, seg, hull)
  body.rotation.z = Math.PI / 2
  body.position.y = 0.7
  g.add(body)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, seg), red)
  nose.rotation.z = -Math.PI / 2
  nose.position.set(2.1, 0.7, 0)
  g.add(nose)
  const canopy = sphere(0.45, seg, plastic("#7fd3ff", 140))
  canopy.scale.set(1.4, 0.8, 0.9)
  canopy.position.set(0.7, 1.15, 0)
  g.add(canopy)
  for (const side of [-1, 1]) {
    const wing = box(1.4, 0.12, 1.5, red)
    wing.position.set(-0.3, 0.55, side * 0.95)
    wing.rotation.x = side * 0.25
    g.add(wing)
  }
  const fin = box(0.9, 0.9, 0.1, red)
  fin.position.set(-1.4, 1.35, 0)
  g.add(fin)
  const smoke = new THREE.Group()
  smoke.name = "smoke"
  for (let i = 0; i < 6; i += 1) {
    const puff = sphere(0.3 + i * 0.06, 8, new THREE.MeshLambertMaterial({ color: "#5c5c66", transparent: true, opacity: 0.6 }))
    puff.position.set(-1.8, 1 + i * 0.5, 0)
    smoke.add(puff)
  }
  g.add(smoke)
  return g
}

/** A Slack-style message bubble that always faces the camera. */
export function makePing(from = "You"): THREE.Sprite {
  const c = document.createElement("canvas")
  c.width = 256
  c.height = 112
  const ctx = c.getContext("2d")
  if (ctx) {
    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = "#1d1c1d"
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.roundRect(6, 6, 244, 100, 18)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "#4a154b"
    ctx.beginPath()
    ctx.roundRect(20, 20, 44, 44, 10)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(from.slice(0, 1).toUpperCase(), 42, 43)
    ctx.textAlign = "left"
    ctx.fillStyle = "#1d1c1d"
    ctx.font = "bold 20px sans-serif"
    ctx.fillText(from, 76, 30)
    ctx.fillStyle = "#1264a3"
    ctx.font = "bold 22px sans-serif"
    ctx.fillText("@Nate", 76, 60)
    ctx.fillStyle = "#616061"
    ctx.font = "18px sans-serif"
    ctx.fillText("quick call? re: my company", 76, 88)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }))
  sprite.scale.set(2.6, 1.14, 1)
  sprite.name = "ping"
  return sprite
}

export function makeEngineer(seg: number): Rig {
  const rig = makePerson(seg, {
    skin: "#f0c9a0",
    hair: "#4a4f5a",
    hairStyle: "hood",
    top: "#4a4f5a",
    bottom: "#2c3140",
    shoes: "#e8e8e8",
    brows: "determined",
  })
  if (rig.head) {
    for (const side of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 12), plastic("#111", 90))
      at(lens, side * 0.17, 0.08, 0.44)
      rig.head.add(lens)
    }
  }
  const laptop = new THREE.Group()
  laptop.add(box(0.5, 0.03, 0.34, plastic("#b8bcc6", 120)))
  const lid = box(0.5, 0.34, 0.02, plastic("#b8bcc6", 120))
  lid.position.set(0, 0.17, -0.17)
  laptop.add(lid)
  const glow = box(0.44, 0.28, 0.01, new THREE.MeshBasicMaterial({ color: "#7dffa0" }))
  glow.position.set(0, 0.17, -0.155)
  laptop.add(glow)
  laptop.position.set(0, -0.6, 0.3)
  laptop.rotation.x = 0.9
  rig.armR?.add(laptop)
  if (rig.armR) rig.armR.rotation.x = -1.0
  rig.prop = laptop
  return rig
}

export function makeGerald(seg: number): Rig {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  root.add(blobShadow(0.5))
  const bird = makePigeon(seg)
  bird.scale.setScalar(1.7)
  bird.position.y = 0.75
  bird.rotation.y = -Math.PI / 2
  body.add(bird)
  const crown = new THREE.Group()
  const gold = plastic("#ffd23b", 140)
  crown.add(cyl(0.16, 0.16, 0.1, 10, gold))
  for (let i = 0; i < 5; i += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), gold)
    const a = (i / 5) * Math.PI * 2
    spike.position.set(Math.cos(a) * 0.13, 0.1, Math.sin(a) * 0.13)
    crown.add(spike)
  }
  crown.position.set(0, 1.4, 0.75)
  body.add(crown)
  return { root, body, head: crown }
}


function badgeTexture(name: string): THREE.CanvasTexture {
  const c = document.createElement("canvas")
  c.width = 128
  c.height = 72
  const ctx = c.getContext("2d")
  if (ctx) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 128, 72)
    ctx.fillStyle = "#d8352a"
    ctx.fillRect(0, 0, 128, 24)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("HELLO MY NAME IS", 64, 12)
    ctx.fillStyle = "#1a1a1f"
    let size = 30
    ctx.font = `bold ${size}px sans-serif`
    while (size > 10 && ctx.measureText(name).width > 116) {
      size -= 1
      ctx.font = `bold ${size}px sans-serif`
    }
    ctx.fillText(name, 64, 48)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * The player: a visitor in town with a bomber jacket, a backpack, a lanyard with
 * a "hello my name is" badge, and a phone to ping with. Not a superhero. Just
 * someone with a company and a problem.
 */
export function makeHero(seg: number, name = "YOU"): Rig {
  const rig = makePerson(seg, {
    skin: "#d9a579",
    hair: "#3b2a1e",
    hairStyle: "short",
    top: "#2fa58a",
    bottom: "#2c3140",
    shoes: "#f2f2ee",
    coat: "#e0792b",
    brows: "determined",
    smile: true,
  })
  const cord = plastic("#1f2f55", 30)
  for (const side of [-1, 1]) {
    const strap = box(0.03, 0.46, 0.03, cord)
    at(strap, side * 0.11, 1.44, 0.38)
    strap.rotation.z = side * 0.2
    rig.body.add(strap)
  }
  const white = plastic("#ffffff", 40)
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.03), [
    white,
    white,
    white,
    white,
    new THREE.MeshBasicMaterial({ map: badgeTexture(name) }),
    white,
  ])
  at(badge, 0, 1.18, 0.4)
  badge.name = "badge"
  rig.body.add(badge)
  const pack = box(0.5, 0.56, 0.24, plastic("#3b4252", 20))
  at(pack, 0, 1.22, -0.42)
  rig.body.add(pack)
  const phone = new THREE.Group()
  phone.add(box(0.14, 0.26, 0.04, plastic("#18181c", 90)))
  const screen = box(0.11, 0.2, 0.01, new THREE.MeshBasicMaterial({ color: "#7dffa0" }))
  screen.position.z = 0.025
  phone.add(screen)
  phone.position.set(0, -0.6, 0.14)
  phone.rotation.x = -0.4
  rig.armR?.add(phone)
  rig.prop = phone
  return rig
}

/** Reprints the hero's badge once the player has typed a name. */
export function setHeroName(rig: Rig, name: string) {
  const badge = rig.root.getObjectByName("badge") as THREE.Mesh | undefined
  if (!badge || !Array.isArray(badge.material)) return
  const front = badge.material[4] as THREE.MeshBasicMaterial | undefined
  if (!front) return
  front.map?.dispose()
  front.map = badgeTexture(name)
  front.needsUpdate = true
}

/** Ranger Deb: campaign hat, khaki shirt, a star, and one fry in an evidence bag. */
export function makeRanger(seg: number): Rig {
  const rig = makePerson(seg, {
    skin: "#c98a66",
    hair: "#2a1a12",
    hairStyle: "short",
    top: "#c9b27c",
    bottom: "#5a6b3a",
    shoes: "#4a2e1a",
    brows: "friendly",
    smile: false,
  })
  if (rig.head) {
    const hatMat = plastic("#6b4a2b", 20)
    const brim = cyl(0.74, 0.74, 0.05, seg, hatMat)
    at(brim, 0, 0.3, 0)
    rig.head.add(brim)
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.42, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.5), hatMat)
    at(crown, 0, 0.3, 0)
    rig.head.add(crown)
    const band = cyl(0.43, 0.43, 0.07, seg, plastic("#2a1a12", 20))
    at(band, 0, 0.35, 0)
    rig.head.add(band)
  }
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.09, 5), plastic("#ffd23b", 120))
  at(star, -0.18, 1.42, 0.35)
  rig.body.add(star)
  const bag = new THREE.Group()
  const sack = box(0.28, 0.36, 0.1, new THREE.MeshPhongMaterial({ color: "#e8f2ff", transparent: true, opacity: 0.45, shininess: 90 }))
  bag.add(sack)
  const seal = box(0.29, 0.05, 0.11, plastic("#d8352a", 40))
  seal.position.y = 0.17
  bag.add(seal)
  const fry = makeFry()
  fry.scale.setScalar(0.5)
  fry.position.y = -0.1
  bag.add(fry)
  bag.position.set(0, -0.62, 0.12)
  rig.armR?.add(bag)
  if (rig.armR) rig.armR.rotation.x = -0.8
  rig.prop = bag
  return rig
}

/**
 * A wild turkey, running toward -x. Parts are named so the fight can animate
 * them: legL, legR, wingL, wingR, head, tail, and the fry a fed one eats.
 */
export function makeTurkey(seg: number): THREE.Group {
  const t = new THREE.Group()
  t.add(blobShadow(1.0))
  const dark = plastic("#4a3320", 18)
  const bronze = plastic("#6e4a2a", 40)
  const tip = plastic("#d9b27a", 20)
  const body = sphere(0.62, seg, dark)
  body.scale.set(1.25, 1, 0.95)
  body.position.y = 0.95
  t.add(body)
  const breast = sphere(0.42, seg, bronze)
  breast.scale.set(1, 0.9, 0.9)
  breast.position.set(-0.45, 0.8, 0)
  t.add(breast)

  // The fan is turned to face the side camera, so it reads as a fan instead of a stick.
  const tail = new THREE.Group()
  for (let i = -3; i <= 3; i += 1) {
    const feather = new THREE.Group()
    const quill = box(0.22, 1.0, 0.05, dark)
    quill.position.y = 0.5
    feather.add(quill)
    const end = box(0.23, 0.16, 0.055, tip)
    end.position.y = 0.95
    feather.add(end)
    feather.rotation.z = i * 0.3
    feather.position.z = i * 0.012
    tail.add(feather)
  }
  tail.position.set(0.5, 0.9, 0)
  tail.rotation.z = -0.55
  tail.name = "tail"
  t.add(tail)

  for (const side of [-1, 1]) {
    const wing = box(0.8, 0.08, 0.5, bronze)
    wing.geometry.translate(0, 0, side * 0.25)
    wing.position.set(0, 1.05, side * 0.5)
    wing.name = side < 0 ? "wingL" : "wingR"
    t.add(wing)
  }

  const head = new THREE.Group()
  const red = plastic("#c04a5a", 30)
  const neck = capsule(0.09, 0.45, seg, red)
  neck.rotation.z = 0.5
  neck.position.set(-0.14, 0.26, 0)
  head.add(neck)
  const skull = sphere(0.17, seg, plastic("#7f8fc9", 30))
  skull.position.set(-0.32, 0.5, 0)
  head.add(skull)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), plastic("#f0b04a", 30))
  beak.rotation.z = Math.PI / 2
  beak.position.set(-0.52, 0.48, 0)
  head.add(beak)
  const wattle = sphere(0.07, 8, red)
  wattle.scale.set(0.8, 1.4, 0.8)
  wattle.position.set(-0.4, 0.34, 0)
  head.add(wattle)
  const snood = capsule(0.025, 0.12, 6, red)
  snood.position.set(-0.5, 0.42, 0)
  head.add(snood)
  for (const z of [-0.1, 0.1]) head.add(at(sphere(0.035, 6, plastic("#111", 120)), -0.42, 0.55, z))
  head.position.set(-0.6, 1.2, 0)
  head.name = "head"
  t.add(head)

  const legMat = plastic("#d98a4a", 20)
  const foot = () => {
    const f = box(0.26, 0.04, 0.16, legMat)
    f.position.x = -0.06
    return f
  }
  const legL = limb(0.05, 0.42, seg, legMat, foot())
  const legR = limb(0.05, 0.42, seg, legMat, foot())
  at(legL, -0.15, 0.52, -0.2)
  at(legR, -0.15, 0.52, 0.2)
  legL.name = "legL"
  legR.name = "legR"
  t.add(legL, legR)

  const treat = makeFry()
  treat.scale.setScalar(0.6)
  treat.position.set(-1.25, 1.1, 0)
  treat.rotation.z = 0.3
  treat.name = "treat"
  treat.visible = false
  t.add(treat)

  t.scale.setScalar(1.1)
  return t
}

export function makeCharacter(id: CharacterId, seg: number, opts: CharacterOpts = {}): Rig {
  switch (id) {
    case "you":
      return makeHero(seg, opts.name)
    case "nate":
      return makeNate(seg)
    case "doctor":
      return makeDoctor(seg)
    case "vest":
      return makeVest(seg)
    case "guide":
      return makeGuide(seg)
    case "engineer":
      return makeEngineer(seg)
    case "ranger":
      return makeRanger(seg)
    case "gerald":
      return makeGerald(seg)
  }
}

/** Walk cycle when moving, a Smash-style idle bounce when still. */
export function animateRig(rig: Rig, t: number, speed: number) {
  const moving = speed > 0.05
  const phase = t * (moving ? 11 : 3)
  const swing = moving ? Math.sin(phase) * 0.8 * Math.min(1, speed) : 0
  if (rig.legL) rig.legL.rotation.x = swing
  if (rig.legR) rig.legR.rotation.x = -swing
  const armBase = (arm: THREE.Object3D | undefined, sign: number) => {
    if (!arm) return
    const rest = (arm.userData.restX as number | undefined) ?? arm.rotation.x
    arm.userData.restX = rest
    arm.rotation.x = rest + (moving ? sign * swing * 0.8 : Math.sin(phase) * 0.05)
  }
  armBase(rig.armL, -1)
  armBase(rig.armR, 1)
  rig.body.position.y = moving ? Math.abs(Math.sin(phase)) * 0.08 : Math.sin(phase) * 0.03
  if (rig.head) rig.head.rotation.z = moving ? 0 : Math.sin(phase * 0.5) * 0.04
  if (rig.flames) {
    for (const flame of rig.flames) {
      const flicker = 0.75 + Math.sin(t * 40 + flame.id) * 0.25
      flame.scale.set(1, flicker, 1)
    }
  }
  // Positive x-rotation swings the cape's hem backward, away from the body.
  if (rig.cape) rig.cape.rotation.x = moving ? 0.42 + Math.sin(phase) * 0.08 : 0.08
}

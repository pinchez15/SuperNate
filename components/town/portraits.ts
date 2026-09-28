import * as THREE from "three"
import { animateRig, makeCharacter, type CharacterId } from "@/components/town/models"
import { disposeObject } from "@/components/town/n64-renderer"

const framing: Record<CharacterId, { y: number; dist: number; turn: number }> = {
  nate: { y: 2.1, dist: 2.9, turn: 0.35 },
  doctor: { y: 1.9, dist: 3.0, turn: 0.35 },
  vest: { y: 1.9, dist: 3.0, turn: 0.35 },
  guide: { y: 1.9, dist: 3.0, turn: -0.3 },
  hedgehawkins: { y: 1.9, dist: 5.2, turn: 0.3 },
  barber: { y: 1.9, dist: 3.0, turn: 0.3 },
  engineer: { y: 1.9, dist: 3.0, turn: -0.3 },
  sommelier: { y: 1.95, dist: 3.1, turn: 0.3 },
  gerald: { y: 1.1, dist: 3.2, turn: 0.5 },
}

/**
 * Renders each character as a close-up bust with a hot rim light, like the
 * pre-rendered portraits on the Smash 64 character select screen.
 */
export function renderPortraits(ids: CharacterId[], seg: number, size = 256): Record<CharacterId, string> {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(size, size, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)

  const out = {} as Record<CharacterId, string>
  for (const id of ids) {
    const scene = new THREE.Scene()
    scene.add(new THREE.HemisphereLight("#fff4e6", "#5a1a14", 1.2))
    const key = new THREE.DirectionalLight("#ffffff", 2.2)
    key.position.set(2, 3, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight("#ffd27a", 2.6)
    rim.position.set(-3, 2, -3)
    scene.add(rim)
    const rig = makeCharacter(id, Math.max(seg, 16))
    animateRig(rig, 0.4, 0)
    const f = framing[id]
    rig.root.rotation.y = f.turn
    scene.add(rig.root)
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    cam.position.set(0, f.y + 0.1, f.dist)
    cam.lookAt(0, f.y - 0.05, 0)
    renderer.render(scene, cam)
    out[id] = canvas.toDataURL("image/png")
    disposeObject(scene)
  }
  renderer.dispose()
  renderer.forceContextLoss()
  return out
}

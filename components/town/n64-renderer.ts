import * as THREE from "three"
import type { Look } from "@/components/town/look"

export const BASE_W = 960
export const BASE_H = 720

const ditherVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

/** 4x4 Bayer dither down to 5 bits per channel, like the N64 16-bit framebuffer. */
const ditherFrag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float dither;
varying vec2 vUv;

float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16];
  m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
  m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
  m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  for (int k = 0; k < 16; k++) { if (k == i) return m[k] / 16.0; }
  return 0.0;
}

vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec3 c = toSRGB(texture2D(tDiffuse, vUv).rgb);
  if (dither > 0.5) {
    float levels = 31.0;
    float d = bayer(gl_FragCoord.xy) - 0.5;
    c = floor(c * levels + 0.5 + d) / levels;
  }
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`

/**
 * Renders at a fixed 4:3 internal resolution into a multisampled target, then the
 * canvas is scaled by CSS. At full scale with MSAA and shadows on it reads like a
 * mid-2000s PC game; drop the scale and switch the dither on for the retro look.
 */
export class N64Renderer {
  readonly renderer: THREE.WebGLRenderer
  private target: THREE.WebGLRenderTarget
  private quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private quadScene = new THREE.Scene()
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private look: Look
  width = BASE_W
  height = BASE_H

  constructor(canvas: HTMLCanvasElement, look: Look) {
    this.look = look
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" })
    this.renderer.setPixelRatio(1)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.target = new THREE.WebGLRenderTarget(BASE_W, BASE_H, { depthBuffer: true, samples: 4 })
    this.quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: ditherVert,
        fragmentShader: ditherFrag,
        uniforms: {
          tDiffuse: { value: this.target.texture },
          resolution: { value: new THREE.Vector2(BASE_W, BASE_H) },
          dither: { value: 1 },
        },
        depthTest: false,
        depthWrite: false,
      }),
    )
    this.quadScene.add(this.quad)
    this.setLook(look)
  }

  setLook(look: Look) {
    this.look = look
    this.width = Math.round(BASE_W * look.renderScale)
    this.height = Math.round(BASE_H * look.renderScale)
    this.renderer.setSize(this.width, this.height, false)
    this.target.setSize(this.width, this.height)
    this.quad.material.uniforms.resolution.value.set(this.width, this.height)
    this.quad.material.uniforms.dither.value = look.dither ? 1 : 0
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.setRenderTarget(this.target)
    this.renderer.render(scene, camera)
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.quadScene, this.quadCam)
  }

  dispose() {
    this.target.dispose()
    this.quad.geometry.dispose()
    this.quad.material.dispose()
    this.renderer.dispose()
  }
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (!mat) return
    const list = Array.isArray(mat) ? mat : [mat]
    for (const m of list) {
      const withMap = m as THREE.Material & { map?: THREE.Texture | null }
      withMap.map?.dispose()
      m.dispose()
    }
  })
}

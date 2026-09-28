"use client"

import * as THREE from "three"
import { defaultLook, disposeTextures, makeTextures, type Look } from "@/components/town/look"
import { animateRig, makeCharacter, makeDogUber, type CharacterId, type Rig } from "@/components/town/models"
import { BASE_H, BASE_W, disposeObject, N64Renderer } from "@/components/town/n64-renderer"
import { renderPortraits } from "@/components/town/portraits"
import { ARENA_Z, applyShadows, arena, buildArena, buildTown, makeScene, setArea } from "@/components/town/stage"
import { gate, npcSpots } from "@/lib/town/world"
import { useEffect, useRef, useState } from "react"

type View = "behind" | "side" | "arena"

const roster: { id: CharacterId; name: string; role: string }[] = [
  { id: "nate", name: "SUPERNATE", role: "Builder" },
  { id: "doctor", name: "DOCTOR", role: "Karibu Health" },
  { id: "barber", name: "BARBER", role: "Chief of Staff" },
  { id: "vest", name: "TECH BRO", role: "Healthcare AIO" },
  { id: "guide", name: "GUIDE", role: "CappaWork" },
  { id: "hedgehawkins", name: "HEDGEHAWKINS", role: "Boss" },
]

export function Lookbook() {
  const [look, setLook] = useState<Look>(defaultLook)
  const [view, setView] = useState<View>("behind")
  const [walking, setWalking] = useState(true)
  const [tab, setTab] = useState<"stage" | "select">("stage")
  const [portraits, setPortraits] = useState<Partial<Record<CharacterId, string>>>({})
  const [pick, setPick] = useState<CharacterId>("nate")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef<View>(view)
  const walkRef = useRef(walking)
  viewRef.current = view
  walkRef.current = walking

  useEffect(() => {
    setPortraits(renderPortraits(roster.map((r) => r.id), look.segments))
  }, [look.segments])

  useEffect(() => {
    if (tab !== "stage") return
    const canvas = canvasRef.current
    if (!canvas) return
    const n64 = new N64Renderer(canvas, look)
    const tex = makeTextures(look)
    const scene = makeScene(tex, look)
    const town = buildTown(tex)
    scene.add(town.group)
    const stage = buildArena(tex)
    scene.add(stage.group)

    const nate = makeCharacter("nate", look.segments)
    nate.root.position.set(0, 0, 3.5)
    scene.add(nate.root)

    const cast: Rig[] = []
    for (const id of ["doctor", "vest", "guide"] as const) {
      const rig = makeCharacter(id, look.segments)
      const spot = npcSpots[id]
      rig.root.position.set(spot.x, 0, spot.z)
      rig.root.rotation.y = spot.facing
      scene.add(rig.root)
      cast.push(rig)
    }
    const perched = makeCharacter("hedgehawkins", look.segments)
    perched.root.position.set(gate.x, 5.6, gate.z - 0.3)
    perched.root.scale.setScalar(0.7)
    scene.add(perched.root)

    const arenaNate = makeCharacter("nate", look.segments)
    arenaNate.root.position.set(-6, 0, ARENA_Z + 0.6)
    arenaNate.root.rotation.y = Math.PI / 2
    scene.add(arenaNate.root)
    const boss = makeCharacter("hedgehawkins", look.segments)
    boss.root.position.set(arena.bossX, 1.8, ARENA_Z - 0.6)
    boss.root.rotation.y = -Math.PI / 2 + 0.4
    boss.root.scale.setScalar(1.35)
    scene.add(boss.root)
    const uber = makeDogUber(look.segments)
    uber.position.set(1.5, 0, ARENA_Z + 0.6)
    scene.add(uber)
    applyShadows(scene)

    const camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 400)
    let raf = 0
    const start = performance.now()
    const loop = () => {
      const t = (performance.now() - start) / 1000
      const v = viewRef.current
      const speed = walkRef.current ? 1 : 0
      setArea(scene, tex, v === "arena" ? "arena" : "town")
      if (v === "side") nate.root.rotation.y = Math.PI / 2
      else nate.root.rotation.y = Math.PI
      animateRig(nate, t, speed)
      for (const rig of cast) animateRig(rig, t + rig.root.position.x, 0)
      animateRig(perched, t, 0)
      animateRig(arenaNate, t, speed)
      animateRig(boss, t, 0)
      uber.position.x = 3 - ((t * 4) % 12)
      uber.traverse((o) => {
        if (o.name === "wheel") o.rotation.y = t * 10
        if (o.name === "dog") o.rotation.z = Math.sin(t * 8) * 0.1
      })

      const p = nate.root.position
      if (v === "behind") {
        camera.fov = 45
        camera.position.set(p.x, 5, p.z + 8.6)
        camera.lookAt(p.x, 1.4, p.z - 3)
      } else if (v === "side") {
        camera.fov = 38
        camera.position.set(p.x - 1, 2.6, p.z + 10)
        camera.lookAt(p.x - 1, 2.1, p.z)
      } else {
        camera.fov = 40
        camera.position.set(-1.2, 3.6, ARENA_Z + 21)
        camera.lookAt(-1.2, 2.7, ARENA_Z)
      }
      camera.updateProjectionMatrix()
      n64.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      disposeObject(scene)
      disposeTextures(tex)
      n64.dispose()
    }
  }, [look, tab])

  const set = <K extends keyof Look>(key: K, value: Look[K]) => setLook((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="min-h-screen bg-[#141018] text-white">
      <header className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 pt-5">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-[#ffb13b]">LOOKBOOK</p>
          <h1 className="smash-type text-3xl sm:text-4xl">SUPERNATE 64</h1>
        </div>
        <div className="flex gap-2">
          {(["stage", "select"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`smash-type rounded-md px-3 py-1.5 text-sm ${tab === t ? "bg-[#d8352a]" : "bg-[#2a2230]"}`}
            >
              {t === "stage" ? "STAGE" : "CHARACTER SELECT"}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[1fr_260px]">
        {tab === "stage" ? (
          <div>
            <div className="overflow-hidden rounded-md border-4 border-[#2a2230] bg-black">
              <canvas ref={canvasRef} className="n64-canvas block aspect-[4/3] w-full" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["behind", "Town: behind camera"],
                  ["side", "Town: Smash side view"],
                  ["arena", "Boss stage"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded px-3 py-1.5 font-mono text-xs ${view === v ? "bg-[#ffb13b] text-black" : "bg-[#2a2230]"}`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWalking((w) => !w)}
                className="rounded bg-[#2a2230] px-3 py-1.5 font-mono text-xs"
              >
                {walking ? "Idle" : "Walk"}
              </button>
            </div>
          </div>
        ) : (
          <SelectScreen portraits={portraits} pick={pick} onPick={setPick} />
        )}

        <aside className="rounded-md bg-[#1f1924] p-4 font-mono text-xs">
          <p className="mb-3 tracking-[0.2em] text-[#ffb13b]">TUNING</p>
          <Row label={`Texture ${look.texSize}px`}>
            <select
              value={look.texSize}
              onChange={(e) => set("texSize", Number(e.target.value) as Look["texSize"])}
              className="w-full rounded bg-[#2a2230] px-2 py-1"
            >
              {[32, 64, 128, 256].map((n) => (
                <option key={n} value={n}>
                  {n}px
                </option>
              ))}
            </select>
          </Row>
          <Row label="Texture blur (N64 bilinear)">
            <input type="checkbox" checked={look.blur} onChange={(e) => set("blur", e.target.checked)} />
          </Row>
          <Row label={`Roundness: ${look.segments} segments`}>
            <input
              type="range"
              min={6}
              max={24}
              value={look.segments}
              onChange={(e) => set("segments", Number(e.target.value))}
              className="w-full"
            />
          </Row>
          <Row label={`Fog ${Math.round(look.fog * 100)}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(look.fog * 100)}
              onChange={(e) => set("fog", Number(e.target.value) / 100)}
              className="w-full"
            />
          </Row>
          <Row label="16-bit dither">
            <input type="checkbox" checked={look.dither} onChange={(e) => set("dither", e.target.checked)} />
          </Row>
          <Row label={`Render ${Math.round(BASE_W * look.renderScale)}x${Math.round(BASE_H * look.renderScale)}`}>
            <input
              type="range"
              min={40}
              max={100}
              value={Math.round(look.renderScale * 100)}
              onChange={(e) => set("renderScale", Number(e.target.value) / 100)}
              className="w-full"
            />
          </Row>
          <button
            type="button"
            onClick={() => setLook(defaultLook)}
            className="mt-2 w-full rounded bg-[#2a2230] py-1.5"
          >
            Reset
          </button>
          <pre className="mt-3 whitespace-pre-wrap break-all text-[10px] text-white/50">{JSON.stringify(look)}</pre>
        </aside>
      </main>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-white/70">{label}</span>
      {children}
    </label>
  )
}

export function SelectScreen({
  portraits,
  pick,
  onPick,
}: {
  portraits: Partial<Record<CharacterId, string>>
  pick: CharacterId
  onPick: (id: CharacterId) => void
}) {
  const picked = roster.find((r) => r.id === pick) ?? roster[0]
  return (
    <div className="smash-backdrop overflow-hidden rounded-md border-4 border-[#2a0c08]">
      <p className="smash-type px-4 pt-3 text-2xl sm:text-3xl">CHOOSE YOUR CHARACTER</p>
      <div className="grid grid-cols-3 gap-1.5 p-4 sm:grid-cols-6">
        {roster.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className={`relative aspect-square overflow-hidden border-4 ${
              pick === r.id ? "border-[#ffe066]" : "border-[#2a0c08]"
            } bg-gradient-to-b from-[#c23a22] to-[#6d130d]`}
          >
            {portraits[r.id] && (
              <img src={portraits[r.id]} alt={r.name} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span
              className={`smash-type absolute left-1 top-0.5 ${r.name.length > 9 ? "text-[9px] sm:text-[10px]" : "text-[11px] sm:text-sm"}`}
            >
              {r.name}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 bg-[#1a0907]/60 p-3 sm:grid-cols-4">
        {(
          [
            ["1P", "#d8352a", picked, "HMN"],
            ["2P", "#3553c9", roster[5], "CPU"],
            ["3P", "#d9b21e", null, "N/A"],
            ["4P", "#3c9a3a", null, "N/A"],
          ] as const
        ).map(([slot, color, who, badge]) => (
          <div
            key={slot}
            className="relative h-36 overflow-hidden rounded-t-2xl border-4 border-[#1a0f08]"
            style={{ background: `linear-gradient(180deg, ${color} 0%, #1a0f08 140%)` }}
          >
            <span className="smash-type absolute left-2 top-0 text-5xl opacity-40">{slot}</span>
            <span className="smash-type absolute right-2 top-2 rounded bg-[#ffcc33] px-1.5 text-xs">{badge}</span>
            {who && portraits[who.id] && (
              <img src={portraits[who.id]} alt="" className="absolute bottom-6 left-1/2 h-24 -translate-x-1/2" />
            )}
            {who && (
              <span className="smash-type absolute bottom-1 left-0 right-0 text-center text-sm">{who.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

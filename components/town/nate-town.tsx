"use client"

import { analytics } from "@/lib/analytics"
import { sites, siteList, type Site } from "@/lib/sites"
import {
  allFriesWin,
  bossIntro,
  calendly,
  declines,
  defaultName,
  emoteAlone,
  emoteLines,
  fightLines,
  fill,
  gateLine,
  intro,
  itemOrder,
  items,
  knocks,
  missed,
  moggedLine,
  nameMax,
  npcs,
  townName,
  townPop,
  winLine,
  type ItemId,
} from "@/lib/town/npcs"
import type { BossEvent, BossState } from "@/lib/town/boss"
import { FRY_TOTAL, fryOrder, type NpcId } from "@/lib/town/world"
import { Blips } from "@/components/town/audio"
import { DialogBox, type Script } from "@/components/town/dialog-box"
import { TownGame, type BossHud } from "@/components/town/game"
import { defaultLook } from "@/components/town/look"
import type { CharacterId } from "@/components/town/models"
import { renderPortraits } from "@/components/town/portraits"
import { SiteBrowser } from "@/components/town/site-browser"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Screen = "title" | "name" | "story" | "town" | "dialog" | "site" | "bossIntro" | "boss" | "won" | "direct" | "end"

const npcPortrait: Partial<Record<NpcId, CharacterId>> = {
  guide: "guide",
  doctor: "doctor",
  vest: "vest",
  engineer: "engineer",
  ranger: "ranger",
  gerald: "gerald",
}

const itemFrom: Record<ItemId, NpcId> = { meds: "doctor", call: "vest", agent: "guide" }

const music = {
  town: "/audio/town-theme.mp3",
  boss: "/audio/boss-theme.mp3",
  congrats: "/audio/Congratulations.m4a",
}

export function NateTown({ onEnter1987 }: { onEnter1987: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<TownGame | null>(null)
  const blips = useMemo(() => new Blips(), [])

  const [screen, setScreen] = useState<Screen>("title")
  const [name, setName] = useState(defaultName)
  const [portraits, setPortraits] = useState<Partial<Record<CharacterId, string>>>({})
  const [got, setGot] = useState<ItemId[]>([])
  const [claimed, setClaimed] = useState<NpcId[]>([])
  const [near, setNear] = useState<NpcId | null>(null)
  const [talking, setTalking] = useState<NpcId | null>(null)
  const [script, setScript] = useState<Script | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [siteReturn, setSiteReturn] = useState<Screen>("town")
  const [toast, setToast] = useState<string | null>(null)
  const [hud, setHud] = useState<BossHud>({ patience: 100, batteries: 3, declining: false, phase: 0 })
  const [quip, setQuip] = useState<string | null>(null)
  const [stamp, setStamp] = useState(false)
  const [fries, setFries] = useState(0)
  const [storyPage, setStoryPage] = useState(0)
  const [banner, setBanner] = useState(false)
  const [big, setBig] = useState<string | null>(null)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  const screenRef = useRef(screen)
  screenRef.current = screen
  const nameRef = useRef(name)
  nameRef.current = name
  const quipTimer = useRef(0)
  const toastTimer = useRef(0)
  const quipTurn = useRef(0)
  const talkRef = useRef<(id: NpcId) => void>(() => undefined)
  const gateAnnounced = useRef(false)
  const airAnnounced = useRef(false)
  const poundAnnounced = useRef(false)
  const fedAnnounced = useRef(false)
  const knockCount = useRef(0)
  const friesRef = useRef(0)

  /** Drops the player's name into a line. */
  const L = useCallback((line: string) => fill(line, nameRef.current), [])

  const say = useCallback((line: string, ms = 1500) => {
    setQuip(line)
    window.clearTimeout(quipTimer.current)
    quipTimer.current = window.setTimeout(() => setQuip(null), ms)
  }, [])

  const flash = useCallback((line: string, ms = 3200) => {
    setToast(line)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), ms)
  }, [])

  useEffect(() => {
    setPortraits(renderPortraits(["you", "nate", "doctor", "vest", "guide", "engineer", "ranger", "gerald"], defaultLook.segments, 256, defaultName))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = new TownGame(
      canvas,
      defaultLook,
      {
        onNear: setNear,
        onTalk: (id) => talkRef.current(id),
        onGate: () => setScreen("bossIntro"),
        onBossHud: setHud,
        onBossEvent: (e: BossEvent, s: BossState) => {
          if (e.type === "declined") {
            const line = declines[quipTurn.current % declines.length] ?? "Declined."
            quipTurn.current += 1
            say(L(line))
          } else if (e.type === "landed" && e.patience % 12 === 0) {
            say(missed[Math.floor(e.patience / 12) % missed.length] ?? "Missed call.", 1000)
          } else if (e.type === "phase" && e.phase === 1) {
            say(fightLines.phase1, 1800)
          } else if (e.type === "phase" && e.phase === 2) {
            say(fightLines.phase2, 2000)
          } else if (e.type === "turkeyAir" && !airAnnounced.current) {
            airAnnounced.current = true
            say(fightLines.air, 1800)
          } else if (e.type === "pound" && e.squashed > 0 && !poundAnnounced.current) {
            poundAnnounced.current = true
            say(fightLines.pound, 1500)
          } else if (e.type === "fed" && !fedAnnounced.current) {
            fedAnnounced.current = true
            say(fightLines.fed, 1800)
          } else if (e.type === "respawn") {
            say(fightLines.respawn, 2000)
          } else if (e.type === "won") {
            analytics.capture("boss_patience_depleted", {
              calls_placed: s.placed,
              calls_declined: s.declined,
              hits_taken: s.hitsTaken,
              seconds: Math.round(s.t),
            })
            say(friesRef.current >= FRY_TOTAL ? allFriesWin : L(winLine), 2600)
            setBig("GAME!")
            window.setTimeout(() => setBig(null), 1500)
            setScreen("won")
          }
        },
        onFry: (count) => {
          friesRef.current = count
          setFries(count)
        },
        onEmote: (nearId) => {
          say("“Can I get a quick call?”", 1100)
          window.setTimeout(() => {
            say(nearId ? (emoteLines[nearId] ?? emoteAlone) : emoteAlone, 1800)
          }, 1150)
        },
        onWinShot: () => {
          setStamp(true)
          blips.playClip(music.congrats, 0.65)
          analytics.capture("hopped_on_a_quick_call", { with: "supernate" })
          window.setTimeout(() => {
            setStamp(false)
            setScreen("end")
          }, 1900)
        },
      },
      blips,
    )
    gameRef.current = game
    game.setMarkers(["guide", "doctor", "vest"])
    if (screenRef.current === "town") game.resumeTown()
    if (screenRef.current === "boss") game.startBoss()
    return () => {
      game.dispose()
      gameRef.current = null
      blips.stopMusic(0.1)
    }
  }, [blips, say, L])

  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    if (screen === "town") game.resumeTown()
    else if (screen === "boss") {
      if (game.getMode() !== "boss") game.startBoss()
    } else if (screen !== "won") game.setMode("paused")
  }, [screen])

  useEffect(() => {
    if (screen === "story" || screen === "town" || screen === "dialog") blips.playMusic(music.town, 0.22)
    else if (screen === "bossIntro" || screen === "boss") blips.playMusic(music.boss, 0.26)
    else if (screen === "won" || screen === "direct") blips.stopMusic(0.7)
    else if (screen === "end") blips.playMusic(music.town, 0.12)
  }, [screen, blips])

  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    game.setMarkers(itemOrder.filter((id) => !got.includes(id)).map((id) => itemFrom[id]))
  }, [got])

  const start = useCallback(() => {
    blips.unlock()
    blips.select()
    setScreen("name")
  }, [blips])

  /** The name screen is done. Print it on the badge, the pings, and the portrait, then roll the story. */
  const confirmName = useCallback((n: string) => {
    setName(n)
    nameRef.current = n
    gameRef.current?.setPlayerName(n)
    setPortraits((prev) => ({ ...prev, ...renderPortraits(["you"], defaultLook.segments, 256, n) }))
    analytics.capture("name_entered", { letters: n.length, kept_default: n === defaultName })
    setStoryPage(0)
    setScreen("story")
  }, [])

  const land = useCallback(() => {
    blips.gate()
    analytics.capture("level_started", { area: "town" })
    setScreen("town")
    setBanner(true)
    window.setTimeout(() => setBanner(false), 2600)
  }, [blips])

  const nextStory = useCallback(() => {
    blips.select()
    setStoryPage((p) => {
      if (p >= intro.length - 1) {
        land()
        return p
      }
      return p + 1
    })
  }, [blips, land])

  const restart = useCallback(() => {
    setGot([])
    setClaimed([])
    setFries(0)
    friesRef.current = 0
    knockCount.current = 0
    airAnnounced.current = false
    poundAnnounced.current = false
    fedAnnounced.current = false
    setQuip(null)
    setHud({ patience: 100, batteries: 3, declining: false, phase: 0 })
    gameRef.current?.restartTown()
    analytics.capture("level_started", { area: "town", replay: true })
    setScreen("town")
  }, [])

  const openSite = useCallback(
    (s: Site, back: Screen) => {
      analytics.capture("product_card_opened", { product: s.name })
      setSite(s)
      setSiteReturn(back)
      setScreen("site")
    },
    [],
  )

  const beginTalk = (id: NpcId) => {
    const npc = npcs[id]
    const face = npcPortrait[id]
    const portrait = face ? portraits[face] : undefined
    const base = { speaker: npc.name, title: npc.title, portrait, real: npc.real }
    const seeSite = { id: "site", label: npc.id === "guide" ? "See CappaWork" : "See the site" }
    const pages = npc.pages.map(L)
    const ask = L(npc.ask)
    let next: Script
    if (npc.id === "ship") {
      next = { ...base, pages: [...pages, ask], choices: [{ id: "1987", label: npc.take }, { id: "bye", label: "Leave it" }] }
    } else if (npc.id === "cya") {
      next = claimed.includes("cya")
        ? { ...base, pages: [L(npc.after)], choices: [{ id: "bye", label: "Walk tall" }] }
        : { ...base, pages: [...pages, ask], choices: [{ id: "knock", label: npc.take }, { id: "bye", label: "Leave" }] }
    } else if (npc.item) {
      next = got.includes(npc.item)
        ? { ...base, pages: [L(npc.after)], choices: [seeSite, { id: "bye", label: "Bye" }] }
        : { ...base, pages: [...pages, ask], choices: [{ id: "take", label: npc.take }, seeSite, { id: "bye", label: "Later" }] }
    } else if (claimed.includes(npc.id)) {
      next = { ...base, pages: [L(npc.after)], choices: [{ id: "bye", label: "Bye" }] }
    } else {
      next = {
        ...base,
        pages: [...pages, ask],
        choices: [{ id: npc.reward === "fry" ? "fry" : "egg", label: npc.take }, { id: "bye", label: "Later" }],
      }
    }
    setTalking(id)
    setScript(next)
    setScreen("dialog")
  }
  talkRef.current = beginTalk

  const onChoice = (id: string) => {
    if (!talking) return
    const npc = npcs[talking]
    if (id === "site" && npc.siteId) {
      openSite(sites[npc.siteId], "dialog")
      return
    }
    if (id === "1987") {
      analytics.capture("easter_egg_found", { egg: "starfighter_1987" })
      onEnter1987()
      return
    }
    if (id === "take" && npc.item) {
      const item = items[npc.item]
      const next = got.includes(npc.item) ? got : [...got, npc.item]
      setGot(next)
      blips.invite()
      analytics.capture("invite_received", {
        npc: npc.id,
        item: npc.item,
        product: npc.siteId ? sites[npc.siteId].name : undefined,
        count: next.length,
      })
      flash(`GOT: ${item.name.toUpperCase()}`, 1800)
      setScript((prev) =>
        prev ? { ...prev, pages: [L(npc.yes)], choices: [{ id: "bye", label: next.length === 3 ? "To the trail" : "Nice" }] } : prev,
      )
      return
    }
    if (id === "fry") {
      setClaimed((prev) => [...prev, npc.id])
      gameRef.current?.grantFry()
      analytics.capture("easter_egg_found", { egg: `${npc.id}_fry` })
      setScript((prev) => (prev ? { ...prev, pages: [L(npc.yes)], choices: [{ id: "bye", label: "Nice" }] } : prev))
      return
    }
    if (id === "egg") {
      setClaimed((prev) => [...prev, npc.id])
      analytics.capture("easter_egg_found", { egg: npc.id })
      setScript((prev) => (prev ? { ...prev, pages: [L(npc.yes)], choices: [{ id: "bye", label: "…OK" }] } : prev))
      return
    }
    if (id === "knock") {
      const n = Math.min(knockCount.current + 1, knocks.length)
      knockCount.current = n
      gameRef.current?.knock()
      blips.text()
      const line = knocks[n - 1] ?? "Enrollment opens soon."
      if (n >= knocks.length) {
        setClaimed((prev) => [...prev, "cya"])
        gameRef.current?.setMogged(true)
        analytics.capture("easter_egg_found", { egg: "heightmogged" })
        setScript((prev) =>
          prev ? { ...prev, pages: [line, L(moggedLine)], choices: [{ id: "mogwin", label: "Take the direct intro" }] } : prev,
        )
      } else {
        setScript((prev) =>
          prev ? { ...prev, pages: [line], choices: [{ id: "knock", label: "Knock again" }, { id: "bye", label: "Leave" }] } : prev,
        )
      }
      return
    }
    if (id === "mogwin") {
      // Heightmogged: investors wave you through, Nate takes the direct intro. Skips the fight.
      analytics.capture("hopped_on_a_quick_call", { with: "supernate", via: "heightmog_direct_intro" })
      setTalking(null)
      setScript(null)
      blips.win()
      setScreen("direct")
      setBig("DIRECT INTRO!")
      window.setTimeout(() => setBig(null), 1400)
      window.setTimeout(() => {
        setStamp(true)
        blips.playClip(music.congrats, 0.65)
        window.setTimeout(() => {
          setStamp(false)
          setScreen("end")
        }, 1900)
      }, 1200)
      return
    }
    setTalking(null)
    setScript(null)
    setScreen("town")
    if (got.length === 3 && !gateAnnounced.current) {
      gateAnnounced.current = true
      gameRef.current?.openGate()
      flash(gateLine, 4200)
    }
  }
  useEffect(() => {
    if (got.length === 0) gateAnnounced.current = false
  }, [got.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = screenRef.current
      if (s === "title" && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault()
        start()
      } else if (s === "story" && ["Enter", "Space", "KeyE"].includes(e.code) && !e.repeat) {
        e.preventDefault()
        nextStory()
      } else if (s === "site" && e.code === "Escape") {
        e.preventDefault()
        setSite(null)
        setScreen(siteReturn)
      } else if (s === "bossIntro" && (e.code === "Enter" || e.code === "Space") && !e.repeat) {
        e.preventDefault()
        goBoss()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const goBoss = () => {
    blips.select()
    analytics.capture("level_started", { area: "boss" })
    setScreen("boss")
    ;["3", "2", "1", "GO!"].forEach((word, i) => {
      window.setTimeout(() => {
        setBig(word)
        if (word === "GO!") blips.invite()
        else blips.select()
      }, i * 600)
    })
    window.setTimeout(() => setBig(null), 2700)
  }

  const objective =
    got.length === 0
      ? "SuperNate won't take a cold call. The trail gate wants: meds, a call time, an agent."
      : got.length < 3
        ? `Unlock the trail gate. ${got.length} of 3.`
        : "The gate's open. Go land your quick call with SuperNate."
  const objectiveShort =
    got.length === 0 ? "Get 3 things for the gate" : got.length < 3 ? `Gate items: ${got.length} of 3` : "Gate's open. Go in."

  const pad = (action: Parameters<TownGame["setVirtual"]>[0]) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      blips.unlock()
      gameRef.current?.setVirtual(action, true)
    },
    onPointerUp: () => gameRef.current?.setVirtual(action, false),
    onPointerLeave: () => gameRef.current?.setVirtual(action, false),
    onPointerCancel: () => gameRef.current?.setVirtual(action, false),
  })

  const inTown = screen === "town" || screen === "dialog"
  const inBoss = screen === "boss" || screen === "won"
  const patienceColor = hud.patience > 60 ? "#ffffff" : hud.patience > 25 ? "#ffd23b" : "#ff4a3a"
  const upperName = name.toUpperCase()

  return (
    <div className="min-h-screen bg-[#120d18] text-white">
      <div className="mx-auto w-full max-w-[min(64rem,calc((100vh-5.5rem)*4/3))] px-2 pt-3 sm:px-4">
        <div className="relative overflow-hidden rounded-lg border-4 border-[#2a2230] bg-black shadow-2xl">
          <canvas
            ref={canvasRef}
            className="n64-canvas block aspect-[4/3] w-full"
            aria-label="SuperNate 64. Walk the town of Missed Call, talk to people, then get SuperNate to pick up a quick call at his cabin in the woods."
          />

          {inTown && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2 sm:p-3">
              <div className="party-panel flex items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-[#ffd23b] sm:h-12 sm:w-12">
                  {portraits.you && <img src={portraits.you} alt="" className="h-full w-full object-cover" />}
                </div>
                <div>
                  <p className="party-type text-[11px] leading-none sm:text-sm">{upperName}&apos;S CALL KIT</p>
                  <div className="mt-1 flex gap-1">
                    {itemOrder.map((id) => (
                      <ItemIcon key={id} id={id} lit={got.includes(id)} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1" title={`The order was for ${fryOrder}. FlyFry shipped ${FRY_TOTAL}. Bring all ${FRY_TOTAL} to the fight.`}>
                  <FryIcon />
                  <span className="party-type text-base sm:text-xl">
                    ×{fries}
                    <span className="text-xs text-white/70 sm:text-sm">/{FRY_TOTAL}</span>
                  </span>
                </div>
              </div>
              <p className="party-panel max-w-[48%] px-2.5 py-1 text-right text-[11px] font-bold leading-tight text-white sm:text-sm">
                <span className="sm:hidden">{objectiveShort}</span>
                <span className="hidden sm:inline">{objective}</span>
              </p>
            </div>
          )}

          {screen === "town" && near && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
              <span className="party-type party-panel flex items-center gap-2 px-4 py-1.5 text-sm sm:text-base">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2f73c9] text-xs">{touch ? "A" : "E"}</span>
                TALK TO {npcs[near].name.toUpperCase()}
              </span>
            </div>
          )}

          {toast && (
            <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-4">
              <p className="party-type rounded-2xl border-[3px] border-white bg-[#e2372e] px-4 py-2 text-center text-base shadow-[0_4px_0_#1a2a5a] sm:text-2xl">
                {toast}
              </p>
            </div>
          )}

          {(screen === "dialog" || (screen === "site" && siteReturn === "dialog")) && script && (
            <DialogBox script={script} onChoice={onChoice} blips={blips} active={screen === "dialog"} touch={touch} />
          )}

          {inBoss && (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-2 px-2 text-center font-mono text-[10px] text-white/75 sm:text-xs">
                {touch
                  ? "◀ ▶ move · A jump · ▼ in the air pounds the turkeys · B ping · 10 pings land the call"
                  : "← → move · SPACE jump · ↓ or SHIFT in the air ground-pounds the turkeys · J or click to ping · 10 pings land the call"}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                <div className="flex items-end gap-2">
                  <HudPortrait src={portraits.you} color="#e0792b" />
                  <div>
                    <p className="smash-type text-xs sm:text-sm">{upperName}</p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <PhoneIcon key={i} lit={i < hud.batteries} small />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2 text-right">
                  <div>
                    <p className="smash-type text-xs sm:text-sm">SUPERNATE</p>
                    <p className="smash-type text-3xl leading-none sm:text-5xl" style={{ color: patienceColor }}>
                      {hud.patience}%
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-white/80">PATIENCE</p>
                  </div>
                  <HudPortrait src={portraits.nate} color="#d8352a" />
                </div>
              </div>
              {hud.declining && screen === "boss" && (
                <p className="smash-type pointer-events-none absolute right-[12%] top-[16%] rotate-6 rounded bg-[#ff3b3b] px-2 text-sm sm:text-lg">
                  DO NOT DISTURB
                </p>
              )}
            </>
          )}

          {quip && inBoss && (
            <div className="pointer-events-none absolute right-[8%] top-[24%] max-w-[46%]">
              <p className="rounded-xl border-[3px] border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[0_4px_0_#000] sm:text-base">
                {quip}
              </p>
            </div>
          )}

          {quip && screen === "town" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-4">
              <p className="rounded-xl border-[3px] border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-[0_4px_0_#000] sm:text-base">
                {quip}
              </p>
            </div>
          )}

          {big && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p key={big} className="smash-type animate-in zoom-in-50 text-7xl duration-200 sm:text-9xl">
                {big}
              </p>
            </div>
          )}

          {stamp && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="smash-type -rotate-6 rounded-lg border-4 border-[#1a0f08] bg-[#ffcc33] px-5 py-3 text-2xl text-white sm:text-5xl">
                HOPPED ON A QUICK CALL
              </p>
            </div>
          )}

          {screen === "title" && <TitleCard portraits={portraits} onStart={start} />}

          {screen === "name" && <NameCard blips={blips} onDone={confirmName} />}

          {screen === "story" && (
            <div className="absolute inset-0 grid place-items-center bg-[#2a3f8a]/60 p-4">
              <div className="w-full max-w-xl rounded-2xl border-4 border-[#c9a26b] bg-[#fbf1d6] p-4 text-[#3a2a14] shadow-[0_8px_0_#1a2a5a] sm:p-6">
                <p className="party-type text-sm sm:text-lg">MEANWHILE, IN {townName}…</p>
                <p className="mt-2 min-h-[4.5em] text-sm leading-snug sm:text-lg" aria-live="polite">
                  {L(intro[storyPage] ?? "")}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {intro.map((_, i) => (
                      <span key={i} className={`h-2 w-2 rounded-full ${i <= storyPage ? "bg-[#e2372e]" : "bg-[#c9a26b]/50"}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={land} className="font-mono text-xs text-[#3a2a14]/70 underline">
                      Skip
                    </button>
                    <button type="button" onClick={nextStory} className="party-type party-panel px-4 py-1 text-sm sm:text-base">
                      {storyPage >= intro.length - 1 ? "LAND" : "NEXT ▶"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {banner && (
            <div className="pointer-events-none absolute inset-x-0 top-[30%] text-center">
              <p className="party-type animate-in fade-in zoom-in-75 text-5xl duration-300 sm:text-8xl">{townName}</p>
              <p className="party-type mt-1 text-sm text-[#ffd23b] sm:text-xl">{townPop}</p>
            </div>
          )}

          {screen === "bossIntro" && (
            <div className="smash-backdrop absolute inset-0 grid place-items-center p-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-3 sm:gap-8">
                  <VsCard src={portraits.you} name={upperName} role="CALLER" color="#e0792b" />
                  <span className="smash-type text-4xl text-[#ffcc33] sm:text-7xl">VS</span>
                  <VsCard src={portraits.nate} name="SUPERNATE" role="RECLUSE · THE WOODS" color="#d8352a" />
                </div>
                <div className="mx-auto mt-2 max-w-lg space-y-1 text-xs sm:mt-4 sm:text-lg">
                  {bossIntro.map((line) => (
                    <p key={line}>{L(line)}</p>
                  ))}
                </div>
                <p className="mt-2 hidden font-mono text-xs text-white/70 sm:block">
                  Drain his patience. Jump the turkeys. Three hits and his patience is back to full, so dodge.
                </p>
                {fries >= FRY_TOTAL && (
                  <p className="mt-1 font-mono text-xs text-[#ffd23b]">
                    You brought all {FRY_TOTAL} fries. The turkeys can smell them.
                  </p>
                )}
                <button
                  type="button"
                  onClick={goBoss}
                  className="smash-type mt-2 rounded-lg bg-[#ffcc33] px-5 py-1 text-lg sm:mt-4 sm:px-6 sm:py-2 sm:text-2xl"
                >
                  READY… GO!
                </button>
              </div>
            </div>
          )}

          {screen === "end" && (
            <EndCard name={name} portraits={portraits} onOpen={(s) => openSite(s, "end")} onAgain={restart} onEnter1987={onEnter1987} />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[11px] text-white/45">
          <span>
            {["won", "direct", "end"].includes(screen)
              ? "supernate.dev · a Nate Pinches production"
              : touch
                ? "A talk & jump · B ping · ▼ in the air dives · tap the dialog to keep it moving"
                : "WASD move · Space jump · E talk · Q quick-call emote · Shift ground pound · Esc closes a site"}
          </span>
          <button
            type="button"
            onClick={() => {
              blips.muted = !blips.muted
              flash(blips.muted ? "Sound off" : "Sound on", 900)
            }}
            className="text-white/60 underline"
          >
            Sound
          </button>
        </div>

        {["title", "story", "town", "dialog", "bossIntro", "boss"].includes(screen) && (
          <div className="mt-2 flex items-center justify-between pb-4 sm:hidden">
            <div className="grid grid-cols-3 gap-1">
              <span />
              <PadButton label="▲" {...pad("up")} />
              <span />
              <PadButton label="◀" {...pad("left")} />
              <PadButton label="▼" {...pad("down")} />
              <PadButton label="▶" {...pad("right")} />
            </div>
            <div className="flex items-center gap-2.5">
              <PadButton label="B" round color="#3c9a3a" {...pad("fire")} />
              <PadButton
                label="A"
                round
                color="#2f73c9"
                onPointerDown={(e) => {
                  e.preventDefault()
                  blips.unlock()
                  if (screenRef.current === "title") start()
                  gameRef.current?.setVirtual("talk", true)
                  gameRef.current?.setVirtual("jump", true)
                }}
                onPointerUp={() => {
                  gameRef.current?.setVirtual("talk", false)
                  gameRef.current?.setVirtual("jump", false)
                }}
                onPointerLeave={() => {
                  gameRef.current?.setVirtual("talk", false)
                  gameRef.current?.setVirtual("jump", false)
                }}
              />
            </div>
          </div>
        )}
      </div>

      {screen === "site" && site && (
        <SiteBrowser
          site={site}
          onClose={() => {
            setSite(null)
            setScreen(siteReturn)
          }}
        />
      )}
    </div>
  )
}

function PhoneIcon({ lit, small }: { lit: boolean; small?: boolean }) {
  return (
    <span
      className={`inline-block rounded-[4px] border-2 border-black ${small ? "h-5 w-3.5" : "h-7 w-5"} ${
        lit ? "bg-[#7dffa0] shadow-[0_0_8px_#7dffa0]" : "bg-[#2a2a30]"
      }`}
    />
  )
}

function HudPortrait({ src, color }: { src?: string; color: string }) {
  return (
    <div
      className="h-12 w-12 overflow-hidden rounded-lg border-[3px] border-black sm:h-16 sm:w-16"
      style={{ background: `linear-gradient(180deg, ${color}, #1a0f08)` }}
    >
      {src && <img src={src} alt="" className="h-full w-full object-cover" />}
    </div>
  )
}

function VsCard({ src, name, role, color }: { src?: string; name: string; role?: string; color: string }) {
  return (
    <div className="w-20 sm:w-44">
      <div
        className="aspect-square overflow-hidden rounded-xl border-4 border-[#1a0f08]"
        style={{ background: `linear-gradient(180deg, ${color}, #1a0f08)` }}
      >
        {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      </div>
      <p className="smash-type mt-1 text-xs sm:text-lg">{name}</p>
      {role && <p className="font-mono text-[9px] tracking-[0.2em] text-white/70 sm:text-[11px]">{role}</p>}
    </div>
  )
}

function PadButton({
  label,
  round,
  color = "#2a2230",
  ...handlers
}: {
  label: string
  round?: boolean
  color?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`smash-type touch-none select-none ${round ? "h-14 w-14 rounded-full text-xl" : "h-11 w-11 rounded-md text-base"}`}
      style={{ background: color }}
      {...handlers}
    >
      {label}
    </button>
  )
}

function TitleCard({ portraits, onStart }: { portraits: Partial<Record<CharacterId, string>>; onStart: () => void }) {
  const cast: CharacterId[] = ["doctor", "you", "nate", "vest", "guide"]
  return (
    <div className="smash-backdrop absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
      <p className="hidden font-mono text-[11px] tracking-[0.35em] text-[#ffcc33] sm:block">A NATE PINCHES PRODUCTION</p>
      <h1 className="smash-type mt-1 text-4xl sm:text-8xl">SUPERNATE 64</h1>
      <p className="smash-type mt-1 text-sm text-[#ffcc33] sm:text-3xl">HOP ON A QUICK CALL</p>
      <div className="mt-2 flex items-end justify-center gap-1 sm:mt-4 sm:gap-2">
        {cast.map((id) => (
          <div
            key={id}
            className={`overflow-hidden rounded-lg border-[3px] border-[#1a0f08] bg-gradient-to-b from-[#c23a22] to-[#6d130d] ${
              id === "nate" ? "h-14 w-14 sm:h-36 sm:w-36" : "h-10 w-10 sm:h-24 sm:w-24"
            }`}
          >
            {portraits[id] && <img src={portraits[id]} alt="" className="h-full w-full object-cover" />}
          </div>
        ))}
      </div>
      <p className="mt-4 hidden max-w-md text-sm text-white/85 sm:block sm:text-base">
        SuperNate lives in a cabin past the tree line and will not take a cold call. You need one. Make him pick up.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="smash-type mt-3 animate-pulse rounded-lg bg-[#ffcc33] px-5 py-1 text-lg motion-reduce:animate-none sm:mt-4 sm:px-7 sm:py-2 sm:text-3xl"
      >
        PRESS START
      </button>
      <p className="mt-1 font-mono text-[10px] text-white/60 sm:mt-2 sm:text-[11px]">About two minutes · sound on</p>
    </div>
  )
}

/** The old RPG name screen: type a name, then "Is that right?" with YES and NO. */
function NameCard({ blips, onDone }: { blips: Blips; onDone: (name: string) => void }) {
  const [draft, setDraft] = useState("")
  const [step, setStep] = useState<"type" | "confirm">("type")
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const clean = draft.replace(/[^A-Za-z0-9 '.-]/g, "").toUpperCase().slice(0, nameMax)
  const name = clean.trim() || defaultName
  const stateRef = useRef({ step, sel, name })
  stateRef.current = { step, sel, name }

  useEffect(() => {
    if (step === "type") inputRef.current?.focus()
  }, [step])

  const toConfirm = () => {
    blips.select()
    setSel(0)
    setStep("confirm")
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (s.step !== "confirm") return
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"].includes(e.code)) {
        e.preventDefault()
        setSel((v) => 1 - v)
        blips.text()
      } else if (["Enter", "Space", "KeyE"].includes(e.code)) {
        e.preventDefault()
        if (e.repeat) return
        blips.select()
        if (s.sel === 0) onDone(s.name)
        else setStep("type")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [blips, onDone])

  return (
    <div className="absolute inset-0 grid place-items-center bg-[#2a3f8a]/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border-4 border-[#c9a26b] bg-[#fbf1d6] p-4 text-[#3a2a14] shadow-[0_8px_0_#1a2a5a] sm:p-6">
        {step === "type" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              toConfirm()
            }}
          >
            <p className="party-type text-sm sm:text-lg">WHAT&apos;S YOUR NAME?</p>
            <input
              ref={inputRef}
              value={clean}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={nameMax}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder={defaultName}
              aria-label="Your name"
              className="mt-3 w-full rounded-lg border-[3px] border-[#c9a26b] bg-white px-3 py-2 font-mono text-2xl uppercase tracking-[0.3em] text-[#1a0f08] outline-none placeholder:text-[#1a0f08]/30 focus:border-[#e2372e] sm:text-4xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="font-mono text-[11px] text-[#3a2a14]/70">{nameMax} letters. Like a cartridge save.</p>
              <button type="submit" className="party-type party-panel px-4 py-1 text-sm sm:text-base">
                OK ▶
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="party-type text-sm sm:text-lg">SO YOUR NAME IS…</p>
            <p className="mt-2 font-mono text-3xl tracking-[0.2em] text-[#e2372e] sm:text-5xl">{name}</p>
            <p className="mt-2 text-sm sm:text-lg">Is that right?</p>
            <div className="mt-3 flex gap-2">
              {["YES", "NO"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    blips.select()
                    if (i === 0) onDone(name)
                    else setStep("type")
                  }}
                  className={`smash-type rounded-md border-2 px-4 py-1 text-base sm:text-lg ${
                    sel === i ? "border-[#ffe066] bg-[#d8352a]" : "border-[#1a0f08]/20 bg-[#1a0f08]/10"
                  }`}
                >
                  {sel === i ? "▶ " : ""}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ItemIcon({ id, lit }: { id: ItemId; lit: boolean }) {
  const color = lit ? "#ffffff" : "rgba(255,255,255,0.35)"
  return (
    <span
      title={items[id].name}
      className={`grid h-7 w-7 place-items-center rounded-lg border-2 ${lit ? "border-white bg-[#38b24a]" : "border-white/30 bg-black/25"}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        {id === "meds" && (
          <g fill="none" stroke={color} strokeWidth="2.4">
            <rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-35 12 12)" />
            <path d="M12 7.5 L12 16.5" transform="rotate(-35 12 12)" />
          </g>
        )}
        {id === "call" && (
          <g fill="none" stroke={color} strokeWidth="2.2">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M4 10 H20 M8 3 V7 M16 3 V7" />
            <path d="M9 15 L11 17 L15 12.5" />
          </g>
        )}
        {id === "agent" && (
          <g fill="none" stroke={color} strokeWidth="2.2">
            <rect x="5" y="8" width="14" height="11" rx="2.5" />
            <path d="M12 8 V4 M12 4 H15" />
            <circle cx="9.5" cy="13" r="0.6" fill={color} />
            <circle cx="14.5" cy="13" r="0.6" fill={color} />
            <path d="M9.5 16.2 H14.5" />
          </g>
        )}
      </svg>
    </span>
  )
}

function FryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="7" y="3" width="2.4" height="11" fill="#ffcf3f" stroke="#1a2a5a" strokeWidth="1" />
      <rect x="10.8" y="2" width="2.4" height="12" fill="#ffcf3f" stroke="#1a2a5a" strokeWidth="1" />
      <rect x="14.6" y="3.5" width="2.4" height="10.5" fill="#ffcf3f" stroke="#1a2a5a" strokeWidth="1" />
      <path d="M5 11 H19 L17 22 H7 Z" fill="#e2372e" stroke="#1a2a5a" strokeWidth="1.2" />
      <rect x="6" y="13.5" width="12" height="2" fill="#ffffff" />
    </svg>
  )
}

function EndCard({
  name,
  portraits,
  onOpen,
  onAgain,
  onEnter1987,
}: {
  name: string
  portraits: Partial<Record<CharacterId, string>>
  onOpen: (s: Site) => void
  onAgain: () => void
  onEnter1987: () => void
}) {
  return (
    <div className="smash-backdrop absolute inset-0 overflow-y-auto p-3 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-[3px] border-[#1a0f08] bg-[#d8352a] sm:h-20 sm:w-20">
            {portraits.nate && <img src={portraits.nate} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#ffcc33]">SUPERNATE, FROM THE PORCH, SAYS</p>
            <h2 className="smash-type text-3xl sm:text-5xl">&ldquo;FINE. QUICK CALL.&rdquo;</h2>
            <p className="mt-1 text-sm text-white/85 sm:text-base">
              {name.toUpperCase()} got the quick call. That was the game. This is the real one.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border-4 border-[#1a0f08] bg-[#fbf1d6] p-4 text-[#1a0f08] shadow-[0_6px_0_#1a0f08] sm:p-5">
          <p className="font-mono text-[11px] tracking-[0.25em] text-[#8f1d14]">OUT OF CHARACTER FOR A SECOND</p>
          <p className="smash-type mt-1 text-2xl leading-tight text-[#e2372e] sm:text-4xl">NATE ACTUALLY WANTS THIS CALL.</p>
          <p className="mt-2 text-sm leading-snug sm:text-base">
            SuperNate declined you 1,400 times. The real Nate won&apos;t decline once. If your company has Computer Work piling up,
            he wants to hear about it. No pitch deck, no turkeys, 15 minutes.
          </p>
          <a
            href={calendly}
            target="_blank"
            rel="noreferrer"
            onClick={() => analytics.capture("calendly_clicked", { from: "end_card" })}
            className="smash-type mt-3 block rounded-xl bg-[#ffcc33] px-5 py-3 text-center text-xl sm:text-3xl"
          >
            BOOK THE REAL QUICK CALL ▶
          </a>
          <p className="mt-2 text-center font-mono text-xs text-[#1a0f08]/70">
            Picks a time on his actual calendar. He picks up. Promise.
          </p>
        </div>

        <p className="mt-3 text-sm text-white/85 sm:text-base">
          He built the three things the town kept mentioning. The turkeys are not real.
        </p>

        <p className="smash-type mt-4 text-lg sm:text-xl">NATE ACTUALLY BUILT THESE</p>
        <p className="mt-1 text-xs text-white/70">Everything else in Missed Call is a joke. These three are real.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {siteList.map((s) => (
            <div key={s.id} className="rounded-lg border-2 border-[#1a0f08] bg-black/40 p-2.5">
              <p className="font-bold">
                {s.name} <span className="rounded bg-[#38b24a] px-1 py-0.5 align-middle font-mono text-[9px] font-bold">✓ REAL</span>
              </p>
              <p className="text-xs text-white/75">{s.line}</p>
              <div className="mt-1.5 flex gap-3 font-mono text-xs">
                <button type="button" onClick={() => onOpen(s)} className="text-[#ffcc33] underline">
                  Peek in game
                </button>
                <a href={s.url} target="_blank" rel="noreferrer" className="text-white/80 underline">
                  Open site
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onAgain} className="smash-type rounded-lg bg-[#ffcc33] px-4 py-1.5 text-lg">
            PLAY AGAIN
          </button>
          <button
            type="button"
            onClick={onEnter1987}
            className="rounded-lg border-2 border-white/30 px-4 py-1.5 font-mono text-xs text-white/80"
          >
            Insert the 1987 cartridge
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-white/50">FlyFry is not on this list. FlyFry is not real.</p>
      </div>
    </div>
  )
}

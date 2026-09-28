"use client"

import type { Blips } from "@/components/town/audio"
import { useEffect, useRef, useState } from "react"

export interface Choice {
  id: string
  label: string
}

export interface Script {
  speaker: string
  title: string
  portrait?: string
  pages: string[]
  choices: Choice[]
}

const CPS = 100

export function DialogBox({
  script,
  onChoice,
  blips,
  active = true,
}: {
  script: Script
  onChoice: (id: string) => void
  blips: Blips
  active?: boolean
}) {
  const [page, setPage] = useState(0)
  const [shown, setShown] = useState(0)
  const [sel, setSel] = useState(0)
  const text = script.pages[page] ?? ""
  const done = shown >= text.length
  const last = page >= script.pages.length - 1
  const showChoices = last && done
  const stateRef = useRef({ done, last, showChoices, sel, text })
  stateRef.current = { done, last, showChoices, sel, text }

  useEffect(() => {
    setPage(0)
    setShown(0)
    setSel(0)
  }, [script])

  useEffect(() => {
    if (done) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setShown(text.length)
      return
    }
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n % 3 === 0) blips.text()
        return Math.min(text.length, n + 1)
      })
    }, 1000 / CPS)
    return () => window.clearInterval(id)
  }, [text, done, blips])

  const advance = () => {
    const s = stateRef.current
    if (!s.done) {
      setShown(s.text.length)
      return
    }
    if (s.showChoices) {
      const choice = script.choices[s.sel]
      if (choice) {
        blips.select()
        onChoice(choice.id)
      }
      return
    }
    blips.select()
    setPage((p) => p + 1)
    setShown(0)
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (["Space", "Enter", "KeyE"].includes(e.code)) {
        e.preventDefault()
        if (!e.repeat) advance()
      } else if (stateRef.current.showChoices && ["ArrowDown", "KeyS", "ArrowRight", "KeyD"].includes(e.code)) {
        e.preventDefault()
        setSel((v) => (v + 1) % script.choices.length)
        blips.text()
      } else if (stateRef.current.showChoices && ["ArrowUp", "KeyW", "ArrowLeft", "KeyA"].includes(e.code)) {
        e.preventDefault()
        setSel((v) => (v - 1 + script.choices.length) % script.choices.length)
        blips.text()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 p-2 sm:p-4" role="dialog" aria-label={`${script.speaker} is talking`}>
      <div className="relative flex gap-3 rounded-xl border-[3px] border-[#f4e3b2]/80 bg-[#140c22]/88 p-3 shadow-[0_6px_0_#000] sm:gap-4 sm:p-4">
        {script.portrait && (
          <div className="smash-backdrop hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg border-[3px] border-[#2a0c08] sm:block">
            <img src={script.portrait} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="party-type text-base sm:text-lg">{script.speaker}</span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#ffcc55] sm:text-xs">{script.title}</span>
          </div>
          <p className="min-h-[3.6em] text-[15px] leading-snug text-white sm:text-lg" aria-live="polite">
            {text.slice(0, shown)}
          </p>
          {showChoices ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {script.choices.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    blips.select()
                    onChoice(c.id)
                  }}
                  className={`smash-type rounded-md border-2 px-3 py-1 text-sm transition-colors sm:text-base ${
                    sel === i ? "border-[#ffe066] bg-[#d8352a]" : "border-white/20 bg-white/5"
                  }`}
                >
                  {sel === i ? "▶ " : ""}
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={advance}
              className="absolute bottom-2 right-3 flex items-center gap-1 font-mono text-[11px] text-white/70"
              aria-label="Next"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2f73c9] text-xs font-bold text-white shadow-[0_2px_0_#000] animate-bounce motion-reduce:animate-none">
                A
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

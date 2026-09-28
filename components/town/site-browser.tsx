"use client"

import type { Site } from "@/lib/sites"
import { useState } from "react"

export function SiteBrowser({ site, onClose }: { site: Site; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const src = site.peek ? `/api/peek?url=${encodeURIComponent(site.url)}` : site.url

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#151515]/80 p-3 sm:p-6">
      <div className="flex h-full max-h-[920px] w-full max-w-5xl flex-col overflow-hidden rounded-md border-2 border-[#DC9300] bg-[#2a241c] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#DC9300]/40 bg-[#1b1712] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F54E00]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#DC9300]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3d7edb]" />
          <div className="min-w-0 flex-1 truncate rounded bg-[#151515] px-2 py-1 font-mono text-[11px] text-[#EEEFE9]">
            {site.url}
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 font-mono text-[11px] text-[#DC9300] underline"
          >
            Open tab
          </a>
        </div>
        <p className="px-3 py-1.5 font-mono text-xs text-[#EEEFE9]/80">{site.line}</p>
        <div className="relative min-h-0 flex-1 bg-white">
          {!loaded && (
            <p className="absolute left-3 top-3 font-mono text-xs text-[#151515]">Ringing them in…</p>
          )}
          <iframe
            key={src}
            title={site.name}
            src={src}
            onLoad={() => setLoaded(true)}
            sandbox={site.peek ? "allow-scripts allow-forms allow-popups" : undefined}
            className="h-full min-h-[280px] w-full bg-white"
          />
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="bg-[#F54E00] px-4 py-3 font-mono text-sm font-bold tracking-wide text-white hover:bg-[#DC9300]"
        >
          Back to town
        </button>
      </div>
    </div>
  )
}

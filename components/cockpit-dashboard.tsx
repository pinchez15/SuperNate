"use client"

import { useState } from "react"
import Image from "next/image"

export function CockpitDashboard() {
  const [powerSwitch, setPowerSwitch] = useState(false)
  const [shieldsSwitch, setShieldsSwitch] = useState(false)
  const [thrustersSwitch, setThrustersSwitch] = useState(false)
  const [commsSwitch, setCommsSwitch] = useState(false)

  return (
    <div className="bg-gradient-to-b from-[#2C2C2C] to-[#1a1a1a] p-4 lg:p-6 relative">
      {/* Cockpit panel background texture */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap gap-6 items-start justify-between">
          <div className="flex-1 min-w-[400px]">
            <h3 className="text-[#DC9300] font-bold text-sm uppercase tracking-wide mb-4 text-center">Ship Systems</h3>

            {/* Switches row */}
            <div className="flex gap-8 justify-center items-start mb-4">
              {/* Power Switch */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setPowerSwitch(!powerSwitch)}
                  className="relative w-20 h-20 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg border-2 border-[#1a1a1a] shadow-lg cursor-pointer flex items-center justify-center"
                  style={{
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Red circular background */}
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#F54E00] to-[#d04400] shadow-inner" />
                  {/* Toggle lever */}
                  <div
                    className={`relative w-8 h-10 bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] rounded-sm shadow-md transition-transform duration-200 ${
                      powerSwitch ? "translate-y-2" : "-translate-y-2"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
                    }}
                  >
                    {/* Lever grooves */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 space-y-0.5">
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                    </div>
                  </div>
                </button>
                <span className="text-xs text-[#EEEFE9] uppercase font-bold">Power</span>
              </div>

              {/* Shields Switch */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setShieldsSwitch(!shieldsSwitch)}
                  className="relative w-20 h-20 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg border-2 border-[#1a1a1a] shadow-lg cursor-pointer flex items-center justify-center"
                  style={{
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#F54E00] to-[#d04400] shadow-inner" />
                  <div
                    className={`relative w-8 h-10 bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] rounded-sm shadow-md transition-transform duration-200 ${
                      shieldsSwitch ? "translate-y-2" : "-translate-y-2"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
                    }}
                  >
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 space-y-0.5">
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                    </div>
                  </div>
                </button>
                <span className="text-xs text-[#EEEFE9] uppercase font-bold">Shields</span>
              </div>

              {/* Thrusters Switch */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setThrustersSwitch(!thrustersSwitch)}
                  className="relative w-20 h-20 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg border-2 border-[#1a1a1a] shadow-lg cursor-pointer flex items-center justify-center"
                  style={{
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#F54E00] to-[#d04400] shadow-inner" />
                  <div
                    className={`relative w-8 h-10 bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] rounded-sm shadow-md transition-transform duration-200 ${
                      thrustersSwitch ? "translate-y-2" : "-translate-y-2"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
                    }}
                  >
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 space-y-0.5">
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                    </div>
                  </div>
                </button>
                <span className="text-xs text-[#EEEFE9] uppercase font-bold">Thrusters</span>
              </div>

              {/* Comms Switch */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setCommsSwitch(!commsSwitch)}
                  className="relative w-20 h-20 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg border-2 border-[#1a1a1a] shadow-lg cursor-pointer flex items-center justify-center"
                  style={{
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#F54E00] to-[#d04400] shadow-inner" />
                  <div
                    className={`relative w-8 h-10 bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] rounded-sm shadow-md transition-transform duration-200 ${
                      commsSwitch ? "translate-y-2" : "-translate-y-2"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
                    }}
                  >
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 space-y-0.5">
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                      <div className="h-px bg-[#666]" />
                    </div>
                  </div>
                </button>
                <span className="text-xs text-[#EEEFE9] uppercase font-bold">Comms</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Power info window */}
              {powerSwitch && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#DC9300] animate-in fade-in duration-300">
                  <p className="text-xs text-[#DC9300] uppercase mb-1">Power Systems Online:</p>
                  <a
                    href="https://www.cappawork.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F54E00] hover:text-[#DC9300] font-mono underline transition-colors"
                  >
                    NateHog's Business - Cappawork.com
                  </a>
                </div>
              )}

              {/* Shields info window */}
              {shieldsSwitch && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#1D4AFF] animate-in fade-in duration-300">
                  <p className="text-xs text-[#1D4AFF] uppercase mb-1">Shields Active:</p>
                  <a
                    href="https://www.workportfolio.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F54E00] hover:text-[#DC9300] font-mono underline transition-colors"
                  >
                    Work Portfolio - workportfolio.io
                  </a>
                </div>
              )}

              {/* Thrusters info window */}
              {thrustersSwitch && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#F54E00] animate-in fade-in duration-300">
                  <p className="text-xs text-[#F54E00] uppercase mb-1">Thrusters Engaged:</p>
                  <a
                    href="https://magnolia-ai-painter.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F54E00] hover:text-[#DC9300] font-mono underline transition-colors"
                  >
                    Magnolia AI Painter - magnolia-ai-painter.vercel.app
                  </a>
                </div>
              )}

              {/* Comms window */}
              {commsSwitch && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#DC9300] animate-in fade-in duration-300">
                  <p className="text-xs text-[#DC9300] uppercase mb-1">Incoming Transmission:</p>
                  <p className="text-sm text-[#EEEFE9] font-mono">nate@cappawork.com</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="bg-[#EEEFE9] p-2 shadow-lg border-2 border-[#D0D1C9] relative w-32"
            style={{
              transform: "rotate(-8deg)",
              transformOrigin: "top center",
            }}
          >
            {/* Tape piece */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-yellow-100/60 opacity-70 rotate-6 shadow-sm" />

            <div className="text-center space-y-1">
              <h3 className="text-[10px] font-bold text-[#F54E00] uppercase tracking-wide border-b border-[#F54E00] pb-0.5">
                Missing
              </h3>

              <div className="flex justify-center">
                <div className="w-12 h-12 relative border border-[#151515] rounded overflow-hidden bg-white">
                  <Image src="/natehog.png" alt="NateHog" fill className="object-contain" />
                </div>
              </div>

              <h4 className="text-[9px] font-bold text-[#151515]">NateHog</h4>

              <p className="text-[7px] text-[#151515] leading-tight">
                Last seen using <span className="font-bold">Cursor</span>, <span className="font-bold">Vercel</span>,{" "}
                <span className="font-bold">Supabase</span>, <span className="font-bold">Tableau</span>. Has{" "}
                <span className="font-bold">MBA</span>. Missed by many children.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { posthog } from "@/lib/posthog"

interface CockpitDashboardProps {
  thrustersActive: boolean
  onThrustersToggle: (active: boolean) => void
}

export function CockpitDashboard({ thrustersActive, onThrustersToggle }: CockpitDashboardProps) {
  const [powerSwitch, setPowerSwitch] = useState(false)
  const [shieldsSwitch, setShieldsSwitch] = useState(false)
  const [commsSwitch, setCommsSwitch] = useState(false)
  const [speedMessageVisible, setSpeedMessageVisible] = useState(false)
  const [fuelMessageVisible, setFuelMessageVisible] = useState(false)

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
          {/* Left side - Missing Poster */}
          <div className="flex flex-col gap-4">
            <div
              className="bg-[#EEEFE9] shadow-lg border-2 border-[#D0D1C9] relative"
              style={{
                width: "153.6px",
                padding: "9.6px",
                transform: "rotate(-8deg)",
                transformOrigin: "top center",
              }}
            >
              {/* Tape piece */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 bg-yellow-100/60 opacity-70 rotate-6 shadow-sm"
                style={{
                  top: "-4.8px",
                  width: "38.4px",
                  height: "14.4px",
                }}
              />

              <div className="text-center space-y-1">
                <h3 
                  className="font-bold text-[#F54E00] uppercase tracking-wide border-b border-[#F54E00]"
                  style={{
                    fontSize: "12px",
                    paddingBottom: "2.4px",
                  }}
                >
                  MISSING!
                </h3>

                <div className="flex justify-center">
                  <div 
                    className="relative border border-[#151515] rounded overflow-hidden bg-white"
                    style={{
                      width: "57.6px",
                      height: "57.6px",
                    }}
                  >
                    <Image src="/natehog.png" alt="NateHog" fill className="object-contain" />
                  </div>
                </div>

                <h4 
                  className="font-bold text-[#151515]"
                  style={{ fontSize: "10.8px" }}
                >
                  NateHog
                </h4>

                <p 
                  className="text-[#151515] leading-tight"
                  style={{ fontSize: "8.4px" }}
                >
                  Last seen using <span className="font-bold">Cursor</span>, <span className="font-bold">Vercel</span>,{" "}
                  <span className="font-bold">Supabase</span>, <span className="font-bold">Tableau</span>. Has{" "}
                  <span className="font-bold">MBA</span>. Missed by a plethora of children.
                </p>
              </div>
            </div>
          </div>

          {/* Center - Ship Systems */}
          <div className="flex-1 min-w-[400px]">
            <h3 className="text-[#DC9300] font-bold text-sm uppercase tracking-wide mb-4 text-center">Ship Systems</h3>

            {/* Switches row */}
            <div className="flex gap-8 justify-center items-start mb-4">
              {/* Power Switch */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    setPowerSwitch(!powerSwitch)
                    posthog.capture('easter_egg_clicked', { type: 'power_switch' })
                  }}
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
                  onClick={() => {
                    setShieldsSwitch(!shieldsSwitch)
                    posthog.capture('easter_egg_clicked', { type: 'shields_switch' })
                  }}
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
                  onClick={() => {
                    onThrustersToggle(!thrustersActive)
                    posthog.capture('easter_egg_clicked', { type: 'thrusters_switch', active: !thrustersActive })
                  }}
                  className="relative w-20 h-20 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg border-2 border-[#1a1a1a] shadow-lg cursor-pointer flex items-center justify-center"
                  style={{
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#F54E00] to-[#d04400] shadow-inner" />
                  <div
                    className={`relative w-8 h-10 bg-gradient-to-b from-[#e0e0e0] to-[#a0a0a0] rounded-sm shadow-md transition-transform duration-200 ${
                      thrustersActive ? "translate-y-2" : "-translate-y-2"
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
                  onClick={() => {
                    setCommsSwitch(!commsSwitch)
                    posthog.capture('easter_egg_clicked', { type: 'comms_switch' })
                  }}
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
                    NateHog spends most of his power on his business @ Cappawork.com
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
                    He made a startup that LinkedIn crushed with a similar feature. But it's still kinda cool and has nice UI: Workportfolio.io
                  </a>
                </div>
              )}

              {/* Thrusters info window */}
              {thrustersActive && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#F54E00] animate-in fade-in duration-300">
                  <p className="text-xs text-[#F54E00] uppercase mb-1">Thrusters Engaged:</p>
                  <a
                    href="https://magnolia-ai-painter.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F54E00] hover:text-[#DC9300] font-mono underline transition-colors"
                  >
                    NateHog just pitched the lovely people at Magnolia to make them an AI painter. TBD if they will buy.
                  </a>
                </div>
              )}

              {/* Comms window */}
              {commsSwitch && (
                <div className="bg-[#1a1a1a] p-3 rounded border border-[#DC9300] animate-in fade-in duration-300">
                  <p className="text-xs text-[#DC9300] uppercase mb-1">Incoming Transmission:</p>
                  <p className="text-sm text-[#EEEFE9] font-mono"> Even though he was captured by the PDfffff aliens, he still has his email. Don't ask how it works: nate@cappawork.com </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Dials and Gauges */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#DC9300] font-bold text-xs uppercase tracking-wide text-center">Diagnostics</h3>
            
            <div className="flex gap-4">
              {/* Speed Gauge */}
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="relative w-24 h-24 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-full border-2 border-[#1a1a1a] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setSpeedMessageVisible(!speedMessageVisible)
                    posthog.capture('easter_egg_clicked', { type: 'speed_gauge' })
                  }}
                >
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    {/* Gauge background */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#151515" strokeWidth="2" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#DC9300" strokeWidth="1" strokeDasharray="2,4" />
                    
                    {/* Gauge markers */}
                    <line x1="50" y1="15" x2="50" y2="20" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="80" y1="30" x2="75" y2="33" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="85" y1="50" x2="80" y2="50" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="80" y1="70" x2="75" y2="67" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="50" y1="85" x2="50" y2="80" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="20" y1="70" x2="25" y2="67" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="15" y1="50" x2="20" y2="50" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="20" y1="30" x2="25" y2="33" stroke="#EEEFE9" strokeWidth="1.5" />
                    
                    {/* Needle - rotates more when thrusters active */}
                    <line 
                      x1="50" y1="50" x2="50" y2="25" 
                      stroke="#F54E00" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      transform={`rotate(${thrustersActive ? 100 : 45} 50 50)`}
                      style={{ transition: 'transform 0.5s ease-out' }}
                    />
                    <circle cx="50" cy="50" r="4" fill="#F54E00" />
                  </svg>
                  <div className="absolute bottom-2 text-[8px] text-[#DC9300] font-bold">SPEED</div>
                </div>
                {speedMessageVisible && (
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#DC9300] animate-in fade-in duration-300 text-center max-w-[120px]">
                    <p className="text-xs text-[#DC9300] font-mono">🚀 Shipping speed set to ludacris mode</p>
                  </div>
                )}
              </div>

              {/* Fuel Gauge */}
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="relative w-24 h-24 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-full border-2 border-[#1a1a1a] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setFuelMessageVisible(!fuelMessageVisible)
                    posthog.capture('easter_egg_clicked', { type: 'fuel_gauge' })
                  }}
                >
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    {/* Gauge background */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#151515" strokeWidth="2" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1D4AFF" strokeWidth="1" strokeDasharray="2,4" />
                    
                    {/* Gauge markers */}
                    <line x1="50" y1="15" x2="50" y2="20" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="80" y1="30" x2="75" y2="33" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="85" y1="50" x2="80" y2="50" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="80" y1="70" x2="75" y2="67" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="50" y1="85" x2="50" y2="80" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="20" y1="70" x2="25" y2="67" stroke="#EEEFE9" strokeWidth="1.5" />
                    <line x1="15" y1="50" x2="20" y2="50" stroke="#EEEFE9" strokeWidth="2" />
                    <line x1="20" y1="30" x2="25" y2="33" stroke="#EEEFE9" strokeWidth="1.5" />
                    
                    {/* Needle */}
                    <line x1="50" y1="50" x2="50" y2="25" stroke="#1D4AFF" strokeWidth="2" strokeLinecap="round" transform="rotate(-30 50 50)" />
                    <circle cx="50" cy="50" r="4" fill="#1D4AFF" />
                  </svg>
                  <div className="absolute bottom-2 text-[8px] text-[#1D4AFF] font-bold">FUEL</div>
                </div>
                {fuelMessageVisible && (
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#1D4AFF] animate-in fade-in duration-300 text-center max-w-[120px]">
                    <p className="text-xs text-[#1D4AFF] font-mono">⛽ Seems to be all gas no brakes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* LED indicators and digital readouts */}
            <div className="flex flex-col gap-2">
              {/* Altitude readout */}
              <div className="bg-[#1a1a1a] border border-[#4B4B4B] rounded px-3 py-2 flex items-center justify-between">
                <span className="text-[9px] text-[#DC9300] uppercase font-bold">Alt</span>
                <span className="text-xs text-[#EEEFE9] font-mono">12,847</span>
              </div>

              {/* Temperature readout */}
              <div className="bg-[#1a1a1a] border border-[#4B4B4B] rounded px-3 py-2 flex items-center justify-between">
                <span className="text-[9px] text-[#1D4AFF] uppercase font-bold">Temp</span>
                <span className="text-xs text-[#EEEFE9] font-mono">-273°C</span>
              </div>

              {/* Status LEDs */}
              <div className="flex gap-2 justify-center mt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#0F0] shadow-[0_0_8px_#0F0]" />
                  <span className="text-[7px] text-[#EEEFE9]/60">SYS</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#0F0] shadow-[0_0_8px_#0F0]" />
                  <span className="text-[7px] text-[#EEEFE9]/60">PWR</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#DC9300] shadow-[0_0_8px_#DC9300]" />
                  <span className="text-[7px] text-[#EEEFE9]/60">WRN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

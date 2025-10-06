"use client"

import { useState } from "react"
import { SpaceHogGame } from "@/components/space-hog-game"
import { MemoryCard } from "@/components/memory-card"
import { CockpitDashboard } from "@/components/cockpit-dashboard"
import { workExperiences } from "@/lib/work-experiences"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { posthog } from "@/lib/posthog"

export default function Home() {
  const [unlockedMemories, setUnlockedMemories] = useState<number[]>([])
  const [viewingMemory, setViewingMemory] = useState<number | null>(null)

  // Get company logo path
  const getCompanyLogo = (company: string): string => {
    const logoMap: { [key: string]: string } = {
      "CappaWork": "/Logos/CappaWork Logos.png",
      "Entromy": "/Logos/entromy.png",
      "Eagle Hill Consulting": "/Logos/EHC_Logo_Primary.svg",
      "CVS Health; Omnicare": "/Logos/CVS.png",
      "Dana-Farber Harvard Cancer Center": "/Logos/danaFarber logo.png",
    }
    return logoMap[company] || ""
  }

  const handleMemoryUnlocked = (memoryIndex: number) => {
    if (!unlockedMemories.includes(memoryIndex)) {
      setUnlockedMemories([...unlockedMemories, memoryIndex])
    }
  }

  const handleCardClick = (memoryIndex: number) => {
    setViewingMemory(memoryIndex)
    posthog.capture('memory_reopened', {
      memory_index: memoryIndex,
      company: workExperiences[memoryIndex]?.company
    })
  }

  const handleReset = () => {
    setUnlockedMemories([])
    setViewingMemory(null)
  }

  const sendTestEvent = () => {
    posthog.capture('test_event', { 
      property: 'test_value',
      timestamp: new Date().toISOString(),
      message: 'Manual test from SpaceHog Spiff'
    })
    alert('Test event sent to PostHog! Check your PostHog dashboard.')
  }

  return (
    <div className="min-h-screen bg-[#151515] flex flex-col">
      <header className="py-6 text-center border-b-2 border-[#F54E00] relative">
        {/* Test button - top right corner */}
        <button
          onClick={sendTestEvent}
          className="absolute top-4 right-4 px-3 py-1 text-xs bg-[#F54E00] hover:bg-[#DC9300] text-white rounded border border-[#EEEFE9] transition-colors"
          title="Send test event to PostHog"
        >
          📊 Test Analytics
        </button>
        <h1
          className="text-5xl md:text-6xl font-bold tracking-wider"
          style={{
            fontFamily: "monospace",
            textShadow: "3px 3px 0px #DC9300, 6px 6px 0px #F54E00",
            background: "linear-gradient(180deg, #F54E00 0%, #DC9300 50%, #EEEFE9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          SPACEHOG SPIFF'S MISSION
        </h1>
      </header>

      <div className="flex-1 flex">
        {/* Main cockpit view - game window and controls */}
        <div className="flex-1 flex flex-col">
          {/* Game Window - The "windshield" */}
          <div className="flex-1 bg-[#151515] p-4 lg:p-8 flex items-center justify-center relative">
            {/* Windshield frame effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#2C2C2C] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#2C2C2C] to-transparent" />
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#2C2C2C] to-transparent" />
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#2C2C2C] to-transparent" />
            </div>

            <div className="w-full max-w-4xl z-10">
              <div className="mb-4 text-center">
                <p className="text-[#EEEFE9]/70 text-sm">
                  Help SpaceHog Spiff defeat the PDfff aliens and unlock NateHog's memories!
                </p>
                <p className="text-xs text-[#EEEFE9]/60 mt-2">Use ← → to rotate, SPACE to shoot</p>
              </div>

              <SpaceHogGame
                onMemoryUnlocked={handleMemoryUnlocked}
                unlockedMemories={unlockedMemories}
                onCardClick={handleCardClick}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Cockpit Dashboard - wraps underneath the window */}
          <div className="border-t-2 border-[#4B4B4B]">
            <CockpitDashboard />
          </div>
        </div>

        {/* Right Panel - Unlocked Memories */}
        <div className="w-80 border-l border-[#4B4B4B] bg-[#2C2C2C] p-4 lg:p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#EEEFE9] mb-4">
            Unlocked Memories ({unlockedMemories.length}/{workExperiences.length})
          </h2>

          {unlockedMemories.length === 0 ? (
            <p className="text-[#EEEFE9]/60 text-sm">Shoot down spaceships to unlock NateHog's work experiences!</p>
          ) : (
            <div className="space-y-4">
              {unlockedMemories.map((index) => (
                <MemoryCard key={index} experience={workExperiences[index]} onClick={() => handleCardClick(index)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={viewingMemory !== null} onOpenChange={() => setViewingMemory(null)}>
        <DialogContent className="bg-[#EEEFE9] dark:bg-[#151515] border-[#F54E00] border-2 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#F54E00] font-bold flex items-center gap-3 justify-center">
              <img src="/natehog.png" alt="NateHog" className="w-10 h-10 rounded-full" />
              Work Experience
            </DialogTitle>
          </DialogHeader>
          {viewingMemory !== null && (
            <div className="space-y-4 text-[#151515] dark:text-[#EEEFE9]">
              {/* Company name with logo */}
              <div className="flex items-center gap-4 justify-center">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-[#F54E00] p-2">
                  <img 
                    src={getCompanyLogo(workExperiences[viewingMemory].company)} 
                    alt={`${workExperiences[viewingMemory].company} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-3xl font-bold">{workExperiences[viewingMemory].company}</h3>
              </div>
              
              <div className="border-t-2 border-[#F54E00] pt-4">
                <p className="text-lg font-semibold">{workExperiences[viewingMemory].title}</p>
                <p className="text-sm text-[#151515]/70 dark:text-[#EEEFE9]/70 mb-2">
                  {workExperiences[viewingMemory].period}
                </p>
                <p className="text-sm leading-relaxed">{workExperiences[viewingMemory].description}</p>
                {workExperiences[viewingMemory].achievements && (
                  <ul className="list-disc list-inside space-y-1 text-sm mt-3">
                    {workExperiences[viewingMemory].achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <Button onClick={() => setViewingMemory(null)} className="bg-[#F54E00] hover:bg-[#F54E00]/90 text-white">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

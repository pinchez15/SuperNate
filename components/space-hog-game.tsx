"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { workExperiences } from "@/lib/work-experiences"
import { posthog } from "@/lib/posthog"

interface SpaceHogGameProps {
  onMemoryUnlocked: (memoryIndex: number) => void
  unlockedMemories: number[]
  onCardClick: (memoryIndex: number) => void
  onReset: () => void
  thrustersActive: boolean
}

interface Spaceship {
  x: number
  y: number
  hits: number
  memoryIndex: number
  speed: number
  direction: number
}

interface Laser {
  x: number
  y: number
  angle: number
}

interface Paper {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
}

interface Star {
  x: number
  y: number
  size: number
  speed: number
}

interface Flame {
  x: number
  y: number
  vy: number
  life: number
}

export function SpaceHogGame({ onMemoryUnlocked, unlockedMemories, onCardClick, onReset, thrustersActive }: SpaceHogGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentMemory, setCurrentMemory] = useState<number | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [spaceHogImage, setSpaceHogImage] = useState<HTMLImageElement | null>(null)
  const [spaceshipImage, setSpaceshipImage] = useState<HTMLImageElement | null>(null)
  const [storyMode, setStoryMode] = useState(true)
  const [storyIndex, setStoryIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const laserSoundRef = useRef<HTMLAudioElement | null>(null)
  const hitSoundRef = useRef<HTMLAudioElement | null>(null)
  const congratsSoundRef = useRef<HTMLAudioElement | null>(null)

  const playerAngleRef = useRef(0)
  const lasersRef = useRef<Laser[]>([])
  const spaceshipsRef = useRef<Spaceship[]>([])
  const papersRef = useRef<Paper[]>([])
  const starsRef = useRef<Star[]>([])
  const flamesRef = useRef<Flame[]>([])
  const keysPressed = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number>()

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isTouchDevice || isMobileUA)
    }
    checkMobile()
  }, [])

  useEffect(() => {
    // Background music (looping)
    const bgMusic = new Audio("/audio/SpacehogSpiff.mp3")
    bgMusic.loop = true
    bgMusic.volume = 0.24
    bgMusicRef.current = bgMusic

    // Laser sound effect
    const laserSound = new Audio("/audio/pew.mp3")
    laserSound.volume = 0.12
    laserSoundRef.current = laserSound

    // Hit sound effect
    const hitSound = new Audio("/audio/zing.mp3")
    hitSound.volume = 0.48
    hitSoundRef.current = hitSound

    // Congratulations sound effect
    const congratsSound = new Audio("/audio/Congratulations.m4a")
    congratsSound.volume = 0.48
    congratsSoundRef.current = congratsSound

    return () => {
      bgMusic.pause()
      bgMusic.src = ""
      laserSound.src = ""
      hitSound.src = ""
      congratsSound.src = ""
    }
  }, [])

  useEffect(() => {
    if (!storyMode && bgMusicRef.current) {
      bgMusicRef.current.play().catch(() => {
        // Autoplay might be blocked, user will need to interact first
      })
    }
  }, [storyMode])

  // Load SpaceHog image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/spacehog.png"
    img.onload = () => setSpaceHogImage(img)
  }, [])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/spaceship.png"
    img.onload = () => setSpaceshipImage(img)
  }, [])

  useEffect(() => {
    const stars: Star[] = []
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
      })
    }
    starsRef.current = stars
  }, [])

  // Initialize spaceships
  useEffect(() => {
    const availableMemories = workExperiences
      .map((_, index) => index)
      .filter((index) => !unlockedMemories.includes(index))

    const ships: Spaceship[] = availableMemories.map((memoryIndex, i) => ({
      x: 100 + ((i * 150) % 600),
      y: 50 + Math.floor(i / 4) * 100,
      hits: 0,
      memoryIndex,
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
    }))

    spaceshipsRef.current = ships
  }, [unlockedMemories])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (storyMode && e.key === " ") {
        e.preventDefault()
        if (storyIndex < STORY_PARTS.length - 1) {
          setStoryIndex(storyIndex + 1)
        } else {
          setStoryMode(false)
          posthog.capture('game_started', {
            story_completed: true
          })
        }
        return
      }

      if (storyMode) return // Don't process game controls during story

      keysPressed.current.add(e.key)

      if (e.key === " ") {
        e.preventDefault()
        fireLaser()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [storyMode, storyIndex])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gameLoop = () => {
      // Update stars with speed boost from thrusters
      const starSpeedMultiplier = thrustersActive ? 3 : 1
      starsRef.current = starsRef.current.map((star) => {
        let newY = star.y + star.speed * starSpeedMultiplier
        if (newY > 600) {
          newY = 0
        }
        return { ...star, y: newY }
      })

      if (!storyMode) {
        // Generate flames when thrusters are active
        if (thrustersActive && Math.random() < 0.3) {
          flamesRef.current.push({
            x: 400 + (Math.random() - 0.5) * 30,
            y: 550,
            vy: Math.random() * 3 + 2,
            life: 1.0
          })
        }

        // Update flames
        flamesRef.current = flamesRef.current
          .map((flame) => ({
            ...flame,
            y: flame.y + flame.vy,
            life: flame.life - 0.02
          }))
          .filter((flame) => flame.life > 0 && flame.y < 600)

        // Update player rotation
        if (keysPressed.current.has("ArrowLeft")) {
          playerAngleRef.current -= 0.05
        }
        if (keysPressed.current.has("ArrowRight")) {
          playerAngleRef.current += 0.05
        }

        // Update lasers
        lasersRef.current = lasersRef.current
          .map((laser) => ({
            ...laser,
            x: laser.x + Math.sin(laser.angle) * 8,
            y: laser.y - Math.cos(laser.angle) * 8,
          }))
          .filter((laser) => laser.y > 0 && laser.x > 0 && laser.x < 800)

        // Update spaceships
        spaceshipsRef.current = spaceshipsRef.current.map((ship) => {
          const newX = ship.x + Math.cos(ship.direction) * ship.speed
          const newY = ship.y + Math.sin(ship.direction) * ship.speed
          let newDirection = ship.direction

          // Bounce off walls
          if (newX < 50 || newX > 750) {
            newDirection = Math.PI - ship.direction
          }
          if (newY < 30 || newY > 400) {
            newDirection = -ship.direction
          }

          return {
            ...ship,
            x: newX,
            y: newY,
            direction: newDirection,
          }
        })

        // Update papers
        papersRef.current = papersRef.current
          .map((paper) => ({
            ...paper,
            x: paper.x + paper.vx,
            y: paper.y + paper.vy,
            vy: paper.vy + 0.2, // gravity
            rotation: paper.rotation + paper.rotationSpeed,
          }))
          .filter((paper) => paper.y < 600)

        // Check collisions
        const lasersToRemove: number[] = []

        spaceshipsRef.current = spaceshipsRef.current.map((ship) => {
          if (ship.x < -100) return ship // Already destroyed

          const laserIndex = lasersRef.current.findIndex((laser, idx) => {
            if (lasersToRemove.includes(idx)) return false
            const dx = laser.x - ship.x
            const dy = laser.y - ship.y
            return Math.sqrt(dx * dx + dy * dy) < 40
          })

          if (laserIndex !== -1) {
            lasersToRemove.push(laserIndex)

            if (hitSoundRef.current) {
              hitSoundRef.current.currentTime = 0
              hitSoundRef.current.play().catch(() => {})
            }

            // Create flying papers
            papersRef.current.push(
              ...Array.from({ length: 5 }, () => ({
                x: ship.x,
                y: ship.y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 8 - 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
              })),
            )

            const newHits = ship.hits + 1

            if (newHits >= 2) {
              // Memory unlocked!
              setTimeout(() => {
                setCurrentMemory(ship.memoryIndex)
                posthog.capture('memory_unlocked', {
                  memory_index: ship.memoryIndex,
                  company: workExperiences[ship.memoryIndex]?.company
                })
              }, 100)
              return { ...ship, hits: newHits, x: -1000 } // Move off screen
            }

            return { ...ship, hits: newHits }
          }

          return ship
        })

        // Remove hit lasers
        lasersRef.current = lasersRef.current.filter((_, idx) => !lasersToRemove.includes(idx))
      }

      // Clear canvas
      ctx.fillStyle = "#151515"
      ctx.fillRect(0, 0, 800, 600)

      ctx.fillStyle = "#EEEFE9"
      starsRef.current.forEach((star) => {
        ctx.globalAlpha = 0.8
        ctx.fillRect(star.x, star.y, star.size, star.size)
      })
      ctx.globalAlpha = 1

      if (storyMode) {
        // Draw zoomed in SpaceHog Spiff
        ctx.save()
        ctx.translate(400, 300)

        if (spaceHogImage) {
          ctx.drawImage(spaceHogImage, -100, -100, 200, 200)
        }

        // Draw speech bubble
        const bubbleWidth = 500
        const bubbleHeight = 150
        const bubbleX = -250
        const bubbleY = -280

        // Bubble background
        ctx.fillStyle = "#EEEFE9"
        ctx.strokeStyle = "#151515"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20)
        ctx.fill()
        ctx.stroke()

        // Bubble pointer
        ctx.beginPath()
        ctx.moveTo(0, -100)
        ctx.lineTo(-30, -130)
        ctx.lineTo(30, -130)
        ctx.closePath()
        ctx.fillStyle = "#EEEFE9"
        ctx.fill()
        ctx.stroke()

        // Story text
        ctx.fillStyle = "#151515"
        ctx.font = "18px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const words = STORY_PARTS[storyIndex].split(" ")
        let line = ""
        let y = bubbleY + 40
        const maxWidth = bubbleWidth - 40

        words.forEach((word) => {
          const testLine = line + word + " "
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, 0, y)
            line = word + " "
            y += 25
          } else {
            line = testLine
          }
        })
        ctx.fillText(line, 0, y)

        // Instruction text - positioned below hedgehog
        ctx.font = "bold 18px monospace"
        ctx.fillStyle = "#F54E00"
        const instructionText = isMobile ? "Tap to continue" : "Press SPACE to continue"
        ctx.fillText(instructionText, 0, 150)

        ctx.restore()
      } else {
        spaceshipsRef.current.forEach((ship) => {
          if (ship.x < -100) return

          // Draw spaceship image
          if (spaceshipImage) {
            ctx.save()
            ctx.translate(ship.x, ship.y)
            ctx.drawImage(spaceshipImage, -40, -30, 80, 60)
            ctx.restore()
          }

          // Papers on spaceship
          const paperCount = 3 - ship.hits
          for (let i = 0; i < paperCount; i++) {
            ctx.fillStyle = "#EEEFE9"
            ctx.strokeStyle = "#151515"
            ctx.lineWidth = 1

            const offsetX = (i - 1) * 15
            ctx.fillRect(ship.x + offsetX - 10, ship.y - 15, 20, 25)
            ctx.strokeRect(ship.x + offsetX - 10, ship.y - 15, 20, 25)

            // Jargon lines
            ctx.strokeStyle = "#151515"
            ctx.lineWidth = 1
            for (let j = 0; j < 4; j++) {
              ctx.beginPath()
              ctx.moveTo(ship.x + offsetX - 8, ship.y - 10 + j * 5)
              ctx.lineTo(ship.x + offsetX + 8, ship.y - 10 + j * 5)
              ctx.stroke()
            }
          }
        })

        // Draw flying papers
        papersRef.current.forEach((paper) => {
          ctx.save()
          ctx.translate(paper.x, paper.y)
          ctx.rotate(paper.rotation)
          ctx.fillStyle = "#EEEFE9"
          ctx.fillRect(-10, -12, 20, 24)
          ctx.strokeStyle = "#151515"
          ctx.strokeRect(-10, -12, 20, 24)
          ctx.restore()
        })

        // Draw lasers
        ctx.strokeStyle = "#F54E00"
        ctx.lineWidth = 3
        lasersRef.current.forEach((laser) => {
          ctx.beginPath()
          ctx.moveTo(laser.x, laser.y)
          ctx.lineTo(laser.x + Math.sin(laser.angle) * 20, laser.y - Math.cos(laser.angle) * 20)
          ctx.stroke()
        })

        // Draw flames (when thrusters active)
        flamesRef.current.forEach((flame) => {
          ctx.font = `${20 * flame.life}px sans-serif`
          ctx.globalAlpha = flame.life
          ctx.fillText("🔥", flame.x - 10, flame.y)
        })
        ctx.globalAlpha = 1

        // Draw player (SpaceHog Spiff)
        ctx.save()
        ctx.translate(400, 550)
        ctx.rotate(playerAngleRef.current)

        if (spaceHogImage) {
          ctx.drawImage(spaceHogImage, -30, -30, 60, 60)
        } else {
          // Fallback if image not loaded
          ctx.fillStyle = "#1D4AFF"
          ctx.beginPath()
          ctx.moveTo(0, -25)
          ctx.lineTo(-20, 25)
          ctx.lineTo(20, 25)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [spaceHogImage, spaceshipImage, storyMode, storyIndex, thrustersActive])

  // Check if game is complete
  useEffect(() => {
    if (unlockedMemories.length === workExperiences.length && unlockedMemories.length > 0) {
      setTimeout(() => {
        setGameComplete(true)
        posthog.capture('game_completed', {
          total_memories: workExperiences.length
        })
        // Play congratulations sound
        if (congratsSoundRef.current) {
          congratsSoundRef.current.currentTime = 0
          congratsSoundRef.current.play().catch(() => {})
        }
      }, 500)
    }
  }, [unlockedMemories])

  const handleCloseModal = () => {
    if (currentMemory !== null) {
      onMemoryUnlocked(currentMemory)
      setCurrentMemory(null)
    }
  }

  const fireLaser = () => {
    lasersRef.current.push({
      x: 400,
      y: 550,
      angle: playerAngleRef.current,
    })

    if (laserSoundRef.current) {
      laserSoundRef.current.currentTime = 0
      laserSoundRef.current.play().catch(() => {})
    }
  }

  const handleRotateLeft = () => {
    playerAngleRef.current -= 0.1
  }

  const handleRotateRight = () => {
    playerAngleRef.current += 0.1
  }

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

  const handlePlayAgain = () => {
    // Stop background music
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current.currentTime = 0
    }

    // Reset game state
    setGameComplete(false)
    setStoryMode(true)
    setStoryIndex(0)
    playerAngleRef.current = 0
    lasersRef.current = []
    spaceshipsRef.current = []
    papersRef.current = []

    // Reset stars
    const stars: Star[] = []
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
      })
    }
    starsRef.current = stars

    // Call parent reset to clear unlocked memories
    onReset()
  }

  const STORY_PARTS = [
    "I'm SpaceHog Spiff. I've been traveling the universe in search of my hero friend NateHog.",
    "NateHog is a brilliant, creative, hardworking guy and he's been captured by the boring PDfffff aliens from the evil planet ReSume! They've stolen his memory!",
    "They put his memories in spaceships to send to the four corners of the galaxy.",
    "Help me blast the PDfffff aliens to free NateHog and his memories from their synergistic clutches (and find the easter eggs)!",
  ]

  // Handle mobile canvas tap to shoot
  const handleCanvasTap = () => {
    if (storyMode) {
      // Progress story on tap
      if (storyIndex < STORY_PARTS.length - 1) {
        setStoryIndex(storyIndex + 1)
      } else {
        setStoryMode(false)
      }
    } else {
      // Fire laser on tap
      fireLaser()
    }
  }

  return (
    <>
      {isMobile && (
        <div className="bg-[#DC9300] text-[#151515] text-center py-2 px-4 mb-2 rounded text-sm font-bold">
          📱 Turn your device sideways for the best experience!
        </div>
      )}
      
      <div className="relative bg-[#151515] rounded-lg overflow-hidden shadow-2xl border-4 border-[#2C2C2C]">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full h-auto"
          onClick={isMobile ? handleCanvasTap : undefined}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      {isMobile && !storyMode && (
        <div className="flex gap-4 justify-center mt-4">
          {/* Rotate Left Button */}
          <button
            onTouchStart={handleRotateLeft}
            className="bg-[#F54E00] hover:bg-[#F54E00]/90 text-white font-bold py-6 px-8 rounded-lg text-xl shadow-lg active:scale-95 transition-transform"
            style={{ touchAction: 'none' }}
          >
            ← AIM LEFT
          </button>
          
          {/* Rotate Right Button */}
          <button
            onTouchStart={handleRotateRight}
            className="bg-[#F54E00] hover:bg-[#F54E00]/90 text-white font-bold py-6 px-8 rounded-lg text-xl shadow-lg active:scale-95 transition-transform"
            style={{ touchAction: 'none' }}
          >
            AIM RIGHT →
          </button>
        </div>
      )}
      
      {isMobile && !storyMode && (
        <p className="text-center text-[#EEEFE9]/70 text-sm mt-3">
          Tap canvas to shoot • Use buttons to aim
        </p>
      )}

      {/* Memory unlocked modal */}
      <Dialog open={currentMemory !== null} onOpenChange={() => handleCloseModal()}>
        <DialogContent className="bg-[#EEEFE9] dark:bg-[#151515] border-[#F54E00] border-2 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#F54E00] font-bold flex items-center gap-3 justify-center">
              <img src="/natehog.png" alt="NateHog" className="w-10 h-10 rounded-full" />
              You unlocked a work experience!
            </DialogTitle>
          </DialogHeader>
          {currentMemory !== null && (
            <div className="space-y-4 text-[#151515] dark:text-[#EEEFE9]">
              {/* Company name with logo */}
              <div className="flex items-center gap-4 justify-center">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-[#F54E00] p-2">
                  <img 
                    src={getCompanyLogo(workExperiences[currentMemory].company)} 
                    alt={`${workExperiences[currentMemory].company} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-3xl font-bold">{workExperiences[currentMemory].company}</h3>
              </div>
              
              <div className="border-t-2 border-[#F54E00] pt-4">
                <p className="text-lg font-semibold">{workExperiences[currentMemory].title}</p>
                <p className="text-sm text-[#151515]/70 dark:text-[#EEEFE9]/70 mb-2">
                  {workExperiences[currentMemory].period}
                </p>
                <p className="text-sm leading-relaxed">{workExperiences[currentMemory].description}</p>
                {workExperiences[currentMemory].achievements && (
                  <ul className="list-disc list-inside space-y-1 text-sm mt-3">
                    {workExperiences[currentMemory].achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <Button onClick={handleCloseModal} className="bg-[#F54E00] hover:bg-[#F54E00]/90 text-white">
            Continue Mission
          </Button>
        </DialogContent>
      </Dialog>

      {/* Game complete modal */}
      <Dialog open={gameComplete} onOpenChange={setGameComplete}>
        <DialogContent className="bg-[#EEEFE9] dark:bg-[#151515] border-[#F54E00] border-2 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#F54E00] font-bold text-center">Mission Complete!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <img
              src="/NateHooray.png"
              alt="Thank you!"
              className="w-full rounded-lg"
            />
            <h3 className="text-xl font-bold text-[#151515] dark:text-[#EEEFE9]">Thank you, PostHog team! 🦔</h3>
            <p className="text-[#151515]/70 dark:text-[#EEEFE9]/70">
              You've successfully helped SpaceHog Spiff rescue all of NateHog's memories! I'd love to join you to bring this kind of
              creativity and technical skill to the wacky PostHog team! 🦔 
            </p>
            
            {/* Resume Preview Card */}
            <a
              href="/NateHog-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block mx-auto max-w-sm group"
              onClick={() => posthog.capture('resume_viewed')}
            >
              <div className="bg-white dark:bg-[#2C2C2C] p-4 rounded-lg border-2 border-[#F54E00] hover:border-[#DC9300] transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-32 bg-[#EEEFE9] rounded border border-[#D0D1C9] overflow-hidden">
                    <img
                      src="/resume-preview.png"
                      alt="Resume Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-[#F54E00] mb-1">📄 View Full Resume</p>
                    <p className="text-xs text-[#151515]/60 dark:text-[#EEEFE9]/60">
                      Click to open PDF in new tab
                    </p>
                    <div className="mt-2 text-xs text-[#F54E00] group-hover:text-[#DC9300] flex items-center gap-1">
                      <span>Open Resume</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
          <Button onClick={handlePlayAgain} className="bg-[#F54E00] hover:bg-[#F54E00]/90 text-white">
            Play Again
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

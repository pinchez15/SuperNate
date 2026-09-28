"use client"

import { ResumeShooter } from "@/components/resume-shooter"
import dynamic from "next/dynamic"
import { useState } from "react"

const NateTown = dynamic(() => import("@/components/town/nate-town").then((m) => m.NateTown), { ssr: false })

export default function Home() {
  const [era, setEra] = useState<"64" | "1987">("64")
  if (era === "1987") return <ResumeShooter onBack={() => setEra("64")} />
  return <NateTown onEnter1987={() => setEra("1987")} />
}

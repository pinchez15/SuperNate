"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkExperience } from "@/lib/work-experiences"

interface MemoryCardProps {
  experience: WorkExperience
  onClick: () => void
}

export function MemoryCard({ experience, onClick }: MemoryCardProps) {
  return (
    <Card
      className="bg-[#EEEFE9] dark:bg-[#151515] border-[#D0D1C9] dark:border-[#4B4B4B] cursor-pointer hover:border-[#F54E00] transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#151515] dark:text-[#EEEFE9]">{experience.title}</CardTitle>
        <p className="text-xs text-[#151515]/60 dark:text-[#EEEFE9]/60">
          {experience.company} • {experience.period}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-[#151515]/80 dark:text-[#EEEFE9]/80 leading-relaxed">{experience.description}</p>
      </CardContent>
    </Card>
  )
}

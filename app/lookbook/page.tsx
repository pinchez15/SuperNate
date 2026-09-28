"use client"

import dynamic from "next/dynamic"

const Lookbook = dynamic(() => import("@/components/town/lookbook").then((m) => m.Lookbook), { ssr: false })

export default function LookbookPage() {
  return <Lookbook />
}

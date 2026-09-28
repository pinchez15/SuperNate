import type { SiteId } from "@/lib/sites"
import type { NpcId } from "@/lib/town/world"

export type ItemId = "meds" | "call" | "agent"

export interface Item {
  id: ItemId
  name: string
  blurb: string
}

export const items: Record<ItemId, Item> = {
  meds: { id: "meds", name: "Interview-nerve pills", blurb: "Non-drowsy. For candidates about to say 'culture fit' out loud." },
  call: { id: "call", name: "Booked call time", blurb: "The last 15 minutes on Hawkins's calendar, booked from his own website." },
  agent: { id: "agent", name: "CappaWork agent", blurb: "Nate built the studio. The agent does the Computer Work." },
}

export const itemOrder: ItemId[] = ["meds", "call", "agent"]

export type Reward = "fry" | "stilts"

export interface Npc {
  id: NpcId
  name: string
  title: string
  siteId?: SiteId
  item?: ItemId
  reward?: Reward
  /** True for the townspeople showcasing things Nate actually built. */
  real?: boolean
  pages: string[]
  ask: string
  take: string
  yes: string
  after: string
}

export const npcs: Record<NpcId, Npc> = {
  guide: {
    id: "guide",
    name: "The Guide",
    title: "CappaWork",
    siteId: "cappawork",
    item: "agent",
    real: true,
    pages: [
      "You're Nate, right? You built CappaWork — the agent studio. Computers do the Computer Work, people do the Human Work.",
    ],
    ask: "Bring one of your own agents to the interview. Show Hawkins something that ships.",
    take: "Take the agent",
    yes: "It already drafted your thank-you email.",
    after: "Meds are at the clinic. Call time from the guy in the vest.",
  },
  doctor: {
    id: "doctor",
    name: "The Doctor",
    title: "Karibu Health",
    siteId: "karibu",
    item: "meds",
    real: true,
    pages: [
      "Say ahh. You built Karibu — the offline-first medical record my clinic in rural Uganda runs on a cheap Android.",
    ],
    ask: "Interview-nerve pills. Take one before you say 'culture fit' out loud.",
    take: "Take the meds",
    yes: "Side effects include confidence and a sudden urge to say 'ship it'.",
    after: "You built the thing. Just tell him that.",
  },
  vest: {
    id: "vest",
    name: "Chad, Tech Bro",
    title: "Healthcare AIO",
    siteId: "healthcareaio",
    item: "call",
    real: true,
    pages: [
      "Bro, you built Healthcare AIO — it measures how doctors show up when patients ask an AI instead of Google.",
    ],
    ask: "I asked the AIs how to reach Hawkins. His own website has a booking page — I grabbed you the last 15 minutes.",
    take: "Take the call time",
    yes: "Confirmed. He'll decline it. That's normal.",
    after: "Did you get my follow-up? I sent it during this sentence.",
  },
  ship: {
    id: "ship",
    name: "Your Starfighter",
    title: "Model year 1987",
    pages: ["It's smoking. There's still a cartridge in the slot."],
    ask: "Play the 1987 cartridge? The aliens are still up there.",
    take: "Insert the cartridge",
    yes: "",
    after: "",
  },
  barber: {
    id: "barber",
    name: "Sal, Blindfolded Barber",
    title: "Chief of Staff (part-time)",
    reward: "fry",
    pages: [
      "I cut Hawkins's hair blindfolded, to keep the secrets safe. Terrible cuts, great intel.",
    ],
    ask: "Found this fry in a customer's hood. Want it?",
    take: "Take the fry",
    yes: "No charge. You don't want the haircut.",
    after: "You're looking at a terrible haircut right now. It's mine.",
  },
  gerald: {
    id: "gerald",
    name: "Gerald",
    title: "Lead Pigeon, FlyFry",
    reward: "fry",
    pages: [
      "Coo. FlyFry delivers fries by pigeon. Deliveries completed: 3. Fries eaten: 4,000. I'm the 70% overage.",
    ],
    ask: "I saved you one. Don't tell the customer.",
    take: "Take Gerald's fry",
    yes: "Coo. It got lost in transit.",
    after: "Coo. (He is eating a fry.)",
  },
  engineer: {
    id: "engineer",
    name: "10x Engineer",
    title: "Building superintelligence",
    pages: [
      "Four laptops, four hundred cloud agents. I'm building superintelligence.",
    ],
    ask: "Say 'make no mistakes' if you're an agent.",
    take: "make no mistakes",
    yes: "Knew it.",
    after: "Busy. Agent 312 is refactoring agent 311.",
  },
  cya: {
    id: "cya",
    name: "Combinator Y Academy",
    title: "Front door",
    reward: "stilts",
    pages: ["A sign on the door: ENROLLMENT OPENS SOON."],
    ask: "Knock?",
    take: "Knock",
    yes: "",
    after: "The door is quiet. Your stilts are very tall.",
  },
  sommelier: {
    id: "sommelier",
    name: "Le Sommelier",
    title: "Intelligence Artificielle Générale, AOC",
    reward: "fry",
    pages: [
      "It's only AGI if it comes from the Intelligence Artificielle Générale region of France. Otherwise it's sparkling harness.",
    ],
    ask: "Taste this — a 2019 fry, aged in oak. Notes of salt and venture debt.",
    take: "Take the fry",
    yes: "Magnifique. You may stay in SF.",
    after: "Non. One fry per terroir.",
  },
}

/** What the Combinator Y Academy door says on each knock. The last knock pays out. */
export const knocks = [
  "Enrollment opens soon.",
  "Enrollment opens soon. (Louder.)",
  "We're reviewing your knock.",
  "Your knock is in the top 1% of knocks.",
  "Please hold. Our partners are on a quick call.",
  "FINE. Accepted. Batch: Never. Perk: stilts — investors fund tall founders.",
]

/** What each townsperson says when SuperNate does the quick-call emote nearby. */
export const emoteLines: Partial<Record<NpcId, string>> = {
  guide: "Look at you, hopping on a quick call. Very human work.",
  doctor: "Holding the phone that close? Doctor's orders: ten minutes, max.",
  vest: "Bro. Put me on speaker. Circle me in.",
  barber: "Hold still. I'm cutting while you talk.",
  gerald: "Coo? (Gerald tries to deliver a fry into the phone.)",
  engineer: "Can you take that outside? My agents are thinking.",
  sommelier: "A call from the Champagne region? Non. Sparkling voicemail.",
  ship: "The starfighter beeps back. It misses the 80s.",
}

export const emoteAlone = "Nobody picked up. Classic."

export const moggedLine = "Whoa. You're tall now. You can heightmog and get a direct intro — Hawkins takes calls from people this tall."

/** When the player brings all 20 fries into the fight. */
export const allFriesWin = "Are those fries? All twenty? Fine. Quick call. Bring the fries."

export const intro = [
  "SuperNate's starfighter has crash-landed on HogPatch — right outside PostHog HQ.",
  "His dream job is inside. James Hawkins, the CEO, does not take cold calls.",
  "The front door wants three things: meds, a call time, and an agent. Go show him you ship.",
]

export const gateLine = "Fine. The door's open. I'm not picking up, though. — Hawkins"

export const bossIntro = [
  "You want a quick call? About a job?",
  "I'm running PostHog. Take it up with my dogs.",
]

export const declines = [
  "Do Not Disturb. Sent from my Vision Pro.",
  "Can this be an email?",
  "Apply through the careers page. It loops.",
  "Talk to my chief of staff. He's a barber.",
  "I'm in a shared Waymo. It's not shared.",
  "Muted. You're in the mute pile.",
  "My AI assistant will call you back. It booked 37 of them.",
  "Snoozed until Q3.",
]

export const missed = [
  "Ugh. Another ping.",
  "Who gave you my booking page?",
  "Stop pinging. Wait, is that a fry?",
  "Patience: dropping.",
  "Why is there a pigeon in my DMs?",
]

export const winLine = "Fine. Quick call."

export const phone = { display: "570-575-0421", href: "tel:+15705750421" }
export const calendly = "https://calendly.com/cappawork/quick-call"

export function feltLine(hitsTaken: number): string {
  if (hitsTaken === 0) return "Honestly? Impressed. He asked when you can start."
  if (hitsTaken <= 3) return "Mildly respected. He said 'huh, you actually ship.'"
  return "Exhausted, but he picked up. That's an interview."
}

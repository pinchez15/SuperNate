import type { SiteId } from "@/lib/sites"
import type { NpcId } from "@/lib/town/world"

export type ItemId = "meds" | "call" | "agent"

export interface Item {
  id: ItemId
  name: string
  blurb: string
}

export const items: Record<ItemId, Item> = {
  meds: { id: "meds", name: "Pitch-nerve pills", blurb: "Non-drowsy. For founders about to say 'pigeons' out loud." },
  call: { id: "call", name: "Booked call time", blurb: "15 minutes, booked on HedgeHawkins's own website. He forgot it had a booking page." },
  agent: { id: "agent", name: "CappaWork agent", blurb: "It does the Computer Work. You do the Human Work." },
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
    title: "CappaWork · Agent Builder",
    siteId: "cappawork",
    item: "agent",
    pages: [
      "The mansion door wants three things: meds, a booked call, and an agent. I build the agents — CappaWork.",
    ],
    ask: "Take this one. It does the Computer Work so you can do the Human Work.",
    take: "Take the agent",
    yes: "It already drafted three follow-ups. Sorry.",
    after: "Meds are at the clinic. The call time? Ask the vest.",
  },
  doctor: {
    id: "doctor",
    name: "The Doctor",
    title: "Karibu Health",
    siteId: "karibu",
    item: "meds",
    pages: [
      "Say ahh. Karibu is my medical record — offline-first, runs on a budget Android, built for clinics in rural Uganda.",
    ],
    ask: "Pitch-nerve pills. Take one before you say 'pigeons' out loud.",
    take: "Take the meds",
    yes: "Side effects include confidence and a sudden urge to say 'TAM'.",
    after: "One pill per pigeon. You'll be fine.",
  },
  vest: {
    id: "vest",
    name: "Chad, Tech Bro",
    title: "Healthcare AIO",
    siteId: "healthcareaio",
    item: "call",
    pages: [
      "Bro. Patients don't Google anymore, they ask an AI — Healthcare AIO measures how you show up in the answer.",
    ],
    ask: "I asked the AIs how to reach HedgeHawkins. His own website has a booking page — I grabbed you the last 15 minutes.",
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
      "I cut HedgeHawkins's hair blindfolded, to keep the secrets safe. Terrible cuts, great intel.",
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
      "Coo. Deliveries completed: 3. Fries eaten: 4,000. I'm the 70% overage.",
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

export const moggedLine = "Whoa. You've been heightmogged. Is that the king of CRMs?"

/** When the player brings all 20 fries into the fight. */
export const allFriesWin = "Are those fries? All twenty? Fine. Quick call. And a term sheet."

export const intro = [
  "SuperNate's starfighter has crash-landed on HogPatch.",
  "He has an idea: FlyFry. Fries, delivered by carrier pigeon, each one individually wrapped.",
  "Only one hedgehog can fund it: HedgeHawkins, CEO of the B2B Mansion. He won't take a quick call.",
]

export const gateLine = "Fine. The mansion's open. I'm not picking up, though. — HedgeHawkins"

export const bossIntro = [
  "You want a quick call? To pitch… fries? By pigeon?",
  "I'm running a B2B SaaS company. Take it up with my dogs.",
]

export const declines = [
  "Do Not Disturb. Sent from my Vision Pro.",
  "Can this be an email?",
  "I only take calls from 175-year-olds.",
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
  if (hitsTaken === 0) return "Honestly? Intrigued. He asked about unit economics."
  if (hitsTaken <= 3) return "Mildly respected. He said 'huh, pigeons.'"
  return "Exhausted, but he picked up. That's a call."
}

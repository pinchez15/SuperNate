import type { SiteId } from "@/lib/sites"
import type { NpcId } from "@/lib/town/world"

export type ItemId = "meds" | "call" | "agent"

export interface Item {
  id: ItemId
  name: string
  blurb: string
}

export const items: Record<ItemId, Item> = {
  meds: { id: "meds", name: "Cold-call nerve pills", blurb: "Non-drowsy. For founders about to say 'synergy' out loud." },
  call: { id: "call", name: "Booked call time", blurb: "The last 15 minutes on SuperNate's calendar, booked from his own website." },
  agent: { id: "agent", name: "CappaWork agent", blurb: "SuperNate built the studio. The agent does the Computer Work." },
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

/** The town, and what the welcome sign says about it. */
export const townName = "MISSED CALL"
export const townPop = "POP. 9 · ALL ON MUTE"

/** What the player is called if they skip the name screen. Ten letters max, like a cartridge save. */
export const defaultName = "CALLER"
export const nameMax = 10

/** Lines use {name} for the player's name. */
export function fill(line: string, name: string): string {
  return line.split("{name}").join(name)
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
      "{name}, right? Here for SuperNate? He built CappaWork — the agent studio. Computers do the Computer Work, people do the Human Work.",
    ],
    ask: "Take one of his agents up the trail. He likes people who've met one.",
    take: "Take the agent",
    yes: "It already drafted your follow-up email.",
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
      "Say ahh. SuperNate built Karibu — the offline-first medical record my clinic in rural Uganda runs on a cheap Android.",
    ],
    ask: "Cold-call nerve pills. Take one before you say 'synergy' out loud.",
    take: "Take the meds",
    yes: "Side effects include confidence and a sudden urge to say 'ship it'.",
    after: "He built the thing. Just tell him what's broken at yours.",
  },
  vest: {
    id: "vest",
    name: "Chad, Tech Bro",
    title: "Healthcare AIO",
    siteId: "healthcareaio",
    item: "call",
    real: true,
    pages: [
      "Bro. SuperNate built Healthcare AIO — it measures how doctors show up when patients ask an AI instead of Google.",
    ],
    ask: "I asked the AIs how to reach SuperNate. His own website has a booking page — I grabbed you the last 15 minutes.",
    take: "Take the call time",
    yes: "Confirmed. He'll decline it. That's normal.",
    after: "Did you get my follow-up? I sent it during this sentence.",
  },
  ship: {
    id: "ship",
    name: "Your Starfighter",
    title: "Model year 1987",
    pages: ["It's smoking. There's still a cartridge in the slot."],
    ask: "Play the 1987 cartridge? It's SuperNate's old save. The aliens are still up there.",
    take: "Insert the cartridge",
    yes: "",
    after: "",
  },
  gerald: {
    id: "gerald",
    name: "Gerald",
    title: "Founder, FlyFry",
    reward: "fry",
    pages: [
      "Coo. I just launched from Combinator Y Academy. I founded FlyFry. Fries delivered by carrier pigeon.",
      "One fry per pigeon. We eat most of them. The TAM is still bigger than GrubHub.",
      "Academy tip: keep knocking. Knock six is the one.",
    ],
    ask: "I saved you one. Don't tell the customer.",
    take: "Take Gerald's fry",
    yes: "Coo. It got lost in transit.",
    after: "Coo. (He is eating a fry.) Knock six.",
  },
  engineer: {
    id: "engineer",
    name: "10x Engineer",
    title: "Waymo Lot · Building AGI",
    pages: [
      "300,000 lines of code, all running, all written from the back of this Waymo. I'm building AGI.",
      "Shipped so far: nothing. The Waymo has shipped more than me.",
    ],
    ask: "Want to see the demo?",
    take: "See the demo",
    yes: "It's loading. It's been loading since March.",
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
  ranger: {
    id: "ranger",
    name: "Ranger Deb",
    title: "Missed Call State Forest",
    reward: "fry",
    pages: ["Don't feed the turkeys. SuperNate does. They work for him now."],
    ask: "Confiscated this fry off a turkey. Want it?",
    take: "Take the fry",
    yes: "Evidence. Don't tell the turkey.",
    after: "The turkeys know your face now. Jump.",
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

/** What each townsperson says when the player does the quick-call emote nearby. */
export const emoteLines: Partial<Record<NpcId, string>> = {
  guide: "Look at you, hopping on a quick call. Very human work.",
  doctor: "Holding the phone that close? Doctor's orders: ten minutes, max.",
  vest: "Bro. Put me on speaker. Circle me in.",
  gerald: "Coo? (Gerald tries to deliver a fry into the phone.)",
  engineer: "Can you take that outside? My Waymo is thinking.",
  ranger: "Keep it down. A turkey can hear a ringtone from two miles.",
  ship: "The starfighter beeps back. It misses the 80s.",
}

export const emoteAlone = "Nobody picked up. Classic."

export const moggedLine = "Whoa. You're tall now. You can heightmog a direct intro — SuperNate takes calls from people this tall."

/** When the player brings all 20 fries into the fight. */
export const allFriesWin = "Are those fries? All twenty? Fine. Quick call. Bring the fries."

export const intro = [
  "{name}, your company is drowning in Computer Work. SuperNate fixes that.",
  "SuperNate lives in a cabin past the tree line. He has declined 1,400 calls this year.",
  "The trail gate wants three things: meds, a call time, and an agent. Go get them.",
]

export const gateLine = "Fine. The gate's open. I'm not picking up, though. — SuperNate"

export const bossIntro = ["You want a quick call? About your company?", "I moved to the woods for a reason. Take it up with the turkeys."]

export const declines = [
  "Do Not Disturb. Sent from a cabin.",
  "Can this be an email? Can the email be nothing?",
  "The turkeys handle my inbound.",
  "No signal out here. Except for this decline.",
  "Muted. You're in the mute pile, {name}.",
  "My agent will call you back. It booked 37 of them. I declined all 37.",
  "I'm chopping wood. Metaphorically. Also literally.",
  "Snoozed until the leaves come back.",
]

export const missed = [
  "Ugh. Another ping.",
  "Who gave you my booking page?",
  "Stop pinging. Wait, is that a fry?",
  "Patience: dropping.",
  "Why is there a pigeon on my porch?",
]

/** One-off quips during the fight, each shown the first time it happens. */
export const fightLines = {
  phase1: "Two turkeys. Both very motivated.",
  phase2: "A RAFTER. That's the word for a flock of turkeys.",
  air: "Yes, wild turkeys fly. Look it up.",
  pound: "Scattered. Turkeys hate that.",
  fed: "Fed it a fry. It's done with you. Good turkey.",
  respawn: "Three turkeys. He forgot you existed. Patience: 100%. Go again.",
}

export const winLine = "Fine, {name}. Quick call."

export const calendly = "https://calendly.com/cappawork/quick-call"

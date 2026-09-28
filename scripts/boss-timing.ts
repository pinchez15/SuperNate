import { createBoss, stepBoss, type BossState } from "../lib/town/boss"

type Bot = (s: BossState) => { left: boolean; right: boolean; jump: boolean; fire: boolean }

const dodger: Bot = (s) => {
  const threat = s.ubers.some((u) => u.x - s.x > 1.4 && u.x - s.x < 1.4 + u.speed * 0.16)
  return { left: false, right: s.x < -3, jump: threat, fire: true }
}

const tank: Bot = (s) => ({ left: false, right: s.x < -3, jump: false, fire: true })

/** Parks on the right platform and never dodges, to prove camping is not free. */
const camper: Bot = (s) => ({ left: false, right: s.x < 1.2, jump: s.y === 0 && s.x > -0.5, fire: true })

function run(name: string, bot: Bot) {
  const s = createBoss()
  const dt = 1 / 60
  while (!s.won && s.t < 180) stepBoss(s, bot(s), dt)
  console.log(
    `${name.padEnd(8)} won=${s.won} seconds=${s.t.toFixed(1)} placed=${s.placed} landed=${s.landed} declined=${s.declined} hits=${s.hitsTaken} respawns=${s.respawns}`,
  )
  return s
}

const results = [run("dodger", dodger), run("tank", tank), run("camper", camper)]
const ok = results.every((s) => s.won) && results[0].t >= 25 && results[0].t <= 50
console.log(ok ? "PASS" : "FAIL")
process.exit(ok ? 0 : 1)

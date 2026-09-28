type Wave = OscillatorType

export class Blips {
  private ctx: AudioContext | null = null
  muted = false

  unlock() {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      this.ctx = new Ctx()
    }
    void this.ctx.resume()
  }

  private tone(freq: number, at: number, dur: number, wave: Wave = "square", vol = 0.05) {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, ctx.currentTime + at)
    gain.gain.setValueAtTime(vol, ctx.currentTime + at)
    gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + at + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + at)
    osc.stop(ctx.currentTime + at + dur + 0.02)
  }

  text() {
    this.tone(880, 0, 0.03, "square", 0.018)
  }
  select() {
    this.tone(660, 0, 0.06)
    this.tone(990, 0.06, 0.08)
  }
  invite() {
    ;[523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.08, 0.14, "triangle", 0.07))
  }
  /** A Slack-ish knock-brush for every ping. */
  ring() {
    this.tone(740, 0, 0.05, "triangle", 0.06)
    this.tone(988, 0.07, 0.09, "triangle", 0.06)
  }
  landed() {
    this.tone(220, 0, 0.12, "sawtooth", 0.06)
    this.tone(330, 0.05, 0.1, "square", 0.04)
  }
  declined() {
    this.tone(392, 0, 0.08, "square", 0.04)
    this.tone(262, 0.08, 0.12, "square", 0.04)
  }
  bark() {
    this.tone(520, 0, 0.05, "sawtooth", 0.05)
    this.tone(380, 0.05, 0.08, "sawtooth", 0.05)
  }
  hurt() {
    this.tone(160, 0, 0.2, "sawtooth", 0.07)
  }
  coin() {
    this.tone(988, 0, 0.06, "square", 0.04)
    this.tone(1319, 0.06, 0.16, "square", 0.04)
  }
  gate() {
    ;[196, 262, 330, 392].forEach((f, i) => this.tone(f, i * 0.12, 0.3, "triangle", 0.07))
  }
  win() {
    ;[523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.2, "triangle", 0.08))
  }
}

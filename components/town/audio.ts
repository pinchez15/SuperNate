type Wave = OscillatorType

export class Blips {
  private ctx: AudioContext | null = null
  private mutedFlag = false
  private musicSrc: AudioBufferSourceNode | null = null
  private musicGain: GainNode | null = null
  private musicUrl: string | null = null
  private musicVol = 0.25
  private buffers = new Map<string, AudioBuffer>()

  get muted() {
    return this.mutedFlag
  }

  /** Muting also ducks the music instead of killing it, so unmuting resumes in place. */
  set muted(m: boolean) {
    this.mutedFlag = m
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(m ? 0.0001 : this.musicVol, this.ctx.currentTime, 0.05)
    }
  }

  unlock() {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      this.ctx = new Ctx()
    }
    void this.ctx.resume()
  }

  private async buffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null
    const hit = this.buffers.get(url)
    if (hit) return hit
    try {
      const res = await fetch(url)
      const buf = await this.ctx.decodeAudioData(await res.arrayBuffer())
      this.buffers.set(url, buf)
      return buf
    } catch {
      return null
    }
  }

  /** Loops a track gaplessly via an AudioBuffer, fading out whatever was playing. */
  playMusic(url: string, vol = 0.25) {
    this.unlock()
    if (!this.ctx || this.musicUrl === url) return
    this.musicUrl = url
    void this.buffer(url).then((buf) => {
      if (!buf || !this.ctx || this.musicUrl !== url) return
      this.fadeOutSource(0.6)
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(this.mutedFlag ? 0.0001 : vol, this.ctx.currentTime + 0.8)
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.connect(gain).connect(this.ctx.destination)
      src.start()
      this.musicSrc = src
      this.musicGain = gain
      this.musicVol = vol
    })
  }

  stopMusic(fade = 0.5) {
    this.musicUrl = null
    this.fadeOutSource(fade)
  }

  private fadeOutSource(fade: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicSrc || !this.musicGain) return
    const src = this.musicSrc
    this.musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, Math.max(0.05, fade / 3))
    src.stop(ctx.currentTime + fade)
    this.musicSrc = null
    this.musicGain = null
  }

  /** One-shot clip, like the Congratulations sting when the call gets booked. */
  playClip(url: string, vol = 0.5) {
    this.unlock()
    if (!this.ctx || this.mutedFlag) return
    void this.buffer(url).then((buf) => {
      if (!buf || !this.ctx) return
      const gain = this.ctx.createGain()
      gain.gain.value = vol
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.connect(gain).connect(this.ctx.destination)
      src.start()
    })
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
  /** A quick three-note warble for every turkey. */
  gobble() {
    this.tone(620, 0, 0.04, "sawtooth", 0.045)
    this.tone(470, 0.04, 0.04, "sawtooth", 0.045)
    this.tone(560, 0.08, 0.07, "sawtooth", 0.045)
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

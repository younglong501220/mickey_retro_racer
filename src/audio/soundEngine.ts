/**
 * Retro Audio Engine utilizing native Web Audio API
 * Fully synthetic sound effects & nostalgic chiptune background music.
 * Zero external audio files required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  
  // Continuous engine hum oscillator
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;

  // Background music scheduler
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  // Retro swing cartoon chiptune melody notes (Hz)
  // Mickey Steamboat & Retro racer style upbeat swing tune in C Major
  private readonly melody = [
    261.63, 329.63, 392.00, 523.25, // C E G C
    440.00, 392.00, 329.63, 261.63, // A G E C
    293.66, 349.23, 440.00, 523.25, // D F A C
    392.00, 349.23, 293.66, 196.00, // G F D G3
    261.63, 329.63, 392.00, 523.25,
    587.33, 523.25, 440.00, 392.00,
    349.23, 392.00, 440.00, 493.88,
    523.25, 0,      523.25, 0
  ];

  private readonly bassline = [
    130.81, 196.00, 130.81, 196.00,
    174.61, 220.00, 174.61, 220.00,
    146.83, 220.00, 146.83, 220.00,
    196.00, 246.94, 196.00, 246.94,
    130.81, 196.00, 130.81, 196.00,
    174.61, 220.00, 174.61, 220.00,
    196.00, 246.94, 196.00, 246.94,
    130.81, 196.00, 261.63, 0
  ];

  constructor() {
    // Audio context will be lazy-initialized on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : 0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmMuted ? 0 : 0.18, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
    if (muted && this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public setBgmMuted(muted: boolean) {
    this.bgmMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.18, this.ctx.currentTime);
    }
  }

  public isSfxMuted() {
    return this.sfxMuted;
  }

  public isBgmMuted() {
    return this.bgmMuted;
  }

  public toggleSfx() {
    this.setSfxMuted(!this.sfxMuted);
    return this.sfxMuted;
  }

  public toggleBgm() {
    this.setBgmMuted(!this.bgmMuted);
    return this.bgmMuted;
  }

  // --- Engine continuous sound simulation ---
  public startEngine() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isEngineRunning) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Low pass filter to make it sound like a rumbling vintage motor
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(this.sfxMuted ? 0 : 0.05, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch {
      // Ignore audio error
    }
  }

  public updateEnginePitch(speedRatio: number) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.isEngineRunning) return;
    try {
      const targetFreq = 50 + speedRatio * 55; // 50Hz to ~105Hz
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
      if (!this.sfxMuted) {
        this.engineGain.gain.setTargetAtTime(0.04 + speedRatio * 0.03, this.ctx.currentTime, 0.08);
      }
    } catch {
      // Ignore
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Ignore
      }
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }

  // --- Sound Effects ---

  public playCrash() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    
    // Sawtooth impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.45);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);

    // White noise explosion crunch
    this.playNoise(0.3, 0.25);
  }

  public playSlip() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.12);
    osc.frequency.linearRampToValueAtTime(320, t + 0.32);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    // Classic 2-tone cheerful pickup (B5 -> E6)
    const tones = [987.77, 1318.51];
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.08;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.14);
    });
  }

  public playNitro() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playHeal() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + i * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.15, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(st);
      osc.stop(st + 0.15);
    });
  }

  public playGameOver() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    const tones = [260, 220, 180, 130];
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.18;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  public playHighScoreFanfare() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const t = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  private playNoise(duration: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(gain);
      gain.connect(this.sfxGain);
      noise.start();
    } catch {
      // Ignore
    }
  }

  // --- Retro Chiptune Swing BGM Loop ---
  public startBGM() {
    this.init();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleNextBgmBeat();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleNextBgmBeat = () => {
    if (!this.isBgmPlaying) return;
    if (!this.ctx || !this.bgmGain) {
      this.bgmTimer = window.setTimeout(this.scheduleNextBgmBeat, 200);
      return;
    }

    const t = this.ctx.currentTime;
    const tempoStepMs = 175; // ~170 BPM swing 8th note feel

    if (!this.bgmMuted) {
      // Lead note
      const melodyFreq = this.melody[this.bgmStep % this.melody.length];
      if (melodyFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melodyFreq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      // Bass note
      const bassFreq = this.bassline[this.bgmStep % this.bassline.length];
      if (bassFreq > 0 && this.bgmStep % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.26);
      }
    }

    this.bgmStep++;
    this.bgmTimer = window.setTimeout(this.scheduleNextBgmBeat, tempoStepMs);
  };
}

export const sound = new SoundEngine();

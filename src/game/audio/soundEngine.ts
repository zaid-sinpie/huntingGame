// Procedural Web Audio System for WildHunt
// 100% self-contained, zero external network dependencies, zero missing asset crashes.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private waterGain: GainNode | null = null;
  private initialized: boolean = false;

  private lastBirdTime: number = 0;
  private birdInterval: number = 6000;

  public init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Ambient Bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbientLoop();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, ambient: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(master, t, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, t, 0.05);
    if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(ambient, t, 0.05);
  }

  // --- AMBIENT SOUNDS ---
  private startAmbientLoop() {
    if (!this.ctx || !this.ambientGain) return;

    // 1. Procedural Wind generator using filtered noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.35;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ambientGain);
    windSource.start();

    // 2. Lake Water lapping ambient loop
    const waterSource = this.ctx.createBufferSource();
    waterSource.buffer = noiseBuffer;
    waterSource.loop = true;

    const waterFilter = this.ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // dynamically fades up near lake

    waterSource.connect(waterFilter);
    waterFilter.connect(this.waterGain);
    this.waterGain.connect(this.ambientGain);
    waterSource.start();
  }

  public updateAmbientPosition(_playerX: number, playerY: number, _playerZ: number, lakeDist: number) {
    if (!this.ctx || !this.windFilter || !this.windGain || !this.waterGain) return;
    const t = this.ctx.currentTime;

    // Wind gets stronger and higher pitched at high altitudes (mountains/watchtower)
    const heightFactor = Math.max(0, Math.min(1, (playerY - 5) / 25));
    const targetFreq = 260 + heightFactor * 450 + Math.sin(t * 0.4) * 80;
    const targetWindGain = 0.2 + heightFactor * 0.25;

    this.windFilter.frequency.setTargetAtTime(targetFreq, t, 0.2);
    this.windGain.gain.setTargetAtTime(targetWindGain, t, 0.2);

    // Lake water sound fades in when within 45m of lake
    const lakeGain = lakeDist < 45 ? Math.max(0, (1 - lakeDist / 45) * 0.35) : 0;
    this.waterGain.gain.setTargetAtTime(lakeGain, t, 0.1);

    // Periodic random bird chirps
    const now = performance.now();
    if (now - this.lastBirdTime > this.birdInterval) {
      this.lastBirdTime = now;
      this.birdInterval = 5000 + Math.random() * 9000;
      if (playerY < 20 && Math.random() < 0.8) {
        this.playBirdChirp();
      }
    }
  }

  // --- WEAPONS ---
  public playRifleShot() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // 1. Initial transient crack (high energy)
    const crack = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(800, t);
    crack.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    crackGain.gain.setValueAtTime(1.0, t);
    crackGain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    crack.connect(crackGain);
    crackGain.connect(this.sfxGain);
    crack.start(t);
    crack.stop(t + 0.08);

    // 2. Heavy Gunpowder Body Punch (sub-bass sweep)
    const punch = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punch.type = 'triangle';
    punch.frequency.setValueAtTime(160, t);
    punch.frequency.exponentialRampToValueAtTime(32, t + 0.28);

    punchGain.gain.setValueAtTime(1.2, t);
    punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    punch.connect(punchGain);
    punchGain.connect(this.sfxGain);
    punch.start(t);
    punch.stop(t + 0.38);

    // 3. Valley Echo & Reverb Tail
    const tailBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 1.5), this.ctx.sampleRate);
    const data = tailBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.35));
    }
    const tailSource = this.ctx.createBufferSource();
    tailSource.buffer = tailBuffer;

    const tailFilter = this.ctx.createBiquadFilter();
    tailFilter.type = 'lowpass';
    tailFilter.frequency.setValueAtTime(1200, t);

    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(0.65, t);
    tailGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    tailSource.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(this.sfxGain);
    tailSource.start(t + 0.02);
  }

  public playBoltAction() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Bolt slide up & back click
    this.playClick(t, 2200, 0.03, 0.4);
    this.playClick(t + 0.15, 1400, 0.04, 0.5);
    // Bolt forward & lock click
    this.playClick(t + 0.45, 1800, 0.03, 0.45);
    this.playClick(t + 0.55, 2600, 0.04, 0.6);
  }

  public playReload() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Magazine release
    this.playClick(t, 900, 0.06, 0.4);
    // Magazine insertion
    this.playClick(t + 0.8, 1200, 0.08, 0.7);
    this.playClick(t + 0.92, 2200, 0.05, 0.6);
  }

  public playBowDraw() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.4);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playBowRelease() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Bow twang
    const twang = this.ctx.createOscillator();
    const twangGain = this.ctx.createGain();
    twang.type = 'triangle';
    twang.frequency.setValueAtTime(420, t);
    twang.frequency.exponentialRampToValueAtTime(80, t + 0.2);

    twangGain.gain.setValueAtTime(0.7, t);
    twangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    twang.connect(twangGain);
    twangGain.connect(this.sfxGain);
    twang.start(t);
    twang.stop(t + 0.26);
  }

  public playEmptyClick() {
    if (!this.ctx || !this.sfxGain) return;
    this.playClick(this.ctx.currentTime, 2800, 0.02, 0.5);
  }

  // --- HIT FEEDBACK & REWARD ---
  public playHitMarker() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playHarvestFanfare() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.28, t + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.8);
    });
  }

  // --- FOOTSTEPS ---
  public playFootstep(surface: 'grass' | 'rock' | 'wood' | 'water', isSprinting: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const vol = isSprinting ? 0.35 : 0.18;

    if (surface === 'wood') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
      gain.gain.setValueAtTime(vol * 1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
      return;
    }

    // Noise-based steps for grass/rock/water
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    if (surface === 'rock') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(2.0, t);
    } else if (surface === 'water') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.07);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    source.start(t);
  }

  // --- ANIMAL CALLS ---
  public playAnimalCall(species: 'deer' | 'boar' | 'wolf' | 'bear') {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (species === 'wolf') {
      // Long mournful wolf howl
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(680, t + 0.9);
      osc.frequency.linearRampToValueAtTime(520, t + 1.8);
      osc.frequency.exponentialRampToValueAtTime(280, t + 2.5);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 2.7);
    } else if (species === 'deer') {
      // Elk bugle / deer contact call
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, t);
      osc.frequency.linearRampToValueAtTime(950, t + 0.6);
      osc.frequency.exponentialRampToValueAtTime(220, t + 1.2);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.4);
    } else if (species === 'boar') {
      // Boar grunt
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.25);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    } else if (species === 'bear') {
      // Deep bear roar
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(130, t + 0.4);
      osc.frequency.exponentialRampToValueAtTime(45, t + 1.1);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.3);
    }
  }

  // --- BIRDSONG ---
  private playBirdChirp() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const baseFreq = 2000 + Math.random() * 1200;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 600, t + 0.05);
    osc.frequency.linearRampToValueAtTime(baseFreq - 300, t + 0.12);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  private playClick(time: number, freq: number, duration: number, vol: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + duration + 0.01);
  }
}

export const soundEngine = new SoundEngine();

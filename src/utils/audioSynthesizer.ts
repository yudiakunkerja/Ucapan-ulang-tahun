import { MusicPresetId } from '../types';

interface ScheduledNote {
  osc: OscillatorNode;
  gain: GainNode;
}

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentPreset: MusicPresetId = 'birthday_musicbox';
  private timerId: number | null = null;
  private masterVolumeNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private activeNotes: ScheduledNote[] = [];
  private isMuted = false;
  private volumeLevel = 0.75;
  private listeners: Set<() => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Master Volume
        this.masterVolumeNode = this.ctx.createGain();
        this.masterVolumeNode.gain.setValueAtTime(this.isMuted ? 0 : this.volumeLevel * 0.4, this.ctx.currentTime);
        this.masterVolumeNode.connect(this.ctx.destination);

        // Music Sub-gain for instant clean cutoff of background tracks
        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.musicGainNode.connect(this.masterVolumeNode);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subscribe to play/pause state changes
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Instantly stop and disconnect all pending/active musical oscillators
  private cancelAllScheduledMusic() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.musicGainNode && this.ctx) {
      try {
        // Fast 20ms ramp-down to completely eliminate pop/clicks while cutting sound immediately
        this.musicGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, this.ctx.currentTime);
        this.musicGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
      } catch {
        // Safe fallback
      }
    }

    // Stop every active oscillator immediately
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activeNotes.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        osc.stop(now + 0.01);
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Already stopped or disconnected
      }
    });
    this.activeNotes = [];

    // Reset musicGainNode to 1.0 after ramp-down completes
    if (this.musicGainNode && this.ctx) {
      const resetTime = this.ctx.currentTime + 0.03;
      try {
        this.musicGainNode.gain.setValueAtTime(1.0, resetTime);
      } catch {
        // Ignore
      }
    }
  }

  // Play a single note safely routed through musicGainNode with strict tracking
  private playNote(
    freq: number,
    duration: number,
    timeOffset: number,
    type: OscillatorType = 'sine',
    release: number = 1.2
  ) {
    if (!this.ctx || !this.musicGainNode || !this.isPlaying || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + timeOffset);

      const startTime = this.ctx.currentTime + timeOffset;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(startTime);
      const stopTime = startTime + duration + release + 0.08;
      osc.stop(stopTime);

      const noteRef: ScheduledNote = { osc, gain };
      this.activeNotes.push(noteRef);

      // Auto-cleanup finished note from active array
      setTimeout(() => {
        const idx = this.activeNotes.indexOf(noteRef);
        if (idx !== -1) {
          this.activeNotes.splice(idx, 1);
        }
      }, (timeOffset + duration + release + 0.15) * 1000);
    } catch {
      // Audio node scheduling error guard
    }
  }

  // Sound Effect: Confetti Pop
  public playConfettiPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterVolumeNode || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterVolumeNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Silently fail if audio not unlocked
    }
  }

  // Sound Effect: Candle blown out (whoosh + fanfare)
  public playCandleBlowOut() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterVolumeNode || this.isMuted) return;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterVolumeNode);
      noise.start();

      setTimeout(() => {
        this.playFanfare();
      }, 250);
    } catch {
      // Guard
    }
  }

  // Triumphant Fanfare Chord
  public playFanfare() {
    if (!this.ctx || !this.masterVolumeNode || this.isMuted) return;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        const start = this.ctx!.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5);
        osc.connect(gain);
        gain.connect(this.masterVolumeNode!);
        osc.start(start);
        osc.stop(start + 1.6);
      } catch {
        // Guard
      }
    });
  }

  // Start background loop with strictly 1 track at a time guaranteed
  public playBackgroundMusic(preset: MusicPresetId = 'birthday_musicbox') {
    this.initContext();
    
    // Stop and kill ANY previous audio notes immediately
    this.cancelAllScheduledMusic();

    this.currentPreset = preset;
    this.isPlaying = true;
    this.notify();

    // Notes frequencies
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.0;

    let loopIntervalMs = 8000;

    const playSequence = () => {
      if (!this.isPlaying || !this.ctx) return;

      if (this.currentPreset === 'kids_happy_birthday') {
        // Melodi Ceria Lagu Anak "Selamat Ulang Tahun" & "Happy Birthday to You"
        const kidsMelody = [
          { f: G4, d: 0.28, t: 0, typ: 'triangle' as const, rel: 0.8 },
          { f: G4, d: 0.28, t: 0.35, typ: 'triangle' as const, rel: 0.8 },
          { f: A4, d: 0.5, t: 0.7, typ: 'triangle' as const, rel: 0.9 },
          { f: G4, d: 0.5, t: 1.3, typ: 'triangle' as const, rel: 0.9 },
          { f: C5, d: 0.5, t: 1.9, typ: 'sine' as const, rel: 1.1 },
          { f: B4, d: 0.9, t: 2.5, typ: 'sine' as const, rel: 1.2 },

          { f: G4, d: 0.28, t: 3.6, typ: 'triangle' as const, rel: 0.8 },
          { f: G4, d: 0.28, t: 3.95, typ: 'triangle' as const, rel: 0.8 },
          { f: A4, d: 0.5, t: 4.3, typ: 'triangle' as const, rel: 0.9 },
          { f: G4, d: 0.5, t: 4.9, typ: 'triangle' as const, rel: 0.9 },
          { f: D5, d: 0.5, t: 5.5, typ: 'sine' as const, rel: 1.1 },
          { f: C5, d: 1.1, t: 6.1, typ: 'sine' as const, rel: 1.3 },

          { f: G4, d: 0.28, t: 7.3, typ: 'triangle' as const, rel: 0.8 },
          { f: G4, d: 0.28, t: 7.65, typ: 'triangle' as const, rel: 0.8 },
          { f: G5, d: 0.6, t: 8.0, typ: 'sine' as const, rel: 1.2 },
          { f: E5, d: 0.6, t: 8.7, typ: 'sine' as const, rel: 1.1 },
          { f: C5, d: 0.5, t: 9.4, typ: 'sine' as const, rel: 1.1 },
          { f: B4, d: 0.5, t: 10.0, typ: 'sine' as const, rel: 1.0 },
          { f: A4, d: 0.9, t: 10.6, typ: 'triangle' as const, rel: 1.1 },

          { f: F5, d: 0.35, t: 11.6, typ: 'sine' as const, rel: 1.0 },
          { f: F5, d: 0.35, t: 12.0, typ: 'sine' as const, rel: 1.0 },
          { f: E5, d: 0.6, t: 12.5, typ: 'sine' as const, rel: 1.1 },
          { f: C5, d: 0.6, t: 13.2, typ: 'sine' as const, rel: 1.1 },
          { f: D5, d: 0.7, t: 13.9, typ: 'triangle' as const, rel: 1.1 },
          { f: C5, d: 1.6, t: 14.7, typ: 'triangle' as const, rel: 1.5 },
        ];
        kidsMelody.forEach((n) => this.playNote(n.f, n.d, n.t, n.typ, n.rel));
        loopIntervalMs = 17000;
      } else if (this.currentPreset === 'birthday_musicbox') {
        // Classic Music Box
        const melody = [
          { f: G4, d: 0.4, t: 0 },
          { f: G4, d: 0.4, t: 0.45 },
          { f: A4, d: 0.7, t: 0.9 },
          { f: G4, d: 0.7, t: 1.7 },
          { f: C5, d: 0.7, t: 2.5 },
          { f: B4, d: 1.2, t: 3.3 },

          { f: G4, d: 0.4, t: 4.8 },
          { f: G4, d: 0.4, t: 5.25 },
          { f: A4, d: 0.7, t: 5.7 },
          { f: G4, d: 0.7, t: 6.5 },
          { f: D5, d: 0.7, t: 7.3 },
          { f: C5, d: 1.3, t: 8.1 },

          { f: G4, d: 0.4, t: 9.6 },
          { f: G4, d: 0.4, t: 10.05 },
          { f: G5, d: 0.8, t: 10.5 },
          { f: E5, d: 0.7, t: 11.4 },
          { f: C5, d: 0.6, t: 12.2 },
          { f: B4, d: 0.6, t: 12.9 },
          { f: A4, d: 0.8, t: 13.6 },

          { f: F5, d: 0.4, t: 14.5 },
          { f: F5, d: 0.4, t: 14.95 },
          { f: E5, d: 0.7, t: 15.4 },
          { f: C5, d: 0.7, t: 16.2 },
          { f: D5, d: 0.7, t: 17.0 },
          { f: C5, d: 1.5, t: 17.8 },
        ];
        melody.forEach((n) => this.playNote(n.f, n.d, n.t, 'sine', 1.0));
        loopIntervalMs = 20000;
      } else if (this.currentPreset === 'romantic_piano') {
        // Romantic piano arpeggio
        const romanticNotes = [
          { f: C4, d: 1.2, t: 0 },
          { f: E4, d: 0.8, t: 0.5 },
          { f: G4, d: 0.8, t: 1.0 },
          { f: B4, d: 1.0, t: 1.6 },
          { f: C5, d: 1.5, t: 2.2 },

          { f: A4, d: 1.0, t: 3.2 },
          { f: C5, d: 0.8, t: 3.8 },
          { f: E5, d: 1.2, t: 4.4 },
          { f: G5, d: 1.5, t: 5.2 },

          { f: F4, d: 1.0, t: 6.4 },
          { f: A4, d: 0.8, t: 7.0 },
          { f: C5, d: 1.2, t: 7.6 },
          { f: E5, d: 1.8, t: 8.4 },

          { f: G4, d: 1.0, t: 9.6 },
          { f: B4, d: 0.8, t: 10.2 },
          { f: D5, d: 1.2, t: 10.8 },
          { f: C5, d: 2.0, t: 11.6 },
        ];
        romanticNotes.forEach((n) => this.playNote(n.f, n.d, n.t, 'triangle', 1.6));
        loopIntervalMs = 14500;
      } else if (this.currentPreset === 'upbeat_party') {
        // Upbeat rhythm
        const partyNotes = [
          { f: C5, d: 0.2, t: 0 },
          { f: E5, d: 0.2, t: 0.25 },
          { f: G5, d: 0.3, t: 0.5 },
          { f: C5, d: 0.2, t: 0.8 },
          { f: A5, d: 0.4, t: 1.05 },
          { f: G5, d: 0.5, t: 1.5 },

          { f: E5, d: 0.2, t: 2.2 },
          { f: G5, d: 0.2, t: 2.45 },
          { f: C5, d: 0.3, t: 2.7 },
          { f: D5, d: 0.4, t: 3.1 },
          { f: C5, d: 0.6, t: 3.6 },
        ];
        partyNotes.forEach((n) => this.playNote(n.f, n.d, n.t, 'sine', 0.6));
        loopIntervalMs = 5000;
      } else if (this.currentPreset === 'warm_acoustic') {
        // Warm acoustic
        const warmNotes = [
          { f: G4, d: 0.9, t: 0 },
          { f: B4, d: 0.8, t: 0.6 },
          { f: D5, d: 1.0, t: 1.2 },
          { f: G5, d: 1.4, t: 1.8 },
          { f: E5, d: 0.9, t: 2.6 },
          { f: C5, d: 1.2, t: 3.4 },
          { f: D5, d: 1.0, t: 4.2 },
          { f: G4, d: 1.8, t: 5.0 },
        ];
        warmNotes.forEach((n) => this.playNote(n.f, n.d, n.t, 'triangle', 1.4));
        loopIntervalMs = 7000;
      } else {
        // chill_lofi
        const lofiNotes = [
          { f: D4, d: 1.2, t: 0 },
          { f: F4, d: 1.0, t: 0.4 },
          { f: A4, d: 1.0, t: 0.8 },
          { f: C5, d: 1.4, t: 1.2 },

          { f: G4, d: 1.2, t: 2.5 },
          { f: B4, d: 1.0, t: 2.9 },
          { f: D5, d: 1.0, t: 3.3 },
          { f: F5, d: 1.4, t: 3.7 },

          { f: C4, d: 1.5, t: 5.0 },
          { f: E4, d: 1.2, t: 5.4 },
          { f: G4, d: 1.2, t: 5.8 },
          { f: B4, d: 1.8, t: 6.2 },
        ];
        lofiNotes.forEach((n) => this.playNote(n.f, n.d, n.t, 'sine', 1.8));
        loopIntervalMs = 8000;
      }

      if (this.isPlaying) {
        this.timerId = window.setTimeout(playSequence, loopIntervalMs);
      }
    };

    playSequence();
  }

  // Stop background music completely
  public stopBackgroundMusic() {
    this.isPlaying = false;
    this.cancelAllScheduledMusic();
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterVolumeNode && this.ctx) {
      this.masterVolumeNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.volumeLevel * 0.4,
        this.ctx.currentTime
      );
    }
    this.notify();
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentPreset(): MusicPresetId {
    return this.currentPreset;
  }

  public setVolume(val: number) {
    this.volumeLevel = Math.max(0, Math.min(1, val));
    if (this.masterVolumeNode && this.ctx) {
      this.masterVolumeNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.volumeLevel * 0.4,
        this.ctx.currentTime
      );
    }
  }
}

export const birthdayAudio = new BirthdayAudioEngine();

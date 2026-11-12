//src/utils/AudioEngine.ts

export class AudioEngine {
  public audioContext: AudioContext;
  private oscillators: Map<string, AudioScheduledSourceNode[]>;
  private gainNodes: Map<string, GainNode>;
  private lfos: Map<string, OscillatorNode>;
  private noteReleases: Map<string, number>;
  private metronomeIntervalId: number | null = null;
  private metronomeGainNode: GainNode;
  private masterGainNode: GainNode;
  private reverbNode: ConvolverNode | null = null;

  private setPlaybackAudioSession(): void {
    // iOS routes Web Audio through its ambient session by default, which can
    // silence it with the Ring/Silent switch enabled. The Audio Session API is
    // optional, so older browsers keep their normal behavior.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      nav.audioSession.type = 'playback';
    }
  }

  // Synthesizer ADSR & Type settings
  private synthType: string = 'piano';
  private adsr = { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 };
  private reverbLevel: number = 0.3;

  constructor() {
    this.setPlaybackAudioSession();
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gainNodes = new Map();
    this.lfos = new Map();
    this.noteReleases = new Map();

    // Create master gain node for overall volume control
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    // Create dedicated gain node for metronome volume control
    this.metronomeGainNode = this.audioContext.createGain();
    this.metronomeGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    this.metronomeGainNode.connect(this.masterGainNode);

    this.initializeReverb();
  }

  private async initializeReverb(): Promise<void> {
    try {
      // Create a simple reverb impulse response
      const length = this.audioContext.sampleRate * 2; // 2 seconds
      const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }

      this.reverbNode = this.audioContext.createConvolver();
      this.reverbNode.buffer = impulse;
      this.reverbNode.connect(this.masterGainNode);
    } catch (error) {
      console.warn('Could not initialize reverb:', error);
    }
  }

  private getFrequency(note: string): number {
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63,
      'C#': 277.18, 'Db': 277.18,
      'D': 293.66,
      'D#': 311.13, 'Eb': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99, 'Gb': 369.99,
      'G': 392.00,
      'G#': 415.30, 'Ab': 415.30,
      'A': 440.00,
      'A#': 466.16, 'Bb': 466.16,
      'B': 493.88
    };

    const match = note.match(/([A-G][#b]?)(\d+)/);
    if (!match) return 440;

    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const baseFreq = noteFrequencies[noteName] || 440;

    // Adjust for octave (C4 is the base octave)
    const octaveMultiplier = Math.pow(2, octave - 4);

    return baseFreq * octaveMultiplier;
  }

  private createOscillator(frequency: number, synthType?: string): OscillatorNode {
    const oscType = synthType || this.synthType;
    const oscillator = this.audioContext.createOscillator();

    if (oscType === 'piano') {
      // Bright hammer-struck spectrum; a closing lowpass in playNote darkens it
      // over time, mimicking how upper partials decay faster than the fundamental
      const real = new Float32Array([0, 1, 0.6, 0.42, 0.3, 0.25, 0.18, 0.12, 0.08, 0.05, 0.035, 0.02]);
      const imag = new Float32Array(real.length);
      const customWave = this.audioContext.createPeriodicWave(real, imag);
      oscillator.setPeriodicWave(customWave);
    } else if (oscType === 'organ') {
      // 8' flue pipe fundamental: near-pure sine; upper drawbar registers are
      // added as separate oscillators in playNote
      oscillator.type = 'sine';
    } else if (oscType === 'flute') {
      // Register-dependent spectrum: the low register has a strong 2nd harmonic
      // (often rivalling the fundamental), the high register is nearly pure
      let real: Float32Array;
      if (frequency < 350) {
        real = new Float32Array([0, 1, 0.7, 0.32, 0.14, 0.06, 0.025]);
      } else if (frequency < 700) {
        real = new Float32Array([0, 1, 0.45, 0.16, 0.07, 0.025]);
      } else {
        real = new Float32Array([0, 1, 0.18, 0.05]);
      }
      const imag = new Float32Array(real.length);
      const customWave = this.audioContext.createPeriodicWave(real, imag);
      oscillator.setPeriodicWave(customWave);
    } else if (oscType === 'cello') {
      oscillator.type = 'sawtooth';
    } else if (oscType === 'violin') {
      oscillator.type = 'sawtooth';
    } else {
      oscillator.type = oscType as OscillatorType;
    }

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    return oscillator;
  }

  private createNoiseBuffer(durationSec: number): AudioBuffer {
    const length = Math.max(1, Math.round(this.audioContext.sampleRate * durationSec));
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private playMetronomeClick(isDownbeat: boolean = false): void {
    if (this.audioContext.state !== 'running') {
      void this.resumeContext();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Different frequencies for downbeat vs regular beat
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      isDownbeat ? 1200 : 800,
      this.audioContext.currentTime
    );

    // Quick attack and decay for a sharp click
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      isDownbeat ? 0.3 : 0.2,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.metronomeGainNode);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  startMetronome(bpm: number, timeSignature: number = 4): void {
    this.stopMetronome();

    const interval = (60 / bpm) * 1000;
    let beatCount = 0;

    const scheduleNextBeat = () => {
      const isDownbeat = beatCount % timeSignature === 0;
      this.playMetronomeClick(isDownbeat);
      beatCount++;
      this.metronomeIntervalId = window.setTimeout(scheduleNextBeat, interval);
    };

    scheduleNextBeat();
  }

  stopMetronome(): void {
    if (this.metronomeIntervalId) {
      window.clearTimeout(this.metronomeIntervalId);
      this.metronomeIntervalId = null;
    }
  }

  // Drum percussion synthesis nodes
  private playKick(now: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    // Pitch envelope drop
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Quick volume decay
    gain.gain.setValueAtTime(volume * 1.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playSnare(now: number, volume: number): void {
    // 1. Noise buffer for the snare rattle snap
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGainNode);

    // 2. Triangle wave for the snare metallic body pitch tone
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.1);

    oscGain.gain.setValueAtTime(volume * 0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterGainNode);

    noiseSource.start(now);
    noiseSource.stop(now + 0.2);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playHihat(now: number, volume: number): void {
    const bufferSize = this.audioContext.sampleRate * 0.05; // Short burst
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 7000;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGainNode);

    noiseSource.start(now);
    noiseSource.stop(now + 0.05);
  }

  playNote(
    note: string,
    velocity: number = 0.7,
    duration?: number,
    synthType?: string,
    useReverb: boolean = true,
    voiceKey?: string
  ): void {
    if (this.audioContext.state !== 'running') {
      void this.resumeContext();
    }

    const activeSynth = synthType || this.synthType;

    // Special drum percussion routing
    if (activeSynth === 'drum') {
      const now = this.audioContext.currentTime;
      const normalizedNote = note.toUpperCase();

      if (
        normalizedNote.startsWith('C2') ||
        normalizedNote.startsWith('C3') ||
        normalizedNote === 'KICK' ||
        normalizedNote === 'BD'
      ) {
        this.playKick(now, velocity);
      } else if (
        normalizedNote.startsWith('D2') ||
        normalizedNote.startsWith('D3') ||
        normalizedNote === 'SNARE' ||
        normalizedNote === 'SD'
      ) {
        this.playSnare(now, velocity);
      } else if (
        normalizedNote.startsWith('F#') ||
        normalizedNote.startsWith('G#') ||
        normalizedNote === 'HIHAT' ||
        normalizedNote === 'HH'
      ) {
        this.playHihat(now, velocity);
      } else {
        // Default short drum click
        this.playHihat(now, velocity * 0.5);
      }
      return;
    }

    // Identify active voice key so multi-track playbacks don't prematurely cancel each other's notes
    const activeKey = voiceKey || `${activeSynth}:${note}`;

    // Stop existing note for this specific voice if playing
    this.stopNote(activeKey);

    const frequency = this.getFrequency(note);
    const oscillator = this.createOscillator(frequency, activeSynth);
    const gainNode = this.audioContext.createGain();

    const oscs: AudioScheduledSourceNode[] = [oscillator];

    // Define instrument-specific ADSR envelope presets
    const instrumentAdsr: { [key: string]: { attack: number; decay: number; sustain: number; release: number } } = {
      piano: { attack: 0.004, decay: 0.9, sustain: 0.18, release: 0.35 },
      organ: { attack: 0.025, decay: 0.06, sustain: 0.95, release: 0.12 },
      flute: { attack: 0.07, decay: 0.12, sustain: 0.8, release: 0.18 },
      cello: { attack: 0.16, decay: 0.25, sustain: 0.8, release: 0.3 },
      violin: { attack: 0.12, decay: 0.2, sustain: 0.85, release: 0.3 },
      sine: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.25 },
      triangle: { attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.25 },
      square: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      sawtooth: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      drum: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
    };

    // If activeSynth matches the global synthType, use the current global ADSR (supporting custom sliders).
    // Otherwise, use the preset.
    const adsr = (activeSynth === this.synthType)
      ? this.adsr
      : (instrumentAdsr[activeSynth] || this.adsr);

    // Convert MIDI-style velocity (0-1) to gain
    // Pure sine and triangle waves lack strong upper harmonics and sound quieter on consumer speakers, so boost their gain
    const synthGainMultiplier = activeSynth === 'sine'
      ? 2.1
      : activeSynth === 'triangle'
      ? 1.8
      : 1.0;
    const volume = Math.pow(velocity, 2) * 0.3 * synthGainMultiplier;

    const now = this.audioContext.currentTime;
    let lastNode: AudioNode = gainNode;

    if (activeSynth === 'piano') {
      // Real pianos strike 2-3 slightly out-of-tune unison strings per note;
      // the beating between them gives the tone its shimmer
      oscillator.detune.setValueAtTime(-2, now);
      const osc2 = this.createOscillator(frequency, 'piano');
      osc2.detune.setValueAtTime(2.5, now);
      oscs.push(osc2);

      const unisonMix = this.audioContext.createGain();
      unisonMix.gain.setValueAtTime(0.5, now);
      oscillator.connect(unisonMix);
      osc2.connect(unisonMix);

      // Upper partials die faster than the fundamental: a lowpass that starts
      // bright (harder velocity = brighter) and closes over the first second
      const brightness = this.audioContext.createBiquadFilter();
      brightness.type = 'lowpass';
      brightness.Q.value = 0.4;
      const startCut = Math.min(Math.max(frequency * (4 + 8 * velocity), 1200), 10000);
      const endCut = Math.max(frequency * 2, 700);
      brightness.frequency.setValueAtTime(startCut, now);
      brightness.frequency.exponentialRampToValueAtTime(endCut, now + 1.2);

      unisonMix.connect(brightness);
      brightness.connect(gainNode);

      // Hammer strike thump: short felt-on-string knock
      const thump = this.audioContext.createBufferSource();
      thump.buffer = this.createNoiseBuffer(0.02);
      const thumpFilter = this.audioContext.createBiquadFilter();
      thumpFilter.type = 'lowpass';
      thumpFilter.frequency.value = 2200;
      const thumpGain = this.audioContext.createGain();
      thumpGain.gain.setValueAtTime(volume * 0.5, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      thump.connect(thumpFilter);
      thumpFilter.connect(thumpGain);
      thumpGain.connect(this.masterGainNode);
      thump.start(now);
      thump.stop(now + 0.02);
    } else if (activeSynth === 'organ') {
      oscillator.connect(gainNode);

      // Drawbar registers over the 8' sine fundamental: 16' sub-octave,
      // 4' octave, 2 2/3' quint, 2' super-octave
      const drawbars: Array<[number, number]> = [
        [0.5, 0.45],
        [2, 0.4],
        [3, 0.3],
        [4, 0.22],
      ];
      drawbars.forEach(([ratio, level]) => {
        const partial = this.audioContext.createOscillator();
        partial.type = 'sine';
        // Separate pipes are never perfectly in tune with each other
        partial.frequency.setValueAtTime(frequency * ratio * (1 + (Math.random() - 0.5) * 0.002), now);
        const pGain = this.audioContext.createGain();
        if (ratio === 3) {
          // Chiff: the quint overshoots while the pipe speaks, then settles
          pGain.gain.setValueAtTime(level * 2.6, now);
          pGain.gain.exponentialRampToValueAtTime(level, now + 0.12);
        } else {
          pGain.gain.setValueAtTime(level, now);
        }
        partial.connect(pGain);
        pGain.connect(gainNode);
        oscs.push(partial);
      });

      // Wind puff as air first rushes past the pipe mouth
      const puff = this.audioContext.createBufferSource();
      puff.buffer = this.createNoiseBuffer(0.06);
      const puffFilter = this.audioContext.createBiquadFilter();
      puffFilter.type = 'bandpass';
      puffFilter.frequency.value = frequency * 2;
      puffFilter.Q.value = 2.0;
      const puffGain = this.audioContext.createGain();
      puffGain.gain.setValueAtTime(volume * 0.3, now);
      puffGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      puff.connect(puffFilter);
      puffFilter.connect(puffGain);
      puffGain.connect(this.masterGainNode);
      puff.start(now);
      puff.stop(now + 0.06);
    } else if (activeSynth === 'flute') {
      // Pitch scoops up slightly as the air jet stabilizes on the embouchure edge
      oscillator.frequency.setValueAtTime(frequency * 0.985, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.06);

      // Gentle lowpass; flute vibrato lives mostly in the upper harmonics,
      // so the vibrato LFO modulates this cutoff (plus amplitude), not pitch
      const toneFilter = this.audioContext.createBiquadFilter();
      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(Math.min(frequency * 6, 9000), now);
      toneFilter.Q.value = 0.5;
      oscillator.connect(toneFilter);
      toneFilter.connect(gainNode);

      // Steady breath noise resonating around the 2nd harmonic of the tube
      const breathSource = this.audioContext.createBufferSource();
      breathSource.buffer = this.createNoiseBuffer(1.5);
      breathSource.loop = true;
      const breathFilter = this.audioContext.createBiquadFilter();
      breathFilter.type = 'bandpass';
      breathFilter.frequency.value = frequency * 2;
      breathFilter.Q.value = 1.2;
      const breathGain = this.audioContext.createGain();
      breathGain.gain.setValueAtTime(0.04, now);
      breathSource.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(gainNode);
      oscs.push(breathSource);

      // Chiff: breathy burst as the note speaks
      const chiff = this.audioContext.createBufferSource();
      chiff.buffer = this.createNoiseBuffer(0.09);
      const chiffFilter = this.audioContext.createBiquadFilter();
      chiffFilter.type = 'bandpass';
      chiffFilter.frequency.value = frequency * 2;
      chiffFilter.Q.value = 4.0;
      const chiffGain = this.audioContext.createGain();
      chiffGain.gain.setValueAtTime(volume * 0.7, now);
      chiffGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      chiff.connect(chiffFilter);
      chiffFilter.connect(chiffGain);
      chiffGain.connect(this.masterGainNode);
      chiff.start(now);
      chiff.stop(now + 0.09);

      // Amplitude + timbre vibrato, fading in after the note settles
      const tremolo = this.audioContext.createGain();
      tremolo.gain.setValueAtTime(1, now);
      gainNode.connect(tremolo);
      lastNode = tremolo;

      const lfo = this.audioContext.createOscillator();
      lfo.frequency.value = 5.2;

      const tremDepth = this.audioContext.createGain();
      tremDepth.gain.setValueAtTime(0, now);
      tremDepth.gain.setValueAtTime(0, now + 0.3);
      tremDepth.gain.linearRampToValueAtTime(0.13, now + 0.9);
      lfo.connect(tremDepth);
      tremDepth.connect(tremolo.gain);

      const filterDepth = this.audioContext.createGain();
      filterDepth.gain.setValueAtTime(0, now);
      filterDepth.gain.setValueAtTime(0, now + 0.3);
      filterDepth.gain.linearRampToValueAtTime(Math.min(frequency * 1.5, 2200), now + 0.9);
      lfo.connect(filterDepth);
      filterDepth.connect(toneFilter.frequency);

      lfo.start(now);
      this.lfos.set(activeKey, lfo);
      if (duration) {
        lfo.stop(now + (duration / 1000) + adsr.release);
      }
    } else if (activeSynth === 'violin' || activeSynth === 'cello') {
      oscillator.connect(gainNode);
      const isViolin = activeSynth === 'violin';

      // Delayed vibrato: real string players start the note straight, then add
      // vibrato; depth is proportional to pitch (~±20 cents at full depth)
      const lfo = this.audioContext.createOscillator();
      lfo.frequency.value = isViolin ? 5.8 : 5.2;
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.setValueAtTime(0, now);
      lfoGain.gain.setValueAtTime(0, now + 0.25);
      lfoGain.gain.linearRampToValueAtTime(frequency * (isViolin ? 0.012 : 0.009), now + 0.8);
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.start(now);
      this.lfos.set(activeKey, lfo);
      if (duration) {
        lfo.stop(now + (duration / 1000) + adsr.release);
      }

      // 1. Highpass filter to cut sub-bass rumble
      const hpFilter = this.audioContext.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = isViolin ? 190 : 55;

      // 2. Main air resonance (violin A0 ~280 Hz; cello ~110 Hz)
      const formant1 = this.audioContext.createBiquadFilter();
      formant1.type = 'peaking';
      formant1.frequency.value = isViolin ? 280 : 110;
      formant1.Q.value = 1.5;
      formant1.gain.value = 4.5;

      // 3. Wood/body plate modes
      const formant2 = this.audioContext.createBiquadFilter();
      formant2.type = 'peaking';
      formant2.frequency.value = isViolin ? 1000 : 500;
      formant2.Q.value = 2.0;
      formant2.gain.value = 4;

      // 4. Bridge hill (violin ~2.5 kHz; cello ~1 kHz)
      const formant3 = this.audioContext.createBiquadFilter();
      formant3.type = 'peaking';
      formant3.frequency.value = isViolin ? 2500 : 1000;
      formant3.Q.value = 1.8;
      formant3.gain.value = isViolin ? 7 : 6;

      // 5. Lowpass tames sawtooth buzz; it opens up over the bow attack,
      // mimicking how harmonics build as the bow grips the string
      const lpFilter = this.audioContext.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.Q.value = 0.7;
      const lpTarget = isViolin ? 4200 : 2600;
      lpFilter.frequency.setValueAtTime(Math.max(frequency * 1.5, isViolin ? 800 : 300), now);
      lpFilter.frequency.exponentialRampToValueAtTime(lpTarget, now + Math.max(0.001, adsr.attack) + 0.15);

      gainNode.connect(hpFilter);
      hpFilter.connect(formant1);
      formant1.connect(formant2);
      formant2.connect(formant3);
      formant3.connect(lpFilter);
      lastNode = lpFilter;

      // 6. Bow scratch noise at the attack phase
      const scratchSource = this.audioContext.createBufferSource();
      scratchSource.buffer = this.createNoiseBuffer(0.08);
      const scratchFilter = this.audioContext.createBiquadFilter();
      scratchFilter.type = 'bandpass';
      scratchFilter.frequency.value = isViolin ? 3000 : 1400;
      scratchFilter.Q.value = 1.0;
      const scratchGain = this.audioContext.createGain();
      scratchGain.gain.setValueAtTime(volume * 0.25, now);
      scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      scratchSource.connect(scratchFilter);
      scratchFilter.connect(scratchGain);
      scratchGain.connect(this.masterGainNode);
      scratchSource.start(now);
      scratchSource.stop(now + 0.08);
    } else if (activeSynth === 'sine') {
      oscillator.connect(gainNode);

      // Add a subtle 2nd harmonic (octave) so pure sine is clearly audible on built-in laptop/mobile speakers
      const overtone = this.audioContext.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(frequency * 2, now);
      const overtoneGain = this.audioContext.createGain();
      overtoneGain.gain.setValueAtTime(0.2, now);
      overtone.connect(overtoneGain);
      overtoneGain.connect(gainNode);
      oscs.push(overtone);
    } else {
      oscillator.connect(gainNode);
    }

    // Route through reverb or direct to master
    if (useReverb && this.reverbNode && this.reverbLevel > 0) {
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();

      dryGain.gain.value = 1 - this.reverbLevel;
      wetGain.gain.value = this.reverbLevel;

      lastNode.connect(dryGain);
      lastNode.connect(wetGain);

      dryGain.connect(this.masterGainNode);
      wetGain.connect(this.reverbNode);
    } else {
      lastNode.connect(this.masterGainNode);
    }

    // ADSR envelope
    const attackDur = Math.max(0.001, adsr.attack);
    const decayDur = Math.max(0.001, adsr.decay);
    const sustainVol = Math.max(0.001, volume * adsr.sustain);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attackDur);

    if (duration) {
      // Articulate notes slightly shorter than the beat duration to leave a 30ms gap,
      // preventing consecutive identical notes from gluing together in the audio buffer.
      const durSec = duration / 1000;
      const noteHoldSec = Math.max(0.02, durSec - 0.03);
      const releaseStart = now + noteHoldSec;
      const releaseDur = Math.max(0.001, adsr.release);
      const decayEnd = now + attackDur + decayDur;

      if (releaseStart <= now + attackDur) {
        // Note shorter than the attack: release straight from the attack peak
        gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + releaseDur);
      } else if (releaseStart < decayEnd) {
        // Note ends mid-decay: ramp to the decay curve's value at that moment,
        // then release — avoids a click from jumping to the sustain level
        const progress = (releaseStart - (now + attackDur)) / decayDur;
        const valueAtRelease = Math.max(0.001, volume * Math.pow(sustainVol / volume, progress));
        gainNode.gain.exponentialRampToValueAtTime(valueAtRelease, releaseStart);
        gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + releaseDur);
      } else {
        gainNode.gain.exponentialRampToValueAtTime(sustainVol, decayEnd);
        gainNode.gain.setValueAtTime(sustainVol, releaseStart);
        gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + releaseDur);
      }

      oscs.forEach(osc => {
        osc.start(now);
        osc.stop(releaseStart + releaseDur);
      });
    } else {
      gainNode.gain.exponentialRampToValueAtTime(sustainVol, now + attackDur + decayDur);
      oscs.forEach(osc => osc.start(now));
    }

    this.oscillators.set(activeKey, oscs);
    this.gainNodes.set(activeKey, gainNode);
    this.noteReleases.set(activeKey, Math.max(0.001, adsr.release));
  }

  stopNote(identifier: string): void {
    // If exact match (e.g. "piano:C4" or "C4") exists, stop it
    if (this.oscillators.has(identifier)) {
      this.stopVoice(identifier);
      return;
    }

    // Otherwise, identifier may be just a pitch name like "C4" released from a keyboard:
    // stop all matching voices that end with ":<pitch>" or equal "<pitch>"
    const keysToStop: string[] = [];
    this.oscillators.forEach((_, key) => {
      if (key === identifier || key.endsWith(`:${identifier}`)) {
        keysToStop.push(key);
      }
    });

    keysToStop.forEach(key => this.stopVoice(key));
  }

  private stopVoice(key: string): void {
    const oscs = this.oscillators.get(key);
    const gainNode = this.gainNodes.get(key);
    const lfo = this.lfos.get(key);

    if (lfo) {
      try {
        const now = this.audioContext.currentTime;
        lfo.stop(now + 0.35);
      } catch (e) {}
      this.lfos.delete(key);
    }

    if (oscs && gainNode) {
      const now = this.audioContext.currentTime;
      const releaseDur = this.noteReleases.get(key) ?? Math.max(0.001, this.adsr.release);

      gainNode.gain.cancelScheduledValues(now);

      // ADSR Envelope Phase 4: Release (Triggered on key release)
      try {
        gainNode.gain.setValueAtTime(Math.max(0.001, gainNode.gain.value), now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseDur);
        oscs.forEach(osc => osc.stop(now + releaseDur));
      } catch (e) {
        // Fallback if node values are invalid
        oscs.forEach(osc => osc.stop(now + 0.1));
      }

      this.oscillators.delete(key);
      this.gainNodes.delete(key);
    }
    this.noteReleases.delete(key);
  }

  // Synthesizer Settings API
  setSynthType(type: string): void {
    this.synthType = type;
  }

  setAdsr(attack: number, decay: number, sustain: number, release: number): void {
    this.adsr = { attack, decay, sustain, release };
  }

  setReverbLevel(level: number): void {
    this.reverbLevel = level;
  }

  async resumeContext(): Promise<void> {
    // iOS Safari can move a context to "interrupted" when audio output is
    // paused by the OS. Resume every non-running state from the current gesture.
    if (this.audioContext.state !== 'running') {
      try {
        this.setPlaybackAudioSession();
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    }
  }

  // Additional methods for piano app functionality
  setMasterVolume(volume: number): void {
    this.masterGainNode.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.audioContext.currentTime
    );
  }

  playChord(notes: string[], velocity: number = 0.7, duration?: number): void {
    notes.forEach(note => {
      this.playNote(note, velocity * 0.8, duration); // Slightly reduce individual note volumes
    });
  }

  stopAllNotes(): void {
    this.oscillators.forEach((_, note) => {
      this.stopNote(note);
    });
  }

  // For recording/playback functionality
  async recordAudio(durationMs: number): Promise<AudioBuffer> {
    const mediaStreamDestination = this.audioContext.createMediaStreamDestination();
    this.masterGainNode.connect(mediaStreamDestination);

    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (error) {
          reject(error);
        }
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), durationMs);
    });
  }

  dispose(): void {
    this.stopMetronome();
    this.stopAllNotes();

    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

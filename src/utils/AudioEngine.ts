// src/utils/AudioEngine.ts

export class AudioEngine {
  private audioContext: AudioContext;
  private oscillators: Map<string, OscillatorNode>;
  private gainNodes: Map<string, GainNode>;
  private metronomeIntervalId: number | null = null;
  private metronomeGainNode: GainNode;
  private masterGainNode: GainNode;
  private reverbNode: ConvolverNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gainNodes = new Map();

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

  private createPianoOscillator(frequency: number): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();

    // Create a more piano-like sound using multiple harmonics
    const real = new Float32Array([0, 1, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02]);
    const imag = new Float32Array(real.length);
    const customWave = this.audioContext.createPeriodicWave(real, imag);

    oscillator.setPeriodicWave(customWave);
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    return oscillator;
  }

  private playMetronomeClick(isDownbeat: boolean = false): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
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

  playNote(
    note: string,
    velocity: number = 0.7,
    duration?: number,
    useReverb: boolean = true
  ): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Stop existing note if playing
    this.stopNote(note);

    const frequency = this.getFrequency(note);
    const oscillator = this.createPianoOscillator(frequency);
    const gainNode = this.audioContext.createGain();

    // Convert MIDI-style velocity (0-1) to gain
    const volume = Math.pow(velocity, 2) * 0.3; // Quadratic scaling for more natural feel

    // Piano-like envelope: quick attack, slower decay
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);

    if (duration) {
      // Natural piano decay
      gainNode.gain.exponentialRampToValueAtTime(
        volume * 0.1,
        this.audioContext.currentTime + duration / 1000 * 0.3
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration / 1000
      );
    } else {
      // Sustain with slow decay
      gainNode.gain.exponentialRampToValueAtTime(
        volume * 0.7,
        this.audioContext.currentTime + 2
      );
    }

    oscillator.connect(gainNode);

    // Route through reverb or direct to master
    if (useReverb && this.reverbNode) {
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();

      dryGain.gain.value = 0.7;
      wetGain.gain.value = 0.3;

      gainNode.connect(dryGain);
      gainNode.connect(wetGain);

      dryGain.connect(this.masterGainNode);
      wetGain.connect(this.reverbNode);
    } else {
      gainNode.connect(this.masterGainNode);
    }

    oscillator.start();

    if (duration) {
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    this.oscillators.set(note, oscillator);
    this.gainNodes.set(note, gainNode);
  }

  stopNote(note: string): void {
    const oscillator = this.oscillators.get(note);
    const gainNode = this.gainNodes.get(note);

    if (oscillator && gainNode) {
      // Natural release
      gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      this.oscillators.delete(note);
      this.gainNodes.delete(note);
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
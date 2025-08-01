export class AudioEngine {
  private audioContext: AudioContext;
  private oscillators: Map<string, OscillatorNode>;
  private gainNodes: Map<string, GainNode>;
  private metronomeIntervalId: NodeJS.Timeout | null = null;
  private metronomeGainNode: GainNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gainNodes = new Map();
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

  private playMetronomeClick(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // High-pitched click sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

    // Quick attack and decay for a sharp click
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  startMetronome(bpm: number): void {
    this.stopMetronome(); // Stop any existing metronome
    
    const interval = (60 / bpm) * 1000; // Convert BPM to milliseconds
    
    const scheduleNextBeat = () => {
      this.playMetronomeClick();
      this.metronomeIntervalId = setTimeout(scheduleNextBeat, interval);
    };
    
    // Start immediately
    scheduleNextBeat();
  }

  stopMetronome(): void {
    if (this.metronomeIntervalId) {
      clearTimeout(this.metronomeIntervalId);
      this.metronomeIntervalId = null;
    }
  }

  playNote(note: string, volume: number = 0.7, duration?: number): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Stop existing note if playing
    this.stopNote(note);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(this.getFrequency(note), this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01);

    if (duration) {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
    }

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

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
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      this.oscillators.delete(note);
      this.gainNodes.delete(note);
    }
  }

  dispose(): void {
    this.stopMetronome();
    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators.clear();
    this.gainNodes.clear();
    
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
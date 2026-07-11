//src/utils/MidiRecorder.ts

const ALLOWED_DURATIONS = [0.25, 0.5, 1, 1.5, 2, 3, 4];

export const quantizeDuration = (beats: number): number => {
  let closest = ALLOWED_DURATIONS[0];
  let minDiff = Math.abs(beats - ALLOWED_DURATIONS[0]);
  for (let i = 1; i < ALLOWED_DURATIONS.length; i++) {
    const diff = Math.abs(beats - ALLOWED_DURATIONS[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ALLOWED_DURATIONS[i];
    }
  }
  return closest;
};

export class MidiRecorder {
  private activeNotes: Map<string, number> = new Map();
  private isRecording: boolean = false;
  private lastReleaseTime: number | null = null;
  private bpm: number = 120;
  private onNoteRecorded: ((noteToken: string) => void) | null = null;

  start(bpm: number, onNoteRecorded: (noteToken: string) => void) {
    this.bpm = bpm;
    this.onNoteRecorded = onNoteRecorded;
    this.activeNotes.clear();
    this.lastReleaseTime = null;
    this.isRecording = true;
  }

  stop() {
    this.isRecording = false;
    this.activeNotes.clear();
    this.lastReleaseTime = null;
  }

  recordNoteOn(note: string) {
    if (!this.isRecording) return;

    const now = performance.now();

    // Auto-rest detection
    if (this.lastReleaseTime !== null && this.activeNotes.size === 0) {
      const gapMs = now - this.lastReleaseTime;
      // Threshold: only record rests longer than 150ms to avoid minor timing overlaps
      if (gapMs > 150) {
        const gapBeats = (gapMs / 1000) / (60 / this.bpm);
        const quantizedRest = quantizeDuration(gapBeats);
        if (quantizedRest >= 0.25 && this.onNoteRecorded) {
          this.onNoteRecorded(`rest/${quantizedRest}`);
        }
      }
    }

    // Set note on timestamp (if it's not already tracked)
    if (!this.activeNotes.has(note)) {
      this.activeNotes.set(note, now);
    }
  }

  recordNoteOff(note: string) {
    if (!this.isRecording) return;

    const now = performance.now();
    const onTime = this.activeNotes.get(note);

    if (onTime !== undefined) {
      const durationMs = now - onTime;
      const durationBeats = (durationMs / 1000) / (60 / this.bpm);
      const quantizedDuration = quantizeDuration(durationBeats);

      if (this.onNoteRecorded) {
        this.onNoteRecorded(`${note}/${quantizedDuration}`);
      }

      this.activeNotes.delete(note);

      // Update release timestamp if all notes are released
      if (this.activeNotes.size === 0) {
        this.lastReleaseTime = now;
      }
    }
  }

  getRecordingStatus(): boolean {
    return this.isRecording;
  }
}

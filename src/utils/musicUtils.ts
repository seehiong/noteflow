// src/utils/musicUtils.ts

const ENHARMONIC_MAP: { [key: string]: string } = {
  'Bb': 'A#',
  'Eb': 'D#',
  'Ab': 'G#',
  'Db': 'C#',
  'Gb': 'F#',
};

/**
 * Normalizes a musical note to a standard format for comparison.
 * - Extracts the note name and octave.
 * - Converts flats to their sharp equivalents.
 * @param note The note string to normalize (e.g., "Bb4").
 * @returns The normalized note string (e.g., "A#4").
 */
export const normalizeNote = (note: string): string => {
  if (!note || note === 'rest') return note;

  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return note; // Return original if format is unexpected

  let [, noteName, octave] = match;

  // Convert flat to its sharp equivalent if it exists in our map
  if (ENHARMONIC_MAP[noteName]) {
    noteName = ENHARMONIC_MAP[noteName];
  }

  return `${noteName}${octave}`;
};
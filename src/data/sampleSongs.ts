export const sampleSongs: { [key: string]: { notes: string[]; durations: number[] } } = {
  "Happy Birthday": {
    notes: ['C4', 'C4', 'D4', 'C4', 'F4', 'E4', 'rest', 'C4', 'C4', 'D4', 'C4', 'G4', 'F4', 'rest',
      'C4', 'C4', 'C5', 'A4', 'F4', 'E4', 'D4', 'rest', 'Bb4', 'Bb4', 'A4', 'F4', 'G4', 'F4'],
    durations: [0.5, 0.5, 1, 1, 1, 2, 1, 0.5, 0.5, 1, 1, 1, 2, 1,
      0.5, 0.5, 1, 1, 1, 1, 2, 1, 0.5, 0.5, 1, 1, 1, 2]
  },
  "Twinkle Star": {
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'rest',
      'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4', 'rest'],
    durations: [1, 1, 1, 1, 1, 1, 2, 0.5,
      1, 1, 1, 1, 1, 1, 2, 0.5]
  },
  "Mary Had a Little Lamb": {
    notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'rest',
      'D4', 'D4', 'D4', 'rest', 'E4', 'G4', 'G4', 'rest'],
    durations: [1, 1, 1, 1, 1, 1, 2, 0.5,
      1, 1, 2, 0.5, 1, 1, 2, 0.5]
  },
  "Ode to Joy": {
    notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
      'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4', 'rest'],
    durations: [1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1.5, 0.5, 2, 1]
  },
  "Jingle Bells": {
    notes: ['E4', 'E4', 'E4', 'rest', 'E4', 'E4', 'E4', 'rest',
      'E4', 'G4', 'C4', 'D4', 'E4', 'rest'],
    durations: [1, 1, 2, 0.5, 1, 1, 2, 0.5,
      1, 1, 1, 1, 4, 1]
  },
  "Winter Sonata - From The Beginning Until Now": {
    notes: [
      // Intro (bars 1–4)
      'C4', 'F4', 'D4', 'G4', 'G4', 'C4', 'D4', 'G4',
      // Verse (bars 5–18)
      'C4', 'F4', 'D4', 'G4', 'G4', 'C4', 'D4', 'G4',
      'C4', 'F4', 'B4', 'E4', 'C4', 'D4', 'G4', // continues with the same pattern
      // Bridge/Chorus & Transition (bars 19–34)
      'F4', 'B4', 'E4', 'C4', 'D4', 'C4', 'F4', 'B4',
      'E4', 'C4', 'D4', 'G4', 'G4', 'C4', 'F4', 'B4', 'E4', 'C4', 'D4', 'G4'
    ],
    durations: [
      // Estimates: each chord/root = 1 beat (quarter note)
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ]
  },
};
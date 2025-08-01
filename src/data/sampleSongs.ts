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
  "Winter Dreams": {
    notes: [
      // Opening phrase - gentle and flowing
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'G4', 'F4',
      'E4', 'D4', 'C4', 'rest',
      
      // Second phrase - building emotion
      'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4',
      'G4', 'F4', 'E4', 'rest',
      
      // Third phrase - reaching higher
      'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'D5', 'C5',
      'B4', 'A4', 'G4', 'rest',
      
      // Fourth phrase - emotional peak
      'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4',
      'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'rest',
      
      // Gentle resolution
      'E4', 'D4', 'C4', 'D4', 'E4', 'F4', 'E4', 'D4',
      'C4', 'rest', 'C4', 'rest'
    ],
    durations: [
      // Opening phrase
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 2, 1,
      
      // Second phrase
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 2, 1,
      
      // Third phrase
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 2, 1,
      
      // Fourth phrase
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 2, 1,
      
      // Gentle resolution
      1, 1, 1, 1, 1, 1, 1, 1,
      2, 1, 2, 2
    ]
  }
};
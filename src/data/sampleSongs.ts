//src/data/sampleSongs.ts

export const sampleSongs: { [key: string]: { notes: string[]; durations: number[] } } = {
  "Happy Birthday": {
    notes: ["T1 instrument=piano C4/0.5 C4/0.5 D4/1 C4/1 F4/1 E4/2 rest/1 C4/0.5 C4/0.5 D4/1 C4/1 G4/1 F4/2 rest/1 C4/0.5 C4/0.5 C5/1 A4/1 F4/1 E4/1 D4/2 rest/1 Bb4/0.5 Bb4/0.5 A4/1 F4/1 G4/1 F4/2"],
    durations: []
  },
  "Twinkle Twinkle Star": {
    notes: ["T1 synth=sine C4/1 C4/1 G4/1 G4/1 A4/1 A4/1 G4/2 rest/0.5 F4/1 F4/1 E4/1 E4/1 D4/1 D4/1 C4/2 rest/0.5 G4/1 G4/1 F4/1 F4/1 E4/1 E4/1 D4/2 rest/0.5 G4/1 G4/1 F4/1 F4/1 E4/1 E4/1 D4/2 rest/0.5 C4/1 C4/1 G4/1 G4/1 A4/1 A4/1 G4/2 rest/0.5 F4/1 F4/1 E4/1 E4/1 D4/1 D4/1 C4/2"],
    durations: []
  },
  "Mary Had a Little Lamb": {
    notes: ["T1 instrument=violin E4/1 D4/1 C4/1 D4/1 E4/1 E4/1 E4/2 rest/0.5 D4/1 D4/1 D4/2 rest/0.5 E4/1 G4/1 G4/2 rest/0.5 E4/1 D4/1 C4/1 D4/1 E4/1 E4/1 E4/1 E4/1 D4/1 D4/1 E4/1 D4/1 C4/2"],
    durations: []
  },
  "Ode to Joy": {
    notes: ["T1 instrument=flute E4/1 E4/1 F4/1 G4/1 G4/1 F4/1 E4/1 D4/1 C4/1 C4/1 D4/1 E4/1 E4/1.5 D4/0.5 D4/2 rest/1 E4/1 E4/1 F4/1 G4/1 G4/1 F4/1 E4/1 D4/1 C4/1 C4/1 D4/1 E4/1 D4/1.5 C4/0.5 C4/2"],
    durations: []
  },
  "Jingle Bells": {
    notes: ["T1 instrument=organ E4/1 E4/1 E4/2 E4/1 E4/1 E4/2 E4/1 G4/1 C4/1.5 D4/0.5 E4/4 rest/1 F4/1 F4/1 F4/1 F4/1 F4/1 E4/1 E4/1 E4/1 E4/1 D4/1 D4/1 E4/1 D4/1 G4/2 rest/1 E4/1 E4/1 E4/2 E4/1 E4/1 E4/2 E4/1 G4/1 C4/1.5 D4/0.5 E4/4 rest/1 F4/1 F4/1 F4/1 F4/1 F4/1 E4/1 E4/1 E4/1 G4/1 G4/1 F4/1 D4/1 C4/4"],
    durations: []
  },
  "Au Clair de la Lune": {
    notes: ["T1 instrument=cello C4/1 C4/1 C4/1 D4/1 E4/2 D4/2 C4/1 E4/1 D4/1 D4/1 C4/2 rest/1 D4/1 D4/1 D4/1 D4/1 A3/2 A3/2 D4/1 C4/1 B3/1 A3/1 G3/2 rest/1 C4/1 C4/1 C4/1 D4/1 E4/2 D4/2 C4/1 E4/1 D4/1 D4/1 C4/3"],
    durations: []
  },
  "Frere Jacques": {
    notes: ["T1 synth=triangle C4/1 D4/1 E4/1 C4/1 C4/1 D4/1 E4/1 C4/1 E4/1 F4/1 G4/2 rest/0.5 E4/1 F4/1 G4/2 rest/0.5 G4/0.5 A4/0.5 G4/0.5 F4/0.5 E4/1 C4/1 G4/0.5 A4/0.5 G4/0.5 F4/0.5 E4/1 C4/1 C4/1 G3/1 C4/2 rest/0.5 C4/1 G3/1 C4/2"],
    durations: []
  },
  "Mini Symphony": {
    notes: [
      "T1 instrument=piano track=on E4/1 E4/1 F4/1 G4/1 G4/1 F4/1 E4/1 D4/1 C4/1 C4/1 D4/1 E4/1 E4/1.5 D4/0.5 D4/2 rest/1 E4/1 E4/1 F4/1 G4/1 G4/1 F4/1 E4/1 D4/1 C4/1 C4/1 D4/1 E4/1 D4/1.5 C4/0.5 C4/2",
      "T2 synth=sawtooth track=on C3/2 E3/2 F3/2 G3/2 C3/2 E3/2 D3/2 C3/2",
      "T3 synth=sine track=on C4/4 E4/4 F4/4 D4/4 C4/4 E4/4 F4/2 G4/2 E4/4",
      "T4 synth=drum track=on C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/1 F#2/1 C2/1 F#2/1 D2/2"
    ],
    durations: []
  },
  "Rock Twinkle": {
    notes: [
      "T1 synth=sawtooth track=on C4/1 C4/1 G4/1 G4/1 A4/1 A4/1 G4/2 F4/1 F4/1 E4/1 E4/1 D4/1 D4/1 C4/2",
      "T2 instrument=organ track=on C3/2 G3/2 F3/2 C3/2 D3/2 C3/2 G2/2 C3/2",
      "T3 synth=drum track=on C2/0.5 F#2/0.5 D2/0.5 F#2/0.5 C2/0.5 F#2/0.5 D2/0.5 F#2/0.5 C2/0.5 F#2/0.5 D2/0.5 F#2/0.5 C2/0.5 F#2/0.5 D2/0.5 F#2/0.5"
    ],
    durations: []
  },
  "Chamber Duet": {
    notes: [
      "T1 instrument=flute track=on E5/1 G5/1 A5/1 G5/1 E5/1 G5/1 A5/2 E5/1 G5/1 A5/1 G5/1 E5/1 D5/1 C5/2",
      "T2 instrument=cello track=on C3/2 E3/2 F3/2 G3/2 C3/2 E3/2 D3/2 C3/2"
    ],
    durations: []
  },
  "Jingle Bells Metal": {
    notes: [
      "T1 synth=sawtooth track=on E4/1 E4/1 E4/2 E4/1 E4/1 E4/2 E4/1 G4/1 C4/1.5 D4/0.5 E4/3 rest/1 F4/1 F4/1 F4/1 F4/1 F4/1 E4/1 E4/1 E4/0.5 E4/0.5 D4/1 D4/1 E4/1 D4/2 G4/2",
      "T2 synth=square track=on C3/4 C3/4 F3/4 G3/4 F3/4 C3/4 G3/4 C3/4",
      "T3 synth=sawtooth track=on C2/1 C2/1 C2/1 C2/1 C2/1 C2/1 C2/1 C2/1 F2/1 F2/1 F2/1 F2/1 G2/1 G2/1 G2/1 G2/1 F2/1 F2/1 F2/1 F2/1 C2/1 C2/1 C2/1 C2/1 G2/1 G2/1 G2/1 G2/1 C2/1 C2/1 C2/2",
      "T4 synth=drum track=on BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1 BD/1 SD/1",
      "T5 synth=drum track=on HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5 HH/0.5"
    ],
    durations: []
  },
  "First Contact (Sci-Fi)": {
    notes: [
      "T1 synth=sine track=on rest/2 G5/0.5 rest/1.5 rest/2 D6/0.5 rest/1.5 rest/2 G5/0.5 rest/1.5 rest/1 D6/0.5 rest/0.5 G5/0.5 rest/1.5 C6/2 Bb5/2 G5/4 Ab5/2 G5/2 D5/4 rest/4 rest/4 rest/4 rest/4 C6/2 D6/2 Eb6/4 D6/2 C6/2 G5/4",
      "T2 instrument=flute track=on rest/4 rest/4 rest/4 rest/4 G4/3 Bb4/1 C5/4 Eb5/3 D5/1 C5/2 G4/2 rest/4 rest/4 rest/4 rest/4 Eb5/8 D5/2 Eb5/2 C5/4",
      "T3 instrument=violin track=on rest/4 rest/4 rest/4 rest/4 rest/4 rest/4 rest/4 rest/4 C5/2 F5/2 Eb5/3 D5/1 C5/2 Bb4/2 G4/4 G5/4 F5/2 Eb5/2 D5/2 Eb5/2 C5/4",
      "T4 instrument=cello track=on C2/8 G2/8 C3/1 C3/1 G3/1 C3/1 C3/1 C3/1 G3/1 C3/1 C3/1 C3/1 G3/1 C3/1 C3/1 C3/1 G3/1 C3/1 Ab2/4 Bb2/4 C3/4 G2/4 Ab2/4 Bb2/4 C3/2 D3/2 C3/4",
      "T5 synth=sawtooth track=on C2/8 C2/8 C2/8 C2/8 Ab2/4 Bb2/4 C2/4 G2/4 Ab2/4 Bb2/4 C2/8",
      "T6 synth=drum track=on rest/4 rest/4 rest/4 rest/4 BD/2 BD/2 BD/2 BD/2 BD/2 BD/2 BD/2 BD/2 BD/1 HH/0.5 HH/0.5 SD/1 HH/1 BD/1 HH/0.5 HH/0.5 SD/1 HH/1 BD/1 HH/0.5 HH/0.5 SD/1 HH/1 BD/1 HH/0.5 HH/0.5 SD/1 HH/1 BD/0.5 HH/0.5 BD/0.5 HH/0.5 SD/0.5 HH/0.5 BD/0.5 HH/0.5 BD/0.5 HH/0.5 BD/0.5 HH/0.5 SD/0.5 HH/0.5 BD/0.5 HH/0.5 BD/0.5 HH/0.5 BD/0.5 HH/0.5 SD/0.5 HH/0.5 BD/0.5 HH/0.5 SD/0.5 SD/0.5 SD/0.5 SD/0.5 BD/2"
    ],
    durations: []
  }
};
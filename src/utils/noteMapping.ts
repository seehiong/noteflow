export const noteMapping: { [key: string]: string } = {
  // First row (QWERTYUI) - Base octave (do re mi fa so la ti do)
  'q': 'C',
  'w': 'D',
  'e': 'E',
  'r': 'F',
  't': 'G',
  'y': 'A',
  'u': 'B',
  'i': 'C',
  
  // Second row (ASDFGHJ) - Next octave (do re mi fa so la ti do)
  'a': 'C',
  's': 'D',
  'd': 'E',
  'f': 'F',
  'g': 'G',
  'h': 'A',
  'j': 'B',
  'k': 'C',
  
  // Third row (ZXCVBNM) - Next octave (do re mi fa so la ti do)
  'z': 'C',
  'x': 'D',
  'c': 'E',
  'v': 'F',
  'b': 'G',
  'n': 'A',
  'm': 'B',
  ',': 'C'
};

export const getRowOctave = (key: string): number => {
  const qwertyKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
  const asdfKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
  const zxcvKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];
  
  if (qwertyKeys.includes(key)) return 0;
  if (asdfKeys.includes(key)) return 1;
  if (zxcvKeys.includes(key)) return 2;
  return 0;
};

export const getNote = (
  baseNote: string, 
  baseOctave: number, 
  isSharp: boolean = false, 
  isFlat: boolean = false
): string => {
  const key = Object.keys(noteMapping).find(k => noteMapping[k] === baseNote);
  if (!key) return `${baseNote}${baseOctave}`;
  
  const rowOctave = getRowOctave(key);
  let finalOctave = baseOctave + rowOctave;
  
  // Handle octave completion notes (I, K, comma)
  if (['i', 'k', ','].includes(key)) {
    finalOctave += 1;
  }
  
  if (isSharp && !['E', 'B'].includes(baseNote)) {
    return `${baseNote}#${finalOctave}`;
  } else if (isFlat && !['C', 'F'].includes(baseNote)) {
    return `${baseNote}b${finalOctave}`;
  }
  
  return `${baseNote}${finalOctave}`;
};
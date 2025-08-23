import React from 'react';

interface PianoProps {
  activeNotes: Set<string>;
  onNotePlay: (note: string) => void;
  onNoteStop: (note: string) => void;
  timingFeedback?: { [key: string]: 'correct' | 'incorrect' | null };
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Define the systematic black key block pattern
const blackKeyBlock = [
  { note: 'C#', flatNote: 'Db', position: 36 },   // Between C and D
  { note: 'D#', flatNote: 'Eb', position: 88 },   // Between D and E
  { note: 'F#', flatNote: 'Gb', position: 192 },  // Between F and G
  { note: 'G#', flatNote: 'Ab', position: 244 },  // Between G and A
  { note: 'A#', flatNote: 'Bb', position: 296 },  // Between A and B
];

export const Piano: React.FC<PianoProps> = ({ activeNotes, onNotePlay, onNoteStop, timingFeedback = {} }) => {
  const octaves = [3, 4, 5]; 

  const isActiveNote = (note: string, octave: number) => {
    return activeNotes.has(`${note}${octave}`) || activeNotes.has(`${note}b${octave}`);
  };
  
  const getTimingFeedbackStyle = (note: string, octave: number) => {
    const noteKey = `${note}${octave}`;
    const feedback = timingFeedback[noteKey];
    
    if (feedback === 'correct') {
      return 'bg-green-400 border-green-500 shadow-green-500/50';
    } else if (feedback === 'incorrect') {
      return 'bg-red-400 border-red-500 shadow-red-500/50';
    }
    return null;
  };

  const handleMouseDown = (note: string, octave: number) => {
    onNotePlay(`${note}${octave}`);
  };

  const handleMouseUp = (note: string, octave: number) => {
    onNoteStop(`${note}${octave}`);
  };

  // Calculate octave width (7 white keys * (width + margin))
  const octaveWidth = 7 * 52; // 48px width + 4px margin

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl">
      <div className="relative flex justify-center">
        <div className="relative inline-flex">
          {/* White Keys */}
          <div className="flex">
            {octaves.map(octave => (
              <div key={octave} className="flex">
                {whiteKeys.map(note => (
                  <button
                    key={`${note}${octave}`}
                    className={`
                      w-12 h-40 mx-0.5 rounded-b-lg transition-all duration-75 transform
                      border-2 border-gray-300 shadow-lg
                      ${getTimingFeedbackStyle(note, octave) || 
                        (isActiveNote(note, octave) 
                          ? 'bg-purple-400 border-purple-500 scale-95 shadow-purple-500/50' 
                          : 'bg-white hover:bg-gray-50 active:scale-95'
                        )
                      }
                    `}
                    onMouseDown={() => handleMouseDown(note, octave)}
                    onMouseUp={() => handleMouseUp(note, octave)}
                    onMouseLeave={() => handleMouseUp(note, octave)}
                  >
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                      {note}{octave}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Black Keys - Systematic Block-Based Pattern */}
          <div className="absolute top-0 left-0 flex pointer-events-none">
            {octaves.map((octave, octaveIndex) => (
              <div key={octave} className="relative">
                {blackKeyBlock.map(({ note, flatNote, position }) => {
                  const absolutePosition = octaveIndex * octaveWidth + position;
                  
                  return (
                    <button
                      key={`${note}${octave}`}
                      className={`
                        absolute w-8 h-24 rounded-b-lg transition-all duration-75 transform pointer-events-auto
                        border border-gray-900 shadow-lg
                        ${getTimingFeedbackStyle(note, octave) ||
                          (isActiveNote(note, octave)
                            ? 'bg-purple-600 border-purple-700 scale-95 shadow-purple-600/50'
                            : 'bg-gray-900 hover:bg-gray-800 active:scale-95'
                          )
                        }
                      `}
                      style={{
                        left: `${absolutePosition}px`,
                        zIndex: 10
                      }}
                      onMouseDown={() => handleMouseDown(note, octave)}
                      onMouseUp={() => handleMouseUp(note, octave)}
                      onMouseLeave={() => handleMouseUp(note, octave)}
                    >
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white text-center leading-tight">
                        <div>{note}{octave}</div>
                        <div>{flatNote}{octave}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
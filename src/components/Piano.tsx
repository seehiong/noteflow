import React from 'react';

interface PianoProps {
  activeNotes: Set<string>;
  onNotePlay: (note: string) => void;
  onNoteStop: (note: string) => void;
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];

export const Piano: React.FC<PianoProps> = ({ activeNotes, onNotePlay, onNoteStop }) => {
  const octaves = [3, 4, 5, 6];

  const isActiveNote = (note: string, octave: number) => {
    return activeNotes.has(`${note}${octave}`);
  };

  const handleMouseDown = (note: string, octave: number) => {
    onNotePlay(`${note}${octave}`);
  };

  const handleMouseUp = (note: string, octave: number) => {
    onNoteStop(`${note}${octave}`);
  };

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
                      ${isActiveNote(note, octave) 
                        ? 'bg-purple-400 border-purple-500 scale-95 shadow-purple-500/50' 
                        : 'bg-white hover:bg-gray-50 active:scale-95'
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

          {/* Black Keys */}
          <div className="absolute top-0 flex pointer-events-none">
            {octaves.map(octave => (
              <div key={octave} className="flex">
                {blackKeys.map((note, index) => (
                  note ? (
                    <button
                      key={`${note}${octave}`}
                      className={`
                        w-8 h-24 mx-1 rounded-b-lg transition-all duration-75 transform pointer-events-auto
                        border border-gray-900 shadow-lg
                        ${isActiveNote(note, octave)
                          ? 'bg-purple-600 border-purple-700 scale-95 shadow-purple-600/50'
                          : 'bg-gray-900 hover:bg-gray-800 active:scale-95'
                        }
                      `}
                      style={{
                        marginLeft: index === 0 ? '2rem' : index === 2 ? '3rem' : '1rem'
                      }}
                      onMouseDown={() => handleMouseDown(note, octave)}
                      onMouseUp={() => handleMouseUp(note, octave)}
                      onMouseLeave={() => handleMouseUp(note, octave)}
                    >
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white">
                        {note}{octave}
                      </div>
                    </button>
                  ) : (
                    <div key={`empty-${index}-${octave}`} className="w-8" />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
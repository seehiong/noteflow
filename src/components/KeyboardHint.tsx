import React from 'react';
import { X } from 'lucide-react';

interface KeyboardHintProps {
  targetNote: string;
  keyboardMapping: { [key: string]: { note: string; octave: number } };
  onClose: () => void;
}

export const KeyboardHint: React.FC<KeyboardHintProps> = ({
  targetNote,
  keyboardMapping,
  onClose
}) => {
  // Find all keys that can play this note (any octave)
  const targetNoteName = targetNote.replace(/[#b]?\d+$/, ''); // Remove octave and accidentals

  const matchingKeys = Object.entries(keyboardMapping).filter(([key, mapping]) => {
    return mapping.note === targetNoteName;
  });

  const keyboardRows = [
    { keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'], label: 'QWERTY' },
    { keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'], label: 'ASDF' },
    { keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','], label: 'ZXCV' }
  ];

  const isKeyHighlighted = (key: string) => {
    return matchingKeys.some(([matchKey]) => matchKey === key);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Play Note: <span className="text-yellow-400">{targetNote.replace(/\d+$/, '')}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-purple-200 mb-4">
            Press any of the highlighted keys to play "{targetNoteName}":
          </p>

          {/* Keyboard Layout */}
          <div className="space-y-2">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                <div className="w-16 text-xs text-purple-300 flex items-center">
                  {row.label}
                </div>
                {row.keys.map(key => {
                  const isHighlighted = isKeyHighlighted(key);
                  const mapping = keyboardMapping[key];

                  return (
                    <div
                      key={key}
                      className={`
                        w-10 h-10 rounded flex flex-col items-center justify-center text-xs font-bold transition-all duration-300
                        ${isHighlighted
                          ? 'bg-yellow-400 text-black animate-pulse scale-110 shadow-lg shadow-yellow-400/50'
                          : 'bg-slate-600 text-white'
                        }
                      `}
                    >
                      <div className="text-sm">{key.toUpperCase()}</div>
                      {mapping && (
                        <div className="text-xs opacity-75">
                          {mapping.note}{mapping.octave}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Piano Keys Hint */}
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-purple-200 text-sm mb-2">
            Or click any <span className="text-yellow-400 font-semibold">{targetNoteName}</span> key on the virtual piano below
          </p>
          <div className="text-xs text-purple-300">
            💡 Tip: Any octave of {targetNoteName} will work!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};